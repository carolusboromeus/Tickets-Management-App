import { useState, useRef, useEffect } from 'react';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';

const FilterOption = (props) => {

    const {filterOpen, setFilterOpen, filter, setFilter, title, handleChangeShowFilter, optionArray, handleSearch, dataUserSession} = props;
    const [filterHover, setFilterHover] = useState(false);
    const [expandedClients, setExpandedClients] = useState([]);
    const menuRef = useRef(null);

    const handleFilterOption = (target) => {
        if (target.checked) {
            // If checked and not already included, add to filterWeek
            if (!filter[title].includes(target.value)) {
                const newFilterArray = [...filter[title], target.value];
                setFilter((prevState) => ({
                    ...prevState,
                    [title]: newFilterArray,
                }));
            }
        } else {
            // If unchecked, remove it from filterWeek
            const newFilterArray = filter[title].filter(item => item !== target.value);
            setFilter((prevState) => ({
                ...prevState,
                [title]: newFilterArray,
            }));
        }
    }

    const toggleClient = (clientName) => {
        if (expandedClients.includes(clientName)) {
            setExpandedClients(expandedClients.filter(client => client !== clientName));
        } else {
            setExpandedClients([...expandedClients, clientName]);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setFilterOpen(false);
                if(filter[title] && filter[title].length === 0){
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
        handleSearch();
        setFilterOpen(false);
        filter[title] && filter[title].length === 0 ? handleChangeShowFilter(title, false) : null;
    }

    const handleClear = () => {
        filter[title] = [];
        handleSubmit();
    }

    return (
        <>
            <Menu>
                <MenuButton className='float-end -mb-1' title="Show Filter" onClick={() => setFilterOpen(true)}>
                    {filter[title] && filter[title].length == 0 ?
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
                <MenuItems anchor={`${filter[title] == 'week' ? 'bottom start' : 'bottom end'}`} ref={menuRef}>
                    <div className={`bg-white px-4 py-3 w-56 border border-black rounded-md text-sm ${filterOpen ? 'block' : 'hidden'}`} >
                        {title && title !== 'appModule' && optionArray.map(item => (
                            <div className='flex my-2 px-2 py-1 rounded-md hover:bg-gray-600/70 hover:text-white hover:font-semibold' key={item}>
                                <input
                                    className="cursor-pointer"
                                    type="checkbox"
                                    id={title === 'week' ? `week ${item}` : item}
                                    name={title === 'week' ? `week ${item}` : item}
                                    value={title === 'week' ? item.toString() : item}
                                    checked={filter[title].includes(title === 'week' ? item.toString() : item)}
                                    onChange={(event) => handleFilterOption(event.target)}
                                />
                                <label className='cursor-pointer ml-2 w-full' htmlFor={title === 'week' ? `week ${item}` : item}>{title === 'week' ? `Week ${item}`: item}</label>
                            </div>
                        ))}
                        {title && title === 'appModule' && dataUserSession && dataUserSession.type === 'Admin' && optionArray.map((item,index) => (
                            item.appModule && item.appModule.length > 0 &&  (
                                <div key={item._id}>
                                    <div className='mt-3 mb-1 px-2 py-1 rounded-md cursor-pointer flex hover:bg-gray-600/70 hover:text-white' onClick={() => toggleClient(item.client)}>
                                        <div className='font-semibold w-11/12'>{item.client}</div>
                                        <i className={`fi ${expandedClients.includes(item.client) ? 'fi-sr-angle-small-up' : 'fi-sr-angle-small-down'} w-1/12`}></i>
                                    </div>
                                    {expandedClients.includes(item.client) && 
                                        <hr></hr>
                                    }
                                    {expandedClients.includes(item.client) && (
                                        <div className='my-2'>
                                            {item.appModule.map(appModule => (
                                                <div className='flex my-2 px-2 py-1 rounded-md hover:bg-gray-600/70 hover:text-white hover:font-semibold' key={appModule._id}>
                                                    <input
                                                        className="cursor-pointer"
                                                        type="checkbox"
                                                        id={appModule.name}
                                                        name={appModule.name}
                                                        value={appModule.name}
                                                        checked={filter[title].includes(appModule.name)}
                                                        onChange={(event) => handleFilterOption(event.target)}
                                                    />
                                                    <label className='cursor-pointer ml-2 w-full' htmlFor={appModule.name}>{appModule.name}</label>
                                                </div>  
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        ))}
                        {title && title === 'appModule' && dataUserSession && dataUserSession.type === 'Client' && optionArray.map((item,index) => (
                            item.appModule && item.appModule.length > 0 &&  (
                                <div key={item._id}>
                                    <div className='my-2'>
                                        {item.appModule.map(appModule => (
                                            <div className='flex my-2 px-2 py-1 rounded-md hover:bg-gray-600/70 hover:text-white hover:font-semibold' key={appModule._id}>
                                                <input
                                                    className="cursor-pointer"
                                                    type="checkbox"
                                                    id={appModule.name}
                                                    name={appModule.name}
                                                    value={appModule.name}
                                                    checked={filter[title].includes(appModule.name)}
                                                    onChange={(event) => handleFilterOption(event.target)}
                                                />
                                                <label className='cursor-pointer ml-2 w-full' htmlFor={appModule.name}>{appModule.name}</label>
                                            </div>  
                                        ))}
                                    </div>
                                </div>
                            )
                        ))}
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
    )
}

export default FilterOption;