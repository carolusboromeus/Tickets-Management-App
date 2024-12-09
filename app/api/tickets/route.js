import connectToDatabase from '@/lib/mongodb';
import Tickets from '@/models/Tickets';
import TicketDelete from '@/models/TicketDelete';
import authenticateJWT from '@/lib/authUtils';

export async function GET(req) {
    
    const res = authenticateJWT(req);

    if(res.status !== 200 ) return new Response(
        JSON.stringify({ error: 'No token provided' }),
        { status: 401 }
    );

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const client = searchParams.get('client');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const startDateR = searchParams.get('startDateR');
    const endDateR = searchParams.get('endDateR');
    
    const query = {};
    
    if (client) query.client = new RegExp(`^${client}$`, 'i');
    if (startDate && endDate) {
        query.createdDate = { $gte: startDate, $lte: endDate };
    }
    if (startDateR && endDateR) {
        query.resolvedDate = { $gte: startDateR, $lte: endDateR };
    }

    try {
        const tickets = await Tickets.find(query).populate('lastUpdateBy', 'name');
        return new Response(JSON.stringify(tickets), { status: 200 });
    } catch (error) {
        console.log(error);
        return new Response(JSON.stringify({ error: 'Failed to fetch tickets' }), { status: 500 });
    }
}

export async function POST(req) {
    
    const res = authenticateJWT(req);
    const reqBody = await req.json();

    if(res.status !== 200 ) return new Response(
        JSON.stringify({ error: 'No token provided' }),
        { status: 401 }
    );

    await connectToDatabase();

    const ticketId = await generateTicketId(reqBody.client);

    const dataTicket = {
        ticketId: ticketId,
        week: reqBody.week,
        client: reqBody.client,
        createdDate:  reqBody.createdDate,
        requesterName: reqBody.requesterName,
        description: reqBody.description,
        appModule: reqBody.appModule,
        resolution: reqBody.resolution,
        resolvedDate: reqBody.resolvedDate,
        resolvedBy: reqBody.resolvedBy,
        requestType: reqBody.requestType,
        modeTicket: reqBody.modeTicket,
        priority: reqBody.priority,
        status: reqBody.status,
        lastUpdateBy: req.user.id
    }

    try {
        await Tickets.insertMany([dataTicket]);
        return new Response(JSON.stringify("Data Ticket successfully added!"), { status: 200 });
    } catch (error) {
        console.log(error);
        return new Response(JSON.stringify('Data Ticket not successfully added!'), { status: 500 });
    }
}

export async function PATCH(req) {
    
    const res = authenticateJWT(req);
    const reqBody = await req.json();

    if(res.status !== 200 ) return new Response(
        JSON.stringify({ error: 'No token provided' }),
        { status: 401 }
    );

    await connectToDatabase();

    const keys = Object.keys(reqBody);

    let filter = null;
    let update = null;

    if(keys.length === 2) {
        filter = {ticketId: reqBody.ticketId};
        update = {[keys[1]] : reqBody[keys[1]], lastUpdateBy: req.user.id};
    } else if (keys.length === 3) {
        filter = {ticketId: reqBody.ticketId};
        update = {
            [keys[1]] : reqBody[keys[1]],
            [keys[2]] : reqBody[keys[2]],
            lastUpdateBy: res.user.id
        };
    }

    try {
        await Tickets.findOneAndUpdate(filter, update);
        return new Response(JSON.stringify("Data Ticket updated successfully!"), { status: 200 });
    } catch (error) {
        console.log(error);
        return new Response(JSON.stringify('Data Ticket not updated successfully!'), { status: 500 });
    }
}

export async function DELETE(req) {
    
    const res = authenticateJWT(req);
    const reqBody = await req.json();

    if(res.status !== 200 ) return new Response(
        JSON.stringify({ error: 'No token provided' }),
        { status: 401 }
    );

    await connectToDatabase();

    const deleteData = await Tickets.findOneAndDelete({ _id: reqBody.ticketId });

    if(!deleteData) {
        console.log('No ticket found with the given ID.');
        return new Response(JSON.stringify({ error: 'Ticket not found or already deleted.' }), { status: 404 });
    }

    const dataDeleteTicket = {
        ticketId: deleteData.ticketId,
        week: deleteData.week,
        client: deleteData.client,
        createdDate: deleteData.createdDate,
        requesterName: deleteData.requesterName,
        description: deleteData.description,
        appModule: deleteData.appModule,
        resolution: deleteData.resolution,
        resolvedDate: deleteData.resolvedDate,
        resolvedBy: deleteData.resolvedBy,
        requestType: deleteData.requestType,
        modeTicket: deleteData.modeTicket,
        priority: deleteData.priority,
        status: deleteData.status,
        lastUpdateBy: req.user.id
    }

    try {
        await TicketDelete.insertMany([dataDeleteTicket]);
        return new Response(JSON.stringify("Data Ticket deleted successfully!"), { status: 200 });
    } catch (error) {
        console.log(error);
        return new Response(JSON.stringify('Data Ticket not deleted successfully!'), { status: 500 });
    }
}

const generateTicketId = async (client) => {
    const lastTicket = await Tickets.findOne({ client }).sort({ createdAt: -1 });
    const ticketNumber = lastTicket ? parseInt(lastTicket.ticketId.split('-')[1]) + 1 : 1;
    const filter = {ticketId: `${client}-${ticketNumber}`};
    const checkTicketDeleted = await TicketDelete.findOne(filter);
    return checkTicketDeleted ? `${client}-${ticketNumber+1}` : `${client}-${ticketNumber}`;
    // return `${client}-${ticketNumber}`;
}