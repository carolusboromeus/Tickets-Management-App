import connectToDatabase from '@/lib/mongodb';
import bcrypt from 'bcrypt';
import Users from '@/models/Users';
import authenticateJWT from '@/lib/authUtils';

export async function GET(req) {
    
    const res = authenticateJWT(req);

    if(res.status !== 200) return new Response(
        JSON.stringify({ error: 'No token provided' }),
        { status: 401 }
    );

    await connectToDatabase();
   
    try {
        const users = await Users.find();
        return new Response(JSON.stringify(users), { status: 200 });
    } catch (error) {
        console.log(error);
        return new Response(JSON.stringify({ error: 'Failed to fetch users' }), { status: 500 });
    }
}

export async function POST(req) {
    
    const res = authenticateJWT(req);
    const reqBody = await req.json();

    if(res.status !== 200) return new Response(
        JSON.stringify({ error: 'No token provided' }),
        { status: 401 }
    );

    await connectToDatabase();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('12345678', salt);
    
    const dataUser = {
        name: reqBody.name,
        email: reqBody.email,
        password: hashedPassword,
        type: reqBody.type,
        status: 'Active'
    }

    if(reqBody.type === 'Client') {
        dataUser.client = reqBody.client;
    }
   
    try {
        Users.insertMany([dataUser]).then((result) => {
            if(result){
                return new Response(JSON.stringify("Data User successfully added!"), { status: 200 });
            } else {
                return new Response(null, { status: 200 });
            }
        });
    } catch (error) {
        console.log(error);
        return new Response(JSON.stringify({ error: 'Failed to add users' }), { status: 500 });
    }
}

export async function PATCH(req, res) {
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

        const { idUser, currentPassword, password, status, name, email, type, client } = reqBody;

        if (!idUser) {
            return new Response(JSON.stringify({ error: 'User ID is required' }), { status: 400 });
        }

        const user = await Users.findOne({ _id: idUser });
        if (!user) {
            return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
        }

        let update = {};
        if (Object.keys(reqBody).length === 1 && password) {
            const salt = await bcrypt.genSalt(10);
            update.password = await bcrypt.hash('12345678', salt);
        } else if (status) {
            update.status = status;
        } else {
            if (name) update.name = name;
            if (email) update.email = email;
            if (type) update.type = type;
            if (type === 'Client' && client) update.client = client;

            if (currentPassword && password) {
                const isMatch = await bcrypt.compare(currentPassword, user.password);
                if (!isMatch) {
                    return new Response(JSON.stringify({ message: 'Invalid current password' }), { status: 401 });
                }

                const salt = await bcrypt.genSalt(10);
                update.password = await bcrypt.hash(password, salt);
            }
        }

        const updatedUser = await Users.findOneAndUpdate({ _id: idUser }, { $set: update }, { new: true });

        if (!updatedUser) {
            return new Response(JSON.stringify({ error: 'Update failed' }), { status: 500 });
        }

        return new Response(JSON.stringify('User updated successfully!'), { status: 200 });

    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Data not updated successfully!' }), { status: 500 });
    }
}