import connectToDatabase from '@/lib/mongodb';
import authenticateJWT from '@/lib/authUtils';
import MasterData from '@/models/MasterData';

export async function POST(req) {
    
    const res = authenticateJWT(req);
    const reqBody = await req.json();

    if(res.status !== 200) return new Response(
        JSON.stringify({ error: 'No token provided' }),
        { status: 401 }
    );

    await connectToDatabase();
    
    const dataClient = {
        client: reqBody.client,
        appModule: reqBody.appModule,
    }
   
    try {
        await MasterData.insertMany([dataClient]);
        return new Response(JSON.stringify("Data Berhasil di tambahkan!"), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to add client' }), { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const reqBody = await req.json(); // Parse the JSON body

        const resAuth = authenticateJWT(req);
        if (resAuth.status !== 200) {
            return new Response(
                JSON.stringify({ error: 'No token provided' }),
                { status: 401 }
            );
        }

        await connectToDatabase();

        const { idClient, client } = reqBody;

        const data = await MasterData.findOne({_id: idClient});

        if(data){
            const filter = {_id: idClient};
            const update = {client : client};

            await MasterData.findOneAndUpdate(filter, update);
            return new Response(JSON.stringify("Data updated successfully!"), { status: 200 });
        } else {
            return new Response(JSON.stringify({ error: 'Data Client not found' }), { status: 404 });
        }
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Data not updated successfully!' }), { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const reqBody = await req.json(); // Parse the JSON body

        const resAuth = authenticateJWT(req);
        if (resAuth.status !== 200) {
            return new Response(
                JSON.stringify({ error: 'No token provided' }),
                { status: 401 }
            );
        }

        await connectToDatabase();

        const { idClient } = reqBody;

        const deleteData = await MasterData.findOneAndDelete({ _id: idClient });
        if(deleteData) {
            return new Response(JSON.stringify("Data deleted successfully!"), { status: 200 });
        } else {
            console.log('No data found with that id.');
            return new Response(JSON.stringify({ error: 'Data Client not found' }), { status: 404 });
        }
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Data not updated successfully!' }), { status: 500 });
    }
}