import { useState, useRef, useEffect } from "react";
import { ChevronDown, Globe, Loader, AlertCircle } from "lucide-react";
import translationService from "../services/translationService";

function DeepLTranslateWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState({
    code: "EN",
    name: "English",
    deepLCode: "EN",
  });
  const [isTranslating, setIsTranslating] = useState(false);
  const [originalContent, setOriginalContent] = useState(new Map());
  const [error, setError] = useState("");
  const dropdownRef = useRef(null);

  const languages = [
    { code: "EN", name: "English", deepLCode: "EN" },
    { code: "AR", name: "العربية", deepLCode: "AR" },
    { code: "DE", name: "Deutsch", deepLCode: "DE" },
    { code: "ES", name: "Español", deepLCode: "ES" },
    { code: "FR", name: "Français", deepLCode: "FR" },
    { code: "IT", name: "Italiano", deepLCode: "IT" },
    { code: "JA", name: "日本語", deepLCode: "JA" },
    { code: "KO", name: "한국어", deepLCode: "KO" },
    { code: "NL", name: "Nederlands", deepLCode: "NL" },
    { code: "PL", name: "Polski", deepLCode: "PL" },
    { code: "PT", name: "Português", deepLCode: "PT" },
    { code: "RU", name: "Русский", deepLCode: "RU" },
    { code: "ZH", name: "中文", deepLCode: "ZH" },
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const shouldExcludeElement = (element) => {
    if (
      element.classList.contains("notranslate") ||
      element.getAttribute("translate") === "no" ||
      element.closest(".notranslate")
    )
      return true;

    const headerSelectors = [
      "header",
      "nav",
      ".header",
      ".navbar",
      ".navigation",
      ".top-bar",
      ".site-header",
      '[role="banner"]',
      '[role="navigation"]',
    ];
    for (const selector of headerSelectors) {
      if (element.closest(selector)) return true;
    }

    const patterns = [/header/i, /navbar/i, /menu/i];
    let parent = element;
    for (let i = 0; i < 5 && parent; i++, parent = parent.parentElement) {
      const cls = Array.from(parent.classList).join(" ");
      if (patterns.some((p) => p.test(cls))) return true;
    }

    return false;
  };

  const showToast = (message, type = "info") => {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.className = `fixed top-5 right-5 z-[9999] px-4 py-2 rounded shadow text-sm font-medium ${
      type === "error"
        ? "bg-red-500 text-white"
        : type === "success"
        ? "bg-green-500 text-white"
        : "bg-blue-600 text-white"
    }`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-10px)";
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  };

  const testBackendConnection = async () => {
    try {
      const res = await translationService.testApi();
      return res && res.success !== false;
    } catch {
      showToast("Backend connection failed.", "error");
      return false;
    }
  };

  // Improved text extraction function
  const getElementText = (element) => {
    if (element.classList.contains('translatable')) {
      // For translatable elements, get the text content but preserve structure
      return element.textContent?.trim() || '';
    } else {
      // For regular elements, check if it's text-only
      if (element.children.length === 0) {
        return element.textContent?.trim() || '';
      }
      // If has children, only process if all children are text nodes
      let hasNonTextChildren = false;
      for (let child of element.childNodes) {
        if (child.nodeType !== Node.TEXT_NODE && child.nodeType !== Node.ELEMENT_NODE) {
          continue;
        }
        if (child.nodeType === Node.ELEMENT_NODE) {
          hasNonTextChildren = true;
          break;
        }
      }
      return hasNonTextChildren ? '' : element.textContent?.trim() || '';
    }
  };

  // Improved text setting function
  const setElementText = (element, text) => {
    if (element.classList.contains('translatable')) {
      // For translatable elements, replace the text content while preserving structure
      // Find all text nodes and replace them
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      const textNodes = [];
      let node;
      while (node = walker.nextNode()) {
        if (node.nodeValue.trim()) {
          textNodes.push(node);
        }
      }
      
      if (textNodes.length === 1) {
        // If there's only one text node, replace it
        textNodes[0].nodeValue = text;
      } else if (textNodes.length === 0) {
        // If no text nodes, set textContent
        element.textContent = text;
      } else {
        // If multiple text nodes, replace the first significant one
        const mainTextNode = textNodes.find(tn => tn.nodeValue.trim().length > 1) || textNodes[0];
        mainTextNode.nodeValue = text;
        // Clear other text nodes
        textNodes.forEach(tn => {
          if (tn !== mainTextNode) {
            tn.nodeValue = '';
          }
        });
      }
    } else {
      // For regular elements, set textContent
      element.textContent = text;
    }
  };

  const storeOriginalContent = () => {
    const elements = document.querySelectorAll(
      "p, h1, h2, h3, h4, h5, h6, span, button, a, li, td, th, label, .translatable"
    );
    const map = new Map();
    let index = 0;
    
    elements.forEach((el) => {
      const text = getElementText(el);
      if (
        text &&
        text.length > 1 &&
        text.length < 300 &&
        !shouldExcludeElement(el)
      ) {
        map.set(`el_${index++}`, { text, element: el });
      }
    });
    
    setOriginalContent(map);
    console.log(`Stored ${map.size} elements for translation`);
  };

  const restoreOriginalContent = () => {
    let restored = 0;
    originalContent.forEach(({ text, element }) => {
      try {
        setElementText(element, text);
        restored++;
      } catch (error) {
        console.warn('Failed to restore element:', error);
      }
    });
    console.log(`Restored ${restored} elements`);
    showToast("Restored original content", "success");
  };

  const translatePageContent = async (targetLang) => {
    const elements = Array.from(
      document.querySelectorAll(
        "p, h1, h2, h3, h4, h5, h6, span, button, a, li, td, th, label, .translatable"
      )
    ).filter((el) => {
      const text = getElementText(el);
      return (
        text &&
        text.length > 1 &&
        text.length < 1000 &&
        !shouldExcludeElement(el)
      );
    });

    if (elements.length === 0) {
      showToast("No translatable content found", "error");
      return;
    }

    console.log(`Found ${elements.length} elements to translate`);
    const texts = elements.map(el => getElementText(el));

    try {
      showToast("Translating page...");
      const data = await translationService.translateBatch({
        texts,
        target_lang: targetLang,
        source_lang: "EN",
      });
      
      let translated = 0;
      data.translations.forEach((translatedText, i) => {
        try {
          setElementText(elements[i], translatedText);
          translated++;
        } catch (error) {
          console.warn(`Failed to set translation for element ${i}:`, error);
        }
      });
      
      console.log(`Successfully translated ${translated} elements`);
      showToast(`Translation complete! (${translated} elements)`, "success");
    } catch (err) {
      console.warn("Batch translation failed, trying individual translations:", err);
      showToast("Batch translation failed. Trying individual translations...", "error");
      
      let translated = 0;
      for (let i = 0; i < elements.length; i++) {
        try {
          const data = await translationService.translateSingle({
            text: texts[i],
            target_lang: targetLang,
            source_lang: "EN",
          });
          setElementText(elements[i], data.translation);
          translated++;
        } catch (error) {
          console.warn(`Failed to translate element ${i}:`, error);
        }
      }
      
      showToast(`Individual translation complete! (${translated} elements)`, "success");
    }
  };

  const handleLanguageSelect = async (lang) => {
    if (lang.code === selectedLang.code || isTranslating) return;
    
    setSelectedLang(lang);
    setIsOpen(false);
    setIsTranslating(true);
    setError("");

    console.log(`Switching to language: ${lang.name} (${lang.deepLCode})`);

    const connected = await testBackendConnection();
    if (!connected) {
      setIsTranslating(false);
      return;
    }

    // Store original content if not already stored or if it's empty
    if (originalContent.size === 0) {
      storeOriginalContent();
    }

    if (lang.deepLCode === "EN") {
      // If selecting English, restore original content
      restoreOriginalContent();
    } else {
      // First restore to English to ensure we're translating from a clean state
      if (selectedLang.deepLCode !== "EN") {
        originalContent.forEach(({ text, element }) => {
          try {
            setElementText(element, text);
          } catch (error) {
            console.warn('Failed to restore element before translation:', error);
          }
        });
        // Small delay to let DOM update
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Then translate to the target language
      await translatePageContent(lang.deepLCode);
    }

    localStorage.setItem("selectedLanguage", JSON.stringify(lang));
    setIsTranslating(false);
  };

  // Expose translation functionality globally for dynamic content
  useEffect(() => {
    window.translateWidget = {
      translateNewContent: () => {
        if (selectedLang.deepLCode !== "EN") {
          console.log('Translating new content to:', selectedLang.name);
          // First store/update original content for any new elements
          const currentStoredCount = originalContent.size;
          storeOriginalContent();
          const newStoredCount = originalContent.size;
          
          if (newStoredCount > currentStoredCount) {
            console.log(`Found ${newStoredCount - currentStoredCount} new elements to translate`);
          }
          
          // Translate to current language
          translatePageContent(selectedLang.deepLCode);
        } else {
          console.log('Skipping translation - currently in English');
        }
      },
      getCurrentLanguage: () => selectedLang,
    };

    return () => {
      delete window.translateWidget;
    };
  }, [selectedLang, originalContent]);

  // Load saved language on component mount
  useEffect(() => {
    const savedLang = localStorage.getItem("selectedLanguage");
    if (savedLang) {
      try {
        const parsedLang = JSON.parse(savedLang);
        const validLang = languages.find(l => l.code === parsedLang.code);
        if (validLang) {
          setSelectedLang(validLang);
        }
      } catch (error) {
        console.warn('Failed to parse saved language:', error);
      }
    }
  }, []);

  return (
    <div className="relative notranslate" ref={dropdownRef} translate="no">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={isTranslating}
      >
        {isTranslating ? (
          <Loader className="h-4 w-4 text-blue-600 animate-spin" />
        ) : (
          <>
            <Globe className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {selectedLang.name}
            </span>
          </>
        )}
        <ChevronDown
          className={`h-4 w-4 text-gray-600 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden min-w-[200px]">
          <div className="py-1 max-h-64 overflow-y-auto">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language)}
                className={`w-full flex items-center justify-between px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                  selectedLang.code === language.code
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700"
                }`}
              >
                <span className="text-sm font-medium">{language.name}</span>
                {selectedLang.code === language.code && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DeepLTranslateWidget;