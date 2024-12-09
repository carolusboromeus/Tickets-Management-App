import { useState, useRef, useEffect } from 'react';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';

const FilterInput = (props) => {
    const { filterOpen, setFilterOpen, filter, setFilter, handleChangeShowFilter, title, handleSearch } = props;
    const [filterHover, setFilterHover] = useState(false);
    const inputRef = useRef(null);
    const menuRef = useRef(null);

    const handleFilterInput = () => {
        if (inputRef && inputRef.current) {
            setFilter((prevState) => ({
                ...prevState,
                [title]: inputRef.current.value,
            }));
        }
    };

    const handleKeyDown = (event) => {
        // Check if the input is focused and SPACE key is pressed
        if(event.key === 'Enter'){
            handleSubmit();
        }

        if (event.key === ' ' && document.activeElement === inputRef.current) {
            event.stopPropagation(); // Prevent the dropdown from closing    
        }
        
    };

    useEffect(() => {
        if (filterOpen && inputRef.current) {
            inputRef.current.value = filter[title];
            setTimeout(() => {
                inputRef.current.focus();
            }, 0);
        }  
    }, [filterOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setFilterOpen(false);
                if (!filter[title]) {
                    handleChangeShowFilter(title, false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [setFilterOpen, handleChangeShowFilter]);

    const handleSubmit = () =>{
        handleSearch();
        setFilterOpen(false);
        !filter[title] ? handleChangeShowFilter(title, false) : null;
    }

    const handleClear = () => {
        filter[title] = null;
        handleSubmit();
    }

    return (
        <>
            <Menu>
                <MenuButton className='float-end -mb-1' title="Show Filter" onClick={() => setFilterOpen(true)}>
                    {filter[title] === null || filter[title] === '' ? (
                        <i className={`fi ${filterHover ? "fi-sr-filter" : "fi-rr-filter"} align-middle text-sm pl-1`}
                            onMouseEnter={() => setFilterHover(true)}
                            onMouseLeave={() => setFilterHover(false)}
                        ></i>
                    ) : (
                        <i className={`fi ${filterHover ? "fi-sr-filter-list" : "fi-rr-filter-list"} align-middle`}
                            onMouseEnter={() => setFilterHover(true)}
                            onMouseLeave={() => setFilterHover(false)}
                        ></i>
                    )}
                </MenuButton>
                <MenuItems anchor="bottom end" ref={menuRef}>
                    <div className={`bg-white px-4 pt-4 pb-3 w-60 border border-black rounded-md ${filterOpen ? 'block' : 'hidden'}`}>
                        <input className='w-full rounded-md border-0 p-1 text-gray-900 ring-1 ring-inset ring-gray-300 text-sm
                                placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6' 
                            type="text"
                            placeholder="Search..."
                            ref={inputRef}
                            onChange={handleFilterInput}
                            onKeyDown={handleKeyDown} // Add the onKeyDown handler here
                            defaultValue={filter[title]}
                        />
                        <div className='flex flex-row-reverse py-2 text-xs'>
                            <MenuItem>
                                <button className="bg-red-600 rounded-md px-2 py-1 text-white hover:bg-gray-500 focus:outline focus:outline-1 focus:outline-black"
                                    title='Clear Filter'
                                    onClick={() => handleClear()}
                                >
                                    Clear
                                </button>
                            </MenuItem>
                            <MenuItem>
                                <button className="bg-blue-600 rounded-md mx-1 px-2 py-1 text-white hover:bg-gray-500 focus:outline focus:outline-1 focus:outline-black"
                                    title='Search Filter'
                                    onClick={handleSubmit}
                                >
                                    Submit
                                </button>
                            </MenuItem>
                        </div>
                    </div>
                </MenuItems>
            </Menu>
        </>
    );
};

export default FilterInput;
