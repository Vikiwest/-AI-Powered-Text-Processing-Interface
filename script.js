/* ==================== LINGUAFLOW PRO - MAIN APPLICATION ==================== */
/* Comprehensive AI-Powered Language Detection & Translation Tool with Dark Mode & Voice Input */

document.addEventListener("DOMContentLoaded", () => {
  /* ==================== DOM ELEMENT REFERENCES ==================== */
  const inputText = document.getElementById("input-text");
  const sendBtn = document.getElementById("send-btn");
  const chatArea = document.getElementById("chat-area");
  const errorDiv = document.getElementById("error-message");
  const errorText = document.getElementById("error-text");
  const clearInputBtn = document.getElementById("clear-btn");
  const voiceBtn = document.getElementById("voice-btn");
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const clearHistoryBtn = document.getElementById("clear-history-btn");

  /* ==================== STATE & CONFIGURATION ==================== */
  let isProcessing = false;
  const MAX_MESSAGES = 50;
  let recognition;

  /* ==================== CHAT STORAGE MANAGEMENT ==================== */
  function saveChatHistory() {
    try {
      const messages = [];
      const messageContainers = chatArea.querySelectorAll(".message-container");

      messageContainers.forEach((container) => {
        const isUser = container.classList.contains("user");
        const bubble = container.querySelector(".message-bubble");
        const timestamp = container.querySelector(".message-timestamp");

        if (bubble && timestamp) {
          messages.push({
            type: isUser ? "user" : "ai",
            text: bubble.innerHTML
              .replace(/<br>/g, "\n")
              .replace(/<code>/g, "`")
              .replace(/<\/code>/g, "`")
              .replace(/<strong>/g, "**")
              .replace(/<\/strong>/g, "**")
              .replace(/<em>/g, "*")
              .replace(/<\/em>/g, "*"),
            timestamp: timestamp.textContent,
            rawText: bubble.textContent || bubble.innerText || "",
          });
        }
      });

      localStorage.setItem("linguaFlow-chatHistory", JSON.stringify(messages));
    } catch (error) {
      console.warn("Failed to save chat history:", error);
    }
  }

  function loadChatHistory() {
    try {
      const savedHistory = localStorage.getItem("linguaFlow-chatHistory");
      if (!savedHistory) return;

      const messages = JSON.parse(savedHistory);
      messages.forEach((message) => {
        appendMessage(
          message.type === "user" ? "You" : "AI",
          message.text,
          message.type === "user"
            ? "bg-indigo-600 text-white"
            : "bg-gray-100 text-gray-800",
          message.type,
          false, // Don't save to storage when loading
        );

        // Update timestamp if it exists
        const containers = chatArea.querySelectorAll(".message-container");
        const lastContainer = containers[containers.length - 1];
        if (lastContainer) {
          const timestamp = lastContainer.querySelector(".message-timestamp");
          if (timestamp) {
            timestamp.textContent = message.timestamp;
          }
        }
      });
    } catch (error) {
      console.warn("Failed to load chat history:", error);
    }
  }

  function clearChatHistory() {
    try {
      localStorage.removeItem("linguaFlow-chatHistory");
    } catch (error) {
      console.warn("Failed to clear chat history from storage:", error);
    }
  }

  /* ==================== COMPLETE 37+ LANGUAGE DATABASE ==================== */
  const LANGUAGES = {
    en: { name: "English", flag: "🇺🇸", native: "English" },
    es: { name: "Spanish", flag: "🇪🇸", native: "Español" },
    fr: { name: "French", flag: "🇫🇷", native: "Français" },
    de: { name: "German", flag: "🇩🇪", native: "Deutsch" },
    it: { name: "Italian", flag: "🇮🇹", native: "Italiano" },
    pt: { name: "Portuguese", flag: "🇵🇹", native: "Português" },
    ru: { name: "Russian", flag: "🇷🇺", native: "Русский" },
    ja: { name: "Japanese", flag: "🇯🇵", native: "日本語" },
    ko: { name: "Korean", flag: "🇰🇷", native: "한국어" },
    zh: { name: "Chinese", flag: "🇨🇳", native: "中文" },
    ar: { name: "Arabic", flag: "🇸🇦", native: "العربية" },
    hi: { name: "Hindi", flag: "🇮🇳", native: "हिन्दी" },
    nl: { name: "Dutch", flag: "🇳🇱", native: "Nederlands" },
    pl: { name: "Polish", flag: "🇵🇱", native: "Polski" },
    uk: { name: "Ukrainian", flag: "🇺🇦", native: "Українська" },
    el: { name: "Greek", flag: "🇬🇷", native: "Ελληνικά" },
    cs: { name: "Czech", flag: "🇨🇿", native: "Čeština" },
    sv: { name: "Swedish", flag: "🇸🇪", native: "Svenska" },
    da: { name: "Danish", flag: "🇩🇰", native: "Dansk" },
    fi: { name: "Finnish", flag: "🇫🇮", native: "Suomi" },
    no: { name: "Norwegian", flag: "🇳🇴", native: "Norsk" },
    hu: { name: "Hungarian", flag: "🇭🇺", native: "Magyar" },
    ro: { name: "Romanian", flag: "🇷🇴", native: "Română" },
    bg: { name: "Bulgarian", flag: "🇧🇬", native: "Български" },
    sr: { name: "Serbian", flag: "🇷🇸", native: "Српски" },
    hr: { name: "Croatian", flag: "🇭🇷", native: "Hrvatski" },
    sk: { name: "Slovak", flag: "🇸🇰", native: "Slovenčina" },
    sl: { name: "Slovenian", flag: "🇸🇮", native: "Slovenščina" },
    th: { name: "Thai", flag: "🇹🇭", native: "ไทย" },
    vi: { name: "Vietnamese", flag: "🇻🇳", native: "Tiếng Việt" },
    id: { name: "Indonesian", flag: "🇮🇩", native: "Bahasa Indonesia" },
    ms: { name: "Malay", flag: "🇲🇾", native: "Bahasa Melayu" },
    tl: { name: "Tagalog", flag: "🇵🇭", native: "Tagalog" },
    tr: { name: "Turkish", flag: "🇹🇷", native: "Türkçe" },
    fa: { name: "Persian", flag: "🇮🇷", native: "فارسی" },
    ur: { name: "Urdu", flag: "🇵🇰", native: "اردو" },
    he: { name: "Hebrew", flag: "🇮🇱", native: "עברית" },
  };

  const SORTED_LANGUAGES = Object.entries(LANGUAGES)
    .sort(([, a], [, b]) => a.name.localeCompare(b.name))
    .map(([code, data]) => ({ code, ...data }));

  /* ==================== THEME MANAGEMENT ==================== */
  function initTheme() {
    const savedTheme = localStorage.getItem("app-theme") || "light";
    document.body.classList.toggle("dark-mode", savedTheme === "dark");
    updateThemeButton(savedTheme === "dark");
  }

  function toggleTheme() {
    const isDarkMode = document.body.classList.toggle("dark-mode");
    localStorage.setItem("app-theme", isDarkMode ? "dark" : "light");
    updateThemeButton(isDarkMode);
  }

  function updateThemeButton(isDarkMode) {
    if (!themeToggleBtn) return;
    themeToggleBtn.innerHTML = isDarkMode
      ? '<i class="fa-solid fa-sun"></i> Light'
      : '<i class="fa-solid fa-moon"></i> Dark';
  }

  /* ==================== SPEECH RECOGNITION SETUP ==================== */
  function initSpeechRecognition() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (voiceBtn) voiceBtn.style.display = "none";
      return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      if (voiceBtn) voiceBtn.classList.add("active");
    };

    recognition.onend = () => {
      if (voiceBtn) voiceBtn.classList.remove("active");
    };

    recognition.onerror = (event) => {
      showError(`Voice error: ${event.error}`);
      if (voiceBtn) voiceBtn.classList.remove("active");
    };

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript + " ";
        }
      }
      if (transcript) {
        inputText.value = transcript.trim();
        inputText.focus();
      }
    };
  }

  /* ==================== WELCOME MESSAGE ==================== */
  function showWelcomeMessage() {
    const welcomeText =
      `👋 **Welcome to LinguaFlow Pro!**\n\n` +
      `I can detect and translate between **${Object.keys(LANGUAGES).length}+ languages**.\n\n` +
      `✨ **Features:**\n` +
      `• 🔍 Automatic language detection\n` +
      `• 🌐 Translate to 37+ languages\n` +
      `• 📝 Smart text summarization\n` +
      `• 🌙 Dark mode support\n` +
      `• 🎙️ Voice input (if available)\n` +
      `• 📋 Copy to clipboard`;

    appendMessage("AI", welcomeText, "bg-indigo-50 text-gray-800", "ai", false);
  }

  /* ==================== AUTO-RESIZE TEXTAREA ==================== */
  function autoResizeTextarea() {
    inputText.style.height = "auto";
    inputText.style.height = Math.min(inputText.scrollHeight, 120) + "px";
  }

  /* ==================== EVENT LISTENERS ==================== */
  function setupEventListeners() {
    sendBtn.addEventListener("click", processText);

    inputText.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        processText();
      }
    });

    inputText.addEventListener("input", autoResizeTextarea);

    if (clearInputBtn) {
      clearInputBtn.addEventListener("click", () => {
        inputText.value = "";
        autoResizeTextarea();
        inputText.focus();
        hideError();
      });
    }

    if (voiceBtn && recognition) {
      voiceBtn.addEventListener("click", () => {
        try {
          if (voiceBtn.classList.contains("active")) {
            recognition.abort();
          } else {
            recognition.start();
          }
        } catch (error) {
          console.error("Voice error:", error);
        }
      });
    }

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener("click", toggleTheme);
    }

    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener("click", () => {
        if (confirm("Clear chat history?")) {
          chatArea.innerHTML = "";
          clearChatHistory();
          showWelcomeMessage();
        }
      });
    }

    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") processText();
      if (e.key === "Escape") {
        inputText.value = "";
        hideError();
      }
    });
  }

  /* ==================== CORE TEXT PROCESSING ==================== */
  async function processText() {
    const text = inputText.value.trim();

    if (!text) {
      showError("Please enter some text");
      return;
    }

    if (isProcessing) {
      showError("Still processing...");
      return;
    }

    hideError();
    isProcessing = true;
    sendBtn.disabled = true;

    appendMessage("You", text, "bg-indigo-600 text-white", "user");
    inputText.value = "";
    autoResizeTextarea();

    const typingId = showTypingIndicator();

    try {
      const detection = await detectLanguageWithConfidence(text);
      removeTypingIndicator(typingId);

      const detectedLang = LANGUAGES[detection.code] || {
        name: detection.code,
        flag: "🌐",
        native: detection.code,
      };

      let confidenceDisplay = "";
      if (detection.confidence !== null && !isNaN(detection.confidence)) {
        const stars = getConfidenceStars(detection.confidence);
        confidenceDisplay = `${stars} · ${detection.confidence}%`;
      } else {
        confidenceDisplay = "✓ Detected";
      }

      appendMessage(
        "AI",
        `🔍 **Language Detection Result**\n\n` +
          `${detectedLang.flag} **${detectedLang.name}**\n` +
          `📝 Native: ${detectedLang.native}\n` +
          `🎯 Code: \`${detection.code}\` · ${confidenceDisplay}`,
        "bg-indigo-50 text-gray-800",
        "ai",
      );

      const actions = await createActionButtons(text, detection.code);
      if (actions) chatArea.appendChild(actions);

      if (detection.confidence && detection.confidence < 70) {
        showLanguageSuggestions(text);
      }
    } catch (error) {
      console.error("Error:", error);
      removeTypingIndicator(typingId);
      appendMessage(
        "AI",
        "😵 Error occurred. Please try again.",
        "bg-red-50 text-red-800",
        "ai",
      );
    } finally {
      isProcessing = false;
      sendBtn.disabled = false;
      cleanupOldMessages();
      chatArea.scrollTop = chatArea.scrollHeight;
    }
  }

  /* ==================== LANGUAGE DETECTION ==================== */
  async function detectLanguageWithConfidence(text) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&dt=ld&q=${encodeURIComponent(text)}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      let langCode = "en";
      let confidence = null;

      if (data[2]) langCode = data[2];
      else if (data[8]?.[0]?.[1]) langCode = data[8][0][1];

      if (data[8]?.[0]?.[0]) {
        const rawConfidence = parseFloat(data[8][0][0]);
        if (!isNaN(rawConfidence))
          confidence = Math.min(100, Math.round(rawConfidence * 100));
      }

      const langMap = {
        "zh-CN": "zh",
        "zh-TW": "zh",
        "pt-PT": "pt",
        "pt-BR": "pt",
      };

      langCode = langMap[langCode] || langCode;
      return { code: langCode, confidence };
    } catch (error) {
      console.warn("Detection failed:", error);
      return { code: "en", confidence: null };
    }
  }

  /* ==================== CONFIDENCE DISPLAY ==================== */
  function getConfidenceStars(confidence) {
    if (!confidence || isNaN(confidence)) return "";
    const valid = Math.min(100, Math.max(0, confidence));
    const stars = Math.floor(valid / 20);
    return "★".repeat(stars) + "☆".repeat(5 - stars);
  }

  /* ==================== TRANSLATION ==================== */
  async function getEnhancedTranslation(text, targetCode, sourceCode = "auto") {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceCode}&tl=${targetCode}&dt=t&q=${encodeURIComponent(text)}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const translation = data[0].map((item) => item[0]).join(" ");
      return {
        text: translation,
        sourceLang: data[2] || sourceCode,
        targetLang: targetCode,
      };
    } catch (error) {
      console.error("Translation error:", error);
      return {
        text: "⚠️ Translation unavailable",
        sourceLang: "unknown",
        targetLang: targetCode,
      };
    }
  }

  /* ==================== ACTION BUTTONS ==================== */
  async function createActionButtons(originalText, detectedCode) {
    const container = document.createElement("div");
    container.className = "flex flex-col gap-3 ml-6 mt-2";

    const translateCard = document.createElement("div");
    translateCard.className = "action-card";

    const cardHeader = document.createElement("div");
    cardHeader.className = "action-card-header";
    cardHeader.innerHTML = `<i class="fa-solid fa-language"></i> <span>Translate (${Object.keys(LANGUAGES).length} languages)</span>`;
    translateCard.appendChild(cardHeader);

    const cardContent = document.createElement("div");
    cardContent.className = "action-card-content";

    const quickRow = document.createElement("div");
    quickRow.className = "quick-lang-row";
    const popularCodes = [
      "es",
      "fr",
      "de",
      "it",
      "pt",
      "ru",
      "ja",
      "ko",
      "zh",
      "ar",
    ];

    popularCodes.forEach((code) => {
      if (LANGUAGES[code] && code !== detectedCode) {
        const btn = document.createElement("button");
        btn.className = "quick-lang-btn";
        btn.innerHTML = `${LANGUAGES[code].flag} ${LANGUAGES[code].name}`;
        btn.addEventListener("click", async () => {
          btn.disabled = true;
          btn.innerHTML = `${LANGUAGES[code].flag} Translating...`;
          const translation = await getEnhancedTranslation(
            originalText,
            code,
            detectedCode,
          );
          appendMessage(
            "AI",
            `${LANGUAGES[code].flag} **${LANGUAGES[code].name} Translation:**\n\n${translation.text}`,
            "bg-indigo-50 text-gray-800",
            "ai",
          );
          btn.disabled = false;
          btn.innerHTML = `${LANGUAGES[code].flag} ${LANGUAGES[code].name}`;
        });
        quickRow.appendChild(btn);
      }
    });
    cardContent.appendChild(quickRow);

    const selectorWrapper = document.createElement("div");
    selectorWrapper.className = "lang-select-wrapper";

    const langSelect = document.createElement("select");
    langSelect.className = "lang-select";

    const regions = {
      Popular: [
        "en",
        "es",
        "fr",
        "de",
        "it",
        "pt",
        "ru",
        "ja",
        "ko",
        "zh",
        "ar",
        "hi",
      ],
      European: [
        "nl",
        "pl",
        "uk",
        "el",
        "cs",
        "sv",
        "da",
        "fi",
        "no",
        "hu",
        "ro",
        "bg",
        "sr",
        "hr",
        "sk",
        "sl",
      ],
      Asian: ["th", "vi", "id", "ms", "tl", "fa", "ur", "he"],
      Other: ["tr"],
    };

    let currentGroup = "";
    SORTED_LANGUAGES.forEach(({ code, flag, name }) => {
      if (code === detectedCode) return;

      const isPopular = regions.Popular.includes(code);
      const isEuropean = regions.European.includes(code);
      const isAsian = regions.Asian.includes(code);

      if (isPopular && currentGroup !== "popular") {
        const group = document.createElement("optgroup");
        group.label = "⭐ Popular";
        langSelect.appendChild(group);
        currentGroup = "popular";
      } else if (isEuropean && currentGroup !== "european") {
        const group = document.createElement("optgroup");
        group.label = "🇪🇺 European";
        langSelect.appendChild(group);
        currentGroup = "european";
      } else if (isAsian && currentGroup !== "asian") {
        const group = document.createElement("optgroup");
        group.label = "🌏 Asian";
        langSelect.appendChild(group);
        currentGroup = "asian";
      } else if (
        !isPopular &&
        !isEuropean &&
        !isAsian &&
        currentGroup !== "other"
      ) {
        const group = document.createElement("optgroup");
        group.label = "🌍 Other";
        langSelect.appendChild(group);
        currentGroup = "other";
      }

      const option = document.createElement("option");
      option.value = code;
      option.textContent = `${flag} ${name}`;
      langSelect.appendChild(option);
    });

    const translateBtn = document.createElement("button");
    translateBtn.className = "translate-btn";
    translateBtn.innerHTML = '<i class="fa-solid fa-arrow-right"></i> Go';

    translateBtn.addEventListener("click", async () => {
      const targetCode = langSelect.value;
      translateBtn.disabled = true;
      translateBtn.innerHTML =
        '<i class="fa-solid fa-spinner spinner"></i> Translating...';
      const translation = await getEnhancedTranslation(
        originalText,
        targetCode,
        detectedCode,
      );
      const targetLang = LANGUAGES[targetCode];
      appendMessage(
        "AI",
        `${targetLang.flag} **${targetLang.name} Translation:**\n\n${translation.text}`,
        "bg-indigo-50 text-gray-800",
        "ai",
      );
      translateBtn.disabled = false;
      translateBtn.innerHTML = '<i class="fa-solid fa-arrow-right"></i> Go';
    });

    selectorWrapper.appendChild(langSelect);
    selectorWrapper.appendChild(translateBtn);
    cardContent.appendChild(selectorWrapper);
    translateCard.appendChild(cardContent);
    container.appendChild(translateCard);

    if (detectedCode === "en" && originalText.length > 150) {
      const summaryCard = document.createElement("div");
      summaryCard.className = "action-card";

      const summaryHeader = document.createElement("div");
      summaryHeader.className = "action-card-header";
      summaryHeader.innerHTML =
        '<i class="fa-solid fa-compress"></i> <span>Summarization</span>';
      summaryCard.appendChild(summaryHeader);

      const summaryContent = document.createElement("div");
      summaryContent.className = "action-card-content";

      const summaryBtn = document.createElement("button");
      summaryBtn.className = "action-btn";
      summaryBtn.innerHTML =
        '<i class="fa-solid fa-magic"></i> Generate Summary';

      summaryBtn.addEventListener("click", () => {
        const summary = summarizeText(originalText);
        appendMessage(
          "AI",
          `📝 **Summary**\n\n${summary}`,
          "bg-purple-50 text-gray-800",
          "ai",
        );
      });

      summaryContent.appendChild(summaryBtn);
      summaryCard.appendChild(summaryContent);
      container.appendChild(summaryCard);
    }

    return container;
  }

  /* ==================== LANGUAGE SUGGESTIONS ==================== */
  function showLanguageSuggestions(text) {
    const suggestions = document.createElement("div");
    suggestions.className = "language-suggestions";

    const title = document.createElement("div");
    title.className = "suggestions-title";
    title.innerHTML =
      '<i class="fa-solid fa-lightbulb"></i> <span>Not sure? Try:</span>';
    suggestions.appendChild(title);

    const buttons = document.createElement("div");
    buttons.className = "suggestions-buttons";

    Object.entries(LANGUAGES)
      .slice(0, 5)
      .forEach(([code, lang]) => {
        const btn = document.createElement("button");
        btn.className = "suggestion-btn";
        btn.innerHTML = `${lang.flag} ${lang.name}`;
        btn.addEventListener("click", async () => {
          const translation = await getEnhancedTranslation(text, code, "auto");
          appendMessage(
            "AI",
            `${lang.flag} **${lang.name} Translation:**\n\n${translation.text}`,
            "bg-yellow-50 text-gray-800",
            "ai",
          );
        });
        buttons.appendChild(btn);
      });

    suggestions.appendChild(buttons);
    chatArea.appendChild(suggestions);
  }

  /* ==================== TEXT SUMMARIZATION ==================== */
  function summarizeText(text, numSentences = 2) {
    if (!text || text.length < 50) return text;

    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    if (sentences.length <= numSentences) return text;

    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const wordFreq = {};
    words.forEach((w) => (wordFreq[w] = (wordFreq[w] || 0) + 1));

    const scored = sentences.map((sentence) => {
      const sentenceWords = sentence.toLowerCase().match(/\b\w+\b/g) || [];
      const score = sentenceWords.reduce(
        (sum, word) => sum + (wordFreq[word] || 0),
        0,
      );
      return {
        sentence: sentence.trim(),
        score: score + (sentences.indexOf(sentence) === 0 ? 5 : 0),
      };
    });

    const topSentences = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, numSentences)
      .sort(
        (a, b) => sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence),
      )
      .map((s) => s.sentence);

    return topSentences.join(" ");
  }

  /* ==================== MESSAGE MANAGEMENT ==================== */
  function appendMessage(
    sender,
    text,
    bgColor,
    senderType = "user",
    saveToStorage = true,
  ) {
    const container = document.createElement("div");
    container.className = `message-container ${senderType === "user" ? "user" : "ai"}`;

    const content = document.createElement("div");
    content.style.display = "flex";
    content.style.flexDirection = "column";

    const bubble = document.createElement("div");
    bubble.className = `message-bubble ${senderType === "user" ? "user" : "ai"}`;

    let formattedText = text
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br>");

    bubble.innerHTML = formattedText;

    const timestamp = document.createElement("div");
    timestamp.className = "message-timestamp";
    timestamp.textContent = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (senderType === "ai") {
      const actions = document.createElement("div");
      actions.className = "message-actions";

      const copyBtn = document.createElement("button");
      copyBtn.className = "message-action-btn";
      copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> Copy';
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(text).then(() => {
          copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
          setTimeout(() => {
            copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> Copy';
          }, 2000);
        });
      });
      actions.appendChild(copyBtn);
      content.appendChild(actions);
    }

    content.appendChild(bubble);
    content.appendChild(timestamp);
    container.appendChild(content);
    chatArea.appendChild(container);

    // Save chat history after adding message (unless disabled)
    if (saveToStorage) {
      saveChatHistory();
    }
  }

  function showTypingIndicator() {
    const id = "typing-" + Date.now();
    const indicator = document.createElement("div");
    indicator.id = id;
    indicator.className = "typing-indicator";
    indicator.innerHTML = `
      <div class="typing-dots">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span>AI is thinking...</span>
      </div>
    `;
    chatArea.appendChild(indicator);
    chatArea.scrollTop = chatArea.scrollHeight;
    return id;
  }

  function removeTypingIndicator(id) {
    document.getElementById(id)?.remove();
  }

  function cleanupOldMessages() {
    const messages = chatArea.querySelectorAll(".message-container");
    if (messages.length > MAX_MESSAGES) {
      for (let i = 0; i < messages.length - MAX_MESSAGES; i++) {
        messages[i]?.remove();
      }
    }
  }

  /* ==================== ERROR HANDLING ==================== */
  function showError(message) {
    errorText.textContent = message;
    errorDiv.classList.add("show");
    setTimeout(hideError, 4000);
  }

  function hideError() {
    errorDiv.classList.remove("show");
    errorText.textContent = "";
  }

  /* ==================== INITIALIZATION ==================== */
  function init() {
    initTheme();
    initSpeechRecognition();
    setupEventListeners();

    // Load chat history or show welcome message
    const savedHistory = localStorage.getItem("linguaFlow-chatHistory");
    if (savedHistory && savedHistory !== "[]") {
      loadChatHistory();
    } else {
      showWelcomeMessage();
    }
  }

  init();
});
