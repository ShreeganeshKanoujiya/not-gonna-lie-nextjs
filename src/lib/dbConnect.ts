import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI: string = process.env.MONGODB_URI ?? "";

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable.");
}

type MongooseCache = {
    connection: Mongoose | null;
    promise: Promise<Mongoose> | null;
};

declare global {
    var mongooseCache: MongooseCache | undefined;
}

const cache =
    global.mongooseCache ??
    (global.mongooseCache = { connection: null, promise: null });

async function dbConnect(): Promise<Mongoose> {
    if (cache.connection) {
        return cache.connection;
    }

    if (!cache.promise) {
        cache.promise = mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 10_000,
        });
    }

    try {
        cache.connection = await cache.promise;
        return cache.connection;
    } catch (error) {
        cache.promise = null;
        console.error("Error connecting to the database", error);
        throw error;
    }
}

export default dbConnect;
