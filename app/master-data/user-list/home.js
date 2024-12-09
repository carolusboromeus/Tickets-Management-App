'use client'

import withAuth from '@/app/lib/withAuth';
import { getUser, patchUser, postUser, } from "@/app/lib/api";
import { useVisibility } from "@/app/home.js";
import Message from "@/app/ui/components/message";
import ModalSuspend from "@/app/ui/components/users/modalSuspend";
import ModalForm from "@/app/ui/components/users/modalForm";
import { useState, useEffect, useRef } from "react";
import AccessMessage from '@/app/ui/components/accessDenied';
import ModalReset from '@/app/ui/components/users/modalReset';

const Layout = () => {
    const { sideBar, showDropdown, userData } = useVisibility();

    if(userData && userData.type === 'Client') {
        return <AccessMessage/>
    }

    const [dataUsers, setDataUsers] = useState(null);

    const [dataModal, setDataModal] = useState(null);
    const [modalFormShow, setModalFormShow] = useState(false);
    const [modalSuspendShow, setModalSuspendShow] = useState(false);
    const [modalResetShow, setModalResetShow] = useState(false);
    const [message, setMessage] = useState(null);
    const [showMessage, setShowMessage] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getUser();
            // console.log(data);
            setDataUsers(data);
        }

        fetchData();
    }, []);

    useEffect(() => {
        if(!modalFormShow && !modalSuspendShow && !modalResetShow) {
            setDataModal(null);
            // console.log(dataModal);
        }
    },[modalFormShow, modalSuspendShow, modalResetShow])

    const handleSetModalSuspend = async (data) => {
        setDataModal(data);
        setModalSuspendShow(true);
    }

    const handleSetModalForm = async (data) => {
        setDataModal(data);
        setModalFormShow(true);
    }

    const handleSetModalReset = async (data) => {
        setDataModal(data);
        setModalResetShow(true);
    }

    const handlUser = async (data, messageWarning, setMessageWarning) => {
        const isAllDataNotNullExceptLastName = (data) => {
            return Object.keys(data).every(key => {
                if(!dataModal) {
                    if (data.type === 'Admin') {
                        return key === 'lastName' || key === 'client' ? true : data[key] !== '';
                    } else {
                        return key === 'lastName' ? true : data[key] !== '';
                    }
                } else {
                    if (data.type === 'Admin') {
                        return key === 'lastName' || key === 'client' ? true : data[key] !== '';
                    } else {
                        return key === 'lastName' ? true : data[key] !== '';
                    }
                    // return key === 'lastName' ? true : data[key] !== '';
                }
            });
        }

        if(isAllDataNotNullExceptLastName(data)) {
            if(!messageWarning.passwordNotMatch && !messageWarning.newPasswordLength) {
                const dataUser = {
                    name: {
                        firstName: data.firstName,
                    },
                    email: data.email,
                    type: data.type,
                }

                if(data.lastName) {
                    dataUser.name.fullName = `${data.firstName} ${data.lastName}`;
                    dataUser.name.lastName = data.lastName;
                } else {
                    dataUser.name.fullName = `${data.firstName}`;
                }

                if(data.type === 'Client') {
                    dataUser.client = data.client;
                }

                if(dataModal) {
                    dataUser.idUser = dataModal._id;
                }

                try {
                    if(!dataModal){
                        const message = await postUser(dataUser);
                        setMessage(message);
                    } else {
                        const message = await patchUser(dataUser);
                        setMessage(message);
                    }
                } finally {
                    setShowMessage(true);
                    const newData = await getUser();
                    setDataUsers(newData);
                    setModalFormShow(false);
                    setDataModal(null);
                }
            }
        } else {
            data.firstName === '' ? setMessageWarning((prevState) => ({
                ...prevState,
                firstName: true,
            })) 
            :
            setMessageWarning((prevState) => ({
                ...prevState,
                firstName: false,
            }))

            data.email === '' ? setMessageWarning((prevState) => ({
                ...prevState,
                email: true,
            })) 
            :
            setMessageWarning((prevState) => ({
                ...prevState,
                email: false,
            }))

            data.type === '' ? setMessageWarning((prevState) => ({
                ...prevState,
                type: true,
            })) 
            :
            setMessageWarning((prevState) => ({
                ...prevState,
                type: false,
            }))

            if(data.type === 'Client') {
                data.client === '' ? setMessageWarning((prevState) => ({
                    ...prevState,
                    client: true,
                })) 
                :
                setMessageWarning((prevState) => ({
                    ...prevState,
                    client: false,
                }))
            }

            // if(!dataModal) {
            //     data.newPassword === '' ? setMessageWarning((prevState) => ({
            //         ...prevState,
            //         newPasswordLength: true,
            //     })) 
            //     :
            //     setMessageWarning((prevState) => ({
            //         ...prevState,
            //         newPasswordLength: false,
            //     }))
    
            //     data.confirmPassword === '' ? setMessageWarning((prevState) => ({
            //         ...prevState,
            //         passwordNotMatch: true,
            //     })) 
            //     :
            //     setMessageWarning((prevState) => ({
            //         ...prevState,
            //         passwordNotMatch: false,
            //     }))
            // }

            console.log("Not all required fields are filled.");
        }
    }

    const handleSuspendUser = async (data) => {
        const dataDelete = {
            idUser: data._id,
            status: data.status === 'Active' ? 'Suspended' : 'Active',
        }
        
        try{
            const message = await patchUser(dataDelete);
            setMessage(message);
        } finally {
            setShowMessage(true);
            const newData = await getUser();
            setDataUsers(newData);
            setModalSuspendShow(false);
            setDataModal(null);
        }
    }

    const handleResetPassword = async (data) => {
        const dataReset = {
            idUser: data._id
        }
        
        try{
            const message = await patchUser(dataReset);
            setMessage(message);
        } finally {
            setShowMessage(true);
            const newData = await getUser();
            setDataUsers(newData);
            setModalResetShow(false);
            setDataModal(null);
        }
    }

    const [filteredUsers, setFilteredUsers] = useState(null);
    const searchQueryRef = useRef(null);

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
            // console.log(event.target.value);
        }
    }

    const handleSearch =  async () => {
        // if (!tickets || tickets.length === 0) return;
        
        let filtering = dataUsers;
       
        // Process the search query
        if (searchQueryRef && searchQueryRef.current) {
            filtering = processSearch(searchQueryRef.current.value, filtering);
        }
        
        filtering ? setFilteredUsers(filtering) : setFilteredUsers([]);
    };

    const processSearch = (search, filtering) => {
        const searchInObject = (obj, searchTerm) => {
            // If the object is not valid, return false
            if (!obj || typeof obj !== 'object') return false;
    
            // Loop through all the properties of the object
            return Object.values(obj).some(value => {
                if (typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())) {
                    return true; // Match found in string
                }
    
                // If the value is an object or array, search it recursively
                if (typeof value === 'object') {
                    return searchInObject(value, searchTerm);
                }
    
                return false;
            });
        };

        if (filtering) {
            const results = filtering.filter(user => searchInObject(user, search.toLowerCase()));
            return results;
        }
    }

    const handleClearSearch = () => {
        if(searchQueryRef && searchQueryRef.current !== null){
            searchQueryRef.current.value = '';
            setFilteredUsers(null);
        }
    }

    useEffect(() => {
        if(filteredUsers) {
            handleSearch();
        }
    },[dataUsers])

    return (
        <>
            <div className="grid">
                <h1 className="text-xl font-semibold mb-4">User List</h1>
                <div className='grid sm:grid-cols-2 mb-3'>
                    <div>
                        <div className='flex'>
                            <button className='bg-blue-700 rounded-md px-3 py-1 text-white hover:bg-gray-600 focus:outline focus:outline-1 focus:outline-black'
                                onClick={() => handleSetModalForm(null)}
                                title="Add User"
                            >
                                <i className="fi fi-rr-user-add text-sm leading-none align-middle"></i> Add User
                            </button>
                        </div>
                    </div>
                    <div className='mt-3 sm:mt-0'>
                        <div className='flex sm:float-end'>
                            <input
                                type="text"
                                placeholder="Search..."
                                spellCheck={false}
                                autoComplete="off"
                                // onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="p-1 border border-gray-300 rounded-md"
                                ref={searchQueryRef}
                            />
                            <button className="bg-blue-600 rounded-md mx-1 px-2 text-white hover:bg-gray-500 focus:outline focus:outline-1 focus:outline-black"
                                title='Search Input'
                                onClick={() => handleSearch()}
                            >
                                <i className='fi fi-rr-search text-sm leading-none align-middle'></i>
                            </button>
                            <button className="bg-red-600 rounded-md px-2 text-white hover:bg-gray-500 focus:outline focus:outline-1 focus:outline-black"
                                title='Clear Input'
                                onClick={() => handleClearSearch()}
                            >
                                <i className='fi fi-rr-eraser text-sm leading-none align-middle'></i>
                            </button>
                        </div>
                    </div>
                </div>
                {showMessage &&
                    <Message message={message} setMessage={setMessage} setShowMessage={setShowMessage}/>
                }
                <div className={`overflow-auto ${sideBar ? 'h-[calc(100vh-16rem)]' : (showDropdown ? "h-[calc(100vh-29rem)]" : "h-[calc(100vh-25rem)]")} sm:h-[calc(100vh-8rem)]`}>
                    <table className="w-max border-separate border-spacing-0">
                        <thead className="bg-gray-100 sticky top-0 z-10">
                            <tr>
                                <th className="border border-black whitespace-nowrap px-4 py-2 cursor-pointer">
                                    No
                                </th>
                                <th className="border border-black whitespace-nowrap px-4 py-2 cursor-pointer">
                                    Name
                                </th>
                                <th className="border border-black whitespace-nowrap px-4 py-2 cursor-pointer">
                                    Email
                                </th>
                                <th className="border border-black whitespace-nowrap px-4 py-2 cursor-pointer">
                                    Account Type
                                </th>
                                <th className="border border-black whitespace-nowrap px-4 py-2 cursor-pointer">
                                    Client
                                </th>
                                <th className="border border-black whitespace-nowrap px-4 py-2 cursor-pointer">
                                    Status
                                </th>
                                <th className="border border-black whitespace-nowrap px-4 py-2 cursor-pointer">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            { filteredUsers ? filteredUsers.map((user, index) => {
                                return (
                                    <tr key={index}>
                                        <td className="border border-black px-4 py-2">{index+1}</td>
                                        <td className="border border-black px-4 py-2">{user.name.fullName}</td>
                                        <td className="border border-black px-4 py-2">{user.email}</td>
                                        <td className="border border-black px-4 py-2">{user.type}</td>
                                        <td className="border border-black px-4 py-2">{user.type === 'Client' ? user.client : ''}</td>
                                        <td className="border border-black px-4 py-2">{user.status}</td>
                                        <td className="border border-black px-4 py-2">
                                            <button className={`${user.status === 'Active' ? 'bg-red-600' : 'bg-green-600'} rounded-md px-2 py-1 text-white hover:bg-gray-500 focus:outline focus:outline-1 focus:outline-black`}
                                                onClick={() => handleSetModalSuspend(user)}
                                            >
                                                <i className={`fi ${user.status === 'Active' ? 'fi fi-rr-delete-user' : 'fi-rr-user-trust'} leading-none align-middle`}></i> {`${user.status === 'Active' ? 'Suspend' : 'Re-activate'}`}
                                            </button>
                                            {user.status === 'Active' && 
                                                <button className="bg-slate-900 rounded-md px-2 ml-2 py-1 text-white hover:bg-gray-500 focus:outline focus:outline-1 focus:outline-black"
                                                    onClick={() => handleSetModalForm(user)}
                                                >
                                                    <i className="fi fi-rr-user-pen leading-none align-middle"></i> Edit
                                                </button>
                                            }
                                        </td>
                                    </tr>
                                )})
                            
                                :

                                dataUsers && dataUsers.length > 0 && dataUsers.map((user, index) => {
                                    return (
                                        <tr key={index}>
                                            <td className="border border-black px-4 py-2">{index+1}</td>
                                            <td className="border border-black px-4 py-2">{user.name.fullName}</td>
                                            <td className="border border-black px-4 py-2">{user.email}</td>
                                            <td className="border border-black px-4 py-2">{user.type}</td>
                                            <td className="border border-black px-4 py-2">{user.type === 'Client' ? user.client : ''}</td>
                                            <td className="border border-black px-4 py-2">{user.status}</td>
                                            <td className="border border-black px-4 py-2">
                                                <button className={`${user.status === 'Active' ? 'bg-red-600' : 'bg-green-600'} rounded-md px-2 py-1 text-white hover:bg-gray-500 focus:outline focus:outline-1 focus:outline-black`}
                                                    onClick={() => handleSetModalSuspend(user)}
                                                >
                                                    <i className={`fi ${user.status === 'Active' ? 'fi fi-rr-delete-user' : 'fi-rr-user-trust'} leading-none align-middle`}></i> {`${user.status === 'Active' ? 'Suspend' : 'Re-activate'}`}
                                                </button>
                                                {user.status === 'Active' && 
                                                    <>
                                                        <button className="bg-slate-900 rounded-md px-2 ml-2 py-1 text-white hover:bg-gray-500 focus:outline focus:outline-1 focus:outline-black"
                                                            onClick={() => handleSetModalForm(user)}
                                                        >
                                                            <i className="fi fi-rr-user-pen leading-none align-middle"></i> Edit
                                                        </button>
                                                        <button className="bg-orange-800 rounded-md px-2 ml-2 py-1 text-white hover:bg-gray-500 focus:outline focus:outline-1 focus:outline-black"
                                                            onClick={() => handleSetModalReset(user)}
                                                        >
                                                            <i className="fi fi-rr-operation leading-none align-middle"></i> Reset Password
                                                        </button>
                                                    </>
                                                }
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div>
            </div>
            { modalFormShow &&
                <ModalForm
                    dataModal={dataModal}
                    modalShow={modalFormShow}
                    setModalShow={setModalFormShow}
                    handleSubmit={handlUser}
                />
            }
            { modalSuspendShow &&
                <ModalSuspend
                    dataModal={dataModal}
                    modalShow={modalSuspendShow}
                    setModalShow={setModalSuspendShow}
                    handleSuspendUser={handleSuspendUser}
                />
            }
            { modalResetShow &&
                <ModalReset 
                    dataModal={dataModal}
                    modalShow={modalResetShow}
                    setModalShow={setModalResetShow}
                    handleResetPassword={handleResetPassword}
                />
            }
        </>
    )
};

export default withAuth(Layout);