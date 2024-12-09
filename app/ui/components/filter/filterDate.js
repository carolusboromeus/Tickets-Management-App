import { useState, useRef, useEffect } from 'react';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';

const FilterDate = (props) => {

    const {filterOpen, setFilterOpen, filter, setFilter, handleChangeShowFilter, title, handleSearch} = props;
    const [filterHover, setFilterHover] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const startDateRef = useRef(null);
    const endDateRef = useRef(null);
    const menuRef = useRef(null);

    const handleFilterDate = () => {
        if(startDateRef && startDateRef.current && endDateRef && endDateRef.current){
            const date = {
                start: startDateRef.current.value === '' ? null : startDateRef.current.value,
                end: endDateRef.current.value === '' ? null : endDateRef.current.value
            }

            setFilter((prevState) => ({
                ...prevState,
                [title]: date,
            }));
        }
    }

    useEffect(() => {
        if(filter && filter[title]){
            if(startDateRef && startDateRef.current && filter[title].start){
                startDateRef.current.value = filter[title].start;
            }

            if(endDateRef && endDateRef.current && filter[title].end){
                endDateRef.current.value = filter[title].end;
            }
        }
    },[filterOpen])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setFilterOpen(false);
                if(filter[title] && (filter[title].start === null && filter[title].end === null)){
                    handleChangeShowFilter(title, false);
                }
            }
        };

        // Add event listener
        document.addEventListener('mousedown', handleClickOutside);

        // Cleanup the event listener on component unmount
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [setFilterOpen, handleChangeShowFilter]);

    const handleSubmit = () =>{
        if(filter[title] && (filter[title].start === null || filter[title].end === null)){
            setShowMessage(true);
        } else {
            setShowMessage(false);
            handleSearch();
            setFilterOpen(false);
            if(filter[title] && (filter[title].start === null && filter[title].end === null)){
                handleChangeShowFilter(title, false);
            }
        }
    }

    const handleClear = () => {
        filter[title] = {
            "start": null,
            "end": null
        };
        
        setShowMessage(false);
        handleSearch();
        setFilterOpen(false);
        if(filter[title] && (filter[title].start === null && filter[title].end === null)){
            handleChangeShowFilter(title, false);
        }
    }

    return (
        <>
            <Menu>
                <MenuButton className='float-end -mb-1' title="Show Filter" onClick={() => setFilterOpen(true)}>
                    {filter[title] && (filter[title].start === null && filter[title].end === null) ?
                        <i className={`fi ${filterHover ? "fi-sr-filter" : "fi-rr-filter"} align-middle text-sm pl-1`}
                            onMouseEnter={() => setFilterHover(true)}
                            onMouseLeave={() => setFilterHover(false)}
                        ></i>

                        :

                        <i className={`fi ${filterHover ? "fi-sr-filter-list" : "fi-rr-filter-list"} align-middle`}
                            onMouseEnter={() => setFilterHover(true)}
                            onMouseLeave={() => setFilterHover(false)}
                        ></i>
                    }
                </MenuButton>
                <MenuItems anchor="bottom end" ref={menuRef}>
                    <div className={`bg-white px-4 pt-4 pb-3 w-80 border border-black rounded-md ${filterOpen ? 'block' : 'hidden'}`}>
                        <div className='flex text-sm'>
                            <div className='w-32'>
                                <div className='mb-1'>From:</div>
                                <input className={`w-full rounded-md ${showMessage && filter[title] && !filter[title].start ? 'border border-red-600' : 'border-0'} p-2 text-gray-900 ring-1 ring-inset ring-gray-300 text-sm
                                        placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6`} 
                                    type="date"
                                    ref={startDateRef}
                                    onChange={handleFilterDate}
                                    defaultValue={filter[title].start}
                                    max={filter[title] && filter[title].end ? filter[title].end : null}
                                >
                                </input>
                            </div>
                            <div className='grid grid-rows-3 grid-flow-col items-center'>
                                <br></br>
                                <span className='text-center row-span-2 mx-3'>-</span>
                            </div>
                            <div className='w-32'>
                                <div className='mb-1'>To:</div>
                                <input className={`w-full rounded-md ${showMessage && filter[title] && !filter[title].end ? 'border border-red-600' : 'border-0'} p-2 text-gray-900 ring-1 ring-inset ring-gray-300 text-sm
                                        placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6`}
                                    type="date"
                                    ref={endDateRef}
                                    onChange={handleFilterDate}
                                    defaultValue={filter[title].end}
                                    min={filter[title] && filter[title].start ? filter[title].start : null}
                                >
                                </input>
                            </div>
                        </div>
                        <div className='flex flex-row-reverse py-2 text-xs'>
                            {filter[title] && (filter[title].start && filter[title].end) ? 
                                <>
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
                                </>

                                :

                                <>
                                    <button className="bg-red-600 rounded-md px-2 py-1 text-white hover:bg-gray-500 focus:outline focus:outline-1 focus:outline-black"
                                        title='Clear Filter'
                                        onClick={() => handleClear()}
                                    >
                                        Clear
                                    </button>
                                    <button className="bg-blue-600 rounded-md mx-1 px-2 py-1 text-white hover:bg-gray-500 focus:outline focus:outline-1 focus:outline-black"
                                        title='Search Filter'
                                        onClick={handleSubmit}
                                    >
                                        Submit
                                    </button>
                                </>
                            }
                        </div>
                    </div>
                </MenuItems>
            </Menu>
        </>
    )
}

export default FilterDate;