import connectToDatabase from '@/lib/mongodb';
import MasterData from '@/models/MasterData';
import authenticateJWT from '@/lib/authUtils';

export async function GET(req) {
    
    const res = authenticateJWT(req);

    if(res.status !== 200) return new Response(
        JSON.stringify({ error: 'No token provided' }),
        { status: 401 }
    );

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const client = searchParams.get('client');
    
    const query = {};
    
    if (client) query.client = new RegExp(`^${client}$`, 'i');
   
    try {
        const data = await MasterData.find(query);
        return new Response(JSON.stringify(data), { status: 200 });
    } catch (error) {
        console.log(error);
        return new Response(JSON.stringify({ error: 'Failed to fetch master data' }), { status: 500 });
    }
}
