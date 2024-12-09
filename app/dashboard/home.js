
'use client'

import { useState, useRef, useEffect } from 'react';
import withAuth from '@/app/lib/withAuth';
import { useVisibility } from '../home';
import { getData, getMasterData } from '../lib/api';
import { epxortFiletoExcel, getDateFirstandLast } from '../lib/function';
import FilterOption from '../ui/components/filter/filterOption';
import FilterInput from '../ui/components/filter/filterInput';
import FilterDate from '../ui/components/filter/filterDate';
// import Link from 'next/link';
// import { useRouter, usePathname } from 'next/navigation';

const Layout = () => {
    // const router = useRouter();
    // const pathname = usePathname();
    const { sideBar, showDropdown, userData} = useVisibility();

    const [tickets, setTickets] = useState(null);
    const [masterData, setMasterData] = useState(null);
    const [filteredTickets, setFilteredTickets] = useState(null);
    const [loading, setLoading] = useState(false);
    const searchQueryRef = useRef(null);

    const [filterOpen, setFilterOpen] = useState(false);
    const [showFilter, setShowFilter] = useState({
        client: false,
        createdDate: false,
        requesterName: false,
        description: false,
        appModule: false,
        resolution: false,
        resolvedDate: false,
        modeTicket: false,
        status: false
    });
    const [filter, setFilter] = useState({
        client: null,
        createdDate: {
            start: null,
            end: null
        },
        requesterName: null,
        description: null,
        appModule: [],
        resolution: null,
        resolvedDate: {
            start: null,
            end: null
        },
        modeTicket: [],
        status: []
    });

    const renderData = async (filter) => {
        const data = await getData(filter);
        
        if(data && data.length > 0){
            data.reverse();
            return data;
            // setFilteredTickets(data);
        }
    }

    useEffect(() => {
        const fetchData = async () => {

            try{
                setLoading(true);
                
                const dateNow = new Date();
                const date = getDateFirstandLast(dateNow);
    
                const filter = {
                    startDate: date.formatFristDate,
                    endDate: date.formatLastDate,
                }

                if(userData && userData.type === 'Client') {
                    filter.client = userData.client;
                }
                
                const data = await renderData(filter);
                setTickets(data);
                
                const masterData = await getMasterData(filter);
                setMasterData(masterData);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [userData]);

    const formatText = (text) => {
        if (typeof text !== 'string' || text === null) {
            // console.error('Input is not a string');
            return '';
        } else {
            const formatText = text.replace(/\n/g,'<br/>');
            // console.log(formatText);
            return formatText;
        }

    }

    const toggleColumn = (columnName) => {
        setVisibleColumns((prevState) => ({
          ...prevState,
          [columnName]: !prevState[columnName],
        }));
    };

    const [visibleColumns, setVisibleColumns] = useState({
        ticketId: true,
        client: userData.type === 'Client' ? false : true,
        createdDate:  true,
        requesterName: true,
        description: true,
        appModule: true,
        resolution: true,
        resolvedDate: true,
        modeTicket: true,
        status: true,
    });

    const handleChangeShowFilter = (columnName, value) => {
        setShowFilter((prevState) => ({
            ...prevState,
            [columnName]: value,
        }));
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
            // console.log(event.target.value);
        }
    }

    const handleSearch =  async () => {
        // if (!tickets || tickets.length === 0) return;
        
        let filtering = tickets;
        if (filter) {
            const filterDate = {};

            if(filter.createdDate && (filter.createdDate.start && filter.createdDate.end)){
                filterDate.startDate = filter.createdDate.start;
                filterDate.endDate = filter.createdDate.end;
            }
            
            if(filter.resolvedDate && (filter.resolvedDate.start && filter.resolvedDate.end)){
                filterDate.resolvedStartDate = filter.resolvedDate.start;
                filterDate.resolvedEndDate = filter.resolvedDate.end;
            }

            if(userData && userData.type === 'Client') {
                filterDate.client = userData.client;
            }

            if(userData && userData.type === 'Client' && filterDate && filterDate.startDate === undefined && filterDate.endDate === undefined && filterDate.resolvedStartDate === undefined && filterDate.resolvedEndDate === undefined) {
                const dateNow = new Date();
                const date = getDateFirstandLast(dateNow);

                filterDate.startDate = date.formatFristDate,
                filterDate.endDate = date.formatLastDate
            }

            if(Object.keys(filterDate).length > 0){
                const updateView = await renderData(filterDate);
                filtering = updateView;
            }
        }
    
        if (filter) {
            const filterConditions = [
                { key: 'client', condition: ticket => String(ticket.client).toLowerCase().includes(filter.client.toLowerCase()) },
                { key: 'requesterName', condition: ticket => String(ticket.requesterName).toLowerCase().includes(filter.requesterName.toLowerCase()) },
                { key: 'appModule', condition: ticket => filter.appModule.includes(ticket.appModule) },
                { key: 'description', condition: ticket => String(ticket.description).toLowerCase().includes(filter.description.toLowerCase()) },
                { key: 'resolution', condition: ticket => String(ticket.resolution).toLowerCase().includes(filter.resolution.toLowerCase()) },
                { key: 'modeTicket', condition: ticket => filter.modeTicket.includes(ticket.modeTicket) },
                { key: 'status', condition: ticket => filter.status.includes(ticket.status) },
            ];
    
            // Filter tickets based on conditions
            filtering = filterConditions.reduce((acc, { key, condition }) => {
                return filter[key] && filter[key].length > 0 ? acc.filter(condition) : acc;
            }, filtering);
        }
    
        // Process the search query
        if (searchQueryRef && searchQueryRef.current) {
            filtering = processSearch(searchQueryRef.current.value, filtering);
        }
        
        filtering ? setFilteredTickets(filtering) : setFilteredTickets([]);
    };

    const processSearch = (search, filtering) => {
        if(filtering){
            const results = filtering.filter(ticket => 
                Object.values(ticket).some(value => 
                    String(value).toLowerCase().includes(search.toLowerCase())
                )
            );
            return results;
        }
    }

    const handleClearSearch = () => {
        if(searchQueryRef && searchQueryRef.current !== null){
            searchQueryRef.current.value = '';
            setFilter({
                client: null,
                createdDate: {
                    start: null,
                    end: null
                },
                requesterName: null,
                description: null,
                appModule: [],
                resolution: null,
                resolvedDate: {
                    start: null,
                    end: null
                },
                modeTicket: [],
                status: [],
                lastUpdateBy: null
            })
            setShowFilter({
                client: false,
                createdDate: false,
                requesterName: false,
                description: false,
                appModule: false,
                resolution: false,
                resolvedDate: false,
                modeTicket: false,
                status: false,
                lastUpdateBy: false
            })
            setFilteredTickets(null);
        }
    }

    const handleExport = () => {
        const table = document.getElementById('tableTicket');
        const colWidth = [
            { wpx: 0 },
            { wpx: 0 },
            { wpx: 110 },
            { wpx: 180 },
            { wpx: 350 },
            { wpx: 200 },
            { wpx: 350 },
            { wpx: 110 },
            { wpx: 110 },
            { wpx: 0 }
        ];

        epxortFiletoExcel(table, 'TicketDetail', colWidth);
    };

    if(!loading){
        return (
            <div className="grid">
                <h1 className="text-xl font-semibold mb-4">Detail Ticket</h1>
                <div className='grid sm:grid-cols-2 mb-3'>
                    <div>
                        <div className='flex'>
                            <button className='bg-green-700 rounded-md px-3 py-1 text-white hover:bg-gray-600 focus:outline focus:outline-1 focus:outline-black'
                                onClick={handleExport}
                                title="Export File to Excel"
                            >
                                <i className="fi fi-rr-file-export text-sm leading-none align-middle"></i> Export to Excel
                            </button>
                        </div>
                    </div>
                    <div className='mt-3 sm:mt-0'>
                        <div className='flex sm:float-end'>
                            <input
                                type="text"
                                placeholder="Search..."
                                spellCheck={false}
                                autoComplete="off"
                                // onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="p-1 border border-gray-300 rounded-md"
                                ref={searchQueryRef}
                            />
                            <button className="bg-blue-600 rounded-md mx-1 px-2 text-white hover:bg-gray-500 focus:outline focus:outline-1 focus:outline-black"
                                title='Search Input'
                                onClick={() => handleSearch()}
                            >
                                <i className='fi fi-rr-search text-sm leading-none align-middle'></i>
                            </button>
                            <button className="bg-red-600 rounded-md px-2 text-white hover:bg-gray-500 focus:outline focus:outline-1 focus:outline-black"
                                title='Clear Input'
                                onClick={() => handleClearSearch()}
                            >
                                <i className='fi fi-rr-eraser text-sm leading-none align-middle'></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div className={`overflow-auto ${sideBar ? 'h-[calc(100vh-16rem)]' : (showDropdown ? "h-[calc(100vh-29rem)]" : "h-[calc(100vh-25rem)]")} sm:h-[calc(100vh-8rem)]`}>
                    <table id='tableTicket' className="w-max border-separate border-spacing-0">
                        <thead className="bg-gray-100 sticky top-0 z-10">
                            <tr>
                                {visibleColumns.ticketId && 
                                    <th className="whitespace-nowrap px-4 py-2 cursor-pointer" 
                                        onDoubleClick={() => toggleColumn('ticketId')}>
                                        No Ticket
                                    </th>
                                }
                                {visibleColumns.client &&
                                    <th className="whitespace-nowrap px-4 py-2 cursor-pointer"
                                        onDoubleClick={!filterOpen && !filter.client ? () => toggleColumn('client') : null}
                                        onMouseEnter={!filter.client && userData && userData.type === 'Admin' ? () => handleChangeShowFilter('client', true) : null}
                                        onMouseLeave={!filter.client && userData && userData.type === 'Admin' ? (!filterOpen ? () => {handleChangeShowFilter('client', false); setFilterOpen(false);} : null) : null}>
                                        <span className={`${showFilter.client && userData && userData.type === 'Admin' ? "ml-10 mr-6" : "mx-10"}`}>Client</span>
                                        {showFilter.client && userData && userData.type === 'Admin' &&
                                            <FilterInput
                                                filterOpen={filterOpen}
                                                setFilterOpen={setFilterOpen}
                                                filter={filter}
                                                setFilter={setFilter}
                                                handleChangeShowFilter={handleChangeShowFilter}
                                                title="client"
                                                handleSearch={handleSearch}
                                            />
                                        }
                                    </th>
                                }
                                {visibleColumns.createdDate &&
                                    <th className="whitespace-nowrap px-4 py-2 cursor-pointer"
                                        onDoubleClick={!filterOpen ? () => toggleColumn('createdDate') : null}
                                        onMouseEnter={() => handleChangeShowFilter('createdDate', true)}
                                        onMouseLeave={filter.createdDate && (!filter.createdDate.start && !filter.createdDate.end) ? (!filterOpen ? () => {handleChangeShowFilter('createdDate', false); setFilterOpen(false);} : null) : null}>
                                        {/* onMouseLeave={!filterOpen ? () => {handleChangeShowFilter('createdDate', false); setFilterOpen(false);} : null}> */}
                                        <span className={`${showFilter.createdDate ? "ml-8 mr-4" : "mx-8"}`}>Created Date</span>
                                        {showFilter.createdDate && 
                                            <FilterDate
                                                filterOpen={filterOpen}
                                                setFilterOpen={setFilterOpen}
                                                filter={filter}
                                                setFilter={setFilter}
                                                handleChangeShowFilter={handleChangeShowFilter}
                                                title={'createdDate'}
                                                handleSearch={handleSearch}
                                            />
                                        }
                                    </th>
                                }
                                {visibleColumns.requesterName &&
                                    <th className="whitespace-nowrap px-4 py-2 cursor-pointer"
                                        onDoubleClick={!filterOpen ? () => toggleColumn('requesterName') : null}
                                        onMouseEnter={!filter.requesterName ? () => handleChangeShowFilter('requesterName', true) : null}
                                        onMouseLeave={!filter.requesterName ? (!filterOpen ? () => {handleChangeShowFilter('requesterName', false); setFilterOpen(false);} : null) : null}
                                    >
                                        <span className={`${showFilter.requesterName ? "ml-8 mr-4" : "mx-8"}`}>Requester Name</span>
                                        {showFilter.requesterName && 
                                            <FilterInput
                                                filterOpen={filterOpen}
                                                setFilterOpen={setFilterOpen}
                                                filter={filter}
                                                setFilter={setFilter}
                                                handleChangeShowFilter={handleChangeShowFilter}
                                                title="requesterName"
                                                handleSearch={handleSearch}
                                            />
                                        }
                                    </th>
                                }
                                {visibleColumns.description && 
                                    <th className="whitespace-nowrap border border-black px-4 py-2 cursor-pointer" 
                                        onDoubleClick={!filterOpen && !filter.description ? () => toggleColumn('description') : null}
                                        onMouseEnter={!filter.description ? () => handleChangeShowFilter('description', true) : null}
                                        onMouseLeave={!filter.description ? (!filterOpen ? () => {handleChangeShowFilter('description', false); setFilterOpen(false);} : null) : null}
                                    >
                                        <span className={`${showFilter.description ? "-mr-4" : ""}`}>Subject/Description</span>
                                        {showFilter.description && 
                                            <FilterInput
                                                filterOpen={filterOpen}
                                                setFilterOpen={setFilterOpen}
                                                filter={filter}
                                                setFilter={setFilter}
                                                handleChangeShowFilter={handleChangeShowFilter}
                                                title="description"
                                                handleSearch={handleSearch}
                                            />
                                        }
                                    </th>
                                }
                                {visibleColumns.appModule && 
                                    <th className="whitespace-nowrap border border-black px-4 py-2 cursor-pointer" 
                                        onDoubleClick={!filterOpen && filter.appModule && filter.appModule.length === 0 ? () => toggleColumn('appModule') : null}
                                        onMouseEnter={!filter.appModule.length > 0 ? () => handleChangeShowFilter('appModule', true) : null}
                                        onMouseLeave={!filter.appModule.length > 0 ? (!filterOpen ? () => {handleChangeShowFilter('appModule', false); setFilterOpen(false);} : null) : null}
                                    >
                                        <span className={`${showFilter.appModule ? "ml-6 mr-2" : "mx-6"}`}>App Module Name</span>
                                        {showFilter.appModule && 
                                            <FilterOption
                                                filterOpen={filterOpen}
                                                setFilterOpen={setFilterOpen}
                                                filter={filter}
                                                setFilter={setFilter}
                                                handleChangeShowFilter={handleChangeShowFilter}
                                                title="appModule"
                                                optionArray={masterData}
                                                handleSearch={handleSearch}
                                                dataUserSession={userData}
                                            />
                                        }
                                    </th>
                                }
                                {visibleColumns.resolution && 
                                    <th className="whitespace-nowrap border border-black px-4 py-2 cursor-pointer"
                                        onDoubleClick={!filterOpen && !filter.resolution ? () => toggleColumn('resolution') : null}
                                        onMouseEnter={!filter.resolution ? () => handleChangeShowFilter('resolution', true) : null}
                                        onMouseLeave={!filter.resolution ? (!filterOpen ? () => {handleChangeShowFilter('resolution', false); setFilterOpen(false);} : null) : null}
                                    >
                                        <span className={`${showFilter.resolution ? "-mr-4" : ""}`}>Resolution</span>
                                        {showFilter.resolution && 
                                            <FilterInput
                                                filterOpen={filterOpen}
                                                setFilterOpen={setFilterOpen}
                                                filter={filter}
                                                setFilter={setFilter}
                                                handleChangeShowFilter={handleChangeShowFilter}
                                                title="resolution"
                                                handleSearch={handleSearch}
                                            />
                                        }
                                    </th>
                                }
                                {visibleColumns.resolvedDate && 
                                    <th className="whitespace-nowrap border border-black px-4 py-2 cursor-pointer" 
                                        onDoubleClick={!filterOpen ? () => toggleColumn('resolvedDate') : null}
                                        onMouseEnter={() => handleChangeShowFilter('resolvedDate', true)}
                                        onMouseLeave={filter.resolvedDate && (!filter.resolvedDate.start && !filter.resolvedDate.end) ? (!filterOpen ? () => {handleChangeShowFilter('resolvedDate', false); setFilterOpen(false);} : null) : null}
                                    >
                                        <span className={`mx-5 ${showFilter.resolvedDate ? "ml-8 mr-4" : "mx-8"}`}>Resolved Date</span>
                                        {showFilter.resolvedDate && 
                                            <FilterDate
                                                filterOpen={filterOpen}
                                                setFilterOpen={setFilterOpen}
                                                filter={filter}
                                                setFilter={setFilter}
                                                handleChangeShowFilter={handleChangeShowFilter}
                                                title={'resolvedDate'}
                                                handleSearch={handleSearch}
                                            />
                                        }
                                    </th>
                                }
                                {visibleColumns.modeTicket && 
                                    <th className="whitespace-nowrap border border-black px-4 py-2 cursor-pointer" 
                                        onDoubleClick={!filterOpen && filter.modeTicket && filter.modeTicket.length === 0 ? () => toggleColumn('modeTicket') : null}
                                        onMouseEnter={!filter.modeTicket.length > 0 ? () => handleChangeShowFilter('modeTicket', true) : null}
                                        onMouseLeave={!filter.modeTicket.length > 0 ? (!filterOpen ? () => {handleChangeShowFilter('modeTicket', false); setFilterOpen(false);} : null) : null}
                                    >
                                        <span className={`${showFilter.modeTicket ? "ml-6 mr-2" : "mx-6"}`}>Mode Ticket</span>
                                        {showFilter.modeTicket && 
                                            <FilterOption
                                                filterOpen={filterOpen}
                                                setFilterOpen={setFilterOpen}
                                                filter={filter}
                                                setFilter={setFilter}
                                                handleChangeShowFilter={handleChangeShowFilter}
                                                title="modeTicket"
                                                optionArray={['WA Personal', 'WA Group', 'Email', 'Phone']}
                                                handleSearch={handleSearch}
                                            />
                                        }
                                    </th>
                                }
                                {visibleColumns.status && 
                                    <th className="whitespace-nowrap border border-black px-4 py-2 cursor-pointer"
                                        onDoubleClick={!filterOpen && filter.status && filter.status.length === 0 ? () => toggleColumn('status') : null}
                                        onMouseEnter={!filter.status.length > 0 ? () => handleChangeShowFilter('status', true) : null}
                                        onMouseLeave={!filter.status.length > 0 ? (!filterOpen ? () => {handleChangeShowFilter('status', false); setFilterOpen(false);} : null) : null}
                                    >
                                        <span className={`${showFilter.status ? "ml-6 mr-2" : "mx-6"}`}>Status</span>
                                        {showFilter.status && 
                                            <FilterOption
                                                filterOpen={filterOpen}
                                                setFilterOpen={setFilterOpen}
                                                filter={filter}
                                                setFilter={setFilter}
                                                handleChangeShowFilter={handleChangeShowFilter}
                                                title="status"
                                                optionArray={['Open', 'Onhold', 'Close']}
                                                handleSearch={handleSearch}
                                            />
                                        }
                                    </th>
                                }
                            </tr>
                        </thead>
                        <tbody>
                            { !filteredTickets && tickets && tickets.length > 0 && tickets.map((ticket, index) => {
                                return (
                                    <tr key={ticket.ticketId}>
                                        {visibleColumns.ticketId &&
                                            <td className="sticky-col px-4 py-2">{ticket.ticketId}</td>
                                        }
                                        {visibleColumns.client &&
                                            <td className="sticky-col px-4 py-2 cursor-pointer"
                                            >{ticket.client}</td>
                                        }
                                        {visibleColumns.createdDate &&
                                            <td className="sticky-col px-4 py-2 cursor-pointer"
                                            >{ticket.createdDate}</td> 
                                        }
                                        {visibleColumns.requesterName &&
                                            <td className="sticky-col px-4 py-2 cursor-pointer"
                                            >{ticket.requesterName}</td>
                                        }
                                        {visibleColumns.description && 
                                            <td className="border border-black px-4 py-2 cursor-pointer" style={{width: '480px'}}>
                                                <div dangerouslySetInnerHTML={{ __html: formatText(ticket.description) }} />
                                            </td>
                                        }
                                        {visibleColumns.appModule &&
                                            <td className="border border-black px-4 py-2 cursor-pointer"
                                            >{ticket.appModule}</td>
                                        }
                                        {visibleColumns.resolution && 
                                            <td className="border border-black px-4 py-2 cursor-pointer" style={{width: '480px'}}>
                                                <div dangerouslySetInnerHTML={{ __html: formatText(ticket.resolution) }} />
                                            </td>
                                        }
                                        {visibleColumns.resolvedDate &&
                                            <td className="border border-black px-4 py-2 cursor-pointer">{ticket.resolvedDate}</td>
                                        }
                                        {visibleColumns.modeTicket &&
                                            <td className="border border-black px-4 py-2 cursor-pointer">{ticket.modeTicket}</td>
                                        }
                                        {visibleColumns.status &&
                                            <td className="border border-black px-4 py-2 cursor-pointer">{ticket.status}</td>
                                        }
                                    </tr>
                                )
                            })}
                            { filteredTickets && filteredTickets.length > 0 && filteredTickets.map((ticket, index) => {
                                return (
                                    <tr key={ticket.ticketId}>
                                        {visibleColumns.ticketId &&
                                            <td className="sticky-col px-4 py-2">{ticket.ticketId}</td>
                                        }
                                        {visibleColumns.client &&
                                            <td className="sticky-col px-4 py-2 cursor-pointer"
                                            >{ticket.client}</td>
                                        }
                                        {visibleColumns.createdDate &&
                                            <td className="sticky-col px-4 py-2 cursor-pointer"
                                            >{ticket.createdDate}</td> 
                                        }
                                        {visibleColumns.requesterName &&
                                            <td className="sticky-col px-4 py-2 cursor-pointer"
                                            >{ticket.requesterName}</td>
                                        }
                                        {visibleColumns.description && 
                                            <td className="border border-black px-4 py-2 cursor-pointer" style={{width: '480px'}}>
                                                <div dangerouslySetInnerHTML={{ __html: formatText(ticket.description) }} />
                                            </td>
                                        }
                                        {visibleColumns.appModule &&
                                            <td className="border border-black px-4 py-2 cursor-pointer"
                                            >{ticket.appModule}</td>
                                        }
                                        {visibleColumns.resolution && 
                                            <td className="border border-black px-4 py-2 cursor-pointer" style={{width: '480px'}}>
                                                <div dangerouslySetInnerHTML={{ __html: formatText(ticket.resolution) }} />
                                            </td>
                                        }
                                        {visibleColumns.resolvedDate &&
                                            <td className="border border-black px-4 py-2 cursor-pointer">{ticket.resolvedDate}</td>
                                        }
                                        {visibleColumns.modeTicket &&
                                            <td className="border border-black px-4 py-2 cursor-pointer">{ticket.modeTicket}</td>
                                        }
                                        {visibleColumns.status &&
                                            <td className="border border-black px-4 py-2 cursor-pointer">{ticket.status}</td>
                                        }
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}

export default withAuth(Layout);