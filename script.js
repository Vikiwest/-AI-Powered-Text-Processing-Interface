document.addEventListener("DOMContentLoaded", async () => {
  const inputText = document.getElementById("input-text");
  const sendBtn = document.getElementById("send-btn");
  const chatArea = document.getElementById("chat-area");
  const errorDiv = document.createElement("div"); // Error message container
  errorDiv.className = "text-red-500 text-lg mt-2";
  inputText.parentNode.appendChild(errorDiv); // Append below input field

  sendBtn.addEventListener("click", processText);

  // ✅ Listen for the Enter key to send message
  inputText.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevent new line in input
      processText();
    }
  });

  async function processText() {
    const text = inputText.value.trim();

    // ✅ Show error if text is empty
    if (!text) {
      errorDiv.textContent = "⚠️ Please enter some text before sending.";
      return;
    }

    // ✅ Clear the error message on valid input
    errorDiv.textContent = "";

    appendMessage("You", text, "bg-green-200   self-end");
    inputText.value = "";

    const detectedLanguage = await detectLanguage(text);
    appendMessage(
      "AI",
      `Detected Language: ${detectedLanguage}`,
      "bg-gray-300"
    );

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "p-2 flex flex-col gap-2";

    // Translation Options
    const translationDiv = document.createElement("div");
    translationDiv.className = "flex items-center gap-2";

    const languageSelect = document.createElement("select");
    languageSelect.className = "p-2 rounded-md border border-gray-300";
    ["en", "pt", "es", "ru", "tr", "fr"].forEach((lang) => {
      const option = document.createElement("option");
      option.value = lang;
      option.textContent = lang.toUpperCase();
      languageSelect.appendChild(option);
    });

    const translateBtn = document.createElement("button");
    translateBtn.className =
      "bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600";
    translateBtn.textContent = "Translate";

    translateBtn.addEventListener("click", async () => {
      const translatedText = await getTranslation(text, languageSelect.value);
      appendMessage("AI", `Translated: ${translatedText}`, "bg-yellow-200");
    });

    translationDiv.appendChild(languageSelect);
    translationDiv.appendChild(translateBtn);
    optionsContainer.appendChild(translationDiv);

    // Summarization Option
    if (detectedLanguage === "en" && text.length > 150) {
      const summarizeBtn = document.createElement("button");
      summarizeBtn.className =
        "bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600";
      summarizeBtn.textContent = "Summarize";
      summarizeBtn.addEventListener("click", async () => {
        const summary = await summarizeText(text);
        appendMessage("AI", `Summary: ${summary}`, "bg-pink-200");
      });
      optionsContainer.appendChild(summarizeBtn);
    }

    chatArea.appendChild(optionsContainer);
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  function appendMessage(sender, text, bgColor) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `p-3 rounded-lg ${bgColor} w-fit max-w-xs`;
    messageDiv.textContent = `${sender}: ${text}`;
    chatArea.appendChild(messageDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  async function detectLanguage(text) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(
      text
    )}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data[2] || "Unknown";
    } catch (error) {
      return "Unknown";
    }
  }

  async function getTranslation(text, targetLang) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(
      text
    )}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      return (
        data[0].map((item) => item[0]).join(" ") || "Translation unavailable."
      );
    } catch (error) {
      return "Translation unavailable.";
    }
  }

  // ✅ SUMMARIZATION FUNCTION (BASIC KEY WORD SUMMARIZATION)
  function summarizeText(text, numSentences = 3) {
    if (!text) return "Summary unavailable.";

    const sentences = text.split(". ");
    if (sentences.length <= numSentences) return text; // Return original if too short

    // Count word frequency
    const wordCounts = {};
    text
      .toLowerCase()
      .match(/\b(\w+)\b/g)
      .forEach((word) => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      });

    // Rank sentences by importance
    const scoredSentences = sentences.map((sentence) => {
      const words = sentence.toLowerCase().match(/\b(\w+)\b/g) || [];
      return {
        sentence,
        score: words.reduce((sum, word) => sum + (wordCounts[word] || 0), 0),
      };
    });

    // Sort by highest score and return top sentences
    return (
      scoredSentences
        .sort((a, b) => b.score - a.score)
        .slice(0, numSentences)
        .map((s) => s.sentence)
        .join(". ") + "."
    );
  }
});
