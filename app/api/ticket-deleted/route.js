import connectToDatabase from '@/lib/mongodb';
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
    // const page = searchParams.get('page');
    
    const query = {};
    
    if (client) {
        query.client = new RegExp(`^${client}$`, 'i');
    }

    if (startDate && endDate) {
        
        query.createdDate = { $gte: startDate };
        query.createdDate.$lte = endDate;
    }

    if (startDateR && endDateR) {

        query.resolvedDate = { $gte: startDateR };
        query.resolvedDate.$lte = endDateR;
    }

    try {
        const tickets = await TicketDelete.find(query).populate('lastUpdateBy', 'name');
        return new Response(JSON.stringify(tickets), { status: 200 });
    } catch (error) {
        console.log(error);
        return new Response(JSON.stringify({ error: 'Failed to fetch tickets' }), { status: 500 });
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
        await TicketDelete.findOneAndUpdate(filter, update);
        return new Response(JSON.stringify("Data Ticket updated successfully!"), { status: 200 });
    } catch (error) {
        console.log(error);
        return new Response(JSON.stringify('Data Ticket not updated successfully!'), { status: 500 });
    }
}
