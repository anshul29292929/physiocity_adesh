import mongoose from "mongoose";

// Connect to the MongoDB database
const connectDB = async () => {

    if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('---')) {
        console.warn('WARNING: MongoDB URI is missing or placeholder. Skipping DB connection.')
        return
    }

    mongoose.connection.on('connected', () => console.log('Database Connected'))

    await mongoose.connect(`${process.env.MONGODB_URI}/lms`)

}

export default connectDB