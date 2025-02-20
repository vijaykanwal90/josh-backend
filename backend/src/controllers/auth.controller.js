import { ApiError } from "../utils/ApiError.js";
import { asynchHandler } from "../utils/AsyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from  "../utils/ApiResponse.js"

const registerUser = asynchHandler(async (req, res) => {
    const { name, email, password, refrralcode, mobilenumber } = req.body;
    try {
        // const validateUser = validateUserInput({ name, email, password, refrralcode, mobilenumber });
        // if(!validateUser){
        //     throw new ApiError(400, "Invalid input");
        // }
        const user = await User.create({ name, email, password, refrralcode, mobilenumber });
        res.status(200).json(new ApiResponse(201, { user }, "User registered successfully"));

    } catch (error) {
        throw new ApiError(500, "Internal server error");
    }
});

const loginUser = asynchHandler(async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User
            .findOne({ email })
            .select("+password")
            .exec();

        if (!user || !(await user.matchPassword(password))) {
            throw new ApiError(401, "Invalid credentials");
        }
        // const token = user.getSignedJwtToken();
        return res.status(200).json(new ApiResponse(200, { user }, "User logged in successfully"));
    } catch (error) {
        throw new ApiError(500, "Internal server error");
    }
}
);

export { registerUser, loginUser };