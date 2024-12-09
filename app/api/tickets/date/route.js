import connectToDatabase from '@/lib/mongodb';
import Tickets from '@/models/Tickets';
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
    
    // const query = {};
    const pipeline = [];

    if (client) {
        pipeline.push({
            $match: {
                $expr: {
                    $eq: [{ $strcasecmp: ["$client", client] }, 0] // Case-insensitive match
                }
            }
        });

        pipeline.push(
            {
                $addFields: {
                    date: { $dateFromString: { dateString: "$createdDate" } }
                }
            },
            {
                $group: {
                    _id: { $year: "$date" },
                    months: { $addToSet: { $month: "$date" } }
                }
            },
            {
                $project: {
                    year: "$_id",
                    month: "$months",
                    _id: 0 // Exclude the default _id field
                }
            }
        );
    } else {
        return new Response(JSON.stringify({ error: 'The query is invalid!. Please correct the query.' }), { status: 400 });
    }
    
    try {
        const dateTickets = await Tickets.aggregate(pipeline);
        return new Response(JSON.stringify(dateTickets), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch tickets' }), { status: 500 });
    }
}
