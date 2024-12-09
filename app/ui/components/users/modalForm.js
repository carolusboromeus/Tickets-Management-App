'use client'

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogPanel, DialogTitle, Field, Fieldset, Input, Label, Legend, Select} from '@headlessui/react';
import { getMasterData  } from "@/app/lib/api";

const ModalForm = (props) => {

    const {dataModal, modalShow, setModalShow, handleSubmit} = props;
    const [dataClient, setDataClient] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showMessage, setShowMessage] = useState({
        firstName: false,
        email: false,
        type: false,
        client: false,
        newPasswordLength: false,
        passwordNotMatch: false,
    });

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        type: '',
        client: '',
    })

    const formDataRefs = useRef(
        {
            firstNameRef: null,
            lastNameRef:null,
            emailRef: null,
            accountTypeRef: null,
            clientRef: null
        }
    )

    useEffect(() => {
        if(dataModal && modalShow) {
            const data = {
                firstName: dataModal.name.firstName,
                lastName: dataModal.name.lastName,
                email: dataModal.email,
                type: dataModal.type
            }

            if(dataModal.type === 'Client') {
                data.client = dataModal.client;
            }

            setFormData(data)
        }
    },[modalShow, dataModal])
    
    const handleChange = (columnName, value) => {
        if(columnName === 'type' && value === 'Admin'){
            setDataClient(null);
        }

        setFormData((prevState) => ({
            ...prevState,
            [columnName]: value,
        }));
    }

    useEffect(() => {
        if(formData && formData.type === 'Client') {
            const fetchData = async () => {
                const data = await getMasterData();
                setDataClient(data);
            }
            
            fetchData();
        }
    },[formData])

    useEffect(() => {
        if(formDataRefs.current && formDataRefs.current.clientRef && dataClient) {
            formDataRefs.current.clientRef.value = formData.client
        }
    },[dataClient])

    return (
        <Dialog open={modalShow} onClose={() => setModalShow(false)} className="relative z-50">
            <div className="fixed inset-0 flex w-screen items-center justify-center p-4 bg-black/50">
                <DialogPanel className="max-w-7xl lg:w-1/2 space-y-4 border rounded-lg bg-white p-12">
                    <DialogTitle className="font-bold text-lg">{dataModal ? 'Edit User' : 'Add User'}</DialogTitle>
                    {/* <Description>This will suspend this user</Description> */}
                    <Fieldset className="space-y-5 w-full pb-2 px-2">
                        <div className="grid grid-cols-2 gap-5">
                            <Field className="w-full">
                                <Label className="block">First Name</Label>
                                <Input className={`w-full mt-1 ps-3 block p-1 border ${showMessage.firstName ? 'border-red-300' : 'border-gray-300'} rounded-md text-sm`} 
                                    name="name" 
                                    type="text"
                                    spellCheck={false}
                                    defaultValue={dataModal ? formData.firstName : ''}
                                    autoComplete="false"
                                    placeholder="First name"
                                    ref={el => formDataRefs.current.firstNameRef = el}
                                    onChange={(event) => handleChange('firstName', event.target.value)}
                                />
                            </Field>
                            <Field className="w-full">
                                <div className="grid lg:grid-cols-2">
                                    <Label className="block">Last Name</Label>
                                    <Legend className="text-xs/6 absolute lg:relative text-right text-black/50 font-thin invisible lg:visible">Optional</Legend>
                                </div>
                                <Input className="w-full mt-1 ps-3 block p-1 border border-gray-300 rounded-md text-sm" 
                                    name="name" 
                                    type="text"
                                    spellCheck={false}
                                    defaultValue={dataModal ? formData.lastName : ''}
                                    autoComplete="false"
                                    placeholder="Last name"
                                    ref={el => formDataRefs.current.lastNameRef = el}
                                    onChange={(event) => handleChange('lastName', event.target.value)}
                                />
                            </Field>
                        </div>
                        <Field>
                            <Label className="block">Email Address</Label>
                            <Input className={`w-full mt-1 ps-3 p-1 border ${showMessage.email ? 'border-red-300' : 'border-gray-300'} rounded-md text-sm`}
                                name="email" 
                                type="email"
                                spellCheck={false}
                                defaultValue={dataModal ? formData.email : ''}
                                autoComplete="false"
                                placeholder="you@example.com"
                                ref={el => formDataRefs.current.emailRef = el}
                                onChange={(event) => handleChange('email', event.target.value)}
                            />
                        </Field>
                        <Field>
                            <Label className="block">Account Type</Label>
                            <Select className={`mt-1 block p-1 border ${showMessage.type ? 'border-red-300' : 'border-gray-300'} rounded-md w-full text-sm`} name="type" 
                                defaultValue={dataModal ? dataModal.type : ''}
                                ref={el => formDataRefs.current.accountTypeRef = el}
                                onChange={(event) => handleChange('type', event.target.value)}
                            >
                                <option value="" disabled>Select account type</option>
                                <option value="Admin">Admin</option>
                                <option value="Client">Client</option>
                            </Select>
                        </Field>
                        {formData.type && formData.type === 'Client' &&
                            <Field>
                                <Label className="block">Client</Label>
                                <Select className={`mt-1 block p-1 border ${showMessage.client ? 'border-red-300' : 'border-gray-300'} rounded-md w-full text-sm`} name="client" 
                                    defaultValue={dataModal ? dataModal.client : ''}
                                    ref={el => formDataRefs.current.clientRef = el}
                                    onChange={(event) => handleChange('client', event.target.value)}
                                >
                                    <option value="" disabled>Select client</option>
                                    {dataClient && dataClient.length > 0 && dataClient.map((client, index) => {
                                        return (
                                            <option key={index} value={client.client}>{client.client}</option>
                                        )
                                    })}
                                </Select>
                            </Field>
                        }
                    </Fieldset>
                    <div className="flex gap-3 flex-row-reverse">
                        <button className="bg-blue-600 text-sm rounded-md px-2 py-1 text-white hover:bg-gray-500 focus:outline focus:outline-1 focus:outline-black"
                            onClick={() => handleSubmit(formData, showMessage, setShowMessage)}>Submit</button>
                        <button className="bg-red-600 text-sm rounded-md px-2 py-1 text-white hover:bg-gray-500 focus:outline focus:outline-1 focus:outline-black"
                            onClick={() => setModalShow(false)}>Cancel</button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    )
};

export default ModalForm;