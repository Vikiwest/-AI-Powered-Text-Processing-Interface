document.addEventListener("DOMContentLoaded", () => {
    // --- DOM Elements ---
    const inputText = document.getElementById("input-text");
    const sendBtn = document.getElementById("send-btn");
    const chatArea = document.getElementById("chat-area");
    const errorDiv = document.getElementById("error-message");
    const errorText = document.getElementById("error-text");
    const clearInputBtn = document.getElementById("clear-btn");

    // --- State & Constants ---
    let isProcessing = false;
    const MAX_MESSAGES = 50;

    // --- Complete Language Database (30+ languages with flags and names) ---
    const LANGUAGES = {
        // Major Languages
        'en': { name: 'English', flag: '🇺🇸', native: 'English' },
        'es': { name: 'Spanish', flag: '🇪🇸', native: 'Español' },
        'fr': { name: 'French', flag: '🇫🇷', native: 'Français' },
        'de': { name: 'German', flag: '🇩🇪', native: 'Deutsch' },
        'it': { name: 'Italian', flag: '🇮🇹', native: 'Italiano' },
        'pt': { name: 'Portuguese', flag: '🇵🇹', native: 'Português' },
        'ru': { name: 'Russian', flag: '🇷🇺', native: 'Русский' },
        'ja': { name: 'Japanese', flag: '🇯🇵', native: '日本語' },
        'ko': { name: 'Korean', flag: '🇰🇷', native: '한국어' },
        'zh': { name: 'Chinese', flag: '🇨🇳', native: '中文' },
        'ar': { name: 'Arabic', flag: '🇸🇦', native: 'العربية' },
        'hi': { name: 'Hindi', flag: '🇮🇳', native: 'हिन्दी' },
        
        // European Languages
        'nl': { name: 'Dutch', flag: '🇳🇱', native: 'Nederlands' },
        'pl': { name: 'Polish', flag: '🇵🇱', native: 'Polski' },
        'uk': { name: 'Ukrainian', flag: '🇺🇦', native: 'Українська' },
        'el': { name: 'Greek', flag: '🇬🇷', native: 'Ελληνικά' },
        'cs': { name: 'Czech', flag: '🇨🇿', native: 'Čeština' },
        'sv': { name: 'Swedish', flag: '🇸🇪', native: 'Svenska' },
        'da': { name: 'Danish', flag: '🇩🇰', native: 'Dansk' },
        'fi': { name: 'Finnish', flag: '🇫🇮', native: 'Suomi' },
        'no': { name: 'Norwegian', flag: '🇳🇴', native: 'Norsk' },
        'hu': { name: 'Hungarian', flag: '🇭🇺', native: 'Magyar' },
        'ro': { name: 'Romanian', flag: '🇷🇴', native: 'Română' },
        'bg': { name: 'Bulgarian', flag: '🇧🇬', native: 'Български' },
        'sr': { name: 'Serbian', flag: '🇷🇸', native: 'Српски' },
        'hr': { name: 'Croatian', flag: '🇭🇷', native: 'Hrvatski' },
        'sk': { name: 'Slovak', flag: '🇸🇰', native: 'Slovenčina' },
        'sl': { name: 'Slovenian', flag: '🇸🇮', native: 'Slovenščina' },
        
        // Asian Languages
        'th': { name: 'Thai', flag: '🇹🇭', native: 'ไทย' },
        'vi': { name: 'Vietnamese', flag: '🇻🇳', native: 'Tiếng Việt' },
        'id': { name: 'Indonesian', flag: '🇮🇩', native: 'Bahasa Indonesia' },
        'ms': { name: 'Malay', flag: '🇲🇾', native: 'Bahasa Melayu' },
        'tl': { name: 'Tagalog', flag: '🇵🇭', native: 'Tagalog' },
        
        // Other Major Languages
        'tr': { name: 'Turkish', flag: '🇹🇷', native: 'Türkçe' },
        'fa': { name: 'Persian', flag: '🇮🇷', native: 'فارسی' },
        'ur': { name: 'Urdu', flag: '🇵🇰', native: 'اردو' },
        'he': { name: 'Hebrew', flag: '🇮🇱', native: 'עברית' }
    };

    // Sort languages alphabetically for the dropdown
    const SORTED_LANGUAGES = Object.entries(LANGUAGES)
        .sort(([, a], [, b]) => a.name.localeCompare(b.name))
        .map(([code, data]) => ({ code, ...data }));

    // --- Welcome Message ---
    const welcomeMessage = `👋 **Welcome to LinguaFlow Pro!**\n\nI can detect and translate between **${Object.keys(LANGUAGES).length}+ languages**. Try sending me text in any of these languages:\n\n` +
        Object.entries(LANGUAGES).slice(0, 10).map(([code, lang]) => `${lang.flag} ${lang.name}`).join(' · ') + 
        `\n\n✨ **Features:**\n• 🔍 Automatic language detection\n• 🌐 Translate to any of ${Object.keys(LANGUAGES).length} languages\n• 📝 Smart summarization for English text (150+ chars)\n• 🎯 Real-time language identification`;
    
    appendMessage("AI", welcomeMessage, "bg-indigo-50 text-gray-800", "ai");

    // --- Event Listeners ---
    sendBtn.addEventListener("click", processText);
    
    inputText.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            processText();
        }
    });
    
    clearInputBtn?.addEventListener("click", () => {
        inputText.value = "";
        inputText.focus();
        hideError();
    });

    // --- Core Processing ---
    async function processText() {
        const text = inputText.value.trim();

        if (!text) {
            showError("Please enter some text to process");
            return;
        }
        
        if (isProcessing) {
            showError("Still processing your previous request...");
            return;
        }

        hideError();
        isProcessing = true;
        sendBtn.disabled = true;
        sendBtn.classList.add("opacity-50", "cursor-not-waiting");

        // Show user message
        appendMessage("You", text, "bg-indigo-100 text-gray-800", "user");
        inputText.value = "";
        inputText.style.height = "auto";

        // Show typing indicator
        const typingId = showTypingIndicator();

        try {
            // Detect language with enhanced info
            const detection = await detectLanguageWithConfidence(text);
            
            removeTypingIndicator(typingId);

            // Format language display with flag and confidence
            const detectedLang = LANGUAGES[detection.code] || { name: detection.code, flag: '🌐', native: detection.code };
            
            // FIXED: Safe confidence display
            let confidenceDisplay = '';
            if (detection.confidence !== null && !isNaN(detection.confidence)) {
                const confidenceStars = getConfidenceStars(detection.confidence);
                confidenceDisplay = `${confidenceStars} · ${detection.confidence}%`;
            } else {
                confidenceDisplay = '✓ Detected';
            }
            
            appendMessage("AI", 
                `🔍 **Language Detection Result**\n\n` +
                `${detectedLang.flag} **${detectedLang.name}**\n` +
                `📝 Native: ${detectedLang.native || detectedLang.name}\n` +
                `🎯 Code: \`${detection.code}\` · ${confidenceDisplay}`, 
                "bg-gray-100 text-gray-800", "ai");

            // Show translation options
            const actions = await createEnhancedActionButtons(text, detection.code);
            if (actions) {
                chatArea.appendChild(actions);
            }

            // Show alternative language suggestions if confidence is low and available
            if (detection.confidence && detection.confidence < 70 && !isNaN(detection.confidence)) {
                showLanguageSuggestions(text);
            }

        } catch (error) {
            console.error("Processing error:", error);
            removeTypingIndicator(typingId);
            appendMessage("AI", "😵 Sorry, I encountered an error. Please try again.", "bg-red-50 text-red-800", "ai");
        } finally {
            isProcessing = false;
            sendBtn.disabled = false;
            sendBtn.classList.remove("opacity-50", "cursor-not-waiting");
        }

        cleanupOldMessages();
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    // --- FIXED: Enhanced Language Detection with Confidence ---
    async function detectLanguageWithConfidence(text) {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&dt=ld&q=${encodeURIComponent(text)}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            
            // Extract language code
            let langCode = 'en';
            let confidence = null; // Start with null instead of a number
            
            // Language code is usually in position 2
            if (data[2]) {
                langCode = data[2];
            } else if (data[8] && data[8][0] && data[8][0][1]) {
                langCode = data[8][0][1];
            }
            
            // FIXED: Safely extract confidence - Google Translate API structure varies
            try {
                // Try different possible locations for confidence data
                if (data[8] && data[8][0] && data[8][0][0] !== undefined) {
                    // Convert to number and validate
                    const rawConfidence = parseFloat(data[8][0][0]);
                    if (!isNaN(rawConfidence) && rawConfidence > 0) {
                        confidence = Math.min(100, Math.round(rawConfidence * 100));
                    }
                }
                
                // Alternative location for confidence
                if (confidence === null && data[7] && data[7][0] && data[7][0][0] !== undefined) {
                    const rawConfidence = parseFloat(data[7][0][0]);
                    if (!isNaN(rawConfidence) && rawConfidence > 0) {
                        confidence = Math.min(100, Math.round(rawConfidence * 100));
                    }
                }
                
                // Another possible location
                if (confidence === null && data[5] && data[5][0] && data[5][0][0] !== undefined) {
                    const rawConfidence = parseFloat(data[5][0][0]);
                    if (!isNaN(rawConfidence) && rawConfidence > 0) {
                        confidence = Math.min(100, Math.round(rawConfidence * 100));
                    }
                }
            } catch (e) {
                console.log("Confidence extraction not available, using null");
            }
            
            // Map common Google Translate codes to our system
            const langMap = {
                'zh-CN': 'zh',
                'zh-TW': 'zh',
                'pt-PT': 'pt',
                'pt-BR': 'pt'
            };
            
            langCode = langMap[langCode] || langCode;
            
            return {
                code: langCode,
                confidence: confidence // Will be null if not available
            };
            
        } catch (error) {
            console.warn("Language detection failed:", error);
            return { code: 'en', confidence: null };
        }
    }

    // --- FIXED: Confidence stars helper (handles null/undefined) ---
    function getConfidenceStars(confidence) {
        // If confidence is null/undefined/NaN, return empty string
        if (confidence === null || confidence === undefined || isNaN(confidence)) {
            return '';
        }
        
        // Ensure confidence is between 0-100
        const validConfidence = Math.min(100, Math.max(0, confidence));
        const starCount = Math.floor(validConfidence / 20); // 0-5 stars
        return '★'.repeat(starCount) + '☆'.repeat(5 - starCount);
    }

    // --- Enhanced Translation with Language Names ---
    async function getEnhancedTranslation(text, targetCode, sourceCode = 'auto') {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceCode}&tl=${targetCode}&dt=t&q=${encodeURIComponent(text)}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            
            // Extract translation and source language
            const translation = data[0].map(item => item[0]).join(" ");
            const detectedSource = data[2] || sourceCode;
            
            return {
                text: translation,
                sourceLang: detectedSource,
                targetLang: targetCode
            };
            
        } catch (error) {
            console.error("Translation error:", error);
            return {
                text: "⚠️ Translation unavailable. Please try again.",
                sourceLang: 'unknown',
                targetLang: targetCode
            };
        }
    }

    // --- Helper Functions ---
    function showError(message) {
        errorText.textContent = message;
        errorDiv.classList.remove("hidden");
        setTimeout(hideError, 4000);
    }

    function hideError() {
        errorDiv.classList.add("hidden");
        errorText.textContent = "";
    }

    function appendMessage(sender, text, bgColor, senderType = "user") {
        const messageDiv = document.createElement("div");
        messageDiv.className = `flex ${senderType === 'user' ? 'justify-end' : 'justify-start'} mb-3`;
        
        const bubble = document.createElement("div");
        
        // Enhanced formatting
        let formattedText = text
            .replace(/\`(.*?)\`/g, '<code class="bg-gray-200 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
            .replace(/\n/g, '<br>');
        
        bubble.innerHTML = formattedText;
        bubble.className = `p-4 rounded-2xl max-w-[80%] shadow-sm ${bgColor} ${senderType === 'user' ? 'rounded-br-none' : 'rounded-bl-none'}`;
        
        messageDiv.appendChild(bubble);
        chatArea.appendChild(messageDiv);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    function showTypingIndicator() {
        const id = 'typing-' + Date.now();
        const indicator = document.createElement("div");
        indicator.id = id;
        indicator.className = "flex justify-start";
        indicator.innerHTML = `
            <div class="bg-gray-100 text-gray-500 p-4 rounded-2xl rounded-bl-none flex items-center gap-2">
                <div class="flex gap-1">
                    <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0s"></span>
                    <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
                    <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></span>
                </div>
                <span class="text-sm">AI is thinking...</span>
            </div>`;
        chatArea.appendChild(indicator);
        chatArea.scrollTop = chatArea.scrollHeight;
        return id;
    }

    function removeTypingIndicator(id) {
        document.getElementById(id)?.remove();
    }

    function cleanupOldMessages() {
        const messages = chatArea.querySelectorAll('div.flex');
        if (messages.length > MAX_MESSAGES) {
            for (let i = 0; i < messages.length - MAX_MESSAGES; i++) {
                messages[i]?.remove();
            }
        }
    }

    // --- Show Language Suggestions for Low Confidence ---
    async function showLanguageSuggestions(text) {
        const suggestions = document.createElement("div");
        suggestions.className = "ml-6 p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-sm";
        suggestions.innerHTML = `
            <div class="flex items-center gap-2 text-yellow-700 mb-2">
                <i class="fa-solid fa-lightbulb"></i>
                <span class="font-medium">Not sure about the language? Try translating to:</span>
            </div>
            <div class="flex flex-wrap gap-2">
                ${Object.entries(LANGUAGES).slice(0, 5).map(([code, lang]) => `
                    <button class="lang-suggestion px-3 py-1.5 bg-white rounded-full border border-yellow-200 hover:bg-yellow-100 transition-colors text-xs flex items-center gap-1"
                            data-lang="${code}">
                        ${lang.flag} ${lang.name}
                    </button>
                `).join('')}
            </div>
        `;
        
        // Add click handlers to suggestions
        suggestions.querySelectorAll('.lang-suggestion').forEach(btn => {
            btn.addEventListener('click', async () => {
                const langCode = btn.dataset.lang;
                const translation = await getEnhancedTranslation(text, langCode, 'auto');
                const targetLang = LANGUAGES[langCode];
                appendMessage("AI", 
                    `${targetLang.flag} **${targetLang.name} Translation:**\n\n${translation.text}`, 
                    "bg-yellow-50 text-gray-800", "ai");
            });
        });
        
        chatArea.appendChild(suggestions);
    }

    // --- Enhanced Action Buttons with 30+ Languages ---
    async function createEnhancedActionButtons(originalText, detectedCode) {
        const container = document.createElement("div");
        container.className = "flex flex-col gap-3 ml-6 mt-2";

        // Translation Section
        const translateSection = document.createElement("div");
        translateSection.className = "bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden";

        // Header
        const header = document.createElement("div");
        header.className = "bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center gap-2";
        header.innerHTML = `
            <i class="fa-solid fa-language text-indigo-500"></i>
            <span class="font-medium text-sm">Translate to (${Object.keys(LANGUAGES).length} languages available)</span>
        `;
        translateSection.appendChild(header);

        // Language selector with search
        const selectorDiv = document.createElement("div");
        selectorDiv.className = "p-3";

        // Quick language row (popular languages)
        const quickRow = document.createElement("div");
        quickRow.className = "flex flex-wrap gap-1 mb-3 pb-2 border-b border-gray-100";
        const popularCodes = ['es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar'];
        
        popularCodes.forEach(code => {
            if (LANGUAGES[code] && code !== detectedCode) {
                const btn = document.createElement("button");
                btn.className = "quick-lang-btn px-2 py-1 text-xs bg-gray-100 hover:bg-indigo-100 rounded-full transition-colors flex items-center gap-1";
                btn.innerHTML = `${LANGUAGES[code].flag} ${LANGUAGES[code].name}`;
                btn.addEventListener('click', async () => {
                    btn.disabled = true;
                    btn.innerHTML = `${LANGUAGES[code].flag} Translating...`;
                    
                    const translation = await getEnhancedTranslation(originalText, code, detectedCode);
                    
                    appendMessage("AI", 
                        `${LANGUAGES[code].flag} **${LANGUAGES[code].name} Translation:**\n\n${translation.text}`, 
                        "bg-indigo-50 text-gray-800", "ai");
                    
                    btn.disabled = false;
                    btn.innerHTML = `${LANGUAGES[code].flag} ${LANGUAGES[code].name}`;
                });
                quickRow.appendChild(btn);
            }
        });
        selectorDiv.appendChild(quickRow);

        // Full language dropdown
        const selectWrapper = document.createElement("div");
        selectWrapper.className = "flex gap-2";

        const langSelect = document.createElement("select");
        langSelect.className = "flex-1 p-2.5 text-sm rounded-lg border border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 bg-white";
        
        // Group languages by region for better UX
        const regions = {
            'Popular': ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi'],
            'European': ['nl', 'pl', 'uk', 'el', 'cs', 'sv', 'da', 'fi', 'no', 'hu', 'ro', 'bg', 'sr', 'hr', 'sk', 'sl'],
            'Asian': ['th', 'vi', 'id', 'ms', 'tl', 'fa', 'ur', 'he'],
            'Other': ['tr']
        };

        let currentGroup = '';
        SORTED_LANGUAGES.forEach(({code, flag, name}) => {
            if (code === detectedCode) return; // Don't show detected language
            
            // Add optgroup labels
            if (regions.Popular.includes(code) && currentGroup !== 'popular') {
                if (currentGroup) langSelect.appendChild(document.createElement('optgroup'));
                const group = document.createElement('optgroup');
                group.label = '⭐ Popular Languages';
                langSelect.appendChild(group);
                currentGroup = 'popular';
            } else if (regions.European.includes(code) && currentGroup !== 'european') {
                const group = document.createElement('optgroup');
                group.label = '🇪🇺 European Languages';
                langSelect.appendChild(group);
                currentGroup = 'european';
            } else if (regions.Asian.includes(code) && currentGroup !== 'asian') {
                const group = document.createElement('optgroup');
                group.label = '🌏 Asian Languages';
                langSelect.appendChild(group);
                currentGroup = 'asian';
            } else if (regions.Other.includes(code) && currentGroup !== 'other') {
                const group = document.createElement('optgroup');
                group.label = '🌍 Other Languages';
                langSelect.appendChild(group);
                currentGroup = 'other';
            }
            
            const option = document.createElement("option");
            option.value = code;
            option.textContent = `${flag} ${name}`;
            langSelect.appendChild(option);
        });

        const translateBtn = document.createElement("button");
        translateBtn.className = "bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2";
        translateBtn.innerHTML = '<i class="fa-solid fa-arrow-right"></i><span>Go</span>';

        translateBtn.addEventListener('click', async () => {
            const targetCode = langSelect.value;
            translateBtn.disabled = true;
            translateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Translating...</span>';
            
            const translation = await getEnhancedTranslation(originalText, targetCode, detectedCode);
            const targetLang = LANGUAGES[targetCode];
            
            appendMessage("AI", 
                `${targetLang.flag} **${targetLang.name} Translation:**\n\n${translation.text}`, 
                "bg-indigo-50 text-gray-800", "ai");
            
            translateBtn.disabled = false;
            translateBtn.innerHTML = '<i class="fa-solid fa-arrow-right"></i><span>Go</span>';
        });

        selectWrapper.appendChild(langSelect);
        selectWrapper.appendChild(translateBtn);
        selectorDiv.appendChild(selectWrapper);
        translateSection.appendChild(selectorDiv);
        container.appendChild(translateSection);

        // Summarization (if applicable)
        if (detectedCode === 'en' && originalText.length > 150) {
            const summarySection = document.createElement("div");
            summarySection.className = "bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden";
            
            const summaryHeader = document.createElement("div");
            summaryHeader.className = "bg-purple-50 px-4 py-2 border-b border-purple-200 flex items-center gap-2";
            summaryHeader.innerHTML = `
                <i class="fa-solid fa-compress text-purple-500"></i>
                <span class="font-medium text-sm">Text Summarization</span>
            `;
            summarySection.appendChild(summaryHeader);
            
            const summaryBody = document.createElement("div");
            summaryBody.className = "p-3";
            
            const summaryBtn = document.createElement("button");
            summaryBtn.className = "w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2";
            summaryBtn.innerHTML = '<i class="fa-solid fa-magic"></i><span>Generate Summary</span>';
            
            summaryBtn.addEventListener('click', () => {
                const summary = summarizeText(originalText);
                appendMessage("AI", 
                    `📝 **Summary**\n\n${summary}`, 
                    "bg-purple-50 text-gray-800", "ai");
            });
            
            summaryBody.appendChild(summaryBtn);
            summarySection.appendChild(summaryBody);
            container.appendChild(summarySection);
        }

        return container;
    }

    // --- Enhanced Summarization ---
    function summarizeText(text, numSentences = 2) {
        if (!text) return "No text to summarize";
        
        // Split into sentences
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        if (sentences.length <= numSentences) return text;
        
        // Simple extractive summarization based on word frequency
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        const wordFreq = {};
        words.forEach(w => wordFreq[w] = (wordFreq[w] || 0) + 1);
        
        // Score sentences
        const scored = sentences.map(sentence => {
            const sentenceWords = sentence.toLowerCase().match(/\b\w+\b/g) || [];
            const score = sentenceWords.reduce((sum, word) => sum + (wordFreq[word] || 0), 0);
            const positionBonus = sentences.indexOf(sentence) === 0 ? 5 : 0; // Bonus for first sentence
            return { sentence: sentence.trim(), score: score + positionBonus };
        });
        
        // Get top sentences while preserving order
        const topSentences = scored
            .sort((a, b) => b.score - a.score)
            .slice(0, numSentences)
            .sort((a, b) => sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence))
            .map(s => s.sentence);
        
        return topSentences.join(' ');
    }
});