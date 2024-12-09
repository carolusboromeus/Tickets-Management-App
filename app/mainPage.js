'use client'

import { useState, useRef } from 'react';
import axios from 'axios';
// import Link from 'next/link';
import authSessionLogin from './lib/authLogin';
import { useRouter } from 'next/navigation';
// import Cookies from 'js-cookie';

const Layout = () => {
    const router = useRouter();

    const [messegeTemp, setMessegeTemp] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })

    const formDataRefs = useRef(
        {
            emailRef: null,
            passwordRef: null,
            accountTypeRef: null
        }
    )

    const handleChange = (columnName, value) => {
        setFormData((prevState) => ({
            ...prevState,
            [columnName]: value,
        }));
    }

    const handleLogin = async () => {
        const dataLogin = {
            email: formData.email,
            password: formData.password
        }

        try {
            const response = await axios.post(`/api/auth/login`, dataLogin, {
                withCredentials: true, // Include credentials to send cookies
            });
            if(response && response.status === 200){
                setShowMessage(false);
                router.push('/dashboard');
            } else if(response && response.status === 429) {
                setShowMessage(false);
                setMessegeTemp(true);
            } 
            else {
                console.log(response);
                console.log("Gagal Login");
                setShowMessage(true);
            }
        } catch(error) {
            if(error && error.status === 429) {
                setShowMessage(false);
                setMessegeTemp(true);
            } 
            else {
                console.log("Gagal Login");
                setShowMessage(true);
            }
        }
    }

    return (
        <div className="grid h-screen">
            <div className="flex flex-1 flex-col justify-center items-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">
                        Sign in to your account
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form onSubmit={(e) => {
                            e.preventDefault();
                            handleLogin();
                        }} 
                        method="POST" className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                                Email Address :
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    className={`w-full mt-1 ps-3 p-1 border border-gray-300 rounded-md text-sm`}
                                    ref={el => formDataRefs.current.emailRef = el}
                                    onChange={(event) => handleChange('email', event.target.value)}
                                    placeholder="Enter email address"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                                    Password :
                                </label>
                                {/* <div className="text-sm">
                                    <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                                        Forgot password?
                                    </a>
                                </div> */}
                            </div>
                            <div className="mt-2">
                                <div className="relative">
                                    <input name="password" type={showPassword ? 'text' : 'password'} 
                                        className={`mt-1 block p-1 ps-3 border border-gray-300 outline-black w-full rounded-md text-sm disabled:opacity-50 disabled:pointer-events-none`}
                                        placeholder="Enter password"
                                        ref={el => formDataRefs.current.passwordRef = el}
                                        onChange={(event) => handleChange('password', event.target.value)}
                                        autoComplete="current-password"
                                    />
                                    <button type="button" className={`absolute border border-gray-300 rounded-tr-md rounded-br-md inset-y-0 end-0 flex items-center 
                                        z-20 px-3 cursor-pointer text-black rounded-e-md hover:bg-indigo-600 hover:text-white`}
                                        onClick={() => {setShowPassword(!showPassword)}}
                                        title={showPassword ? 'Hide Password' : 'Show Password'}
                                    >
                                        <i className={`mt-1 ${showPassword ? 'fi-rr-eye' : 'fi-rr-eye-crossed'} text-sm`}></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {(showMessage || messegeTemp) &&
                            <div className='border border-red-300 bg-red-100 rounded-lg'>
                                <div className='p-4 font-semibold text-sm'>{showMessage ? 'The email or password you entered did not match. Please try agian.' : 'Too many login attempts, please try again later.'}</div>
                            </div>
                        }

                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Sign in
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default authSessionLogin(Layout);
