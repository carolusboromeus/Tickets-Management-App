'use client'

import { useState, useRef, useEffect } from "react";

const Message = (props) => {

    const {message, setMessage, setShowMessage} = props;
    const [progressWidth, setProgressWidth] = useState(0);

    useEffect(() => {
        if (message) {
            // Set up the timer to hide the message after 5 seconds
            const hideMessageTimer = setTimeout(() => {
                setShowMessage(false);
                setMessage(null);
            }, 2000);

            // Set up the progress timer
            const progressInterval = setInterval(() => {
                setProgressWidth(prevWidth => {
                    if (prevWidth >= 100) {
                        clearInterval(progressInterval);
                        return 100;
                    }
                    return prevWidth + (100 / 3500) * 100; // Increment width by 100%/5000ms
                });
            }, 50); // Update every 50ms

            // Clean up timers if component unmounts or message changes
            return () => {
                clearTimeout(hideMessageTimer);
                clearInterval(progressInterval);
            };
        }
    }, [message, setShowMessage]);

    return (
        <div className="mb-5 absolute z-20 bottom-0 md:right-0 mr-5">
            {message && 
                <div className={`${message.status === 200 ? 'bg-green-400' : 'bg-red-400'} rounded-lg border-black border items-center pt-2`}>
                    <div className="flex py-2 px-5 items-center">
                        <i className={`fi ${message.status === 200 ? 'fi-rr-checkbox' : 'fi-rr-cross-circle'} mt-1`} ></i>
                        <div className="ml-2">{message.message}</div>
                    </div>   
                    <div className="bg-gray-500/50 rounded-b-lg h-1" style={{ width: `${progressWidth}%` }}></div>
                </div>
            }
        </div>
    )
};

export default Message;