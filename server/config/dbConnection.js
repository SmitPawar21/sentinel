import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log("Database Connected"))
        .catch(err => {
            console.log("db connection failed, ", err);
        });
}

