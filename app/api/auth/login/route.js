// pages/api/login.js

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import connectToDatabase from '@/lib/mongodb'; // Adjust the path as necessary
import Users from '@/models/Users'; // Adjust the path as necessary

export const config = {
    runtime: 'edge', // This enables the edge runtime, which allows `Response`
};

export async function POST(req) {
    // Connect to the database
    await connectToDatabase();

    // Extract email and password from the request body
    const { email, password } = await req.json();  // Use `await req.json()` for body parsing

    // Validate required fields
    if (!email || !password) {
        return new Response(
            JSON.stringify({ message: 'Email and password are required' }),
            { status: 400 }
        );
    }

    try {
        // Find user by email
        const user = await Users.findOne({ email });

        // If user not found, return an error
        if (!user) {
            return new Response(
                JSON.stringify({ message: 'Invalid credentials' }),
                { status: 401 }
            );
        }

        // Compare provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return new Response(
                JSON.stringify({ message: 'Invalid credentials' }),
                { status: 401 }
            );
        }

        // Create JWT payload
        const payload = {
            id: user._id,
            name: user.name,
            email: user.email,
            type: user.type,
            status: user.status,
        };

        // If the user is a 'Client', attach additional client info to payload
        if (user.type === 'Client') {
            payload.client = user.client;
        }

        // Generate JWT token
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRATION || '1d',
        });

        // Serialize the token into a cookie
        const cookie = serialize('token', token, {
            httpOnly: false, // Can't be accessed via JavaScript
            secure: process.env.NODE_ENV === 'production', // Set secure flag in production
            sameSite: 'Strict', // CSRF protection
            path: '/', // Available across the whole site
            maxAge: 24 * 60 * 60, // 1 day
        });

        // Set the cookie in the response headers
        const headers = new Headers();
        headers.append('Set-Cookie', cookie);

        // Return a successful response with the cookie
        return new Response(
            JSON.stringify({ message: 'Login successful' }),
            { status: 200, headers }
        );
    } catch (error) {
        console.error('Error during login:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500 }
        );
    }
}
