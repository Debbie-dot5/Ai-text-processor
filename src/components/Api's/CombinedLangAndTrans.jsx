import { useState, useEffect } from "react";

const LanguageTranslator = () => {
  const [text, setText] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("fr"); // Default: French
  const [detector, setDetector] = useState(null);
  const [translator, setTranslator] = useState(null);
  const [loading, setLoading] = useState(true);

  // Language options
  const languageOptions = [
    { code: "fr", name: "French" },
    { code: "es", name: "Spanish" },
    { code: "de", name: "German" },
    { code: "zh", name: "Chinese" },
    { code: "ar", name: "Arabic" },
    { code: "hi", name: "Hindi" },
    { code: "en", name: "English" }, // Option to translate non-English text to English
  ];

  // Initialize Language Detector & Translator
  useEffect(() => {
    const initializeAI = async () => {
      if (!("ai" in self && "languageDetector" in self.ai && "translator" in self.ai)) {
        console.error("AI APIs are not supported in this browser.");
        return;
      }
      
      const langCapabilities = await self.ai.languageDetector.capabilities();

      const transCapabilities = await self.ai.translator.capabilities();

      if (langCapabilities === "no" || transCapabilities === "no") {
        console.error("AI APIs are not available.");
        return;
      }

      try {
        // Initialize Language Detector
        let langDetectorInstance;
        if (langCapabilities === "readily") {
          langDetectorInstance = await self.ai.languageDetector.create();
        } else {
          langDetectorInstance = await self.ai.languageDetector.create({
            monitor(m) {
              m.addEventListener("downloadprogress", (e) => {
                console.log(`Downloading model: ${e.loaded} of ${e.total} bytes`);
              });
            },
          });
          await langDetectorInstance.ready;
        }

        

        // Initialize Translator
        let translatorInstance = await self.ai.translator.create({
            sourceLanguage: 'es',
            targetLanguage: 'fr',
            monitor(m) {
              m.addEventListener('downloadprogress', (e) => {
                console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
              });
            },
        });

        setDetector(langDetectorInstance);
        setTranslator(translatorInstance);
        setLoading(false);
      } catch (error) {
        console.error("Error initializing AI APIs:", error);
      }
    };

    initializeAI();
  }, []);

  // Detect language on text change
  useEffect(() => {
    if (!detector || text.trim() === "") {
      setDetectedLanguage("");
      setTranslatedText("");
      return;
    }

    const detectLanguage = async () => {
      try {
        const results = await detector.detect(text);
        if (results.length > 0 && results[0].confidence > 0.5) {
          setDetectedLanguage(results[0].detectedLanguage);
        } else {
          setDetectedLanguage("Unknown");
        }
      } catch (error) {
        console.error("Error detecting language:", error);
      }
    };

    const debounceTimeout = setTimeout(detectLanguage, 500);
    return () => clearTimeout(debounceTimeout);
  }, [text, detector]);

  // Translate when detected language or target language changes
  useEffect(() => {
    if (!translator || !detectedLanguage || detectedLanguage === "Unknown" || text.trim() === "") {
      setTranslatedText("");
      return;
    }

    const translateText = async () => {
     
      try {

        if (!translator) {
            console.error("Translator is not initialized.");
            return;
          }


        const capabilities = await translator.capabilities();
        if (!capabilities.languagePairAvailable(detectedLanguage, targetLanguage)) {
          setTranslatedText("Translation not available for this language pair.");
          return;
        }

        const translation = await translator.translate(text, 
            { sourceLanguage: detectedLanguage, targetLanguage });
        setTranslatedText(translation.translation);
      } catch (error) {
        console.error("Error translating text:", error);
      }
    };

    const debounceTimeout = setTimeout(translateText, 500);
    return () => clearTimeout(debounceTimeout);
  }, [text, detectedLanguage, targetLanguage, translator]);

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-2">Language Translator</h2>
      
      {loading ? (
        <p className="text-red-500">Loading AI models...</p>
      ) : (
        <>
          <textarea
            className="w-full p-2 border rounded"
            placeholder="Enter text..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {text.trim() !== "" && (
            <>
              <p className="mt-2 text-gray-700">Detected Language: <span className="font-semibold">{detectedLanguage}</span></p>
              
              <label className="block mt-3 text-gray-700">Translate to:</label>
              <select
                className="w-full p-2 border rounded mt-1"
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
              >
                {languageOptions.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>

              {translatedText && (
                <p className="mt-2 text-gray-700">
                  Translated Text: <span className="font-semibold">{translatedText}</span>
                </p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default LanguageTranslator;
