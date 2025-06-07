import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asynchHandler } from "../utils/AsynchHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getUser = asynchHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user._id
        ).populate("courses").populate("bundles")
        .populate({
            path: 'incomeHistory',
            populate: {
                path: 'from', // this is the field inside incomeHistory
                select: 'name' // only get the name, not full user doc
            }
        })
        ;
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
const getUserCourses = asynchHandler(async (req, res) => {
     const { _id } = req.params;
    try {
        console.log("get courses and bundles")
        const user = await User.findById(_id)
        .select('name email courses bundles')
        .populate('courses')
        .populate('bundles')
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        res.status(200).json(new ApiResponse(200, { user }, "User fetched successfully"));
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Internal server error");
    }
});
const getUserBundles = asynchHandler(async (req, res) => {
    const { _id } = req.params;
    try {
        console.log("get courses and bundles")
        const user = await User.findById(_id)
        .select('name email courses bundles')
        .populate({
            path: 'bundles',
            options: {sort:{price:1}}
        })
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        res.status(200).json(new ApiResponse(200, { user }, "User fetched successfully"));
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Internal server error");
        
    }
});
const updateUser = asynchHandler(async (req, res) => {
    try {
        const  id  = req.user._id;
        const {name,email} = req.body;
        
        console.log(name,email)
        const user = await User.findByIdAndUpdate(id, {
            name,
            email
        }, {
            new: true,
            runValidators: true
        });

        // console.log(user)
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
const updateRole = asynchHandler(async (req, res) => {
    try {
      const { userId } = req.body;
  
      const user = await User.findById(userId);
      if (!user) {
        throw new ApiError(404, "User not found");
      }
  
      // Toggle role
      const newRole = user.role === 'admin' ? 'user' : 'admin';
  
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { role: newRole },
        { new: true, runValidators: true }
      );
  
      res.status(200).json(
        new ApiResponse(200, { updatedUser }, "User role updated successfully")
      );
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json(new ApiResponse(500, {}, "Failed to update user role"));
    }
  });
  
const getAllUser = asynchHandler(async(req,res)=>{
    try {
        const users = await User.find();
        // console.log(users)
        if(!users){
            throw new ApiError(404, "Unable to get Users");
        }
        res.status(200).json(new ApiResponse(200, { users }, "Users fetched successfully"));
    } catch (error) {
        console.log(error)
        throw new ApiError(404, "Internal server error");
    }
})
const getUserIncomeHistory = asynchHandler(async (req, res) => {
    const {userId }= req.params;
    try {
        const user = await User.findById(userId).populate({
            path: "incomeHistory",
            populate: {
                path: "from",
                select: 'name'
            }
        });
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

export { updateUser, getUser,getAllUser ,getUserCourses,getUserIncomeHistory,getUserBundles,updateRole};