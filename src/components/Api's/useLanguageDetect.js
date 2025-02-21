import { useState, useEffect } from "react";


// This is where i declared the langauge detect.....
// when you return, fix issue that displays unknown

// shorter words tend to give inaccurate results 


const useLanguageDetect = () => {
  const [text, setText] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState("");
  const [detector, setDetector] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeDetector = async () => {
      if (!("ai" in self) || !("languageDetector" in self.ai)) {
        console.error("Language Detector API is not available.");
        return;
      }

      try {
        const capabilitiesInstance = await self.ai.languageDetector.capabilities();
        if (capabilitiesInstance.capabilities === "no") {
          console.error("Language detection is not supported.");
          return;
        }

        let detectorInstance;
        if (capabilitiesInstance.capabilities === "readily") {
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
    if (!detector || text.trim().length < 3) {
      setDetectedLanguage(""); 
      return;
    }

    const detectLanguage = async () => {
      try {
        const results = await detector.detect(text);

        if (results.length > 0) {
          const topResult = results[0];

          if (topResult.confidence > 0.4) {
            setDetectedLanguage(topResult.detectedLanguage);
          } else {
            setDetectedLanguage("Unknown");
          }
        } else {
          setDetectedLanguage("Unknown");
        }
      } catch (error) {
        console.error("Error detecting language:", error);
        setDetectedLanguage("Unknown");
      }
    };

    const debounceTimeout = setTimeout(() => {
      detectLanguage();
    }, 500); 

    return () => clearTimeout(debounceTimeout);
  }, [text, detector]);

  return { text, setText, detectedLanguage, loading };
};

export default useLanguageDetect;
