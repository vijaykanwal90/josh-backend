import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asynchHandler } from "../utils/AsynchHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getUser = asynchHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user.id
        );
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
        const {id} = req.params;
        const user = await User.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });
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

const getUserById = asynchHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
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
export { getUser, updateUser, getUserById };