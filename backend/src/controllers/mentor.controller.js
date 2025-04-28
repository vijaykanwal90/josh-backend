// import { Mentor } from "../models/mentor.model.js"; // adjust path as needed
import {Mentor} from "../models/mentor.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asynchHandler } from "../utils/AsynchHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Course } from "../models/course.model.js";
// Add Mentor
import bcrypt from 'bcryptjs';
const getMentors = asynchHandler (async (req,res)=>{
    try{
        const mentors = await Mentor.find();
        if(!mentors){
            throw new ApiError(404,"Mentors not found");
        }
        res.status(200).json(new ApiResponse(200, {mentors}, "Mentors fetched successfully"));
    }
    catch(error){
        console.log(error);
        throw new ApiError(500, "Internal server error");
    }
})
const addMentor = asynchHandler(async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email) {
            throw new ApiError(400, "Email is required");
        }

        const existingMentor = await Mentor.findOne({ email });
        if (existingMentor) {
            throw new ApiError(400, "Mentor already exists with this email");
        }

        // Clone body to modify if password exists
        const mentorData = { ...req.body };

        // Hash password if provided
        if (password) {
            mentorData.password = await bcrypt.hash(password, 10);
        }

        const mentor = await Mentor.create(mentorData);

        res.status(201).json(
            new ApiResponse(201, { mentor }, "Mentor created successfully")
        );
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Internal server error");
    }
});

const addCourseToMentor = asynchHandler(async (req, res) => {
    const { mentorId, courseId } = req.body;

    // Check if mentor and course exist
    const mentor = await Mentor.findById(mentorId);
    const course = await Course.findById(courseId);

    if (!mentor) {
        throw new ApiError(404, "Mentor not found");
    }
    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    // Avoid duplicates
    if (mentor.courses.includes(courseId)) {
        throw new ApiError(400, "Course already added to mentor");
    }

    // Add course to mentor
    mentor.courses.push(courseId);
    await mentor.save();

    res.status(200).json(
        new ApiResponse(200, { mentor }, "Course added to mentor successfully")
    );
});
// Update Mentor
const updateMentor = asynchHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, about, mobilenumber, socialLinks, role } = req.body;

        const mentor = await Mentor.findByIdAndUpdate(
            id,
            { name, email, about, mobilenumber, socialLinks, role },
            { new: true, runValidators: true }
        );

        if (!mentor) {
            throw new ApiError(404, "Mentor not found");
        }

        res.status(200).json(new ApiResponse(200, { mentor }, "Mentor updated successfully"));
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Internal server error");
    }
});

// Delete Mentor
const deleteMentor = asynchHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const mentor = await Mentor.findByIdAndDelete(id);

        if (!mentor) {
            throw new ApiError(404, "Mentor not found");
        }

        res.status(200).json(new ApiResponse(200, null, "Mentor deleted successfully"));
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Internal server error");
    }
});

export { addMentor, updateMentor, deleteMentor, addCourseToMentor , getMentors };
