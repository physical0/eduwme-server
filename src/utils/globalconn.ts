import mongoose from "mongoose";

// Declare the global type
declare global {
    var _mongo: {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
    } | undefined;
}

// Initialize global cache if it doesn't exist
if (!global._mongo) {
    global._mongo = { conn: null, promise: null };
}

export async function connectToMongo() {
    // Return existing connection
    if (global._mongo!.conn) {
        return global._mongo!.conn;
    }

    // Create connection promise if it doesn't exist
    if (!global._mongo!.promise) {
        global._mongo!.promise = mongoose.connect(process.env.MONGO_URI || "").then((mongooseInstance) => {
            global._mongo!.conn = mongooseInstance;
            return mongooseInstance;
        });
    }

    // Wait for and return the connection
    return global._mongo!.promise;
}