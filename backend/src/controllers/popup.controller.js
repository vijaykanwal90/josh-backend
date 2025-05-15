import { asynchHandler } from "../utils/AsynchHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Popup } from "../models/popup.model.js";

const getPopup = asynchHandler(async (req, res) => {
    try {
        const popup = await Popup.find({
            $and: [{ isActive: true }, { isDeleted: false }]
        }).populate("bundle", "_id bundleName price discountedPrice discount ");

        if (!popup) {
            throw new ApiError(404, "Popup not found");
        }
        return res.status(200).json(new ApiResponse(200, { popup }, "Popup fetched successfully"));
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Internal server error");
    }
});

const createPopup = asynchHandler(async (req, res) => {
    try {
        const { text, bundle } = req.body;
        const popup = await Popup.create({
            text,
            bundle,
            isActive: true,
            isDeleted: false
        });

        if (!popup) {
            throw new ApiError(500, "Unable to create popup");
        }
        return res.status(201).json(new ApiResponse(201, { popup }, "Popup created successfully"));
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Internal server");

    }
});


const deletePopup = asynchHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const popup = await Popup.findOneAndDelete({
            bundle: id
        },
            {
                new: true
            });
        if (!popup) {
            throw new ApiError(404, "Popup not found");
        }
    




        if (!popup) {
            throw new ApiError(404, "Popup not found");
        }
        return res.status(200).json(new ApiResponse(200, { popup }, "Popup deleted successfully"));
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Internal server error");
    }
});

const deletePopUpById = asynchHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const popup = await Popup.findByIdAndDelete(id);
        if (!popup) {
            throw new ApiError(404, "Popup not found");
        }
        return res.status(200).json(new ApiResponse(200, { popup }, "Popup deleted successfully"));
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Internal server error");
    }
}
);




export { getPopup, createPopup, deletePopup,deletePopUpById };