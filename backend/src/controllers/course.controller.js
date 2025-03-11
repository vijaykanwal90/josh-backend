import { ApiError } from "../utils/ApiError.js";
import { asynchHandler } from "../utils/AsynchHandler.js";
import { Course } from "../models/course.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// import { uploadCloudinary } from "../utils/Cloudinary.js";
import { Bundle } from "../models/bundle.model.js";

// Create a course and link it to a bundle
const createCourse = asynchHandler(async (req, res) => {
    const {
        title,
        image,
        bundleName,
        category,
        video,
        description,
        price,
        duration,
        courseMentorName
    } = req.body;

    try {
        // Check if the bundle already exists
        let bundle = await Bundle.findOne({ bundleName });

        // If the bundle doesn't exist, create a new bundle
        if (!bundle) {
            bundle = new Bundle({
                bundleName,
                // You can customize the description and price as needed
                courses: [] // Start with an empty courses array
            });
            await bundle.save();
        }

        // Create the course and link it to the bundle
        const course = new Course({
            title,
            image,
            bundle: bundle._id, // Add bundle ID reference here
            category,
            video,
            description,
            price,
            duration,
            courseMentorName
        });

        // Save the course to the database
        await course.save();

        // Add the course to the bundle's courses array
        bundle.courses.push(course._id);
        await bundle.save();

        return res.status(201).json(new ApiResponse(201, { course }, "Course created successfully"));
    } catch (error) {
        console.error(error);
        throw new ApiError(500, "Internal server error", error);
    }
});

// Create a new bundle
const createBundle = asynchHandler(async (req, res) => {
    const {
        bundleName,
        description,
        oldPrice,
        price
    } = req.body;

    try {
        let bundle = await Bundle.findOne({ bundleName });
        if (!bundle) {
            bundle = new Bundle({
                bundleName,
                description,
                oldPrice,
                price,
                courses: []
            });
            await bundle.save();
        }

        return res.status(201).json(new ApiResponse(201, { bundle }, "Bundle created successfully"));
    } catch (error) {
        console.error(error);
        throw new ApiError(500, "Internal server error", error);
    }
});

// Update an existing bundle
const updateBundle = asynchHandler(async (req, res) => {
    const { id } = req.params;

    try {
        const updatedBundle = await Bundle.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });

        if (!updatedBundle) {
            throw new ApiError(404, "Bundle not found");
        }

        return res.status(200).json(new ApiResponse(200, { updatedBundle }, "Bundle updated successfully"));
    } catch (error) {
        console.error(error);
        throw new ApiError(500, "Internal server error", error);
    }
});

// Fetch all bundles or specific bundles by name
const getBundles = asynchHandler(async (req, res) => {
    const { bundleName } = req.query;

    try {
        let bundles;
        if (bundleName && bundleName !== "all") {
            bundles = await Bundle.find({ bundleName }).populate("courses");
        } else {
            bundles = await Bundle.find({}).populate("courses");
        }

        return res.status(200).json(new ApiResponse(200, { bundles }, "Bundles fetched successfully"));
    } catch (error) {
        console.error(error);
        throw new ApiError(500, "Internal server error", error);
    }
});

const getBundleById = asynchHandler(async (req, res) => {
        const { id } = req.params;
        try {
            const bundle = await Bundle
                .findById(id)
                .populate("courses");
            if (!bundle) {
                throw new ApiError(404, "Bundle not found");
            }
            return res.status(200).json(new ApiResponse(200, { bundle }, "Bundle fetched successfully"));
        } catch (error) {
            console.error(error);
            throw new ApiError(500, "Internal server error", error);
        }
    }
    );


    const getAllBundles = asynchHandler(async (req, res) => {
        try {
            const bundles = await Bundle.find().populate("courses");
            return res.status(200).json(new ApiResponse(200, { bundles }, "Bundles fetched successfully"));
        } catch (error) {
            console.error(error);
            throw new ApiError(500, "Internal server error");
        }
    })

// Fetch all courses
const getCourses = asynchHandler(async (req, res) => {
    try {
        const courses = await Course.find();
        return res.status(200).json(new ApiResponse(200, { courses }, "Courses fetched successfully"));
    } catch (error) {
        console.error(error);
        throw new ApiError(500, "Internal server error");
    }
});

// Fetch a course by its ID
const getCourseById = asynchHandler(async (req, res) => {
    const { id } = req.params;

    try {
        const course = await Course.findById(id);

        if (!course) {
            throw new ApiError(404, "Course not found");
        }

        return res.status(200).json(new ApiResponse(200, { course }, "Course fetched successfully"));
    } catch (error) {
        console.error(error);
        throw new ApiError(500, "Internal server error");
    }
});


// Fetch courses associated with a specific user
const getUserCourses = asynchHandler(async (req, res) => {
    const { userId } = req.params;

    try {
        const courses = await Course.find({ courseMentorName: userId });

        if (!courses || courses.length === 0) {
            throw new ApiError(404, "No courses associated with this user");
        }

        return res.status(200).json(new ApiResponse(200, { courses }, "Courses fetched successfully"));
    } catch (error) {
        console.error(error);
        throw new ApiError(500, "Internal server error");
    }
});

// Update a course by its ID
const updateCourse = asynchHandler(async (req, res) => {
    const { id } = req.params;

    try {
        const course = await Course.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });

        if (!course) {
            throw new ApiError(404, "Course not found");
        }

        return res.status(200).json(new ApiResponse(200, { course }, "Course updated successfully"));
    } catch (error) {
        console.error(error);
        throw new ApiError(500, "Internal server error");
    }
});

// Delete a course by its ID
const deleteCourse = asynchHandler(async (req, res) => {
    const { id } = req.params;

    try {
        const course = await Course.findByIdAndDelete(id);

        if (!course) {
            throw new ApiError(404, "Course not found");
        }

        return res.status(200).json(new ApiResponse(200, { course }, "Course deleted successfully"));
    } catch (error) {
        console.error(error);
        throw new ApiError(500, "Internal server error");
    }
});



export {
    createCourse,
    getCourses,
    getCourseById,
    getUserCourses,
    updateCourse,
    deleteCourse,
    createBundle,
    updateBundle,
    getBundles,
    getBundleById,
    getAllBundles
};
