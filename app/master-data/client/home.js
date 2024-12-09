'use client'

import withAuth from '@/app/lib/withAuth';
import { deleteClient, getMasterData, patchClient, postClient } from "@/app/lib/api";
import { useVisibility } from "@/app/home.js";
import Message from "@/app/ui/components/message";
import Modal from "@/app/ui/components/client/modalDelete";
import { useState, useRef, useEffect } from "react";
import AccessMessage from '@/app/ui/components/accessDenied';

const Layout = () => {
    const { sideBar, showDropdown, userData } = useVisibility();

    if(userData && userData.type === 'Client') {
        return <AccessMessage/>
    }

    const [dataClient, setDataClient] = useState(null);
    const [client, setClient] = useState(null);
    const clientInputRef = useRef(null);

    const [dataModal, setDataModal] = useState(null);
    const [modalShow, setModalShow] = useState(false);
    const [message, setMessage] = useState(null);
    const [showMessage, setShowMessage] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getMasterData();
            // console.log(data);
            setDataClient(data);
        }

        fetchData();
    }, []);

    const handleAddClient = async () => {
        if(client !== null && clientInputRef.current !== null){
            try{
                const appModule = [];
                const data = {
                    client: client,
                    appModule: appModule,
                }

                const message = await postClient(data);
                setMessage(message);
            } finally {
                setShowMessage(true);

                // const newData = dataClient;
                // newData.push(data);
                // setDataClient(newData);

                const newData = await getMasterData();
                setDataClient(newData);

                setClient(null);
                clientInputRef.current.value = null;
            }
    
        }
    }

    const [editableColumn, setEditableColumn] = useState(null);
    const [indexColumn, setIndexColumn] = useState(null);
    const clientInputEditRef = useRef(null);

    useEffect(() => {
        setClient(null);
    },[editableColumn])

    const toggleShowEditInput = (column, index) => {
        setIndexColumn(index);
        setEditableColumn(prevColumn => prevColumn === column ? null : column);
    };

    const handleClickOutside = async () => {
        
        if (clientInputEditRef.current && !clientInputEditRef.current.contains(event.target)) {

            // console.log(columnRefs[editableColumn].current.value);
            // console.log(columnRefs[editableColumn].current.getAttribute("target"))
            if(client){
                const updateData = {
                    idClient: clientInputEditRef.current.getAttribute("target"),
                    client: client ? client : columnRefs.client.value,
                };
    
                try{
                    const message = await patchClient(updateData);
                    setMessage(message);
                } finally{
                    setShowMessage(true);
    
                    const newData = await getMasterData();
                    setDataClient(newData);
    
                    setClient(null);
                    setEditableColumn(null);
                    setIndexColumn(null);
                }
            } else {
                setClient(null);
                setEditableColumn(null);
                setIndexColumn(null);
            }
        }
    };

    useEffect(() => {
        // Add event listener for clicks outside
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            // Cleanup event listener on unmount
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [editableColumn, client]);

    const handleSetDataModal = async (data) => {
        setDataModal(data);
        setModalShow(true);
    }

    const handleDeleteClient = async (data) => {
        const dataDelete = {
            idClient: data._id,
            client: data.client,
        }
        
        try{
            const message = await deleteClient(dataDelete);
            setMessage(message);
        } finally {
            setShowMessage(true);
            const newData = await getMasterData();
            setDataClient(newData);
            setModalShow(false);
        }
    }

    return (
        <>
            <div className="grid">
                <h1 className="text-xl font-semibold mb-4">Client List</h1>
                {showMessage &&
                    <Message message={message} setMessage={setMessage} setShowMessage={setShowMessage}/>
                }
                <div className={`overflow-auto ${sideBar ? "h-[calc(100vh-10em)]" : (showDropdown ? "h-[calc(100vh-23rem)]" : "h-[calc(100vh-19rem)]")} sm:h-[calc(100vh-5rem)]`}>
                    <table className="w-max border-separate border-spacing-0">
                        <thead className="bg-gray-100 sticky top-0 z-10">
                            <tr>
                                <th className="border border-black whitespace-nowrap px-4 py-2 cursor-pointer">
                                    No
                                </th>
                                <th className="border border-black whitespace-nowrap px-4 py-2 cursor-pointer">
                                    Client
                                </th>
                                <th className="border border-black whitespace-nowrap px-4 py-2 cursor-pointer">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-black px-4 py-2"></td>
                                <td className="border border-black px-4 py-2">
                                    <input className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6" 
                                        type="text" placeholder="Name"
                                        ref={clientInputRef}
                                        onChange={(event) => {setClient(event.target.value)}}
                                    >
                                    </input>
                                </td>
                                <td className="border border-black px-4 py-2 text-center">
                                    <button className="bg-blue-600 rounded-md px-2 py-1 text-white hover:bg-gray-500 focus:outline focus:outline-1 focus:outline-black"
                                        onClick={handleAddClient}
                                    >
                                        <i className='fi fi-rr-plus-small leading-none align-middle'></i> Add
                                    </button>
                                </td>
                            </tr>
                            { dataClient && dataClient.length > 0 && dataClient.map((client, index) => {
                                return (
                                    <tr key={index}>
                                        <td className="border border-black px-4 py-2">{index+1}</td>
                                        {(editableColumn === 'client' && indexColumn === index ?
                                            <td className="border border-black px-4 py-2">
                                                <input className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                        placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6" 
                                                    type="text" placeholder="Name"
                                                    defaultValue={client.client}
                                                    target={client._id}
                                                    ref={clientInputEditRef}
                                                    onChange={(event) => {setClient(event.target.value)}}
                                                    spellCheck={false}
                                                >
                                                </input>
                                            </td>
                                            :
                                            <td className="border border-black px-4 py-2"
                                                onDoubleClick={() => {toggleShowEditInput('client', index)}}
                                            >{client.client}</td>
                                        )}
                                        <td className="border border-black px-4 py-2">
                                            <button className="bg-red-600 rounded-md px-2 py-1 text-white hover:bg-gray-500 focus:outline focus:outline-1 focus:outline-black"
                                                onClick={() => handleSetDataModal(client)}
                                            >
                                                <i className='fi fi-rr-trash leading-none align-middle'></i> Delete
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            { modalShow &&
                <Modal
                    dataModal={dataModal}
                    modalShow={modalShow}
                    setModalShow={setModalShow}
                    handleDeleteClient={handleDeleteClient}
                />
            }
        </>
    )
};

export default withAuth(Layout);