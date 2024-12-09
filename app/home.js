
'use client'

import { createContext, useContext, useMemo, useState } from 'react';
// import Link from 'next/link';
// import { useRouter, usePathname } from 'next/navigation';

const VisibilityContext = createContext();

const MainLayout = ({page}) => {

    const [showDropdown, setShowDropdown] = useState(false);
    const [sideBar, setSideBar] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loadingSession, setLoadingSession] = useState(true);

    const contextValue = useMemo(() => ({
        sideBar,
        setSideBar,
        showDropdown,
        setShowDropdown,
        userData,
        setUserData,
        loadingSession,
        setLoadingSession
    }), [sideBar, setSideBar, showDropdown, setShowDropdown, userData, setUserData, loadingSession, setLoadingSession]);

    return (
        <VisibilityContext.Provider value={contextValue}>
            <div>
                {page}
            </div>
        </VisibilityContext.Provider>
    )
}

export default MainLayout;

export const useVisibility = () => useContext(VisibilityContext);