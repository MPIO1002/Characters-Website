const index = () => {
    return (
        <div className="bg-[#222222] p-2 flex justify-between items-center top-0 left-0 w-full z-50">
            <a href="https://mhgh.ggo.vn" className="flex-shrink-0">
                <img src="logo.png" alt="logo" className="h-8 w-auto md:h-10 cursor-pointer" />
            </a>
            <div className="gap-2 md:gap-4 flex items-center flex-shrink-0">
                <a href="https://nap.mongdaihiep.mobi/login">
                    <button>
                        <img src="pay.PNG" alt="user" className="h-8 w-auto md:h-10 cursor-pointer" />
                    </button>
                </a>
                <a href="https://mhgh.ggo.vn">
                    <button>
                        <img src="download.png" alt="cart" className="h-8 w-auto md:h-10 cursor-pointer" />
                    </button>
                </a>
            </div>
        </div>
    )
}

export default index;