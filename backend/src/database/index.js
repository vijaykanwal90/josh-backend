import mongoose from "mongoose";


const connectDB = async ()=>{
    try {
        console.log(process.env.MONGODB_URL)
       const connectionIstance =  await mongoose.connect(`${process.env.MONGODB_URL}/josh-backend`);
       console.log(`\n MongoDB connected !!  DB HOST ${connectionIstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection error ",error)
        process.exit(1);
    }
}

export default connectDB