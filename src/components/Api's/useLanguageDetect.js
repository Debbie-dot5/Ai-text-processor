import { useState, useEffect } from "react";

// This is where i declared the langauge detect.....
// when you return, fix issue that displays unknown



const useLanguageDetect = () => {
  const [text, setText] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState("");
  const [detector, setDetector] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeDetector = async () => {
      if (!("ai" in self && "languageDetector" in self.ai)) {
        console.error("Language Detector API is not supported in this browser.");
        return;
      }

      const capabilities = await self.ai.languageDetector.capabilities();
      if (capabilities.capabilities === "no") {
        console.error("Language Detector API is not available.");
        return;
      }

      try {
        let detectorInstance;
        if (capabilities.capabilities === "readily") {
          detectorInstance = await self.ai.languageDetector.create();
        } else {
          detectorInstance = await self.ai.languageDetector.create({
            monitor(m) {
              m.addEventListener("downloadprogress", (e) => {
                console.log(`Downloading model: ${e.loaded} of ${e.total} bytes`);
              });
            },
          });
          await detectorInstance.ready;
        }

        setDetector(detectorInstance);
        setLoading(false);
      } catch (error) {
        console.error("Error initializing language detector:", error);
      }
    };

    initializeDetector();
  }, []);

  useEffect(() => {
    if (!detector || text.trim() === "") {
      setDetectedLanguage(""); // Clear detection if text is empty
      return;
    }

    const detectLanguage = async () => {
      try {
        const results = await detector.detect(text);
        if (results.length > 0 && results[0].confidence > 0.5) {
          setDetectedLanguage(results[0].detectedLanguage); // Show the most confident result
        } else {
          setDetectedLanguage("Unknown");
        }
      } catch (error) {
        console.error("Error detecting language:", error);
      }
    };

    const debounceTimeout = setTimeout(() => {
      detectLanguage();
    }, 500); // Adds a small delay to reduce API calls

    return () => clearTimeout(debounceTimeout); // Cleanup on unmount or text change
  }, [text, detector]);

  return { text, setText, detectedLanguage, loading };
};

export default useLanguageDetect;