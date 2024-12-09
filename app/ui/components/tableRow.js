import React from 'react';

const TableRow = React.memo(({ 
    visibleColumns, 
    columnOffsets, 
    handleChange, 
    handleAddTicket, 
    formDataRefs, 
    masterData, 
    formData 
}) => {
    return (
        <tr>
            {visibleColumns.ticketId && 
                <td className="sticky-col px-4 py-2" style={{ left: columnOffsets.ticketId || 0 }}></td>
            }
            {visibleColumns.week &&
                <td className="sticky-col px-4 py-2" style={{ left: columnOffsets.week || 0 }}>
                    <select 
                        className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                        ref={el => formDataRefs.current.weekRef = el}
                        onChange={(event) => {handleChange('week', event.target.value)}}
                        defaultValue={""}
                    >
                        <option value={""} disabled>Select week</option>
                        {[...Array(5)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>Week {i + 1}</option>
                        ))}
                    </select>
                </td>
            }
            {visibleColumns.client &&
                <td className="sticky-col px-4 py-2" style={{ left: columnOffsets.client || 0 }}>
                    <select 
                        className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                        ref={el => formDataRefs.current.clientRef = el}
                        onChange={(event) => {
                            handleChange('client', event.target.value);
                            if (formDataRefs.current.appModuleRef !== null) {
                                handleChange('appModule', null);
                                formDataRefs.current.appModuleRef.value = "";
                            }
                        }}
                        defaultValue={""}
                    >
                        <option value={""} disabled>Select client</option>
                        {masterData && masterData.map(data => (
                            <option key={data._id} value={data.client}>{data.client}</option>
                        ))}
                    </select>
                </td>
            }
            {visibleColumns.createdDate &&
                <td className="sticky-col px-4 py-2" style={{ left: columnOffsets.createdDate || 0 }}>
                    <input 
                        name="createDate" 
                        type="date" 
                        className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                        ref={el => formDataRefs.current.createDateRef = el}
                        onChange={(event) => {handleChange('createDate', event.target.value)}}
                    />
                </td>
            }
            {visibleColumns.requesterName &&
                <td className="sticky-col px-4 py-2" style={{ left: columnOffsets.requesterName || 0 }}>
                    <input 
                        name="name" 
                        type="text" 
                        placeholder="Name"
                        className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                        ref={el => formDataRefs.current.requesterNameRef = el}
                        onChange={(event) => {handleChange('requesterName', event.target.value)}}
                    />
                </td>
            }
            {visibleColumns.description && 
                <td className="border border-black px-4 py-2">
                    <textarea 
                        className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                        placeholder="Text" 
                        rows="1" 
                        cols="30"
                        ref={el => formDataRefs.current.subjectRef = el}
                        onChange={(event) => {handleChange('subject', event.target.value)}}
                    ></textarea>
                </td>
            }
            {visibleColumns.appModule && 
                <td className="border border-black px-4 py-2">
                    {formDataRefs.current.clientRef && formDataRefs.current.clientRef.value !== '' &&
                        <select 
                            className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                                placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                            ref={el => formDataRefs.current.appModuleRef = el}
                            onChange={(event) => {handleChange('appModule', event.target.value)}}
                            defaultValue={""}
                        >
                            <option value={""} disabled>Select app module</option>
                            {masterData && masterData.filter(data => data.client === formData.client)
                                .flatMap(data => data.appModule.map(appModule => (
                                    <option key={appModule.name} value={appModule.name}>{appModule.name}</option>
                                )))
                            }
                        </select>
                    }
                </td>
            }
            {visibleColumns.resolution && 
                <td className="border border-black px-4 py-2">
                    <textarea 
                        className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                        placeholder="Text" 
                        rows="1" 
                        cols="30"
                        ref={el => formDataRefs.current.resolutionRef = el}
                        onChange={(event) => {handleChange('resolution', event.target.value)}}
                    ></textarea>
                </td>
            }
            {visibleColumns.resolvedDate && 
                <td className="border border-black px-4 py-2">
                    <input 
                        className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6" 
                        type="date" 
                        name="resolveDate"
                        ref={el => formDataRefs.current.resolveDateRef = el}
                        onChange={(event) => {handleChange('resolveDate', event.target.value)}}
                    />
                </td>
            }
            {visibleColumns.resolvedBy && 
                <td className="border border-black px-4 py-2">
                    <input 
                        className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6" 
                        type="text" 
                        placeholder="Name"
                        ref={el => formDataRefs.current.resolvedByRef = el}
                        onChange={(event) => {handleChange('resolvedBy', event.target.value)}}
                    />
                </td>
            }
            {visibleColumns.requestType && 
                <td className="border border-black px-4 py-2">
                    <select 
                        className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                        ref={el => formDataRefs.current.requestTypeRef = el}
                        onChange={(event) => {handleChange('requestType', event.target.value)}}
                        defaultValue={""}
                    >
                        <option value={""} disabled>Select request type</option>
                        <option value="Service Request">Service Request</option>
                        <option value="Trouble Ticket">Trouble Ticket</option>
                    </select>
                </td>
            }
            {visibleColumns.modeTicket && 
                <td className="border border-black px-4 py-2">
                    <select 
                        className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                        ref={el => formDataRefs.current.modeTicketRef = el}
                        onChange={(event) => {handleChange('modeTicket', event.target.value)}}
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
                    <select 
                        className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                        ref={el => formDataRefs.current.priorityRef = el}
                        onChange={(event) => {handleChange('priority', event.target.value)}}
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
                    <select 
                        className="w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 
                            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                        ref={el => formDataRefs.current.statusRef = el}
                        onChange={(event) => {handleChange('status', event.target.value)}}
                        defaultValue={""}
                    >
                        <option value={""} disabled>Select status</option>
                        <option value="Open">Open</option>
                        <option value="Onhold">Onhold</option>
                        <option value="Close">Close</option>
                    </select>
                </td>
            }
            {visibleColumns.action && 
                <td className="border border-black px-4 py-2 text-center">
                    <button 
                        className="bg-blue-600 rounded-md px-2 py-1 text-white hover:bg-gray-500 focus:outline focus:outline-1 focus:outline-black"
                        onClick={handleAddTicket}
                    >
                        <i className='fi fi-rr-plus-small leading-none align-middle'></i> Add
                    </button>
                </td>
            }
        </tr>
    );
});

export default TableRow;
