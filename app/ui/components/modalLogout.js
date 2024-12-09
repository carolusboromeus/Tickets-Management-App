'use client'

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';

const Modal = (props) => {

    const {modalShow, setModalShow, handleLogout} = props;

    return (
        <Dialog open={modalShow} onClose={() => setModalShow(true)} className="relative z-50">
            <div className="fixed inset-0 flex w-screen items-center justify-center p-4 bg-black/50">
                <DialogPanel className="max-w-7xl space-y-4 border rounded-lg bg-white p-12">
                    <div className="text-center">
                        <div className="bg-yellow-200 w-2/12 rounded-full flex items-center justify-center mx-auto p-4">
                            <i className="fi fi-sr-triangle-warning text-3xl text-yellow-500"></i> {/* Adjust size here */}
                        </div>
                    </div>
                    <DialogTitle className="font-bold text-lg text-center">Sign Out</DialogTitle>
                    <div className="md:leading-3">
                        Are you sure you would like to sign out of your account? 
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-row-reverse">
                            <button className="bg-gray-300 rounded-md w-1/2 px-2 py-1 text-black hover:bg-gray-500 hover:text-white focus:outline focus:outline-1 focus:outline-black"
                                onClick={() => handleLogout()}>Sign Out</button>
                        </div>
                        <div className="flex">
                            <button className="bg-blue-600 rounded-md w-1/2 px-2 py-1 text-white hover:bg-gray-500 focus:outline focus:outline-1 focus:outline-black"
                                onClick={() => setModalShow(false)}>Cancel</button>
                        </div>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    )
};

export default Modal;