import Link from 'next/link';

const AccessMessage = () => {

    return (
        <div className="flex justify-center items-center h-[calc(100vh-3rem)] bg-gray-100">
            <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-md w-full">
                <div className="text-center">
                    <div className="bg-red-200 w-2/12 rounded-full flex items-center justify-center mx-auto p-4">
                        <i className="fi fi-sr-triangle-warning text-2xl text-red-500 mt-1"></i> {/* Adjust size here */}
                    </div>
                </div>
                <div className="text-2xl font-bold my-4">Access Denied</div>
                <div className="text-gray-600 mb-6">You don't have permission to access this content</div>
                <Link href={`/dashboard`} className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                    Go Home
                </Link>
            </div>
        </div>
    )
}

export default AccessMessage;