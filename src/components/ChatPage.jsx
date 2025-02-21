import { useState, useEffect } from "react";
import useLanguageDetector from "./Api's/useLanguageDetect";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 
import MainBody from "./MainBody";




const ChatPage = () => {
  // Chat messages
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");

  // Translator states
  const [targetLanguage, setTargetLanguage] = useState("en"); 
  const [supportedLanguages, setSupportedLanguages] = useState([]);
  const [botLoading, setBotLoading] = useState(false);

  // Language Detector hook
  const { detectedLanguage, setText,  } = useLanguageDetector();

  // Fetch supported languages for the translator
  useEffect(() => {
    const fetchSupportedLanguages = async () => {
      if ("ai" in self && "translator" in self.ai) {
        
        try{
          const capabilities = await self.ai.translator.capabilities();
          const languages = ["en", "es", "fr", "pt", "ru", "tr"]; 

          // Filter available languages for translation from detected language
          const availableLanguages = languages.filter(
            (lang) => capabilities.languagePairAvailable("en", lang) !== "no"
          );
          setSupportedLanguages(availableLanguages);


        } catch (error) {
          toast.error("Failed to load languages. Please try again.");
          console.error("Error fetching languages:", error);
        }
        



      }  else {
        toast.error("Translator API is not supported in this browser.");
        console.error("Translator API is not supported in this browser.");
      }
    
      
    };

    fetchSupportedLanguages();
  }, []);


  // Handle sending the user message
  const handleSend = async () => {
    if (!inputText.trim()) {
      toast.error("Message cannot be empty!");
      return
    };

    // Set text for language detection
    setText(inputText);

    // Add user message to chat
    const userMessage = {
      text: inputText,
      sender: "user",
      language: detectedLanguage || "Detecting...",
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setBotLoading(true);

   
    setTimeout(async () => {

    
      // Detect language (already handled by useLanguageDetector)
      const detectedLang = detectedLanguage || "en";

      // Translate user message into the selected target language
      let translatedText = inputText;
      if (detectedLang !== targetLanguage) {
        try {
          const translator = await self.ai.translator.create({
            sourceLanguage: detectedLang,
            targetLanguage,
          });

          translatedText = await translator.translate(inputText);
        } catch (error) {
          toast.error("Translation failed")
          console.error("Translation failed:", error);
          translatedText = "Translation not available.";
        }
      }

      // Add translated message from AI to chat
      const aiMessage = {
        text: translatedText,
        sender: "ai",
        language: targetLanguage,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setBotLoading(false);
    }, 500);
  };

  return (
    <div className="flex justify-center mx-auto w-full max-w-[900px] px-4">

      {messages.length === 0 && <MainBody />}
    
      {/* Chat Area */}
      <div className="result w-full px-5 max-h-[70vh] overflow-y-scroll">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`result-data h-auto flex items-end gap-5 my-[18px] ${
              msg.sender === "user" ? "justify-end" : ""
            }`}
          >
            {msg.sender === "ai" && (
              <img className="w-[40px]" src="/bot.svg" alt="AI" tabIndex={0} />
            )}
            <div>
              <p
                className={`text-[17px] px-6 py-4 rounded-[10px] ${
                  msg.sender === "user"
                    ? "bg-gray-300"
                    : "bg-[#3c096c] text-white"
                }`}
                tabIndex={0}
              >
                {msg.text}
              </p>
              {/* Show detected language below user messages */}
              {msg.sender === "user" && (
                <p className="text-sm text-gray-500" tabIndex={0}>
                  lang: {msg.language || "Detecting..."}
                </p>
              )}
            </div>
            {msg.sender === "user" && (
              <img
                className="w-[40px] rounded-full"
                src="/user_icon.png"
                alt="User"
                tabIndex={0}
              />
            )}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="absolute bottom-6 md:bottom-[8%] md:w-full max-w-[900px] mx-auto ">
        <div className="search bg-[#E8EBF0] flex items-center justify-between gap-2 py-[5px] px-2.5 md:py-1 md:px-5 rounded-[10px]">

          <input
            className="flex-none sm:w-[150px] md:flex-1 bg-transparent border-none outline-none p-2 text-[#444] text-lg focus:ring-2 focus:ring-blue-500"
            type="text"
            placeholder="Enter your message here..."
            value={inputText}
            aria-label="Message input field"
            onChange={(e) => setInputText(e.target.value)}
          />


          {/* Language Dropdown */}
          <select
            className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            value={targetLanguage}
             aria-label="Select target language"
            onChange={(e) => setTargetLanguage(e.target.value)}
          >
            {supportedLanguages.map((lang) => (
              <option className="" key={lang} value={lang}>
                {lang.toUpperCase()}
              </option>
            ))}
          </select>

          <button 
          className="flex justify-between sm:gap-[25px] hover:bg-blue-200 focus:ring-2 focus:ring-blue-500"
          aria-label="Send message"
          onClick={handleSend}
          >
            <img
              className="w-[20px] md:w-[24px] cursor-pointer"
              src="/send.svg"
              alt="Send"
              
             
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
