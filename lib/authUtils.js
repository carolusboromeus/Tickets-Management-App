import jwt, { decode } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET; // Store this in .env for production

const authenticateJWT = (req, res, next) =>  {

    const token = req.headers.get('authorization')?.replace('Bearer ', ''); // Get the token from the Authorization header

    if (!token) {
        return new Response(
            JSON.stringify({ error: 'No token provided' }),
            { status: 401 }
        );
        // return res.status(401).json({ message: 'No token provided' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach user info to the request object
        return new Response(
            JSON.stringify(decoded),
            { status: 200 }
        );
        // next(); // Pass control to the next handler
    } catch (err) {
        return new Response(
            JSON.stringify({ error: 'Invalid or expired token' }),
            { status: 401 }
        );
        // return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

export default authenticateJWT;
