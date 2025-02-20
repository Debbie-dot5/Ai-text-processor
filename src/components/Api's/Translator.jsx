import { useState, useEffect } from "react";

const Translator = () => {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("es"); // Default: Spanish
  const [supportedLanguages, setSupportedLanguages] = useState([]);

  useEffect(() => {
    const fetchSupportedLanguages = async () => {
      if ("ai" in self && "translator" in self.ai) {
        const capabilities = await self.ai.translator.capabilities();
        const languages = ["pt", "es", "ru", "tr", "fr","en",]; // Example language codes

        const availableLanguages = languages.filter(
          (lang) => capabilities.languagePairAvailable("en", lang) !== "no"
        );
        setSupportedLanguages(availableLanguages);
      } else {
        console.error("Translator API is not supported in this browser.");
      }
    };

    fetchSupportedLanguages();
  }, []);

  const handleTranslate = async () => {
    if (!inputText) return;

    try {
      const translator = await self.ai.translator.create({
        sourceLanguage: "en",
        targetLanguage,
      });

      const translation = await translator.translate(inputText);
      setTranslatedText(translation);
    } catch (error) {
      console.error("Translation failed:", error);
      setTranslatedText("Translation not available.");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 border rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">AI Translator</h2>

      {/* Text Input */}
      <textarea
        className="w-full p-2 border rounded-md"
        placeholder="Type text to translate..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />

      {/* Language Dropdown */}
      <select
        className="w-full mt-2 p-2 border rounded-md"
        value={targetLanguage}
        onChange={(e) => setTargetLanguage(e.target.value)}
      >
        {supportedLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {lang.toUpperCase()}
          </option>
        ))}
      </select>

      {/* Translate Button */}
      <button
        onClick={handleTranslate}
        className="w-full mt-3 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition"
      >
        Translate
      </button>

      {/* Translated Output */}
      {translatedText && (
        <div className="mt-4 p-2 border rounded-md bg-gray-100">
          <strong>Translated Text:</strong>
          <p>{translatedText}</p>
        </div>
      )}
    </div>
  );
};

export default Translator;
