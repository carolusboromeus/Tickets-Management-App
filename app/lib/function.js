import * as XLSX from 'xlsx-js-style';

export const epxortFiletoExcel = (table, title, columnWidth) => {
    const tableClone = table.cloneNode(true);

    if(title === "TicketList" || title === "TicketDetail"){
        // Reverse the rows
        const rows = Array.from(tableClone.querySelectorAll('tr'));
        const headerRow = rows.shift();
        const reversedRows = rows.reverse();

        const tbody = tableClone.querySelector('tbody') || tableClone; // Use tbody if exists, otherwise use table
        tbody.innerHTML = ''; // Clear the table body
    
        // Append the header row back (first row)
        tbody.appendChild(headerRow);

        // Append the reversed rows to the table
        reversedRows.forEach(row => {
            tbody.appendChild(row);
        });
    }

    const rowsRemovable = tableClone.getElementsByClassName('removable');
    if(rowsRemovable && rowsRemovable.length > 0){
        // Convert HTMLCollection to an array and loop through it in reverse
        for (let i = rowsRemovable.length - 1; i >= 0; i--) {
          rowsRemovable[i].remove();
        }
    }

    const wb = XLSX.utils.table_to_book(tableClone);
    const ws = wb.Sheets[wb.SheetNames[0]];

    ws['!cols'] = columnWidth;

    // Define border style
    const borderStyle = {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } },
    };

    const range = XLSX.utils.decode_range(ws['!ref']);

    // Set wrap text for all columns
    for (let row = range.s.r; row <= range.e.r; row++) {

        for (let col = range.s.c; col <= range.e.c; col++) {
            const cell = ws[XLSX.utils.encode_cell({ r: row, c: col })];
            if (cell) {
                cell.s = {
                    ...cell.s,
                    font: { sz: 12 },
                    border: borderStyle,
                    alignment: {
                        vertical: 'center',
                        wrapText: true,
                        horizontal: col === range.s.c ? 'center' : 'left',
                    },
                };
            }
        }
    }

    // Set styles for the header (title) row
    for (let col = range.s.c; col <= range.e.c; col++) {
        const cell = ws[XLSX.utils.encode_cell({ r: range.s.r, c: col })];
        if (cell) {
            cell.s = {
                font: { bold: true, sz: 13 },
                alignment: { horizontal: "center" },
                border: borderStyle,
            };
        }
    }

    XLSX.writeFile(wb,`${title}.xlsx`);
}

export const getDateFirstandLast = (dateNow) => {
    const firstDate = new Date(dateNow.getFullYear(), dateNow.getMonth(), 1);
    const lastDate = new Date(dateNow.getFullYear(), dateNow.getMonth() + 1, 0);
    const formatFristDate = formatDate(firstDate);
    const formatLastDate = formatDate(lastDate);

    return {formatFristDate, formatLastDate};
}

export const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}