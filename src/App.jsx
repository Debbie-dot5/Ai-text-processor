
import Header from "./components/Header"
import MainBody from "./components/MainBody"
import ChatPage from "./components/ChatPage"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <div className="">
    <Header/>
    <ToastContainer/>

      <ChatPage/>
    </div>
  )
}

export default App
