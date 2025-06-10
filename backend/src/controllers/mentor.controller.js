// import { Mentor } from "../models/mentor.model.js"; // adjust path as needed
import {Mentor} from "../models/mentor.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asynchHandler } from "../utils/AsynchHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Course } from "../models/course.model.js";
// Add Mentor
import bcrypt from 'bcryptjs';
import { uploadCloudinary } from "../utils/Cloudinary.js";
import fs from "fs"
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
    console.log("adding mentor");

    const { name, email, mobileNumber, about, socialLinks, position } = req.body;

    if (!email) {
      throw new ApiError(400, "Email is required");
    }
    console.log("mentor position", position);

    const existingMentor = await Mentor.findOne({ email });
    if (existingMentor) {
      throw new ApiError(400, "Mentor already exists with this email");
    }

    const mentorImage = req.file;
    let cloudinaryImageUrl = null;

    if (mentorImage) {
      try {
        const result = await uploadCloudinary(mentorImage?.path);
        cloudinaryImageUrl = result?.secure_url || null;
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        throw new ApiError(500, "Failed to upload mentor image");
      }
    }

    let parsedSocialLinks = [];
    try {
      parsedSocialLinks = typeof socialLinks === "string" ? JSON.parse(socialLinks) : socialLinks;
    } catch (err) {
      throw new ApiError(400, "Invalid socialLinks format");
    }

    const mentor = await Mentor.create({
      name,
      email,
      mobileNumber,
      about,
      socialLinks: parsedSocialLinks,
      profileImage: cloudinaryImageUrl,
      position,
    });

    res.status(201).json(new ApiResponse(201, { mentor }, "Mentor created successfully"));
  } catch (error) {
    console.log(error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Internal server error");
  }
});

const getMentorById = asynchHandler(async (req, res) => {
    const {mentorId} = req.params;
    try {
        console.log(mentorId)
        const mentor = await Mentor.findById(mentorId).populate("courses");
        if (!mentor) {
            throw new ApiError(404, "Mentor not found");
        }
        res.status(200).json(
            new ApiResponse(200, { mentor }, "Mentor fetched successfully")
        ); 
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Internal server error");
        
    }

});


const addCourseToMentor = asynchHandler(async (req, res) => {
    const { mentorId, courseId } = req.body;
  
    // Validate mentor and course
    console.log("assigning course to mentor");
    const mentor = await Mentor.findById(mentorId);
    const course = await Course.findById(courseId);
  
    if (!mentor) {
      throw new ApiError(404, "Mentor not found");
    }
  
    if (!course) {
      throw new ApiError(404, "Course not found");
    }
  
    // Check for duplicate course assignment
    if (mentor.courses.includes(courseId)) {
      throw new ApiError(400, "Course already assigned to this mentor");
    }
  
    // Assign course to mentor
    mentor.courses.push(courseId);
    await mentor.save();
  
    // Assign mentor to course
    course.mentor.push(mentorId);
    await course.save();
  
    res.status(200).json(
      new ApiResponse(200, { mentor }, "✅ Course assigned to mentor successfully")
    );
  });
  const removeCourseFromMentor = asynchHandler(async (req, res) => {
    const { mentorId, courseId } = req.body;
  
    console.log("Removing course from mentor");
  
    const mentor = await Mentor.findById(mentorId);
    const course = await Course.findById(courseId);
  
    if (!mentor) {
      throw new ApiError(404, "Mentor not found");
    }
  
    if (!course) {
      throw new ApiError(404, "Course not found");
    }
  
    if (!mentor.courses.includes(courseId)) {
      throw new ApiError(400, "Course not assigned to this mentor");
    }
  
    // ✅ Remove mentorId from course
    await Course.updateOne(
      { _id: courseId },
      { $pull: { mentors: mentorId } }
    );
  
    // ✅ Remove courseId from mentor
    await Mentor.updateOne(
      { _id: mentorId },
      { $pull: { courses: courseId } }
    );
  
    res.status(200).json(new ApiResponse(200, null, "Course removed from mentor successfully"));
  });
  
// Update Mentor
// const updateMentor = asynchHandler(async (req, res) => {
//     try {
//         console.log("updating mentor")
//         const { id } = req.params;
//         const { name, email, about, mobilenumber, socialLinks, position } = req.body;
//         console.log(req.body)
//         const mentor = await Mentor.findByIdAndUpdate(
//             id,
//             { name, email, about, mobilenumber, socialLinks, position },
//             { new: true, runValidators: true }
//         );

//         if (!mentor) {
//             throw new ApiError(404, "Mentor not found");
//         }

//         res.status(200).json(new ApiResponse(200, { mentor }, "Mentor updated successfully"));
//     } catch (error) {
//         console.log(error);
//         throw new ApiError(500, "Internal server error");
//     }
// });


const updateMentor = asynchHandler(async (req, res) => {
    try {
      console.log("updating mentor");
      const { id } = req.params;
  
      const { name, email, about, mobileNumber, socialLinks, position } = req.body;
  
      console.log("mobileNumber:", mobileNumber);
      console.log("raw socialLinks:", socialLinks);
  
      // Prepare update data
      let mentorData = {
        name,
        email,
        about,
        mobileNumber,
        position,
      };
  
      // ✅ Fix: Parse socialLinks string to an array of objects
      if (socialLinks) {
        try {
          const parsedLinks = JSON.parse(socialLinks);
          if (Array.isArray(parsedLinks)) {
            mentorData.socialLinks = parsedLinks.filter(
              (linkObj) =>
                typeof linkObj === "object" &&
                "link" in linkObj &&
                "name" in linkObj
            );
          } else {
            mentorData.socialLinks = [];
          }
        } catch (err) {
          console.error("Error parsing socialLinks:", err.message);
          mentorData.socialLinks = [];
        }
      }
  
      // ✅ Handle image upload
       const mentorImage = req.file;
       let cloudinaryImageUrl = null;
       if (mentorImage) {
        try {
          const result = await uploadCloudinary(mentorImage.path);
          cloudinaryImageUrl = result?.secure_url || null;
        } catch (err) {
          console.error("Cloudinary upload failed:", err);
          throw new ApiError(500, "Failed to upload mentor image");
        }
      }
      mentorData.profileImage = cloudinaryImageUrl;
      const mentor = await Mentor.findByIdAndUpdate(id, mentorData, {
        new: true,
        runValidators: true,
      });
  
      if (!mentor) {
        throw new ApiError(404, "Mentor not found");
      }
  
      res
        .status(200)
        .json(new ApiResponse(200, { mentor }, "Mentor updated successfully"));
    } catch (error) {
      console.error("Update Error:", error);
      throw new ApiError(500, "Internal server error");
    }
  });
  

// Delete Mentor
const deleteMentor = asynchHandler(async (req, res) => {
    try {
        const { id } = req.params;
        console.log("mentor deletion ")
        const mentor = await Mentor.findByIdAndDelete(id);

        if (!mentor) {
            throw new ApiError(404, "Mentor not found");
        }
        // Optionally, you can also remove the mentor from any courses they were assigned to
        await Course.updateMany(
            { mentors: id },
            { $pull: { mentors: id } }
        );
        console.log("mentor deleted")
        res.status(200).json(new ApiResponse(200, null, "Mentor deleted successfully"));
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Internal server error");
    }
});

export { addMentor, updateMentor, deleteMentor, addCourseToMentor , getMentors , getMentorById, removeCourseFromMentor };
