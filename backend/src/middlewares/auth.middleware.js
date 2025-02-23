import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asynchHandler } from "../utils/AsynchHandler.js";
import jwt from 'jsonwebtoken';
const userAuth = asynchHandler(async (req, res, next) => {

     try{
        const {token }= req.cookies;
        // console.log(res.cookies);
        
        if((!token)){
            throw new ApiError(401, "Unauthorized");
        }
        const decodedJwt = jwt.verify(token, "JoshGuruPvt@2025");
        const {id} = decodedJwt;
        const user = await User.findById({_id:id});
        if(!user){
            throw new ApiError(404, "User not found");
        }
        req.user= user;
        next();

     }
     catch(error){
         console.log(error);
         res.status(500).json(new ApiResponse(500,  "Internal Server Error"));
     }
});
export { userAuth };