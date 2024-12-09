'use client'

import { useState, useRef, useEffect } from "react";
import { Description, Dialog, DialogPanel, DialogTitle } from '@headlessui/react';

const Modal = (props) => {

    const {dataModal, modalShow, setModalShow, handleDeleteAppModule} = props;

    return (
        <Dialog open={modalShow} onClose={() => setModalShow(false)} className="relative z-50">
            <div className="fixed inset-0 flex w-screen items-center justify-center p-4 bg-black/50">
                <DialogPanel className="max-w-7xl space-y-4 border rounded-lg bg-white p-12">
                    <DialogTitle className="font-bold text-lg">Delete App Module</DialogTitle>
                    <Description>This will permanently delete app module</Description>
                    <div className="md:leading-3">
                        Are you sure you want to delete this app module <b>{dataModal.appModule.name}</b> in client <b>{dataModal.data.client}</b> ? 
                    </div>
                    <div className="text-sm text-red-500">All of data will be permanently removed !</div>
                    <div className="flex gap-3">
                        <button className="bg-blue-600 rounded-md px-2 py-1 text-white hover:bg-gray-500 focus:outline focus:outline-1 focus:outline-black"
                            onClick={() => setModalShow(false)}>Cancel</button>
                        <button className="bg-red-600 rounded-md px-2 py-1 text-white hover:bg-gray-500 focus:outline focus:outline-1 focus:outline-black"
                            onClick={() => handleDeleteAppModule(dataModal.data, dataModal.appModule)}>Submit</button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    )
};

export default Modal;