'use client'

import withAuth from '@/app/lib/authLayout';
import useWindowWidth from '@/app/lib/device';
import Link from 'next/link';
import { useVisibility } from '../../home';
import { useEffect, useState } from 'react';
import Modal from './modalLogout';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const MainLayout = ({page}) => {
    const { sideBar, setSideBar, showDropdown, setShowDropdown, userData} = useVisibility();
    const router = useRouter();
    
    const [modalShow, setModalShow] = useState(false);
    const width = useWindowWidth();

    const handleLogout = async () => {
        const urlNode = `${process.env.NEXT_PUBLIC_URL_API}:${process.env.NEXT_PUBLIC_PORT_API}`;
        const getCookie = (name) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        }

        try {
            const token = getCookie('token');

            if(token) {
                // Send the logout request to the backend
                const response = await axios.post(`${urlNode}/auth/logout`, {}, {
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
        <div className="md:flex h-screen">
            <div className={`${sideBar ? 'md:w-14' : 'md:w-72'} bg-gray-800 text-white p-4 sticky top-0 overflow-hidden md:h-screen z-30 md:static flex flex-col`}>
                {sideBar &&
                    <>
                        <div className='py-2 mx-4 px-2 cursor-default'>
                            <i className='hidden md:block fi fi-rr-angle-small-right pt-1 px-2 float-end cursor-pointer hover:bg-gray-700 rounded'
                                onClick={() => {
                                    setSideBar(false);
                                }}
                            ></i>
                        </div>
                        <div className='block md:hidden py-1 px-4 cursor-default'>
                            <Link href={`/dashboard`} className='text-lg font-bold'>Ticket Management</Link>
                            <i className='fi fi-rr-angle-small-down pt-1 px-2 float-end cursor-pointer hover:bg-gray-700 rounded'
                                onClick={() => {
                                    setSideBar(false);
                                }}
                            ></i>
                        </div>
                        {width > 768 && 
                            <>
                                <div>
                                    <Link href={`/dashboard`} className="block py-1 my-1 px-2 hover:bg-gray-700 rounded float-end" title='Home'>
                                        <div className='flex justify-center'>
                                            <i className='fi fi-rr-home mt-1'></i>
                                        </div>
                                    </Link>
                                    {userData && userData.type === 'Admin' &&
                                        <Link href={`/tickets`} className="block py-1 my-1 px-2 hover:bg-gray-700 rounded float-end" title='Input Ticket'>
                                            <div className='flex justify-center'>
                                                <i className='fi fi-rr-table-list mt-1'></i>
                                            </div>
                                        </Link>
                                    }
                                    <Link href={`/graphics`} className="block py-1 my-1 px-2 hover:bg-gray-700 rounded float-end" title='Graphics'>
                                        <div className='flex justify-center'>
                                            <i className='fi fi-rr-stats mt-1'></i>
                                        </div>
                                    </Link>
                                    {userData && userData.type === 'Admin' && 
                                        <>
                                            <div className="block">
                                                <div className='my-1 py-1 px-2 hover:bg-gray-700 rounded cursor-pointer select-none float-end' title='Master Data' onClick={() => {setShowDropdown(!showDropdown)}}>
                                                    <i className={`fi ${showDropdown ? 'fi-rr-folder-open' : 'fi-rr-folder'}`}></i> 
                                                </div>
                                                {showDropdown &&
                                                    <>
                                                        <i className={`fi fi-rr-horizontal-rule float-end mr-2`}></i>
                                                        <ul className='list-none pl-3 space-y-1'>
                                                            <Link href={`/master-data/client`} title='Client'>
                                                                <li className='py-1 px-2 hover:bg-gray-700 rounded flex justify-center float-end'>
                                                                    <i className='fi fi-rr-target-audience'></i>
                                                                </li>
                                                            </Link>
                                                            <Link href={`/master-data/app-module`} title='App Module'>
                                                                <li className='py-1 px-2 hover:bg-gray-700 rounded flex justify-center float-end'>
                                                                    <i className='fi fi-rr-module mt-1'></i>
                                                                </li>
                                                            </Link>
                                                            <Link href={`/master-data/user-list`} title='Users'>
                                                                <li className='py-1 px-2 hover:bg-gray-700 rounded flex justify-center float-end'>
                                                                    <i className='fi fi-rr-member-list mt-1'></i>
                                                                </li>
                                                            </Link>             
                                                        </ul>
                                                        <i className={`fi fi-rr-horizontal-rule float-end mr-2`}></i>
                                                    </>
                                                }
                                            </div>
                                            <Link href={`/ticket-deleted`} className="block py-1 my-1 px-2 hover:bg-gray-700 rounded float-end" title='Ticket Deleted'>
                                                <div className='flex justify-center'>
                                                    <i className='fi fi-rr-delete-document mt-1'></i>
                                                </div>
                                            </Link>
                                        </>
                                    }
                                </div>
                                <div className='mt-auto'>
                                    <div className='-ml-2'>
                                        <div className="py-1 my-1 px-3 hover:bg-gray-700 rounded cursor-pointer" title='Settings'
                                            onClick={() => router.push('/settings')}
                                        >
                                            <div className='flex justify-center'>
                                                <i className='fi fi-rr-settings mt-1'></i>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='-ml-2'>
                                        <div className="py-1 my-1 px-3 hover:bg-gray-700 rounded cursor-pointer" title='Sign Out'
                                            onClick={() => setModalShow(true)}
                                        >
                                            <div className='flex justify-center'>
                                                <i className='fi fi-rr-exit mt-1'></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        }
                    </>
                }
                {!sideBar && 
                    <>
                        <div className='py-2 px-4 cursor-default'>
                            <Link href={`/dashboard`} className='text-lg font-bold'>Ticket Management</Link>
                            <i className='hidden md:block fi fi-rr-angle-small-left pt-1 px-2 float-end cursor-pointer hover:bg-gray-700 rounded'
                                onClick={() => {
                                    setSideBar(true);
                                }}
                            ></i>
                            <i className='block md:hidden fi fi-rr-angle-small-up pt-1 px-2 float-end cursor-pointer hover:bg-gray-700 rounded'
                                onClick={() => {
                                    setSideBar(true);
                                }}
                            ></i>
                        </div>
                        <Link href={`/dashboard`} className="block py-2 px-4 hover:bg-gray-700 rounded">
                            <div className='flex items-center'>
                                <i className='fi fi-rr-home mt-1 mr-2'></i>
                                <p>Home</p>
                            </div>
                        </Link>
                        {userData && userData.type === 'Admin' &&
                            <Link href={`/tickets`} className="block py-2 px-4 hover:bg-gray-700 rounded">
                                <div className='flex items-center'>
                                    <i className='fi fi-rr-table-list mt-1 mr-2'></i>
                                    <p>Input Ticket</p>
                                </div>
                            </Link>
                        }
                        <Link href={`/graphics`} className="block py-2 px-4 hover:bg-gray-700 rounded">
                            <div className='flex items-center'>
                            <i className='fi fi-rr-stats mt-1 mr-2'></i>
                                <p>Graphics</p>
                            </div>
                        </Link>
                        {userData && userData.type === 'Admin' && 
                            <>
                                <div className="block">
                                    <div className='py-2 px-4 hover:bg-gray-700 rounded cursor-pointer select-none' onClick={() => {setShowDropdown(!showDropdown)}}>
                                        <i className={`fi ${showDropdown ? 'fi-rr-folder-open' : 'fi-rr-folder'} mr-2`}></i> 
                                        Master Data 
                                        <i className={`${showDropdown ? 'fi fi-rr-caret-up' : 'fi fi-rr-caret-down '} mt-1 leading-none float-end`}></i>
                                    </div>
                                    {showDropdown &&
                                        <ul className='list-none pl-3 space-y-1'>
                                            <Link href={`/master-data/client`}>
                                                <li className='py-1 px-4 hover:bg-gray-700 rounded flex items-center'>
                                                    <i className='fi fi-rr-target-audience mr-2'></i>
                                                    <p>Client</p>
                                                </li>
                                            </Link>
                                            <Link href={`/master-data/app-module`}>
                                                <li className='py-1 px-4 hover:bg-gray-700 rounded flex items-center'>
                                                    <i className='fi fi-rr-module mr-2 mt-1'></i>
                                                    <p>App Module</p>
                                                </li>
                                            </Link>
                                            <Link href={`/master-data/user-list`}>
                                                <li className='py-1 px-4 hover:bg-gray-700 rounded flex items-center'>
                                                    <i className='fi fi-rr-member-list mr-2 mt-1'></i>
                                                    <p>Users</p>
                                                </li>
                                            </Link>             
                                        </ul>
                                    }
                                </div>
                                <Link href={`/ticket-deleted`} className="block py-2 px-4 hover:bg-gray-700 rounded">
                                    <div className='flex items-center'>
                                        <i className='fi fi-rr-delete-document mt-1 mr-2'></i>
                                        <p>Ticket Deleted</p>
                                    </div>
                                </Link>
                            </>
                        }
                        <div className='mt-auto '>
                            <div className="py-2 px-4 hover:bg-gray-700 rounded cursor-pointer" onClick={() => router.push('/settings')}>
                                <div className='flex items-center'>
                                    <i className='fi fi-rr-settings mt-1 mr-2'></i>
                                    <p>Profile Settings</p>
                                </div>
                            </div>
                            { width <= 768 ? 
                                <div className="py-2 px-4 hover:bg-gray-700 rounded cursor-pointer" onClick={() => setModalShow(true)}>
                                    <div className='flex items-center'>
                                        <i className='fi fi-rr-exit mt-1 mr-2'></i>
                                        <p>Sign Out</p>
                                    </div>
                                </div>

                                :

                                <div className="block py-2 px-4 rounded">
                                    <div className='grid grid-cols-6'>
                                        <div className='flex items-center col-span-5'>
                                            <i className='fi fi-rr-circle-user mt-1 mr-2'></i>
                                            <p className={userData && userData.name.firstName.length > 9 ? 'text-sm' : 'text-base'}>{`Welcome ${userData ? userData.name.firstName : ''} !`}</p>
                                        </div>
                                        <div className="py-1 px-3 hover:bg-gray-700 rounded cursor-pointer" onClick={() => setModalShow(true)} title="Sign Out">
                                            <div className='flex items-center'>
                                                <i className='fi fi-rr-exit mt-1'></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>
                    </>
                }
            </div>
            <div className="flex-1 p-6">
                {page}
            </div>
            {modalShow && 
                <Modal
                    modalShow={modalShow}
                    setModalShow={setModalShow}
                    handleLogout={handleLogout}
                />
            }
        </div>
    )
}

export default withAuth(MainLayout);