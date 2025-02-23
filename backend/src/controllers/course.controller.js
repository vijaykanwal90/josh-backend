import { ApiError } from "../utils/ApiError.js";
import { asynchHandler } from "../utils/AsynchHandler.js";
import { Course } from "../models/course.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createCourse = asynchHandler(async (req, res) => {
    const { title, description, price, duration, courseMentorName } = req.body;
    try {

        const course = new Course({
            title,
            description,
            price,
            duration,
            courseMentorName
        });
        await course.save();
        console.log(course)



        // const validateCourse = validateCourseInput({ title, description, price, duration });
        // if (!validateCourse) {
        //     throw new ApiError(400, "Invalid input");
        // }
        res.status(200).json(new ApiResponse(201, { course }, "Course created successfully"));
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Internal server error", error);
    }
}
);

const getCourses = asynchHandler(async (req, res) => {
    try {
        const courses = await Course.find();
        res.status(200).json(new ApiResponse(200, { courses }, "Courses fetched successfully"));
    } catch (error) {
        throw new ApiError(500, "Internal server error");
    }
}
);

const getCourseById = asynchHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const course = await Course.findById(id);
        if (!course) {
            throw new ApiError(404, "Course not found");
        }
        res.status(200).json(new ApiResponse(200, { course }, "Course fetched successfully"));
    } catch (error) {
        throw new ApiError(500, "Internal server error");
    }
}
);

const getUserCourses = asynchHandler(async (req, res) => {
    const { userId } = req.params;
    try {
        const courses = await Course.findById(id);
        if (!courses) {
            throw new ApiError(404, "No Courses Associated with this user");
        }
        res.status(200).json(new ApiResponse(200, { courses }, "Courses fetched successfully"));
    } catch (error) {
        throw new ApiError(500, "Internal server error");
    }
}
);

const updateCourse = asynchHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const course = await Course.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        }
        );
        if (!course) {

            throw new ApiError(404, "Course not found");
        }
        res.status(200).json(new ApiResponse(200, { course }, "Course updated successfully"));
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Internal server error");
    }
}
);

const deleteCourse = asynchHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const course = await Course.findByIdAndDelete(id);
        if (!course) {
            throw new ApiError(404, "Course not found");
        }
        res.status(200).json(new ApiResponse(200, { course }, "Course deleted successfully"));
    } catch (error) {
        throw new ApiError(500, "Internal server error");
    }
}
);





export { createCourse, getCourses, getCourseById, getUserCourses, updateCourse, deleteCourse };