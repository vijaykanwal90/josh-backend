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
        console.log("adding mentor");
        
        const { name, email, mobileNumber, about, socialLinks, position } = req.body;
        
        // Basic validation
        if (!email) {
            throw new ApiError(400, "Email is required");
        } 
        console.log("mentor position", position);

        // Check if the mentor already exists
        const existingMentor = await Mentor.findOne({ email });
        if (existingMentor) {
            throw new ApiError(400, "Mentor already exists with this email");
        }

        // Handle file upload and path creation
        const mentorImage = req.file;
        const localMentorImagePath = mentorImage ? `/fileStore/${mentorImage.filename}` : null;

        // Parse socialLinks if it is a string, and ensure it's properly formatted
        let parsedSocialLinks = [];
        try {
            parsedSocialLinks = typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks;
        } catch (err) {
            throw new ApiError(400, "Invalid socialLinks format");
        }

        // Create mentor data
        const mentor = await Mentor.create({
            name,
            email,
            mobileNumber,
            about,
            socialLinks: parsedSocialLinks,
            profileImage: localMentorImagePath,
            position,
        });

        // Return successful response
        res.status(201).json(
            new ApiResponse(201, { mentor }, "Mentor created successfully")
        );
    } catch (error) {
        console.log(error);
        // Check for custom errors and pass them accordingly
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
        const mentor = await Mentor.findById(mentorId);
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
    course.mentors.push(mentorId);
    await course.save();
  
    res.status(200).json(
      new ApiResponse(200, { mentor }, "✅ Course assigned to mentor successfully")
    );
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
      if (req.file) {
        mentorData.profileImage = req.file.path; // or whatever field you're using
      }
  
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

export { addMentor, updateMentor, deleteMentor, addCourseToMentor , getMentors , getMentorById };
