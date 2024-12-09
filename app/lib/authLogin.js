import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
// const urlNode = `${process.env.NEXT_PUBLIC_URL_API}:${process.env.NEXT_PUBLIC_PORT_API}`;

const authSessionLogin = (WrappedComponent) => {
    return (props) => {
        const router = useRouter();

        useEffect(() => {
            const checkSession = async () => {
                const getCookie = (name) => {
                    const value = `; ${document.cookie}`;
                    const parts = value.split(`; ${name}=`);
                    if (parts.length === 2) return parts.pop().split(';').shift();
                }

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
                        } else {
                            router.push('/dashboard');
                        }
                    }
                } catch (error) {
                    // console.log(error)
                }
            };

            checkSession();
        }, []);

        return <WrappedComponent {...props} />;
    };
}

export default authSessionLogin;