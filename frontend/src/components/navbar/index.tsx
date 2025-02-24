const index = () => {
    return (
        <div className="navbar-bg p-4 flex justify-between items-center">
            <a href="/">
                <img src="logo.png" alt="logo" className="h-14 w-auto cursor-pointer" />
            </a>
            <div className="gap-4 flex items-center">
                <a href="https://nap.mongdaihiep.mobi/login">
                    <button>
                        <img src="pay.PNG" alt="user" className="h-10 w-auto cursor-pointer" />
                    </button>
                </a>
                <a href="https://play.google.com/store/apps/details?id=mobi.mgh.mong.daihiep">
                    <button>
                        <img src="download.png" alt="cart" className="h-10 w-auto cursor-pointer" />
                    </button>
                </a>
            </div>
        </div>
    )
}

export default index;