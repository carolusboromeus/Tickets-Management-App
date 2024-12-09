'use client'

import Link from 'next/link';
// import { useRouter } from 'next/navigation';

const NotFound = (() => {

    return (
        <div className='flex h-[calc(100vh-250px)] sm:h-[calc(100vh-37px)] justify-center items-center'>
            <div className='w-1/2 text-center'>
                <h1 className='font-extrabold text-3xl py-3'>Oops!</h1>
                <hr></hr>
                <br></br>
                <h3 className='font-semibold text-base'>404.<br></br>Page Not Found</h3><br></br>
                <p className='text-base'>Something went wrong and the page you're looking for cannot be found.</p>
                <br></br>
                <Link href={`/dashboard`} className='px-3 py-2 my-3 rounded-3xl font-bold text-white bg-blue-600 hover:bg-gray-500
                    focus:outline focus:outline-1 focus:outline-black'>Go To Home</Link>
            </div>
        </div>
    )
})

export default NotFound;