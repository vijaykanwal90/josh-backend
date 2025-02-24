import { asynchHandler } from "../utils/AsynchHandler.js";
import { Wallet } from "../models/Wallet.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";


const getWalletDetails = asynchHandler(async (req, res) => {
    try {
        const wallet = await Wallet.findOne({ user: req.user._id });
        if (!wallet) {
            throw new ApiError(404, "Wallet not found");
        }

        return res.status(200).json(new ApiResponse(200, { wallet }, "Wallet fetched successfully"));

    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Internal server error");
    }

}
);




export { getWalletDetails };

