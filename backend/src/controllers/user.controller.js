import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asynchHandler } from "../utils/AsynchHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getUser = asynchHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user._id
        ).populate("courses").populate("bundles");
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        res.status(200).json(new ApiResponse(200, { user }, "User fetched successfully"));
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Internal server error");
    }
}
);


const updateUser = asynchHandler(async (req, res) => {
    try {
        const  id  = req.user._id;
        const {name, mobilenumber,email} = req.body;
        
        console.log(name, mobilenumber, email)
        const user = await User.findByIdAndUpdate(id, {
            name,
            mobilenumber,
            email
        }, {
            new: true,
            runValidators: true
        });

        console.log(user)
        if (!user) {
            console.log(error)
            throw new ApiError(404, "User not found");
        }

        res.status(200).json(new ApiResponse(200, { user }, "User updated successfully"));
    } catch (error) {
        console.log(error)
        throw new ApiError(500, "Internal server error");
    }
}
);
const getAllUser = asynchHandler(async(req,res)=>{
    try {
        const users = await User.find();
        console.log(users)
        if(!users){
            throw new ApiError(404, "Unable to get Users");
        }
        res.status(200).json(new ApiResponse(200, { users }, "Users fetched successfully"));
    } catch (error) {
        console.log(error)
        throw new ApiError(404, "Internal server error");
    }
})

export { updateUser, getUser,getAllUser };