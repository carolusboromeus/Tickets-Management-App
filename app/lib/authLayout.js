import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useVisibility } from '../home';

const withAuth = (WrappedComponent) => {
    return (props) => {
        const router = useRouter();
        const { userData, setUserData, setLoadingSession } = useVisibility();

        const getCookie = (name) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        }

        useEffect(() => {
            
            const checkSession = async () => {
                try {
                    const token = getCookie('token');
                    if(token){
                        const res = await axios.get(`/api/auth/session`, {
                            withCredentials: true, // Include credentials to send cookies
                            headers: {
                                'Content-Type': 'application/json', // Set the Content-Type header to indicate JSON data
                                'Authorization': `Bearer ${token}`
                            }
                        });
    
                        if (res.status !== 200) {
                            // console.log("Logout!")
                            router.push('/'); // Redirect if not authenticated
                        } else {
                            setLoadingSession(false);
                            setUserData(res.data.user);
                            // console.log("Login!")
                        }
                    } else {
                        router.push('/');
                    }
                  
                } catch (error) {
                    console.log(error);
                    router.push('/'); // Redirect if not authenticated
                }
            };

            checkSession();
        }, []);

        if (userData && userData.status !== 'Active') {

            const handleLogout = async () => {
                try {
                    const token = getCookie('token');
                    if(token) {
                        // Send the logout request to the backend
                        const response = await axios.post(`/api/auth/logout`, {}, {
                            withCredentials: true,  // Ensure the session cookie is included in the request
                            headers: {
                                'Content-Type': 'application/json', // Set the Content-Type header to indicate JSON data
                                'Authorization': `Bearer ${token}`
                            }
                        });
                
                        if (response.status === 200) {
                            // Redirect to the login page after logout
                            router.push('/');
                        }
                    }
                } catch (error) {
                    console.error('Logout error:', error);
                    // Optionally handle the error (show message, etc.)
                }
            }

            return (
                <div className="flex justify-center items-center h-[calc(100vh)] bg-gray-100">
                    <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-md w-full">
                        <div className="text-center">
                            <div className="bg-red-200 w-2/12 rounded-full flex items-center justify-center mx-auto p-4">
                                <i className="fi fi-sr-triangle-warning text-2xl text-red-500 mt-1"></i> {/* Adjust size here */}
                            </div>
                        </div>
                        <div className="text-2xl font-bold my-4">Access Denied</div>
                        <div className="text-gray-600 mb-6">You don't have permission to access this content</div>
                        <div className="text-gray-500 mb-6">It looks like your account has been suspended. Please contact the admin.</div>
                        <button className="cursor-pointer inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                            onClick={handleLogout}
                        >
                            Go Login
                        </button>
                    </div>
                </div>
            )
        }

        return <WrappedComponent {...props} />;
    };
};

export default withAuth;
