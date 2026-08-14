import mongoose from 'mongoose';
import { envs } from '../../lib/env.js';

const connectDb = async () => {
    try {
        await mongoose.connect(envs.MONGODB_URI, {
            maxPoolSize: 10,
            authSource: "admin"
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

const disconnectDb = async () => {
    try {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error disconnecting from MongoDB:', error);
    }
}

export { connectDb, disconnectDb };