import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;
const MONGO_DBNAME = process.env.MONGO_DBNAME;

if (!MONGO_URI) {
    throw new Error('Please define the MONGO_URI environment variable');
}

if (!MONGO_DBNAME) {
    throw new Error('Please define the MONGO_DBNAME environment variable');
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
    // If there's already a cached connection, return it.
    if (cached.conn) {
        return cached.conn;
    }

    // If there's no cached connection, start the connection process.
    if (!cached.promise) {
        const opts = {
            bufferCommands: false,  // Avoid buffering commands while disconnected
        };

        // Use the host URL and the database name together
        const connectionString = `${MONGO_URI}/${MONGO_DBNAME}`;

        cached.promise = mongoose
            .connect(connectionString, opts)
            .then((mongooseInstance) => {
                console.log("Successfully connected to MongoDB");
                return mongooseInstance;
            })
            .catch((error) => {
                console.error('Error connecting to MongoDB:', error);
                throw new Error('Failed to connect to MongoDB');
            });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

export default connectToDatabase;
