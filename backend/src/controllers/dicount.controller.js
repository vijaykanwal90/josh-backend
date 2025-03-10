import { Course } from "../models/course.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynchHandler } from "../utils/AsynchHandler.js";
import { ApiError } from "../utils/ApiError.js";


const addDiscount = asynchHandler(async (req, res) => {
    const { discount, courseId } = req.body;
    try {
        const course = await Course.findById(courseId);
        if (!course) {
            throw new ApiError(404, "Course not found");
        }
        course.discount = discount;
        course.discountedPrice = course.price - (course.price * discount) / 100;
        course.hasDiscount = true;
        
        await course.save();
        res.status(200).json(new ApiResponse(200, { course }, "Discount added successfully"));
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Internal server error");
    }
}
);

const removeDiscount = asynchHandler(async (req, res) => {
    const { courseId } = req.body;
    try {
        const course = await Course.findById(courseId);
        if (!course) {
            throw new ApiError(404, "Course not found");
        }
        course.discount = 0;
        course.discountedPrice = course.price;
        course.hasDiscount = false;
        await course.save();
        res.status(200).json(new ApiResponse(200, { course }, "Discount removed successfully"));
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Internal server error");
    }
}
);

export  { addDiscount, removeDiscount };

