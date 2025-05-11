import { ApiError } from "../utils/ApiError.js";
import { asynchHandler } from "../utils/AsynchHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const checkRole = (roles) => {
    return asynchHandler((req, res, next) => {
        try {
            // Check if the user's role exists on the request object (from previous middleware like userAuth)
            // console.log(req.user)
            if (!req.user || !roles.includes(req.user.role)) {
                throw new ApiError(403, "You are not authorized to access this route");
       P     }

            // If the role is valid, proceed to the next middleware/route
            next();
        } catch (error) {
            // Log the error for debugging purposes
            console.error(error);

           

            return res.status(500).json(new ApiResponse(500, "Internal Server Error"));
        }
    });
};

export { checkRole };
