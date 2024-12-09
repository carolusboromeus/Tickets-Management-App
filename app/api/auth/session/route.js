import connectToDatabase from '@/lib/mongodb';
import Users from '@/models/Users';
import authenticateJWT from '@/lib/authUtils';

export async function GET(req, res) {
    // Connect to the database
    await connectToDatabase();

    authenticateJWT(req);

    if (!req.user) {
        return new Response(
            JSON.stringify({ error: 'Token is invalid or expired' }),
            { status: 401 }
        );
        // return res.status(401).json({ message: 'Token is invalid or expired' });
    }

    try {
        const user = await Users.findById(req.user.id); // Assuming you store the user ID in the token

        if (!user) {
            return new Response(
                JSON.stringify({ error: 'User not found' }),
                { status: 401 }
            );
            // return res.status(404).json({ message: 'User not found' });
        }

        const payload = {
            id: user._id,
            name: user.name,
            email: user.email,
            type: user.type,
            status: user.status
        }

        if (user.type === 'Client') {
            payload.client = user.client;
        }

        // Return the user data (you can also customize this based on your needs)
        return new Response(
            JSON.stringify({
                message: 'Authenticated',
                user: payload
            }),
            { status: 200 }
        );

        // return res.status(200).json({
        //     message: 'Authenticated',
        //     user: payload
        // });
    } catch (error) {
        console.error('Invalid token');
        return res.status(500).json({ error: 'Internal server error' });
    }
}
