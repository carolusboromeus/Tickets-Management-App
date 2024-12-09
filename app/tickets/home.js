'use client'

import { useState, useRef, useEffect, useCallback } from 'react';
import withAuth from '@/app/lib/withAuth';
import { deleteData, getData, getMasterData, patchData, postData } from '../lib/api';
import { epxortFiletoExcel, getDateFirstandLast } from '../lib/function';
import debounce from 'lodash/debounce';
import Message from '../ui/components/message';
import { useVisibility } from '../home';
import Modal from '../ui/components/tickets/modalDelete';
import FilterOption from '../ui/components/filter/filterOption';
import FilterInput from '../ui/components/filter/filterInput';
import FilterDate from '../ui/components/filter/filterDate';
import Loader from '../ui/components/loading';
import AccessMessage from '../ui/components/accessDenied';
// import Link from 'next/link';
// import { useRouter, usePathname } from 'next/navigation';

const Layout = () => {
    // const router = useRouter();
    // const pathname = usePathname();
    const { sideBar, showDropdown, userData} = useVisibility();

    if(userData && userData.type === 'Client') {
        return <AccessMessage/>
    }

    const [tickets, setTickets] = useState(null);
    const [masterData, setMasterData] = useState(null);
    const [dataModal, setDataModal] = useState(null);
    const [modalShow, setModalShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [showMessage, setShowMessage] = useState(false);

    const [filterOpen, setFilterOpen] = useState(false);
    const [showFilter, setShowFilter] = useState({
        week: false,
        client: false,
        createdDate: false,
        requesterName: false,
        description: false,
        appModule: false,
        resolution: false,
        resolvedDate: false,
        resolvedBy: false,
        modeTicket: false,
        requestType: false,
        priority: false,
        status: false,
        lastUpdateBy: false
    });
    const [filter, setFilter] = useState({
        week: [],
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
        resolvedBy: null,
        modeTicket: [],
        requestType: [],
        priority: [],
        status: [],
        lastUpdateBy: null
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
        const isAllNull = Object.values(filter).every(value => {
            if (Array.isArray(value)) {
                return value.length === 0;
            } else if (typeof value === 'object' && value !== null) {
                return Object.values(value).every(subValue => subValue === null);
            }
            return value === null;
        });

        if(!isAllNull) {
            handleSearch();
        }
    }, [tickets]);
      

    useEffect(() => {
        const fetchData = async () => {

            try {
                setLoading(true);

                const dateNow = new Date();
                const date = getDateFirstandLast(dateNow);
    
                const filter = {
                    startDate: date.formatFristDate,
                    endDate: date.formatLastDate,
                }
                
                const data = await renderData(filter);
                setTickets(data);
                
                const masterData = await getMasterData();
                setMasterData(masterData);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

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

    //Add Ticket
    const [formData, setFormData] = useState({
        week: null,
        client: null,
        createdDate: null,
        requesterName: null,
        description: null,
        appModule: null,
        resolution: null,
        resolvedDate: null,
        resolvedBy: null,
        modeTicket: null,
        requestType: null,
        priority: null,
        status: null
    });

    const formDataRefs = useRef({
        weekRef: null,
        clientRef: null,
        createDateRef: null,
        requesterNameRef: null,
        subjectRef: null,
        appModuleRef: null,
        resolutionRef: null,
        resolveDateRef: null,
        resolvedByRef: null,
        requestTypeRef: null,
        modeTicketRef: null,
        priorityRef: null,
        statusRef: null
    });

    const handleChange = useCallback(
        debounce((columnName, value) => {
            setFormData((prevState) => ({
                ...prevState,
                [columnName]: value,
            }));
        }, 0),
        []
    );

    const adjustTextareaHeight = (textarea) => {
        if (textarea) {
            textarea.style.height = 'auto';
            const height = textarea.scrollHeight;
            textarea.style.height = `${height}px`;
        }
    };
    
    useEffect(() => {
        if (formDataRefs.current.subjectRef) {
            adjustTextareaHeight(formDataRefs.current.subjectRef);
        }

        if (formDataRefs.current.resolutionRef) {
            adjustTextareaHeight(formDataRefs.current.resolutionRef);
        }
    }, [formData]);

    const handleAddTicket = async () => {

        const allRefsNotNull = () => {
            return Object.values(formDataRefs.current).every(ref => ref !== null);
        };

        const areRequiredFieldsNotNull = () => {
            // Destructure the formData object
            const { resolution, resolvedDate, resolvedBy, ...otherFields } = formData;
            
            // Get the values of the other fields
            const allOtherFields = Object.values(otherFields);
            const allOtherFieldsNullOrEmpty = allOtherFields.some(item => item === null || item === '');
            
            // Return true if all other fields are null or empty
            return allOtherFieldsNullOrEmpty;
        };

        if (loading) {
            return;
        }

        if(allRefsNotNull()){
            if (!areRequiredFieldsNotNull()) {

                try{
                    setLoading(true);

                    let id = 0;
                    if(tickets) {
                        id = tickets.length;
                    }
                    const data = {
                        ticketId: id+1,
                        week: formData.week,
                        client: formData.client,
                        createdDate: formData.createdDate,
                        requesterName: formData.requesterName,
                        description: formData.description,
                        appModule: formData.appModule,
                        resolution: formData.resolution,
                        resolvedDate: formData.resolvedDate,
                        resolvedBy: formData.resolvedBy,
                        modeTicket: formData.modeTicket,
                        requestType: formData.requestType,
                        priority: formData.priority,
                        status: formData.status
                    };
    
                    const message = await postData(data);
                    setMessage(message);
                } finally{
                    setShowMessage(true);

                    const dateNow = new Date();
                    const date = getDateFirstandLast(dateNow);
                    const filter = {
                        startDate: date.formatFristDate,
                        endDate: date.formatLastDate,
                    }
                    
                    const updateView = await renderData(filter);
                    setTickets(updateView);
                }
    
                setFormData({
                    week: null,
                    client: null,
                    createdDate: null,
                    requesterName: null,
                    description: null,
                    appModule: null,
                    resolution: null,
                    resolvedDate: null,
                    resolvedBy: null,
                    modeTicket: null,
                    requestType: null,
                    priority: null,
                    status: null
                })

                const keysToSetToNull = ['createDateRef', 'requesterNameRef', 'subjectRef', 'resolveDateRef', 'resolvedByRef'];
            
                Object.keys(formDataRefs.current).forEach(key => {
                    if (keysToSetToNull.includes(key)) {
                        formDataRefs.current[key].value = null;
                    } else {
                        formDataRefs.current[key].value = '';
                    }
                });

                setLoading(false);
            }
        }
    }

    const [visibleColumns, setVisibleColumns] = useState({
        ticketId: true,
        week: true,
        client: true,
        createdDate:  true,
        requesterName: true,
        description: true,
        appModule: true,
        resolution: true,
        resolvedDate: true,
        resolvedBy: true,
        requestType: true,
        modeTicket: true,
        priority: true,
        status: true,
        lastUpdateBy: true,
        action: true,
    });

    //Edit Ticket
    const [editableColumn, setEditableColumn] = useState(null);
    const [indexColumn, setIndexColumn] = useState(null);
    const formDataEditRefs = useRef({
        weekRef: null,
        clientRef: null,
        createDateRef: null,
        requesterNameRef: null,
        subjectRef: null,
        appModuleRef: null,
        resolutionRef: null,
        resolveDateRef: null,
        resolvedByRef: null,
        requestTypeRef: null,
        modeTicketRef: null,
        priorityRef: null,
        statusRef: null
    })

    useEffect(() => {
        setFormData({
            week: null,
            client: null,
            createdDate: null,
            requesterName: null,
            description: null,
            appModule: null,
            resolution: null,
            resolvedDate: null,
            resolvedBy: null,
            modeTicket: null,
            requestType: null,
            priority: null,
            status: null
        })
    },[editableColumn])

    const toggleShowEditInput = (column, index) => {
        setIndexColumn(index);
        setEditableColumn(prevColumn => prevColumn === column ? null : column);
    };

    const handleClickOutside = async () => {

        const columnRefs = {
            week: formDataEditRefs.current.weekRef,
            client: formDataEditRefs.current.clientRef,
            createdDate: formDataEditRefs.current.createDateRef,
            requesterName: formDataEditRefs.current.requesterNameRef,
            description: formDataEditRefs.current.subjectRef,
            appModule: formDataEditRefs.current.appModuleRef,
            resolution: formDataEditRefs.current.resolutionRef,
            resolvedDate: formDataEditRefs.current.resolveDateRef,
            resolvedBy: formDataEditRefs.current.resolvedByRef,
            modeTicket: formDataEditRefs.current.modeTicketRef,
            requestType: formDataEditRefs.current.requestTypeRef,
            priority: formDataEditRefs.current.priorityRef,
            status: formDataEditRefs.current.statusRef
        };

        const resetFormData = () => {
            setFormData({
                week: null,
                client: null,
                createdDate: null,
                requesterName: null,
                description: null,
                appModule: null,
                resolution: null,
                resolvedDate: null,
                resolvedBy: null,
                modeTicket: null,
                requestType: null,
                priority: null,
                status: null
            });
        };

        if(editableColumn !== 'client' && editableColumn !== 'appModule'){
            if (columnRefs[editableColumn] && !columnRefs[editableColumn].contains(event.target)) {
    
                if(formData[editableColumn]){
                    // console.log(columnRefs[editableColumn].current.value);
                    // console.log(columnRefs[editableColumn].current.getAttribute("target"))
      
                    try {
                        const updateData = {
                            ticketId: columnRefs[editableColumn].getAttribute("target"),
                            [editableColumn]: formData[editableColumn],
                        };
            
                        const message = await patchData(updateData);
                        setMessage(message);
                    } finally {
                        setShowMessage(true);
    
                        const dateNow = new Date();
                        const date = getDateFirstandLast(dateNow);
                        const filter = {
                            startDate: date.formatFristDate,
                            endDate: date.formatLastDate,
                        }

                        const updateView = await renderData(filter);
                        setTickets(updateView);
                    }
                }
    
                resetFormData();
                setEditableColumn(null);
                setIndexColumn(null);
            }
        } else {
            if(columnRefs.client && !columnRefs.client.contains(event.target) && columnRefs.appModule && !columnRefs.appModule.contains(event.target))
            {
                if(formData.client || formData.appModule){
                    if(columnRefs.client.value !== '' && columnRefs.appModule.value !== '' && formData.client !== '' && formData.appModule !== ''){
                        try {
                            const updateData = {
                                ticketId: columnRefs[editableColumn].getAttribute("target"),
                                client: formData.client ? formData.client : columnRefs.client.value,
                                appModule: formData.appModule ? formData.appModule : columnRefs.appModule.value,
                            };
                
                            const message = await patchData(updateData);
                            setMessage(message);
                        } finally {
                            setShowMessage(true);
        
                            const dateNow = new Date();
                            const date = getDateFirstandLast(dateNow);
                            const filter = {
                                startDate: date.formatFristDate,
                                endDate: date.formatLastDate,
                            }
                            
                            const updateView = await renderData(filter);
                            setTickets(updateView);
                        }
                    }
                }
                resetFormData();
                setEditableColumn(null);
                setIndexColumn(null);
            }
        }
    };

    useEffect(() => {
        // Add event listener for clicks outside
        document.addEventListener('mousedown', handleClickOutside);

        handleSearch();
        if(filteredTickets && filteredTickets.length === 0){
            handleClearSearch();
        }

        return () => {
            // Cleanup event listener on unmount
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [editableColumn, formData]);

    const adjustAndFocus = (ref, adjustHeight = false) => {
        if (ref) {
            if (adjustHeight) {
                adjustTextareaHeight(ref);
            }
            ref.focus();
        }
    };

    useEffect(() => {
        if(editableColumn){
            // Adjust and focus for specific refs
            adjustAndFocus(formDataEditRefs.current.subjectRef, true);
            adjustAndFocus(formDataEditRefs.current.resolutionRef, true);
    
            // Focus for other refs
            Object.entries(formDataEditRefs.current).forEach(([key, ref]) => {
                if (key !== 'createDateRef' && key !== 'resolveDateRef') {
                    adjustAndFocus(ref);
                }
            });
        }
    }, [editableColumn]);

    //Ticket Delete
    const handleSetDataModal = async (data) => {
        setDataModal(data);
        setModalShow(true);
    }
    
    const handleDeleteTicket = async (data) => {
        const dataDelete = {
            ticketId: data._id,
            client: data.client,
        }
        
        try{
            const message = await deleteData(dataDelete);
            setMessage(message);
        } finally {
            setShowMessage(true);
            const dateNow = new Date();
            const date = getDateFirstandLast(dateNow);
            const filter = {
                startDate: date.formatFristDate,
                endDate: date.formatLastDate,
            }
            
            const updateView = await renderData(filter);
            setTickets(updateView);
            setModalShow(false);
        }
    }

    //Filter / Search Ticket
    const [filteredTickets, setFilteredTickets] = useState(null);
    const searchQueryRef = useRef(null);

    // useEffect(() => {
    //     console.log(filter);
    //     // handleSearch()
    // }, [filter])

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

            if(Object.keys(filterDate).length > 0){
                const updateView = await renderData(filterDate);
                filtering = updateView;
            }
        }
    
        if (filter) {
            const filterConditions = [
                { key: 'week', condition: ticket => filter.week.includes(ticket.week.toString()) },
                { key: 'client', condition: ticket => String(ticket.client).toLowerCase().includes(filter.client.toLowerCase()) },
                { key: 'requesterName', condition: ticket => String(ticket.requesterName).toLowerCase().includes(filter.requesterName.toLowerCase()) },
                { key: 'appModule', condition: ticket => filter.appModule.includes(ticket.appModule) },
                { key: 'description', condition: ticket => String(ticket.description).toLowerCase().includes(filter.description.toLowerCase()) },
                { key: 'resolution', condition: ticket => String(ticket.resolution).toLowerCase().includes(filter.resolution.toLowerCase()) },
                { key: 'resolvedBy', condition: ticket => String(ticket.resolvedBy).toLowerCase().includes(filter.resolvedBy.toLowerCase()) },
                { key: 'requestType', condition: ticket => filter.requestType.includes(ticket.requestType) },
                { key: 'modeTicket', condition: ticket => filter.modeTicket.includes(ticket.modeTicket) },
                { key: 'priority', condition: ticket => filter.priority.includes(ticket.priority) },
                { key: 'status', condition: ticket => filter.status.includes(ticket.status) },
                { key: 'lastUpdateBy', condition: ticket => String(ticket.lastUpdateBy ? ticket.lastUpdateBy.name.fullName : '').toLowerCase().includes(filter.lastUpdateBy.toLowerCase()) },
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
        // Helper function to flatten an object and make it searchable
        const flattenObject = (obj) => {
            let result = [];
            
            // Iterate through each key in the object
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const value = obj[key];
                    
                    // If the value is an object, recurse to flatten it
                    if (typeof value === 'object' && value !== null) {
                        result = result.concat(flattenObject(value));  // Recursively flatten nested objects
                    } else {
                        // Otherwise, just add the stringified value
                        result.push(String(value).toLowerCase());
                    }
                }
            }
    
            return result;
        };
    
        if (filtering) {
            const results = filtering.filter(ticket => 
                flattenObject(ticket).some(value => 
                    value.includes(search.toLowerCase())
                )
            );
            
            return results;
        }
    };
    

    const handleClearSearch = () => {
        if(searchQueryRef && searchQueryRef.current !== null){
            searchQueryRef.current.value = '';
            setFilter({
                week: [],
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
                resolvedBy: null,
                modeTicket: [],
                requestType: [],
                priority: [],
                status: [],
                lastUpdateBy: null
            })
            setShowFilter({
                week: false,
                client: false,
                createdDate: false,
                requesterName: false,
                description: false,
                appModule: false,
                resolution: false,
                resolvedDate: false,
                resolvedBy: false,
                modeTicket: false,
                requestType: false,
                priority: false,
                status: false,
                lastUpdateBy: false,
            })
            setFilteredTickets(null);
        }
    }

    const handleExport = () => {
        const table = document.getElementById('tableTicket');
        const colWidth = [
            { wpx: 0 },
            { wpx: 0 },
            { wpx: 0 },
            { wpx: 110 },
            { wpx: 180 },
            { wpx: 350 },
            { wpx: 200 },
            { wpx: 350 },
            { wpx: 110 },
            { wpx: 110 },
            { wpx: 110 },
            { wpx: 110 },
            { wpx: 0 },
            { wpx: 0 }
        ];

        // const selectedRows = [1, 3, 5];


        epxortFiletoExcel(table, 'TicketList', colWidth);
    };

    return (
        <>
            <div className="grid">
                <h1 className="text-xl font-semibold mb-4">Ticket List</h1>
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
                {showMessage && 
                    <Message message={message} setMessage={setMessage} setShowMessage={setShowMessage}/>
                }
                {loading && 
                    <Loader/>
                }
                <div className={`overflow-auto ${sideBar ? 'h-[calc(100vh-16rem)]' : (showDropdown ? "h-[calc(100vh-29rem)]" : "h-[calc(100vh-25rem)]")} sm:h-[calc(100vh-8rem)]`}>
                    <table id="tableTicket" className="w-max border-separate border-spacing-0">
                        <thead className="bg-gray-100 sticky top-0 z-10">
                            <tr>
                                {visibleColumns.ticketId && 
                                    <th className="whitespace-nowrap px-4 py-2 cursor-pointer" 
                                        onDoubleClick={() => toggleColumn('ticketId')}>
                                        <span>No Ticket</span>
                                    </th>
                                }
                                {visibleColumns.week &&
                                    <th className="whitespace-nowrap px-4 py-2 cursor-pointer"
                                        onDoubleClick={!filterOpen && filter.week && filter.week.length === 0 ? () => toggleColumn('week') : null}
                                        onMouseEnter={!filter.week.length > 0 ? () => handleChangeShowFilter('week', true) : null}
                                        onMouseLeave={!filter.week.length > 0 ? (!filterOpen ? () => {handleChangeShowFilter('week', false); setFilterOpen(false);} : null) : null}>
                                        <span className={`${showFilter.week ? "-mr-4" : ""}`}>Week</span>
                                        {showFilter.week && 
                                            <FilterOption
                                                filterOpen={filterOpen}
                                                setFilterOpen={setFilterOpen}
                                                filter={filter}
                                                setFilter={setFilter}
                                                handleChangeShowFilter={handleChangeShowFilter}
                                                title="week"
                                                optionArray={[1, 2, 3, 4, 5]}
                                                handleSearch={handleSearch}
                                            />
                                        }
                                    </th>
                                }
                                {visibleColumns.client &&
                                    <th className="whitespace-nowrap px-4 py-2 cursor-pointer"
                                        onDoubleClick={!filterOpen && !filter.client ? () => toggleColumn('client') : null}
                                        onMouseEnter={!filter.client ? () => handleChangeShowFilter('client', true) : null}
                                        onMouseLeave={!filter.client ? (!filterOpen ? () => {handleChangeShowFilter('client', false); setFilterOpen(false);} : null) : null}>
                                        <span className={`${showFilter.client ? "-mr-4" : ""}`}>Client</span>
                                        {showFilter.client && 
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
                                        <span className={`mx-5 ${showFilter.createdDate ? "mr-3" : ""}`}>Created Date</span>
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
                                        <span className={`${showFilter.requesterName ? "-mr-4" : ""}`}>Requester Name</span>
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
                                        <span className={`mx-5 ${showFilter.appModule ? "mr-3" : ""}`}>App Module Name</span>
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
                                        <span className={`mx-5 ${showFilter.resolvedDate ? "mr-3" : ""}`}>Resolved Date</span>
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
                                {visibleColumns.resolvedBy && 
                                    <th className="whitespace-nowrap border border-black px-4 py-2 cursor-pointer" 
                                        onDoubleClick={!filterOpen && !filter.resolvedBy ? () => toggleColumn('resolvedBy') : null}
                                        onMouseEnter={!filter.resolvedBy ? () => handleChangeShowFilter('resolvedBy', true) : null}
                                        onMouseLeave={!filter.resolvedBy ? (!filterOpen ? () => {handleChangeShowFilter('resolvedBy', false); setFilterOpen(false);} : null) : null}
                                    >
                                        <span className={`${showFilter.resolvedBy ? "-mr-4" : ""}`}>Resolved By</span>
                                        {showFilter.resolvedBy && 
                                            <FilterInput
                                                filterOpen={filterOpen}
                                                setFilterOpen={setFilterOpen}
                                                filter={filter}
                                                setFilter={setFilter}
                                                handleChangeShowFilter={handleChangeShowFilter}
                                                title="resolvedBy"
                                                handleSearch={handleSearch}
                                            />
                                        }
                                    </th>
                                }
                                {visibleColumns.requestType && 
                                    <th className="whitespace-nowrap border border-black px-4 py-2 cursor-pointer"
                                        onDoubleClick={!filterOpen && filter.requestType && filter.requestType.length === 0 ? () => toggleColumn('requestType') : null}
                                        onMouseEnter={!filter.requestType.length > 0 ? () => handleChangeShowFilter('requestType', true) : null}
                                        onMouseLeave={!filter.requestType.length > 0 ? (!filterOpen ? () => {handleChangeShowFilter('requestType', false); setFilterOpen(false);} : null) : null}
                                    >
                                        <span className={`${showFilter.requestType ? "-mr-4" : ""}`}>Request Type</span>
                                        {showFilter.requestType && 
                                            <FilterOption
                                                filterOpen={filterOpen}
                                                setFilterOpen={setFilterOpen}
                                                filter={filter}
                                                setFilter={setFilter}
                                                handleChangeShowFilter={handleChangeShowFilter}
                                                title="requestType"
                                                optionArray={['Service Request', 'Cancel Request', 'Trouble Ticket']}
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
                                        <span className={`${showFilter.modeTicket ? "-mr-4" : ""}`}>Mode Ticket</span>
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
                                {visibleColumns.priority && 
                                    <th className="whitespace-nowrap border border-black px-4 py-2 cursor-pointer"
                                        onDoubleClick={!filterOpen && filter.priority && filter.priority.length === 0 ? () => toggleColumn('priority') : null}
                                        onMouseEnter={!filter.priority.length > 0 ? () => handleChangeShowFilter('priority', true) : null}
                                        onMouseLeave={!filter.priority.length > 0 ? (!filterOpen ? () => {handleChangeShowFilter('priority', false); setFilterOpen(false);} : null) : null}
                                    >
                                        <span className={`${showFilter.priority ? "-mr-4" : ""}`}>Priority</span>
                                        {showFilter.priority && 
                                            <FilterOption
                                                filterOpen={filterOpen}
                                                setFilterOpen={setFilterOpen}
                                                filter={filter}
                                                setFilter={setFilter}
                                                handleChangeShowFilter={handleChangeShowFilter}
                                                title="priority"
                                                optionArray={['Low', 'Medium', 'High']}
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
                                        <span className={`${showFilter.status ? "-mr-4" : ""}`}>Status</span>
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
                                {visibleColumns.lastUpdateBy && 
                                    <th className="whitespace-nowrap border border-black px-4 py-2 removable" 
                                        onDoubleClick={!filterOpen && !filter.lastUpdateBy ? () => toggleColumn('lastUpdateBy') : null}
                                        onMouseEnter={!filter.lastUpdateBy ? () => handleChangeShowFilter('lastUpdateBy', true) : null}
                                        onMouseLeave={!filter.lastUpdateBy ? (!filterOpen ? () => {handleChangeShowFilter('lastUpdateBy', false); setFilterOpen(false);} : null) : null}
                                    >
                                        <span className={`${showFilter.lastUpdateBy ? "ml-10 mr-6" : "mx-10"}`}>Last Update By</span>
                                        {showFilter.lastUpdateBy && 
                                            <FilterInput
                                                filterOpen={filterOpen}
                                                setFilterOpen={setFilterOpen}
                                                filter={filter}
                                                setFilter={setFilter}
                                                handleChangeShowFilter={handleChangeShowFilter}
                                                title="lastUpdateBy"
                                                handleSearch={handleSearch}
                                            />
                                        }
                                    </th>
                                }
                                {visibleColumns.action && 
                                    <th className="whitespace-nowrap border border-black px-4 py-2 cursor-pointer removable" 
                                        onDoubleClick={() => toggleColumn('action')}>Action</th>
                                }
                            </tr>
                        </thead>
                        <tbody>
                            <tr className='removable'>
                                {visibleColumns.ticketId &&
                                    <td className="px-4 py-2"></td>
                                }
                                {visibleColumns.week &&
                                    <td className={`px-4 py-2`}>
                                        <select className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                            ref={el => formDataRefs.current.weekRef = el}
                                            onChange={(event) => {handleChange('week', event.target.value)}}
                                            defaultValue={""}
                                        >
                                            <option value={""} disabled>Select week</option>
                                            <option value={"1"}>Week 1</option>
                                            <option value={"2"}>Week 2</option>
                                            <option value={"3"}>Week 3</option>
                                            <option value={"4"}>Week 4</option>
                                            <option value={"5"}>Week 5</option>
                                        </select>
                                    </td>
                                }
                                {visibleColumns.client &&
                                    <td className="px-4 py-2">
                                        <select className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                            ref={el => formDataRefs.current.clientRef = el}
                                            onChange={(event) => {
                                                handleChange('client', event.target.value);
                                                if(formDataRefs.current.appModuleRef !== null){
                                                    formData.appModule = null;
                                                    formDataRefs.current.appModuleRef.value = "";
                                                }
                                            }}
                                            defaultValue={""}
                                        >
                                            <option value={""} disabled>Select client</option>
                                            {masterData && masterData.length > 0  && masterData.map((data) => {
                                                return (
                                                    <option key={data._id} value={data.client}>{data.client}</option>
                                                )
                                            })}
                                        </select>
                                    </td>
                                }
                                {visibleColumns.createdDate &&
                                    <td className="px-4 py-2">
                                        <input name="createDate" type="date" placeholder="Name"
                                            className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                            ref={el => formDataRefs.current.createDateRef = el}
                                            onChange={(event) => {handleChange('createdDate',event.target.value)}}
                                        />
                                    </td>
                                }
                                {visibleColumns.requesterName &&
                                    <td className="px-4 py-2">
                                        <input name="name" type="text" placeholder="Name"
                                            className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                            ref={el => formDataRefs.current.requesterNameRef = el}
                                            onChange={(event) => {handleChange('requesterName',event.target.value)}}
                                        />
                                    </td>
                                }
                                {visibleColumns.description && 
                                    <td className="border border-black px-4 py-2">
                                        <textarea className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6
                                                overflow-hidden"
                                            placeholder="Text" rows="1" cols="30"
                                            ref={el => formDataRefs.current.subjectRef = el}
                                            onChange={(event) => {handleChange('description',event.target.value)}}
                                        ></textarea>
                                    </td>
                                }
                                {visibleColumns.appModule && 
                                    <td className="border border-black px-4 py-2">
                                        {formDataRefs.current.clientRef && formDataRefs.current.clientRef.value !== '' &&
                                            <select className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                                ref={el => formDataRefs.current.appModuleRef = el}
                                                onChange={(event) => {handleChange('appModule',event.target.value)}}
                                                defaultValue={""}
                                            >
                                                <option value={""} disabled>Select app module</option>
                                                {masterData && masterData.length > 0 && masterData.filter(data => data.client == formData.client)
                                                    .flatMap(data => data.appModule.map(appModule => ( // Flatten the array of arrays
                                                        <option key={appModule.name} value={appModule.name}>{appModule.name}</option> // Return option element
                                                    )))
                                                }
                                            </select>
                                        }
                                    </td>
                                }
                                {visibleColumns.resolution && 
                                    <td className="border border-black px-4 py-2">
                                        <textarea className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6
                                                overflow-hidden"
                                            placeholder="Text" rows="1" cols="30"
                                            ref={el => formDataRefs.current.resolutionRef = el}
                                            onChange={(event) => {handleChange('resolution',event.target.value)}}
                                        ></textarea>
                                    </td>
                                }
                                {visibleColumns.resolvedDate && 
                                    <td className="border border-black px-4 py-2">
                                        <input className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6" 
                                            type="date" name="resolveDate"
                                            ref={el => formDataRefs.current.resolveDateRef = el}
                                            onChange={(event) => {handleChange('resolvedDate',event.target.value)}}
                                        />
                                    </td>
                                }
                                {visibleColumns.resolvedBy && 
                                    <td className="border border-black px-4 py-2">
                                        <input className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6" 
                                            type="text" placeholder="Name"
                                            ref={el => formDataRefs.current.resolvedByRef = el}
                                            onChange={(event) => {handleChange('resolvedBy',event.target.value)}}
                                        >
                                        </input>
                                    </td>
                                }
                                {visibleColumns.requestType && 
                                    <td className="border border-black px-4 py-2">
                                        <select className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                            ref={el => formDataRefs.current.requestTypeRef = el}
                                            onChange={(event) => {handleChange('requestType',event.target.value)}}
                                            defaultValue={""}
                                        >
                                            <option value={""} disabled>Select request type</option>
                                            <option value="Service Request">Service Request</option>
                                            <option value="Cancel Request">Cancel Request</option>
                                            <option value="Trouble Ticket">Trouble Ticket</option>
                                        </select>
                                    </td>
                                }
                                {visibleColumns.modeTicket && 
                                    <td className="border border-black px-4 py-2">
                                        <select className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                            ref={el => formDataRefs.current.modeTicketRef = el}
                                            onChange={(event) => {handleChange('modeTicket',event.target.value)}}
                                            defaultValue={""}
                                        >
                                            <option value={""} disabled>Select mode ticket</option>
                                            <option value="WA Personal">WA Personal</option>
                                            <option value="WA Group">WA Group</option>
                                            <option value="Email">Email</option>
                                            <option value="Phone">Phone</option>
                                        </select>
                                    </td>
                                }
                                {visibleColumns.priority && 
                                    <td className="border border-black px-4 py-2">
                                        <select className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                            ref={el => formDataRefs.current.priorityRef = el}
                                            onChange={(event) => {handleChange('priority',event.target.value)}}
                                            defaultValue={""}
                                        >
                                            <option value={""} disabled>Select priority</option>
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </td>
                                }
                                {visibleColumns.status && 
                                    <td className="border border-black px-4 py-2">
                                        <select className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                            ref={el => formDataRefs.current.statusRef = el}
                                            onChange={(event) => {handleChange('status',event.target.value)}}
                                            defaultValue={""} 
                                        >
                                            <option value={""} disabled>Select status</option>
                                            <option value="Open">Open</option>
                                            <option value="Onhold">Onhold</option>
                                            <option value="Close">Close</option>
                                        </select>
                                    </td>
                                }
                                {visibleColumns.lastUpdateBy && 
                                    <td className="border border-black px-4 py-2 text-center"></td>
                                }
                                {visibleColumns.action && 
                                    <td className="border border-black px-4 py-2 text-center">
                                        {!loading && 
                                            <button className="bg-blue-600 rounded-md px-2 py-1 text-white hover:bg-gray-500 focus:outline focus:outline-1 focus:outline-black"
                                                onClick={handleAddTicket}
                                                disabled={loading}
                                            >
                                                <i className='fi fi-rr-plus-small leading-none align-middle'></i> Add
                                            </button>
                                        }
                                    </td>
                                }
                            </tr>
                            { filteredTickets  ? filteredTickets.map((ticket, index) => {
                                return (
                                    <tr key={ticket.ticketId}>
                                        {visibleColumns.ticketId &&
                                            <td className="px-4 py-2">{ticket.ticketId}</td>
                                        }
                                        {visibleColumns.week &&
                                            (editableColumn === 'week' && indexColumn == index ?
                                                <td className="px-4 py-2">
                                                    <select className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                                        ref={el => formDataEditRefs.current.weekRef = el}
                                                        onChange={(event) => { handleChange('week', event.target.value) }}
                                                        defaultValue={ticket.week}
                                                        target={ticket.ticketId}
                                                    >
                                                        <option value="" disabled>Select week</option>
                                                        <option value="1">Week 1</option>
                                                        <option value="2">Week 2</option>
                                                        <option value="3">Week 3</option>
                                                        <option value="4">Week 4</option>
                                                        <option value="5">Week 5</option>
                                                    </select>
                                                </td>
                                                :
                                                <td className={`px-4 py-2 cursor-pointer`}
                                                    onDoubleClick={() => toggleShowEditInput('week', index)}
                                                >
                                                    {ticket.week}
                                                </td>
                                            )
                                        }
                                        {visibleColumns.client &&
                                            ((editableColumn === 'client' || editableColumn === 'appModule') && indexColumn == index ? 
                                                <td className="px-4 py-2">
                                                    <select className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                                        ref={el => formDataEditRefs.current.clientRef = el}
                                                        target={ticket.ticketId}
                                                        onChange={(event) => {
                                                            handleChange('client', event.target.value);
                                                            if(formDataEditRefs.current.appModuleRef !== null){
                                                                handleChange('appModule', event.target.value)
                                                                formDataEditRefs.current.appModuleRef.value = "";
                                                            }
                                                        }}
                                                        defaultValue={ticket.client}
                                                    >
                                                        <option value={""} disabled>Select client</option>
                                                        {masterData && masterData.length > 0  && masterData.map((data) => {
                                                            return (
                                                                <option key={data._id} value={data.client}>{data.client}</option>
                                                            )
                                                        })}
                                                    </select>
                                                </td>
                                                :
                                                <td className="px-4 py-2 cursor-pointer"
                                                    onDoubleClick={() => {toggleShowEditInput('client', index)}}
                                                >{ticket.client}</td>
                                            )
                                        }
                                        {visibleColumns.createdDate &&
                                            (editableColumn === 'createdDate' && indexColumn == index ?
                                                <td className="px-4 py-2">
                                                    <input name="createDate" type="date" placeholder="Name"
                                                        className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                                        ref={el => formDataEditRefs.current.createDateRef = el}
                                                        target={ticket.ticketId}
                                                        defaultValue={ticket.createdDate}
                                                        onChange={(event) => {handleChange('createdDate', event.target.value)}}
                                                    />
                                                </td>
                                                :
                                                <td className="px-4 py-2 cursor-pointer"
                                                    onDoubleClick={() => {toggleShowEditInput('createdDate', index)}}
                                                >{ticket.createdDate}</td>
                                            ) 
                                        }
                                        {visibleColumns.requesterName &&
                                            (editableColumn === 'requesterName' && indexColumn === index ?
                                                <td className="px-4 py-2">
                                                    <input name="name" type="text" placeholder="Name"
                                                        className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                                        ref={el => formDataEditRefs.current.requesterNameRef = el}
                                                        target={ticket.ticketId}
                                                        defaultValue={ticket.requesterName}
                                                        onChange={(event) => {handleChange('requesterName', event.target.value)}}
                                                    />
                                                </td>
                                                :
                                                <td className="px-4 py-2 cursor-pointer"
                                                    onDoubleClick={() => {toggleShowEditInput('requesterName', index)}}
                                                >{ticket.requesterName}</td>
                                            )
                                        }
                                        {visibleColumns.description && 
                                            (editableColumn === 'description' && indexColumn === index ?
                                                <td className="border border-black px-4 py-2">
                                                    <textarea className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                                        placeholder="Text" cols="30"
                                                        ref={el => formDataEditRefs.current.subjectRef = el}
                                                        target={ticket.ticketId}
                                                        defaultValue={ticket.description}
                                                        onChange={(event) => {
                                                            handleChange('description', event.target.value);
                                                            adjustTextareaHeight(event.target);
                                                        }}
                                                    ></textarea>
                                                </td>
                                                :
                                                <td className="border border-black px-4 py-2 w-96 cursor-pointer"
                                                    onDoubleClick={() => {toggleShowEditInput('description', index)}}>
                                                    <div dangerouslySetInnerHTML={{ __html: formatText(ticket.description) }} />
                                                </td>
                                            )
                                        }
                                        {visibleColumns.appModule &&
                                            ((editableColumn === 'appModule' || editableColumn === 'client') && indexColumn === index ?
                                                <td className="border border-black px-4 py-2">
                                                    {ticket.client &&
                                                        <select className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                                            ref={el => formDataEditRefs.current.appModuleRef = el}
                                                            onChange={(event) => {handleChange('appModule', event.target.value)}}
                                                            defaultValue={ticket.appModule}
                                                            target={ticket.ticketId}
                                                        >
                                                            <option value={""} disabled>Select app module</option>
                                                            {masterData && masterData.length > 0 && masterData.filter(data => data.client === (formDataEditRefs.current.clientRef ? formDataEditRefs.current.clientRef.value : ticket.client))
                                                                .flatMap(data => data.appModule.map(appModule => (
                                                                    <option key={appModule.name} value={appModule.name}>{appModule.name}</option>
                                                                )))
                                                            }
                                                        </select>
                                                    }
                                                </td>
                                                :
                                                <td className="border border-black px-4 py-2 cursor-pointer"
                                                    onDoubleClick={() => {toggleShowEditInput('appModule',index, ticket.client)}}
                                                >{ticket.appModule}</td>
                                            ) 
                                        }
                                        {visibleColumns.resolution && 
                                            (editableColumn === 'resolution' && indexColumn === index ?
                                                <td className="border border-black px-4 py-2">
                                                    <textarea className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                                        placeholder="Text" rows="1" cols="30"
                                                        ref={el => formDataEditRefs.current.resolutionRef = el}
                                                        target={ticket.ticketId}
                                                        onChange={(event) => {
                                                            handleChange('resolution', event.target.value); 
                                                            adjustTextareaHeight(event.target);
                                                        }}
                                                        defaultValue={ticket.resolution}
                                                    ></textarea>
                                                </td>
                                                :
                                                <td className="border border-black px-4 py-2 w-96 cursor-pointer"
                                                    onDoubleClick={() => {toggleShowEditInput('resolution', index)}}>
                                                    <div dangerouslySetInnerHTML={{ __html: formatText(ticket.resolution) }} />
                                                </td>
                                            )
                                        }
                                        {visibleColumns.resolvedDate &&
                                            (editableColumn === 'resolvedDate' && indexColumn === index ?
                                                <td className="border border-black px-4 py-2">
                                                    <input className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6" 
                                                        type="date" name="resolveDate"
                                                        ref={el => formDataEditRefs.current.resolveDateRef = el}
                                                        onChange={(event) => {handleChange('resolvedDate', event.target.value)}}
                                                        defaultValue={ticket.resolvedDate}
                                                        target={ticket.ticketId}
                                                    />
                                                </td>
                                                :
                                                <td className="border border-black px-4 py-2 cursor-pointer"
                                                    onDoubleClick={() => {toggleShowEditInput('resolvedDate',index)}}>{ticket.resolvedDate}</td>
                                            )
                                        }
                                        {visibleColumns.resolvedBy &&
                                            (editableColumn === 'resolvedBy' && indexColumn === index ?
                                                <td className="border border-black px-4 py-2">
                                                    <input className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6" 
                                                        type="text" placeholder="Name"
                                                        ref={el => formDataEditRefs.current.resolvedByRef = el}
                                                        onChange={(event) => {handleChange('resolvedBy', event.target.value)}}
                                                        defaultValue={ticket.resolvedBy}
                                                        target={ticket.ticketId}
                                                    >
                                                    </input>
                                                </td>
                                                :
                                                <td className="border border-black px-4 py-2 cursor-pointer"
                                                    onDoubleClick={() => {toggleShowEditInput('resolvedBy',index)}}>{ticket.resolvedBy}</td>
                                            )
                                        }
                                        {visibleColumns.requestType && 
                                            (editableColumn === 'requestType' && indexColumn === index ?
                                                <td className="border border-black px-4 py-2">
                                                    <select className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                                        ref={el => formDataEditRefs.current.requestTypeRef = el}
                                                        onChange={(event) => {handleChange('requestType', event.target.value)}}
                                                        defaultValue={ticket.requestType}
                                                        target={ticket.ticketId}
                                                    >
                                                        <option value={""} disabled>Select request type</option>
                                                        <option value="Service Request">Service Request</option>
                                                        <option value="Trouble Ticket">Trouble Ticket</option>
                                                    </select>
                                                </td>
                                                :
                                                <td className="border border-black px-4 py-2 cursor-pointer"
                                                    onDoubleClick={() => {toggleShowEditInput('requestType',index)}}>{ticket.requestType}</td>
                                            )
                                        }
                                        {visibleColumns.modeTicket &&
                                            (editableColumn === 'modeTicket' && indexColumn === index ?
                                                <td className="border border-black px-4 py-2">
                                                    <select className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                                        ref={el => formDataEditRefs.current.modeTicketRef = el}
                                                        onChange={(event) => {handleChange('modeTicket', event.target.value)}}
                                                        defaultValue={ticket.modeTicket}
                                                        target={ticket.ticketId}
                                                    >
                                                        <option value={""} disabled>Select mode ticket</option>
                                                        <option value="WA Personal">WA Personal</option>
                                                        <option value="WA Group">WA Group</option>
                                                        <option value="Email">Email</option>
                                                        <option value="Phone">Phone</option>
                                                    </select>
                                                </td>
                                                :
                                                <td className="border border-black px-4 py-2 cursor-pointer"
                                                    onDoubleClick={() => {toggleShowEditInput('modeTicket',index)}}>{ticket.modeTicket}</td>
                                            )
                                        }
                                        {visibleColumns.priority && 
                                            (editableColumn === 'priority' && indexColumn === index ?
                                                <td className="border border-black px-4 py-2">
                                                    <select className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                                        ref={el => formDataEditRefs.current.priorityRef = el}
                                                        onChange={(event) => {handleChange('priority', event.target.value)}}
                                                        defaultValue={ticket.priority}
                                                        target={ticket.ticketId}
                                                    >
                                                        <option value={""} disabled>Select priority</option>
                                                        <option value="Low">Low</option>
                                                        <option value="Medium">Medium</option>
                                                        <option value="High">High</option>
                                                    </select>
                                                </td>
                                                :
                                                <td className="border border-black px-4 py-2 cursor-pointer"
                                                    onDoubleClick={() => {toggleShowEditInput('priority',index)}}>{ticket.priority}</td>
                                            )
                                        }
                                        {visibleColumns.status &&
                                            (editableColumn === 'status' && indexColumn === index ?
                                                <td className="border border-black px-4 py-2">
                                                    <select className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                                        ref={el => formDataEditRefs.current.statusRef = el}
                                                        onChange={(event) => {handleChange('status', event.target.value)}}
                                                        defaultValue={ticket.status}
                                                        target={ticket.ticketId} 
                                                    >
                                                        <option value={""} disabled>Select status</option>
                                                        <option value="Open">Open</option>
                                                        <option value="Onhold">Onhold</option>
                                                        <option value="Close">Close</option>
                                                    </select>
                                                </td>
                                                :
                                                <td className="border border-black px-4 py-2 cursor-pointer"
                                                    onDoubleClick={() => {toggleShowEditInput('status', index)}}>{ticket.status}</td>
                                            )
                                        }
                                        {visibleColumns.lastUpdateBy &&
                                            <td className="border border-black px-4 py-2 removable">{ticket.lastUpdateBy ? ticket.lastUpdateBy.name.fullName : ''}</td>
                                        }
                                        {visibleColumns.action &&
                                            <td className="border border-black px-4 py-2 removable">
                                                <button className="bg-red-600 rounded-md px-2 py-1 text-white hover:bg-gray-500 focus:outline focus:outline-1 focus:outline-black"
                                                    onClick={() => handleSetDataModal(ticket)}
                                                >
                                                    <i className='fi fi-rr-trash leading-none align-middle'></i> Delete
                                                </button>
                                            </td>
                                        }
                                    </tr>
                                )
                            })
                            
                            :

                            tickets && tickets.length > 0 && tickets.map((ticket, index) => {
                                return (
                                    <tr key={ticket.ticketId}>
                                        {visibleColumns.ticketId &&
                                            <td className="px-4 py-2">{ticket.ticketId}</td>
                                        }
                                        {visibleColumns.week &&
                                            (editableColumn === 'week' && indexColumn == index ?
                                                <td className="px-4 py-2">
                                                    <select className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                                        ref={el => formDataEditRefs.current.weekRef = el}
                                                        onChange={(event) => { handleChange('week', event.target.value) }}
                                                        defaultValue={ticket.week}
                                                        target={ticket.ticketId}
                                                    >
                                                        <option value="" disabled>Select week</option>
                                                        <option value="1">Week 1</option>
                                                        <option value="2">Week 2</option>
                                                        <option value="3">Week 3</option>
                                                        <option value="4">Week 4</option>
                                                        <option value="5">Week 5</option>
                                                    </select>
                                                </td>
                                                :
                                                <td className={`px-4 py-2 cursor-pointer`}
                                                    onDoubleClick={() => toggleShowEditInput('week', index)}
                                                >
                                                    {ticket.week}
                                                </td>
                                            )
                                        }
                                        {visibleColumns.client &&
                                            ((editableColumn === 'client' || editableColumn === 'appModule') && indexColumn == index ? 
                                                <td className="px-4 py-2">
                                                    <select className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                                        ref={el => formDataEditRefs.current.clientRef = el}
                                                        target={ticket.ticketId}
                                                        onChange={(event) => {
                                                            handleChange('client', event.target.value);
                                                            if(formDataEditRefs.current.appModuleRef !== null){
                                                                handleChange('appModule', event.target.value)
                                                                formDataEditRefs.current.appModuleRef.value = "";
                                                            }
                                                        }}
                                                        defaultValue={ticket.client}
                                                    >
                                                        <option value={""} disabled>Select client</option>
                                                        {masterData && masterData.length > 0  && masterData.map((data) => {
                                                            return (
                                                                <option key={data._id} value={data.client}>{data.client}</option>
                                                            )
                                                        })}
                                                    </select>
                                                </td>
                                                :
                                                <td className="px-4 py-2 cursor-pointer"
                                                    onDoubleClick={() => {toggleShowEditInput('client', index)}}
                                                >{ticket.client}</td>
                                            )
                                        }
                                        {visibleColumns.createdDate &&
                                            (editableColumn === 'createdDate' && indexColumn == index ?
                                                <td className="px-4 py-2">
                                                    <input name="createDate" type="date" placeholder="Name"
                                                        className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                                        ref={el => formDataEditRefs.current.createDateRef = el}
                                                        target={ticket.ticketId}
                                                        defaultValue={ticket.createdDate}
                                                        onChange={(event) => {handleChange('createdDate', event.target.value)}}
                                                    />
                                                </td>
                                                :
                                                <td className="px-4 py-2 cursor-pointer"
                                                    onDoubleClick={() => {toggleShowEditInput('createdDate', index)}}
                                                >{ticket.createdDate}</td>
                                            ) 
                                        }
                                        {visibleColumns.requesterName &&
                                            (editableColumn === 'requesterName' && indexColumn === index ?
                                                <td className="px-4 py-2">
                                                    <input name="name" type="text" placeholder="Name"
                                                        className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                                        ref={el => formDataEditRefs.current.requesterNameRef = el}
                                                        target={ticket.ticketId}
                                                        defaultValue={ticket.requesterName}
                                                        onChange={(event) => {handleChange('requesterName', event.target.value)}}
                                                    />
                                                </td>
                                                :
                                                <td className="px-4 py-2 cursor-pointer"
                                                    onDoubleClick={() => {toggleShowEditInput('requesterName', index)}}
                                                >{ticket.requesterName}</td>
                                            )
                                        }
                                        {visibleColumns.description && 
                                            (editableColumn === 'description' && indexColumn === index ?
                                                <td className="border border-black px-4 py-2">
                                                    <textarea className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                                        placeholder="Text" cols="30"
                                                        ref={el => formDataEditRefs.current.subjectRef = el}
                                                        target={ticket.ticketId}
                                                        defaultValue={ticket.description}
                                                        onChange={(event) => {
                                                            handleChange('description', event.target.value);
                                                            adjustTextareaHeight(event.target);
                                                        }}
                                                    ></textarea>
                                                </td>
                                                :
                                                <td className="border border-black px-4 py-2 w-96 cursor-pointer"
                                                    onDoubleClick={() => {toggleShowEditInput('description', index)}}>
                                                    <div dangerouslySetInnerHTML={{ __html: formatText(ticket.description) }} />
                                                </td>
                                            )
                                        }
                                        {visibleColumns.appModule &&
                                            ((editableColumn === 'appModule' || editableColumn === 'client') && indexColumn === index ?
                                                <td className="border border-black px-4 py-2">
                                                    {ticket.client &&
                                                        <select className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                                            ref={el => formDataEditRefs.current.appModuleRef = el}
                                                            onChange={(event) => {handleChange('appModule', event.target.value)}}
                                                            defaultValue={ticket.appModule}
                                                            target={ticket.ticketId}
                                                        >
                                                            <option value={""} disabled>Select app module</option>
                                                            {masterData && masterData.length > 0 && masterData.filter(data => data.client === (formDataEditRefs.current.clientRef ? formDataEditRefs.current.clientRef.value : ticket.client))
                                                                .flatMap(data => data.appModule.map(appModule => (
                                                                    <option key={appModule.name} value={appModule.name}>{appModule.name}</option>
                                                                )))
                                                            }
                                                        </select>
                                                    }
                                                </td>
                                                :
                                                <td className="border border-black px-4 py-2 cursor-pointer"
                                                    onDoubleClick={() => {toggleShowEditInput('appModule',index, ticket.client)}}
                                                >{ticket.appModule}</td>
                                            ) 
                                        }
                                        {visibleColumns.resolution && 
                                            (editableColumn === 'resolution' && indexColumn === index ?
                                                <td className="border border-black px-4 py-2">
                                                    <textarea className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                                        placeholder="Text" rows="1" cols="30"
                                                        ref={el => formDataEditRefs.current.resolutionRef = el}
                                                        target={ticket.ticketId}
                                                        onChange={(event) => {
                                                            handleChange('resolution', event.target.value); 
                                                            adjustTextareaHeight(event.target);
                                                        }}
                                                        defaultValue={ticket.resolution}
                                                    ></textarea>
                                                </td>
                                                :
                                                <td className="border border-black px-4 py-2 w-96 cursor-pointer"
                                                    onDoubleClick={() => {toggleShowEditInput('resolution', index)}}>
                                                    <div dangerouslySetInnerHTML={{ __html: formatText(ticket.resolution) }} />
                                                </td>
                                            )
                                        }
                                        {visibleColumns.resolvedDate &&
                                            (editableColumn === 'resolvedDate' && indexColumn === index ?
                                                <td className="border border-black px-4 py-2">
                                                    <input className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6" 
                                                        type="date" name="resolveDate"
                                                        ref={el => formDataEditRefs.current.resolveDateRef = el}
                                                        onChange={(event) => {handleChange('resolvedDate', event.target.value)}}
                                                        defaultValue={ticket.resolvedDate}
                                                        target={ticket.ticketId}
                                                    />
                                                </td>
                                                :
                                                <td className="border border-black px-4 py-2 cursor-pointer"
                                                    onDoubleClick={() => {toggleShowEditInput('resolvedDate',index)}}>{ticket.resolvedDate}</td>
                                            )
                                        }
                                        {visibleColumns.resolvedBy &&
                                            (editableColumn === 'resolvedBy' && indexColumn === index ?
                                                <td className="border border-black px-4 py-2">
                                                    <input className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6" 
                                                        type="text" placeholder="Name"
                                                        ref={el => formDataEditRefs.current.resolvedByRef = el}
                                                        onChange={(event) => {handleChange('resolvedBy', event.target.value)}}
                                                        defaultValue={ticket.resolvedBy}
                                                        target={ticket.ticketId}
                                                    >
                                                    </input>
                                                </td>
                                                :
                                                <td className="border border-black px-4 py-2 cursor-pointer"
                                                    onDoubleClick={() => {toggleShowEditInput('resolvedBy',index)}}>{ticket.resolvedBy}</td>
                                            )
                                        }
                                        {visibleColumns.requestType && 
                                            (editableColumn === 'requestType' && indexColumn === index ?
                                                <td className="border border-black px-4 py-2">
                                                    <select className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                                        ref={el => formDataEditRefs.current.requestTypeRef = el}
                                                        onChange={(event) => {handleChange('requestType', event.target.value)}}
                                                        defaultValue={ticket.requestType}
                                                        target={ticket.ticketId}
                                                    >
                                                        <option value={""} disabled>Select request type</option>
                                                        <option value="Service Request">Service Request</option>
                                                        <option value="Trouble Ticket">Trouble Ticket</option>
                                                    </select>
                                                </td>
                                                :
                                                <td className="border border-black px-4 py-2 cursor-pointer"
                                                    onDoubleClick={() => {toggleShowEditInput('requestType',index)}}>{ticket.requestType}</td>
                                            )
                                        }
                                        {visibleColumns.modeTicket &&
                                            (editableColumn === 'modeTicket' && indexColumn === index ?
                                                <td className="border border-black px-4 py-2">
                                                    <select className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                                        ref={el => formDataEditRefs.current.modeTicketRef = el}
                                                        onChange={(event) => {handleChange('modeTicket', event.target.value)}}
                                                        defaultValue={ticket.modeTicket}
                                                        target={ticket.ticketId}
                                                    >
                                                        <option value={""} disabled>Select mode ticket</option>
                                                        <option value="WA Personal">WA Personal</option>
                                                        <option value="WA Group">WA Group</option>
                                                        <option value="Email">Email</option>
                                                        <option value="Phone">Phone</option>
                                                    </select>
                                                </td>
                                                :
                                                <td className="border border-black px-4 py-2 cursor-pointer"
                                                    onDoubleClick={() => {toggleShowEditInput('modeTicket',index)}}>{ticket.modeTicket}</td>
                                            )
                                        }
                                        {visibleColumns.priority && 
                                            (editableColumn === 'priority' && indexColumn === index ?
                                                <td className="border border-black px-4 py-2">
                                                    <select className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                                        ref={el => formDataEditRefs.current.priorityRef = el}
                                                        onChange={(event) => {handleChange('priority', event.target.value)}}
                                                        defaultValue={ticket.priority}
                                                        target={ticket.ticketId}
                                                    >
                                                        <option value={""} disabled>Select priority</option>
                                                        <option value="Low">Low</option>
                                                        <option value="Medium">Medium</option>
                                                        <option value="High">High</option>
                                                    </select>
                                                </td>
                                                :
                                                <td className="border border-black px-4 py-2 cursor-pointer"
                                                    onDoubleClick={() => {toggleShowEditInput('priority',index)}}>{ticket.priority}</td>
                                            )
                                        }
                                        {visibleColumns.status &&
                                            (editableColumn === 'status' && indexColumn === index ?
                                                <td className="border border-black px-4 py-2">
                                                    <select className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                                        ref={el => formDataEditRefs.current.statusRef = el}
                                                        onChange={(event) => {handleChange('status', event.target.value)}}
                                                        defaultValue={ticket.status}
                                                        target={ticket.ticketId} 
                                                    >
                                                        <option value={""} disabled>Select status</option>
                                                        <option value="Open">Open</option>
                                                        <option value="Onhold">Onhold</option>
                                                        <option value="Close">Close</option>
                                                    </select>
                                                </td>
                                                :
                                                <td className="border border-black px-4 py-2 cursor-pointer"
                                                    onDoubleClick={() => {toggleShowEditInput('status', index)}}>{ticket.status}</td>
                                            )
                                        }
                                        {visibleColumns.lastUpdateBy &&
                                            <td className="border border-black px-4 py-2 removable">{ticket.lastUpdateBy ? ticket.lastUpdateBy.name.fullName : ''}</td>
                                        }
                                        {visibleColumns.action &&
                                            <td className="border border-black px-4 py-2 removable">
                                                <button className="bg-red-600 rounded-md px-2 py-1 text-white hover:bg-gray-500 focus:outline focus:outline-1 focus:outline-black"
                                                    onClick={() => handleSetDataModal(ticket)}
                                                >
                                                    <i className='fi fi-rr-trash leading-none align-middle'></i> Delete
                                                </button>
                                            </td>
                                        }
                                    </tr>
                                )
                            })

                            } 
                        </tbody>
                    </table>
                </div>
            </div>
            { modalShow &&
                <Modal
                    dataModal={dataModal}
                    modalShow={modalShow}
                    setModalShow={setModalShow}
                    handleDeleteTicket={handleDeleteTicket}
                />
            }
        </>

    )
}

export default withAuth(Layout);