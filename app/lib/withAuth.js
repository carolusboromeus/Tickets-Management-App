import { useVisibility } from '../home';
// import { useEffect, useState } from 'react';

const withAuth = (WrappedComponent) => {
    return (props) => {
        const { loadingSession } = useVisibility();
        // const [ loading, setLoading ] = useState(true);

        // useEffect(() => {
        //     const startLoading = async () => {
        //         setTimeout(() => {
        //             setLoading(false);  // Set loading to false after delay
        //         }, 1000);  // 2000 ms = 2 seconds
        //     };

        //     startLoading();
        // }, []);

        if (loadingSession) {
            return <div></div>;  // You can show a loading state while user data is fetched
        }

        return <WrappedComponent {...props} />;
    };
};

export default withAuth;
