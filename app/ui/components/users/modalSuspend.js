'use client'

import { useState, useRef, useEffect } from "react";
import { Description, Dialog, DialogPanel, DialogTitle } from '@headlessui/react';

const ModalSuspend = (props) => {

    const {dataModal, modalShow, setModalShow, handleSuspendUser} = props;

    return (
        <Dialog open={modalShow} onClose={() => setModalShow(false)} className="relative z-50">
            <div className="fixed inset-0 flex w-screen items-center justify-center p-4 bg-black/50">
                <DialogPanel className="max-w-7xl space-y-4 border rounded-lg bg-white p-12">
                    <DialogTitle className="font-bold text-lg">{dataModal.status === 'Active' ? 'Suspend User': 'Re-Active User'}</DialogTitle>
                    <Description>This will {dataModal.status === 'Active' ? 'suspend': 're-active'} this user</Description>
                    <div className="md:leading-3">
                        Are you sure you want to {dataModal.status === 'Active' ? 'suspend': 're-active'} this user <b>{dataModal.name.fullName}</b> ? 
                    </div>
                    <div className="flex gap-3">
                        <button className="bg-blue-600 rounded-md px-2 py-1 text-white hover:bg-gray-500 focus:outline focus:outline-1 focus:outline-black"
                            onClick={() => setModalShow(false)}>Cancel</button>
                        <button className="bg-red-600 rounded-md px-2 py-1 text-white hover:bg-gray-500 focus:outline focus:outline-1 focus:outline-black"
                            onClick={() => handleSuspendUser(dataModal)}>Submit</button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    )
};

export default ModalSuspend;