import {app} from './app.js';
import dotenv from 'dotenv'
// import connectDB from "./db/index.js"
dotenv.config({
    path: './.env'
})
import connectDB from './database/index.js';
// console.log("MONGODB URL is ",process.env.MONGODB_URL)
// console.log("PORT is ",process.env.PORT)
connectDB() 
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(` Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MONGODB  db connection failed !!!" , err);
})
