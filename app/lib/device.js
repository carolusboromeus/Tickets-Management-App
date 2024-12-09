import { useState, useEffect } from 'react';

const useWindowWidth = () => {
    const [windowWidth, setWindowWidth] = useState(0);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        // Set initial width
        handleResize();

        // Add event listener
            window.addEventListener('resize', handleResize);
        
        // Cleanup on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
  }, []);

  return windowWidth;
};

export default useWindowWidth;
