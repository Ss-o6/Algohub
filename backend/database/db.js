import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const dbconnection=async ()=>{
    const mongodb_url= process.env.mongodb_URL;
    try {
        await mongoose.connect(mongodb_url);
        console.log("dbconnection established")
    } catch (error) {
       console.error(error);   
    }
};
export default dbconnection;