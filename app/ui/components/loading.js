'use client'

const Loader = () => {
    return (
        <div className="mb-5 absolute z-20 bottom-0 md:right-0 mr-5">
            <div className={`rounded-lg bg-white border-black border items-center w-72`}>
                <div className="flex py-2 px-5 items-center">
                    <i className={`loader mt-1`} ></i>
                    <div className="ml-2 mt-2 font-bold">Loading . . .</div>
                </div>
                <div className=" -mt-1 pb-2 px-5">Processing your action.</div>
                <div className="rounded-b-lg loader-bar"></div>
            </div>
        </div>
    )
}

export default Loader;