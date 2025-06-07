import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asynchHandler } from "../utils/AsynchHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken';

const userAuth = asynchHandler(async (req, res, next) => {

     try{
        const { token }=  req.cookies;
       
        // console.log(token)
        if(!token){
            throw new ApiError(401, "you are Unauthorized");
        }
        const decodedJwt = jwt.verify(token, "JoshGuruPvt@2025");

        const {id} = decodedJwt;
        const user = await User.findById({_id:id});
        if(!user){
            throw new ApiError(404, "User not found");
        }
        req.user= user;
        // console.log("user auth is clear")
        next();

     }
     catch(error){
         console.log(error);
         return res.status(500).json(new ApiResponse(500,  "Internal Server Error"));
     }
});
export { userAuth };