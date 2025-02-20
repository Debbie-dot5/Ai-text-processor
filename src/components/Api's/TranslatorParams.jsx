
const TranslatorParams = () => {

  const handleSubmit = () => {

    if ('ai' in self && 'translator' in self.ai) {
        console.log(" The Translator API is supported.")
      } else {
        console.log("Api is not supported")
      }

      const detectLanguage = async (text) => {
        if (!('ai' in self && 'languageDetector' in self.ai)) {
          console.error("Language Detector API is not supported.");
          return;
        }
      
        const detector = await self.ai.languageDetector.create();
        const result = await detector.detect(text);
      
        console.log("Detected language:", result.language);
        return result.language; // Returns language code like 'en', 'es', etc.
      };
      

}








  return (
    <div>

      <button onClick={handleSubmit}></button>
      
    </div>
  )
}

export default TranslatorParams













