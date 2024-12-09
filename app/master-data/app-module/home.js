'use client'

import Modal from "@/app/ui/components/app-module/modalDelete";
import Message from "@/app/ui/components/message";
import withAuth from '@/app/lib/withAuth';
import { getMasterData, postAppModule, deleteAppModule, patchAppModule } from "@/app/lib/api";
import { useState, useRef, useEffect } from "react";
import { useVisibility } from "@/app/home.js";
import AccessMessage from "@/app/ui/components/accessDenied";

const Layout = () => {
    const { sideBar, showDropdown, userData } = useVisibility();

    if(userData && userData.type === 'Client') {
        return <AccessMessage/>
    }

    const [dataAppModule, setDataAppModule] = useState(null);
    const [modalShow, setModalShow] = useState(false);

    const [appModule, setAppModule] = useState(null);
    const appModuleInputRef = useRef(null);

    const [client, setClient] = useState(null);
    const clientSelectRef = useRef(null);
    
    const [dataModal, setDataModal] = useState(null);
    const [message, setMessage] = useState(null);
    const [showMessage, setShowMessage] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getMasterData();
            // console.log(data);
            setDataAppModule(data);
        }

        fetchData();
    }, []);

    const handleAddAppModule = async () => {
        if(appModule !== null && client !== null && appModuleInputRef.current !== null && clientSelectRef.current !== null){

            const data = {
                client: client,
                appModule: appModule,
            }

            try{
                const message = await postAppModule(data);
                setMessage(message);
            } finally{
                // const newData = dataAppModule;
                // newData.push(data);

                // setDataAppModule(newData);
                setShowMessage(true);
                setAppModule(null);
                setClient(null);
                appModuleInputRef.current.value = null;
                clientSelectRef.current.value = '';
    
                const newData = await getMasterData();
                setDataAppModule(newData);
            } 
        }
    }

    const handleSetDataModal = async (data, appModule) => {
        const temp = {
            data: data,
            appModule: appModule,
        }

        setDataModal(temp);
        setModalShow(true);
    }

    const handleDeleteAppModule = async (data ,appModule) => {
        const dataDelete = {
            idClient: data._id,
            client: data.client,
            idAppModule: appModule._id,
            appModule: appModule.name
        }
        
        try{
            const message = await deleteAppModule(dataDelete);
            setMessage(message);
        } finally {
            setShowMessage(true);
            const newData = await getMasterData();
            setDataAppModule(newData);
            setModalShow(false);
        }
    }

    const [editableColumn, setEditableColumn] = useState(null);
    const [indexColumn, setIndexColumn] = useState(null);
    const formDataEditRefs = useRef({
        clientRef: null,
        appModuleRef: null,
    })

    useEffect(() => {
        setAppModule(null);
        setClient(null);
    },[editableColumn])

    const toggleShowEditInput = (column, index) => {
        setIndexColumn(index);
        setEditableColumn(prevColumn => prevColumn === column ? null : column);
    };

    const handleClickOutside = async () => {

        const columnRefs = {
            client: formDataEditRefs.current.clientRef,
            appModule: formDataEditRefs.current.appModuleRef,
        };
        
        if (columnRefs.client && !columnRefs.client.contains(event.target) && columnRefs.appModule && !columnRefs.appModule.contains(event.target)) {

            // console.log(columnRefs[editableColumn].current.value);
            // console.log(columnRefs[editableColumn].current.getAttribute("target"))
            if(appModule || client){
                const updateData = {
                    idClient: columnRefs.appModule.getAttribute("target"),
                    client: client ? client : columnRefs.client.value,
                    idAppModule: columnRefs.appModule.getAttribute("appmodule"),
                    appModule: appModule ? appModule : columnRefs.appModule.value,
                };
    
                try{
                    const message = await patchAppModule(updateData);
                    setMessage(message);
                } finally{
                    setShowMessage(true);
    
                    const newData = await getMasterData();
                    setDataAppModule(newData);
    
                    setAppModule(null);
                    setClient(null);
                    setEditableColumn(null);
                    setIndexColumn(null);
                }
            } else {
                setAppModule(null);
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
    }, [editableColumn, appModule, client]);

    const getRowNumber = (dataIndex, appIndex) => {
        // Adjust this calculation based on how you want to calculate row numbers
        return dataIndex * dataAppModule[0].appModule.length + appIndex + 1;
    };
    
    return (
        <>
            <div className="grid">
                <h1 className="text-xl font-semibold mb-4">App Module List</h1>
                {showMessage && 
                    <Message message={message} setMessage={setMessage} setShowMessage={setShowMessage}/>
                }
                <div className={`overflow-auto ${sideBar ? 'h-[calc(100vh-10rem)]' : (showDropdown ? "h-[calc(100vh-23rem)]" : "h-[calc(100vh-19rem)]")} sm:h-[calc(100vh-5rem)]`}>
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
                                    App Module Name
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
                                    <select className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                        ref={clientSelectRef}
                                        onChange={(event) => {setClient(event.target.value)}}
                                        defaultValue={""}
                                    >
                                        <option value={""} disabled>Select client</option>
                                        {dataAppModule && dataAppModule.length > 0 && dataAppModule.map(data => {
                                            return (
                                                <option key={data._id} value={data.client}>{data.client}</option>
                                            )
                                        })}
                                        {/* <option value={"ISS"}>ISS</option>
                                        <option value={"Honda"}>Honda</option> */}
                                    </select>
                                </td>
                                <td className="border border-black px-4 py-2">
                                    <input className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6" 
                                        type="text" placeholder="Name"
                                        ref={appModuleInputRef}
                                        onChange={(event) => {setAppModule(event.target.value)}}
                                    >
                                    </input>
                                </td>
                                <td className="border border-black px-4 py-2 text-center">
                                    <button className="bg-blue-600 rounded-md px-2 py-1 text-white hover:bg-gray-500 focus:outline focus:outline-1 focus:outline-black"
                                        onClick={handleAddAppModule}
                                    >
                                        <i className='fi fi-rr-plus-small leading-none align-middle'></i> Add
                                    </button>
                                </td>
                            </tr>
                            {dataAppModule && dataAppModule.length > 0 && dataAppModule.map((data, dataIndex) =>
                                data.appModule.map((appModule, appIndex) => (
                                    <tr key={`${data._id}-${appIndex}`}>
                                        <td className="border border-black px-4 py-2">{getRowNumber(dataIndex, appIndex)}</td>
                                        {((editableColumn === 'appModule' || editableColumn === 'client') && indexColumn === getRowNumber(dataIndex, appIndex) ? 
                                            <td className="border border-black px-4 py-2">
                                                <select className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                        placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                                    ref={el => formDataEditRefs.current.clientRef = el}
                                                    onChange={(event) => {setClient(event.target.value)}}
                                                    defaultValue={data.client}
                                                >
                                                    <option value={""} disabled>Select client</option>
                                                    {dataAppModule && dataAppModule.length > 0 && dataAppModule.map(data => {
                                                        return (
                                                            <option key={data._id} value={data.client}>{data.client}</option>
                                                        )
                                                    })}
                                                </select>
                                            </td>
                                            :
                                            <td className="border border-black px-4 py-2"
                                                onDoubleClick={() => {toggleShowEditInput('client', getRowNumber(dataIndex, appIndex), data.client)}}
                                            >{data.client}</td>
                                        )}
                                            {((editableColumn === 'appModule' || editableColumn === 'client') && indexColumn === getRowNumber(dataIndex, appIndex) ?
                                            <td className="border border-black px-4 py-2">
                                                <input className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                        placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6" 
                                                    type="text" placeholder="Name"
                                                    defaultValue={appModule.name}
                                                    target={data._id}
                                                    client={data.client}
                                                    appmodule={appModule._id}
                                                    ref={el => formDataEditRefs.current.appModuleRef = el}
                                                    onChange={(event) => {setAppModule(event.target.value)}}
                                                    spellCheck={false}
                                                >
                                                </input>
                                            </td>
                                            :
                                            <td className="border border-black px-4 py-2"
                                                onDoubleClick={() => {toggleShowEditInput('appModule', getRowNumber(dataIndex, appIndex), data.client)}}
                                            >{appModule.name}</td>
                                        )}
                                        <td className="border border-black px-4 py-2">
                                            <button className="bg-red-600 rounded-md px-2 py-1 text-white hover:bg-gray-500 focus:outline focus:outline-1 focus:outline-black"
                                                onClick={() => handleSetDataModal(data, appModule)}
                                            >
                                                <i className='fi fi-rr-trash leading-none align-middle'></i> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            { modalShow &&
                <Modal
                    dataModal={dataModal}
                    modalShow={modalShow}
                    setModalShow={setModalShow}
                    handleDeleteAppModule={handleDeleteAppModule}
                />
            }
        </>
    )
};

export default withAuth(Layout);