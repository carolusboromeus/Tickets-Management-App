'use client'

import { useState, useRef, useEffect } from 'react';
import withAuth from '@/app/lib/withAuth';
import { useVisibility } from '../home';
import { getData, getDateTicket, getMasterData } from '../lib/api';
import BarChart from "../ui/components/bar";
import PieChart from "../ui/components/pie";

const Layout = () => {
    const { userData } = useVisibility();

    const [tickets, setTickets] = useState(null);
    const [weeks, setWeeks] = useState(null);
    const [dates, setDates] = useState(null);
    const [masterData, setMasterData] = useState(null);
    const [showYear, setShowYear] = useState(false);
    const [showMonth, setShowMonth] = useState(false);
    
    const [filter, setFilter] = useState({
        client: null,
        year: null,
        month: null,
    })
    const clientSelectRef = useRef(null);
    const yearSelectRef = useRef(null);
    const monthSelectRef = useRef(null); 

    useEffect(() => {
        const fetchData = async () => {
            const masterData = await getMasterData();
            setMasterData(masterData);

            if(userData && userData.type === 'Client') {
                const filters = {
                    client: userData.client,
                    year: null,
                    month: null
                }

                setFilter(filters);

                const date = await getDateTicket(filters);
                setDates(date);
                setShowYear(true);
            }

            // console.log(data);
        }

        fetchData();
    }, []);

    const getWeekNumberByMonth = (date) => {
        if (!(date instanceof Date)) {
            throw new Error("Invalid date");
        }
    
        // Helper function to get the Monday of the week for a given date
        const getMonday = (date) => {
            const day = date.getDay();
            // Calculate the number of days to subtract to get to Monday
            const diff = (day >= 1 ? day - 1 : 6) * -1; // Monday is day 1
            return new Date(date.getFullYear(), date.getMonth(), date.getDate() + diff);
        }

        const getMondayOfWeek = (date) => {
            // Get the current date's weekday (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
            const dayOfWeek = date.getDay();
            
            // Calculate the offset to get to the previous Monday (if date is not Monday)
            const daysToMonday = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
            
            // Calculate the Monday of the week for the given date
            const mondayOfWeek = new Date(date);
            mondayOfWeek.setDate(date.getDate() + daysToMonday);
            
            return mondayOfWeek;
        }

        const year = date.getFullYear();
        const month = date.getMonth();

        const mondayDate = getMondayOfWeek(date);
        let checkDate = new Date(mondayDate);
        checkDate.setDate(checkDate.getDate() + 5);
        
        let weekNumber;
        if(checkDate.getMonth() !== month){
            weekNumber = {
                week: 1,
                month: checkDate.getMonth(),
                year: checkDate.getFullYear()
            }
        } else {
            // Helper function to get the week number for a given date
            function getWeekNumber(date, startOfMonthMonday) {
                const currentMonday = getMonday(date);
                return Math.floor((currentMonday - startOfMonthMonday) / (7 * 24 * 60 * 60 * 1000)) + 1;
            }
        
            // const year = date.getFullYear();
            // const month = date.getMonth();
        
            // Start of the month and the Monday of the start of the month
            const startOfMonth = new Date(year, month, 1);
            const startOfMonthMonday = getMonday(startOfMonth);
        
            // Check if the date is in the last week of the month that overlaps into the next month
            const endOfMonth = new Date(year, month + 1, 0); // Last day of the current month
            const startOfNextMonthMonday = getMonday(new Date(year, month + 1, 1));
        
            if (date > endOfMonth) {
                // The date is in the next month; calculate week number for the next month
                const nextMonthDate = new Date(year, month + 1, date.getDate());
                weekNumber = {
                    week: getWeekNumber(nextMonthDate, startOfNextMonthMonday),
                    month: month + 1,
                    year: year
                };
            } else {
                // The date is in the current month
                weekNumber = {
                    week: getWeekNumber(date, startOfMonthMonday),
                    month: month,
                    year: year
                };
            }
        }
        return weekNumber;
    }

    const handleChange = async (e) => {
        const { name, value } = e.target;

        if(name === 'client'){
            filter.year = null;
            filter.month = null;
            if(yearSelectRef && yearSelectRef.current){
                yearSelectRef.current.value = '';
            }

            if(monthSelectRef && monthSelectRef.current){
                monthSelectRef.current.value = '';
                setShowMonth(false);
            }

            const filters = {
                client: value,
                year: null,
                month: null
            }

            const date = await getDateTicket(filters);
            // Step 1: Sort the months within each year
            date.forEach(entry => {
                entry.month.sort((a, b) => a - b);
            });

            // Step 2: Sort the years in ascending order
            date.sort((a, b) => a.year - b.year);
            setDates(date);
            setShowYear(true);
        }

        if(name === 'year'){
            setShowMonth(true);
            if(monthSelectRef && monthSelectRef.current) {
                setFilter(prevFilter => ({
                    ...prevFilter,
                    month: null
                }));
                monthSelectRef.current.value = '';
            }
        }

        if(name === 'month'){
            const month = parseInt(value);
            const startDate = `${filter.year}-${String(month).padStart(2, '0')}-01`;
            const formatEndDate = new Date(filter.year, month+1, 0).getDate();
            const endDate = `${filter.year}-${String(month+1).padStart(2, '0')}-${String(formatEndDate).padStart(2, '0')}`;
            // const endDate = `${filter.year}-${String(month+1).padStart(2, '0')}-31`;

            const filters = {
                client: filter.client,
                startDate: startDate,
                endDate: endDate,
            }

            const data = await getData(filters);
            data.map((info) => {
                const date = new Date(info.createdDate)
                const dateData = getWeekNumberByMonth(date);
                info.dateWeek = dateData.week;
                info.dateMonth = dateData.month;
                info.dateYear = dateData.year;
            })
            setTickets(data);
        }

        setFilter(prevFilter => ({
          ...prevFilter,
          [name]: value
        }));
    };

    useEffect(() => {
        if(filter && filter.client && filter.year && filter.month){
            const data = tickets.filter(ticket => 
                ticket.dateMonth.toString() === filter.month.toString() && 
                ticket.dateYear.toString() === filter.year.toString() && 
                ticket.client === filter.client
            );
            // console.log(data);
            const uniqueWeeks = new Set(data.map(item => item.week));
            const weeks = Array.from(uniqueWeeks);
            weeks.sort();
            setWeeks(weeks);
        }
    },[filter])

    const settingsData = (week, type, title) => {
        const weekTickets = tickets.filter(ticket => 
            ticket.week === week &&
            ticket.dateMonth.toString() === filter.month.toString() &&
            ticket.dateYear.toString() === filter.year.toString() &&
            ticket.client === filter.client
        );
    
        const colorPalette = [
            "rgba(236, 112, 99, 1)", "rgba(93, 173, 226, 1)", "rgba(130, 224, 170, 1)", 
            "rgba(247, 220, 111, 1)", "rgba(191, 201, 202, 1)", "rgba(240, 178, 122, 1)", 
            "rgba(118, 215, 196, 1)", "rgba(127, 179, 213, 1)", "rgba(221, 160, 221, 1)", 
            "rgba(195, 155, 211, 1)", "rgba(240, 230, 140, 1)", "rgba(144, 238, 144, 1)", 
            "rgba(173, 216, 230, 1)", "rgba(255, 182, 193, 1)", "rgba(217, 136, 128, 1)", 
            "rgba(204, 255, 255, 1)", "rgba(240, 248, 255, 1)", "rgba(255, 240, 245, 1)", 
            "rgba(250, 250, 210, 1)", "rgba(176, 224, 230, 1)"
        ];
    
        const getColorForAppModule = (appModule) => {
            const hash = [...appModule].reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0);
            return colorPalette[Math.abs(hash) % colorPalette.length];
        };
    
        const getCounts = (key) => {
            const uniqueValues = [...new Set(weekTickets.map(ticket => ticket[key]))];
            if(key === 'appModule') {
                uniqueValues.sort();
            }
            
            return uniqueValues.reduce((counts, value) => {
                counts[value] = weekTickets.filter(ticket => ticket[key] === value).length;
                return counts;
            }, {});
        };
    
        const getColors = (labels, type) => {
            const colorMap = {
                'Low': 'rgba(75, 192, 192, 1)', 'Medium': 'rgba(255, 159, 64, 1)', 'High': 'rgba(255, 99, 132, 1)',
                'Close': 'rgba(75, 192, 192, 1)', 'Onhold': 'rgba(255, 159, 64, 1)', 'Open': 'rgba(255, 99, 132, 1)',
                'Trouble Ticket': 'rgba(255, 99, 132, 1)', 'Service Request': 'rgba(54, 162, 235, 1)',
                'Cancel Request': 'rgba(255, 159, 64, 1)', 'WA Group': 'rgba(255, 99, 132, 1)', 
                'WA Personal': 'rgba(54, 162, 235, 1)', 'Email': 'rgba(255, 159, 64, 1)', 'Phone': 'rgba(75, 192, 192, 1)'
            };
    
            return labels.map(label => colorMap[label] || getColorForAppModule(label));
        };
    
        let temp = {};
        let colors = null;
        const keyMap = {
            'appModule': 'appModule', 'priority': 'priority', 'status': 'status',
            'requestType': 'requestType', 'modeTicket': 'modeTicket'
        };
    
        if (keyMap[type]) {
            temp = getCounts(keyMap[type]);
            const labels = Object.keys(temp);
            colors = getColors(labels, type);
        }
    
        const data = {
            labels: Object.keys(temp),
            datasets: [{
                label: title,
                data: Object.values(temp),
                backgroundColor: colors,
                borderColor: 'rgba(0, 0, 0, 1)',
                borderWidth: 1,
            }],
        };
    
        return data;
    };
    
    
    const settingsDate = (week) => {
        // Filter tickets for the given week
        const weekTickets = tickets.filter(ticket => 
            ticket.week.toString() === week.toString() && 
            ticket.dateMonth.toString() === filter.month.toString() && 
            ticket.dateYear.toString() === filter.year.toString() && 
            ticket.client === filter.client
        );
    
        // Create data objects for createdDate and resolvedDate
        const dataCreatedDate = weekTickets.reduce((counts, ticket) => {
            const date = ticket.createdDate;
            counts[date] = (counts[date] || 0) + 1;
            return counts;
        }, {});
    
        const dataResolvedDate = weekTickets.reduce((counts, ticket) => {
            const date = ticket.resolvedDate;
            counts[date] = (counts[date] || 0) + 1;
            return counts;
        }, {});
    
        if ('null' in dataResolvedDate) {
            delete dataResolvedDate.null;    
        }
        
        // Extract and merge unique dates from both datasets
        const uniqueDates = new Set([
            ...Object.keys(dataCreatedDate),
            ...Object.keys(dataResolvedDate)
        ]);
    
        // Sort the dates in ascending order
        const sortedLabels = Array.from(uniqueDates).sort((a, b) => new Date(a) - new Date(b));
    
        // Map sorted labels to their corresponding values
        const valuesCreatedDate = sortedLabels.map(date => dataCreatedDate[date] || 0);
        const valuesResolvedDate = sortedLabels.map(date => dataResolvedDate[date] || 0);
    
        // Construct the dataset for the chart
        const data = {
            labels: sortedLabels,
            datasets: [
                {
                    label: "Created Date",
                    data: valuesCreatedDate,
                    backgroundColor: 'rgba(54, 162, 235, 1)',
                    borderColor: 'rgba(0, 0, 0, 1)',
                    borderWidth: 1,
                },
                {
                    label: "Resolved Date",
                    data: valuesResolvedDate,
                    backgroundColor: 'rgba(255, 99, 132, 1)',
                    borderColor: 'rgba(0, 0, 0, 1)',
                    borderWidth: 1,
                },
            ],
        };
    
        return data;
    };
    
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June', 
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
        
    const getMonthName = (monthNumber) => monthNames[monthNumber] || 'Unknown';
    
    return (
        <div>
            <h1 className="text-xl font-semibold mb-4">Graphics</h1>
            <div className={`grid grid-cols-1 ${showYear ? userData && userData.type === 'Admin' ?  "md:grid-cols-2": "md:grid-cols-1" :  "md:grid-cols-1"} ${showMonth ? userData && userData.type === 'Admin' ? "md:grid-cols-3": "md:grid-cols-2" : ""} md:gap-5 mb-5`}>
                {userData && userData.type === 'Admin' && 
                    <div className='bg-slate-500 p-3 rounded-md my-2 md:my-0'>
                        <div className='ml-1 text-white text-lg'>Client</div>
                        <select className='p-1 w-full my-2 rounded-md text-sm' 
                            defaultValue={''}
                            ref={clientSelectRef}
                            name="client"
                            onChange={handleChange}
                        >
                            <option value={''} disabled>Select Client</option>
                            {masterData && masterData.length > 0 && masterData.map((data) => {
                                return(
                                    <option key={data._id} value={data.client}>{data.client}</option>
                                )
                            })}
                        </select>
                    </div>
                }
                {showYear && 
                    <div className='bg-slate-500 p-3 rounded-md my-2 md:my-0'>
                        <div className='ml-1 text-white text-lg'>Year</div>
                        <select className='p-1 w-full mt-2 mb-1 rounded-md text-sm' 
                            defaultValue={''}
                            ref={yearSelectRef}
                            name="year"
                            onChange={handleChange}
                        >
                            <option value={''} disabled>Select Year</option>
                            {dates && dates.length > 0 && dates.map((date,index) => {
                                return (
                                    <option key={index} value={date.year}>{date.year}</option>
                                )
                            })}
                            {/* <option value={'2023'}>2023</option> */}
                        </select>
                    </div>
                }
                {showMonth && 
                    <div className='bg-slate-500 p-3 rounded-md my-2 md:my-0'>
                        <div className='ml-1 text-white text-lg'>Month</div>
                        <select className='p-1 w-full my-2 rounded-md text-sm' 
                            defaultValue={''}
                            ref={monthSelectRef}
                            name="month"
                            onChange={handleChange}
                        >
                            <option value={''} disabled>Select Month</option>
                            {filter && filter.year && dates && dates.length > 0 && dates
                                .filter(date => date.year.toString() === filter.year.toString()) // Filter to get the matching year
                                .flatMap(date => date.month.map((month, index) => (
                                    <option key={index} value={month-1}>{getMonthName(month-1)}</option>
                                )))
                            }
                        </select>
                    </div>
                }
            </div>
            {filter && filter.client && filter.year && filter.month &&
                <div className={`overflow-auto h-[calc(100vh-3rem)] md:h-[calc(100vh-15rem)]`}>
                    <div className='my-5'>
                        <label className="text-lg">App Module</label>
                        <div className={`grid grid-cols-1 ${weeks && weeks.length % 2 === 0 ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} lg:gap-10`}>
                            {weeks && weeks.length > 0 && weeks.map((week, index) => {
                                const data = settingsData(week, 'appModule', 'App Module');
                                return (
                                    <div className="w-full" key={index}>
                                        <div className='h-64'>
                                            <BarChart data={data} type={true}/>
                                        </div>
                                        <div className="text-center font-bold my-4">Week {week}</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <hr></hr>
                    <div className='my-5'>
                        <label className="text-lg">Priority</label>
                        <div className={`grid grid-cols-1 ${weeks && weeks.length % 2 === 0 ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} lg:gap-10`}>
                            {weeks && weeks.length > 0 && weeks.map((week, index) => {
                                const data = settingsData(week, 'priority', 'Priority');
                                return (
                                    <div className="w-full" key={index}>
                                        <div className='h-64'>
                                            <BarChart data={data} type={true}/>
                                        </div>
                                        <div className="text-center font-bold my-4">Week {week}</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <hr></hr>
                    <div className='my-5'>
                        <label className="text-lg">Status</label>
                        <div className={`grid grid-cols-1 ${weeks && weeks.length % 2 === 0 ? 'md:grid-cols-2' : 'md:grid-cols-3'} md:gap-10`}>
                            {weeks && weeks.length > 0 && weeks.map((week, index) => {
                                const data = settingsData(week, 'status', 'Status');
                                return (
                                    <div className="w-full" key={index}>
                                        <div className='h-64'>
                                            <PieChart data={data}/>
                                        </div>
                                        <div className="text-center font-bold my-4">Week {week}</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <hr></hr>
                    <div className='my-5'>
                        <label className="text-lg">Created & Resolved Date</label>
                        <div className={`grid ${weeks && weeks.length % 2 === 0 ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} lg:gap-10`}>
                            {weeks && weeks.length > 0 && weeks.map((week, index) => {
                                const data = settingsDate(week, 'date', 'Created & Resolved Date');
                                return (
                                    <div className="w-full" key={index}>
                                        <div className='h-64'>
                                            <BarChart data={data} type={false}/>
                                        </div>
                                        <div className="text-center font-bold my-4">Week {week}</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <hr></hr>
                    <div className='my-5'>
                        <label className="text-lg">Request Type</label>
                        <div className={`grid ${weeks && weeks.length % 2 === 0 ? 'md:grid-cols-2' : 'md:grid-cols-3'} md:gap-10`}>
                            {weeks && weeks.length > 0 && weeks.map((week, index) => {
                                const data = settingsData(week, 'requestType', 'Request Type');
                                return (
                                    <div className="w-full" key={index}>
                                        <div className='h-64'>
                                            <PieChart data={data}/>
                                        </div>
                                        <div className="text-center font-bold my-4">Week {week}</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <hr></hr>
                    <div className='my-5'>
                        <label className="text-lg">Mode Ticket</label>
                        <div className={`grid grid-cols-1 ${weeks && weeks.length % 2 === 0 ? 'md:grid-cols-2' : 'md:grid-cols-3'} md:gap-10`}>
                            {weeks && weeks.length > 0 && weeks.map((week, index) => {
                                const data = settingsData(week, 'modeTicket', 'Mode Ticket');
                                return (
                                    <div className="w-full" key={index}>
                                        <div className='h-64'>
                                            <PieChart data={data}/>
                                        </div>
                                        <div className="text-center font-bold my-4">Week {week}</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}

export default withAuth(Layout);