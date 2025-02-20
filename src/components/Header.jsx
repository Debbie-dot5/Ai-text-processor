
const Header = () => {
  return (
    <>

        <nav className="max-w-[900px] px-2 items-center mt-4 mx-auto flex justify-between">
            <div className="logo flex items-center gap-2 text-xl ">
             <img className="w-[50px]" src="/logo.svg" alt="" />   <p className="font-bold text-white">TRANS<span className="">Gpt</span></p> 
            </div>

            <div>
                <img className="w-[30px] cursor-pointer" src="/user-profile.svg" alt="" />
            </div>
        </nav>
      
    </>
  )
}

export default Header
