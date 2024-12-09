import connectToDatabase from '@/lib/mongodb';
import authenticateJWT from '@/lib/authUtils';
import MasterData from '@/models/MasterData';
import axios from 'axios';
import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;

export async function POST(req) {
    
    const res = authenticateJWT(req);
    const reqBody = await req.json();

    if(res.status !== 200) return new Response(
        JSON.stringify({ error: 'No token provided' }),
        { status: 401 }
    );

    await connectToDatabase();

    const data = await MasterData.findOne({client: reqBody.client});

    if (!data) {
        return new Response(JSON.stringify({ error: 'Data not found' }), { status: 404 });
    }

    const newAppModule = data.appModule;
    const newData = {
        _id: new ObjectId(),
        name: reqBody.appModule,
    }

    newAppModule.push(newData);
    
    // console.log(data);
   
    try {
        const filter = {client : reqBody.client};
        const update = {appModule : newAppModule};
        await MasterData.findOneAndUpdate(filter, update);
        return new Response(JSON.stringify("Data successfully added!"), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Data not added successfully!' }), { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const reqBody = await req.json(); // Parse the JSON body

        // Authentication of JWT token
        const resAuth = authenticateJWT(req);
        if (resAuth.status !== 200) {
            return new Response(
                JSON.stringify({ error: 'No token provided' }),
                { status: 401 }
            );
        }

        await connectToDatabase();

        const { idClient, client, idAppModule, appModule } = reqBody;

        // Fetch the existing data
        const data = await MasterData.findOne({ _id: idClient });

        if (!data) {
            return new Response(JSON.stringify({ error: 'Client data not found' }), { status: 404 });
        }

        const axiosConfig = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${req.headers.get('authorization')?.replace('Bearer ', '')}`,
            },
        };

        // If the client matches, update the appModule
        if (data.client === client) {
            await MasterData.findOneAndUpdate(
                { _id: idClient, 'appModule._id': idAppModule },
                { $set: { 'appModule.$.name': appModule } },
                { new: true }
            );
            return new Response(JSON.stringify("Data updated successfully!"), { status: 200 });
        } else {
            // If client does not match, delete the module and then re-create it (reset)
            const deleteResponse = await axios.delete(`${process.env.CLIENT_ORIGIN}/api/master-data/app-module`, {
                data: reqBody,
                ...axiosConfig,
            });

            if (deleteResponse.status === 200) {
                // After successful delete, create the new module or reset the data
                const createResponse = await axios.post(`${process.env.CLIENT_ORIGIN}/api/master-data/app-module`, reqBody, axiosConfig);

                if (createResponse.status === 200) {
                    return new Response(JSON.stringify("Data reset and updated successfully!"), { status: 200 });
                } else {
                    return new Response(JSON.stringify({ error: 'Failed to reset data after delete.' }), { status: 500 });
                }
            } else {
                return new Response(JSON.stringify({ error: 'Failed to delete data from external API.' }), { status: 500 });
            }
        }
    } catch (error) {
        return new Response(JSON.stringify({ error: 'An error occurred while updating data!' }), { status: 500 });
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

        const data = await MasterData.findOneAndDelete({ _id: idClient });

        if(!data) {
            return new Response(JSON.stringify({ error: 'Data not found' }), { status: 404 });
        }

        const deleteData = data.appModule.filter(module => module._id.toString() !== req.body.idAppModule);
        // console.log(deleteData);
        const filter = {_id: idClient};
        const update = {appModule : deleteData};
        await MasterData.findOneAndUpdate(filter, update);
        return new Response(JSON.stringify("Data deleted successfully!"), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Data not updated successfully!' }), { status: 500 });
    }
}