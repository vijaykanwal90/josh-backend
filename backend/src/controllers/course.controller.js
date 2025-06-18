import { ApiError } from "../utils/ApiError.js";
import { asynchHandler } from "../utils/AsynchHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";
import { Mentor } from "../models/mentor.model.js";
// import { uploadCloudinary } from "../utils/Cloudinary.js";
import { Bundle } from "../models/bundle.model.js";
import mongoose from "mongoose";
import { uploadCloudinary } from "../utils/Cloudinary.js";

import fs from "fs";
// import { uploadCloudinary } from "../utils/cloudinary.utils.js"; // Make sure the import is only once at the top!

const createCourse = asynchHandler(async (req, res) => {
  try {
    const {
      title,
      bundleName,
      category,
      description,
      price,
      duration,
      courseMentorName,
      isTrending,
      isOffline,
      courseIntrovideo: rawIntroVideo,
    } = req.body;

    // Parse videos array from string or array
    let videos = [];
    if (req.body.videos) {
      try {
        const parsedVideos =
          typeof req.body.videos === "string"
            ? JSON.parse(req.body.videos)
            : req.body.videos;

        if (Array.isArray(parsedVideos)) {
          videos = parsedVideos.map((video, index) => ({
            title: video.title || `Video ${index + 1}`,
            url: convertToEmbedUrl(video.url),
            isPreview: index === 0 ? true : video.isPreview || false,
          }));
        } else {
          return res
            .status(400)
            .json(new ApiResponse(400, null, "Videos must be an array"));
        }
      } catch {
        return res
          .status(400)
          .json(new ApiResponse(400, null, "Invalid JSON format for videos"));
      }
    }

    // Find or create bundle if bundleName provided
    let bundle = null;
    if (bundleName) {
      bundle = await Bundle.findOne({ bundleName });
      if (!bundle) {
        bundle = new Bundle({ bundleName });
        await bundle.save();
      }
    }

    // Upload files to Cloudinary (imageFile, pdfFile, certificateFile)
    const fileTypes = ["imageFile", "pdfFile", "certificateFile"];
    const uploadedFiles = {};
    for (const fileType of fileTypes) {
      const file = req.files?.[fileType]?.[0];
      if (file) {
        try {
          const uploadResult = await uploadCloudinary(file.path);
          // Map field names
          let fieldName =
            fileType === "imageFile"
              ? "image"
              : fileType === "pdfFile"
              ? "pdfPath"
              : "certificatePath";

          uploadedFiles[fieldName] = uploadResult.secure_url;
        } catch (error) {
          console.error(`Cloudinary upload failed for ${fileType}:`, error);
          return res
            .status(500)
            .json(new ApiResponse(500, null, `Failed to upload ${fileType}`));
        }
      }
    }

    // Process arrays that might come as JSON strings
    const arrayFields = [
      "whatYouWillLearn",
      "whyCourse",
      "whoShouldEnroll",
      "courseHighlights",
    ];
    const processedArrays = {};
    for (const field of arrayFields) {
      if (req.body[field]) {
        try {
          processedArrays[field] =
            typeof req.body[field] === "string"
              ? JSON.parse(req.body[field])
              : req.body[field];

          if (!Array.isArray(processedArrays[field])) {
            return res
              .status(400)
              .json(new ApiResponse(400, null, `${field} must be an array`));
          }
        } catch {
          return res
            .status(400)
            .json(new ApiResponse(400, null, `Invalid JSON format for ${field}`));
        }
      }
    }

    // Process boolean fields
    const isTrendingBool = isTrending === "true" || isTrending === true;
    const isOfflineBool = isOffline === "true" || isOffline === true;

    // Convert courseIntrovideo to embed URL if provided
    const courseIntrovideo = rawIntroVideo
      ? convertToEmbedUrl(rawIntroVideo)
      : undefined;

    // Create course document
    const course = new Course({
      title,
      bundleName,
      category,
      description,
      price: Number(price),
      duration: Number(duration),
      bundle: bundle ? bundle._id : null,
      courseMentorName,
      videos,
      isTrending: isTrendingBool,
      isOffline: isOfflineBool,
      courseIntrovideo,
      ...uploadedFiles,
      ...processedArrays,
    });

    await course.save();

    // Associate course with bundle
    if (bundle) {
      bundle.courses.push(course._id);
      await bundle.save();
    }

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { course },
          "Course created with videos and files successfully"
        )
      );
  } catch (error) {
    console.error("Error creating course:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal server error"));
  }
});


const addVideos = asynchHandler(async (req, res) => {
  const { courseId } = req.params;
  const { videos } = req.body;
  console.log(videos);
  try {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, "Course not found");
    }
    console.log("adding videos ");
    const isCourseEmpty = course.videos.length === 0;

    const newVideos = videos.map((video, index) => ({
      title: video.title,
      url: convertToEmbedUrl(video.url),
      isPreview: (isCourseEmpty && index === 0) || video.isPreview || false,
    }));

    course.videos.push(...newVideos);
    await course.save();
    const updatedCourse = await Course.findById(courseId);
    console.log("videos added");
    console.log(updatedCourse.videos);

    return res
      .status(200)
      .json(new ApiResponse(200, { course }, "Videos added successfully"));
  } catch (error) {
    console.error(error);
    throw new ApiError(500, "Internal server error", error);
  }
});



const getCourseByName = asynchHandler(async (req, res) => {
  const { name } = req.body;
  console.log(name);
  try {
    const course = await Course.find({
      title: { $regex: name, $options: "i" },
    });

    if (course.length === 0) {
      throw new ApiError(404, "No bundles matching the name found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { course }, "Course fetched successfully"));
  } catch (error) {
    console.error(error);
    throw new ApiError(500, "Internal server error", error);
  }
});

// Fetch all courses
const getCourses = asynchHandler(async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("mentor") // Populating mentor
      .populate("students"); // Populating enrolled users

    return res
      .status(200)
      .json(new ApiResponse(200, { courses }, "Courses fetched successfully"));
  } catch (error) {
    console.error(error);
    throw new ApiError(500, "Internal server error");
  }
});

const assignMentor = asynchHandler(async (req, res) => {
  const { courseId, mentorId } = req.body;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, "Course not found");
    }

    // Check if mentor exists
    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      throw new ApiError(404, "Mentor not found");
    }

    // Check if the same mentor is already assigned
    if (course.mentor?.toString() === mentorId) {
      throw new ApiError(400, "Mentor already assigned to this course");
    }

    course.mentor = mentorId; // assign mentor
    await course.save();

    return res
      .status(200)
      .json(new ApiResponse(200, { course }, "Mentor assigned successfully"));
  } catch (error) {
    console.error(error);
    throw new ApiError(500, "Internal server error", error);
  }
});

// Fetch a course by its ID
const getCourseById = asynchHandler(async (req, res) => {
  const { courseId } = req.params;
  console.log("got courses by id")

  try {
    const course = await Course.findById(courseId);

    if (!course) {
      throw new ApiError(404, "Course not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { course }, "Course fetched successfully"));
  } catch (error) {
    console.error(error);
    throw new ApiError(500, "Internal server error");
  }
});

// Fetch courses associated with a specific user
const getMentorCourses = asynchHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    const courses = await Course.find({ courseMentorName: userId });

    if (!courses || courses.length === 0) {
      throw new ApiError(404, "No courses associated with this user");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { courses }, "Courses fetched successfully"));
  } catch (error) {
    console.error(error);
    throw new ApiError(500, "Internal server error");
  }
});



const updateCourse = asynchHandler(async (req, res) => {
  const { courseId } = req.params;

  try {
    console.log("this is id", courseId);

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Invalid course ID format"));
    }

    const updatedFields = { ...req.body };

    // Process videos array
    if (req.body.videos !== undefined) {
      try {
        let parsedVideos;

        if (typeof req.body.videos === "string") {
          parsedVideos = JSON.parse(req.body.videos);
        } else {
          parsedVideos = req.body.videos;
        }

        if (Array.isArray(parsedVideos)) {
          const validVideos = parsedVideos.every(
            (video) => typeof video === "object" && "title" in video && "url" in video
          );

          if (validVideos) {
            // Convert YouTube URLs to embed format
            const processedVideos = parsedVideos.map((video) => ({
              ...video,
              url: convertToEmbedUrl(video.url),
            }));

            updatedFields.videos = processedVideos;
          } else {
            return res.status(400).json(
              new ApiResponse(
                400,
                null,
                "Videos must contain title and url properties"
              )
            );
          }
        } else {
          return res
            .status(400)
            .json(new ApiResponse(400, null, "Videos must be an array"));
        }
      } catch (err) {
        return res
          .status(400)
          .json(new ApiResponse(400, null, "Invalid JSON format for videos"));
      }
    }

    // Upload files to Cloudinary
    const fileTypes = ["imageFile", "pdfFile", "certificateFile"];
    for (const fileType of fileTypes) {
      const file = req.files?.[fileType]?.[0];
      if (file) {
        try {
          const uploadResult = await uploadCloudinary(file.path);
          // Map to correct field name in DB
          let fieldName =
            fileType === "imageFile"
              ? "image"
              : fileType === "pdfFile"
              ? "pdfPath"
              : "certificatePath";

          updatedFields[fieldName] = uploadResult.secure_url;
        } catch (error) {
          console.error(`Cloudinary upload failed for ${fileType}:`, error);
          return res
            .status(500)
            .json(new ApiResponse(500, null, `Failed to upload ${fileType}`));
        }
      }
    }

    // Process arrays that might come as strings
    [
      "whatYouWillLearn",
      "whyCourse",
      "whoShouldEnroll",
      "stillConfused",
      "reasonWhyJoshGuru",
      "courseHighlights",
    ].forEach((arrayField) => {
      if (req.body[arrayField]) {
        try {
          if (typeof req.body[arrayField] === "string") {
            updatedFields[arrayField] = JSON.parse(req.body[arrayField]);
          }

          if (!Array.isArray(updatedFields[arrayField])) {
            return res
              .status(400)
              .json(
                new ApiResponse(400, null, `${arrayField} must be an array`)
              );
          }
        } catch (err) {
          return res
            .status(400)
            .json(
              new ApiResponse(
                400,
                null,
                `Invalid JSON format for ${arrayField}`
              )
            );
        }
      }
    });

    // Handle boolean fields
    ["isTrending", "isOffline"].forEach((boolField) => {
      if (req.body[boolField] !== undefined) {
        if (typeof req.body[boolField] === "string") {
          updatedFields[boolField] =
            req.body[boolField].toLowerCase() === "true";
        }
      }
    });

    // Convert intro video URL to embed format
    if (req.body.courseIntrovideo !== undefined) {
      updatedFields.courseIntrovideo = convertToEmbedUrl(req.body.courseIntrovideo);
    }

    const course = await Course.findByIdAndUpdate(courseId, updatedFields, {
      new: true,
      runValidators: true,
    });

    if (!course) {
      return res.status(404).json(new ApiResponse(404, null, "Course not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { course }, "Course updated successfully"));
  } catch (error) {
    console.error("Error updating course:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal server error"));
  }
});

// Delete a course by its ID
const deleteCourse = asynchHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const course = await Course.findByIdAndDelete(id);
    console.log("course deleting");
    if (!course) {
      throw new ApiError(404, "Course not found");
    }
    // Remove course from bundle if it exists
    // if (course.bundle) {
    //   const bundle = await Bundle.findById(course.bundle);
    //   if (bundle) {
    //     bundle.courses = bundle.courses.filter(
    //       (courseId) => courseId.toString() !== id
    //     );
    //     await bundle.save();
    //   }
    // }
    // Remove course from users who are enrolled
    const users = await User.updateMany(
      { courses: id },
      { $pull: { courses: id } }
    );

    // Remove course from mentors who are assigned
    const mentors = await Mentor.updateMany(
      { courses: id },
      { $pull: { courses: id } }
    );
    return res
      .status(200)
      .json(new ApiResponse(200, { course }, "Course deleted successfully"));
  } catch (error) {
    console.error(error);
    throw new ApiError(500, "Internal server error");
  }
});

const assignCourse = asynchHandler(async (req, res) => {
  const { courseId, studentId } = req.body;

  try {
    // ✅ Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(courseId) ||
      !mongoose.Types.ObjectId.isValid(studentId)
    ) {
      throw new ApiError(400, "Invalid Course or Student ID");
    }

    const course = await Course.findById({_id:courseId});
    if (!course) {
      throw new ApiError(404, "Course not found");
    }

    const user = await User.findById({_id:studentId});
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // ✅ Prevent duplicate assignment
    if (course.students.includes(studentId)) {
      throw new ApiError(400, "User already assigned to course");
    }
    if (user.courses.includes(courseId)) {
      throw new ApiError(400, "Course already assigned to user");
    }

    // ✅ Unlock all videos as previews
    // course.videos = course.videos.map((video) => ({
    //   ...video.toObject(), // safer than _doc
    //   isPreview: true,
    // }));

    // ✅ Handle referral incentive if course is trending
    if (course.isTrending) {
      user.canRefer = true;
      await handleReferralIncentive(user, course);
    }

    // ✅ Assign course to user and vice versa
    course.students.push(studentId);
    user.courses.push(courseId);

    await course.save();
    await user.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        { course, user },
        "Course assigned and all videos unlocked (as previews)"
      )
    );
  } catch (error) {
    console.error("Error assigning course:", error);
  
    const statusCode = error instanceof ApiError && error.statusCode ? error.statusCode : 500;
    const message =
      error instanceof ApiError && error.message
        ? error.message
        : "Internal Server Error";
  
    return res.status(statusCode).json(
      new ApiResponse(statusCode, null, message)
    );
  }
  
});

export {
  createCourse,
  getCourses,
  getCourseById,
  getMentorCourses,
  updateCourse,
  deleteCourse,
  assignCourse,
  getCourseByName,
  assignMentor,
  addVideos,
};
function convertToEmbedUrl(url) {
  try {
    const parsedUrl = new URL(url);
    const videoId = parsedUrl.pathname.split("/").pop();
    const query = parsedUrl.search; // includes ?si=...
    return `https://www.youtube.com/embed/${videoId}${query}`;
  } catch (error) {
    console.error("Invalid URL:", url);
    return url; // return as-is if something fails
  }
}
const handleReferralIncentive = async (user, course) => {
  const oneLevelUser = await User.findOne({
    sharableReferralCode: user.referredByCode,
  });
  // console.log("assign refereal amount")
   if(!oneLevelUser){
    console.log("user does not exists")
   }
  if (oneLevelUser) {
    const bonus = course.price * 0.1;
    console.log(bonus)
    console.log("user exists")
    console.log("checking incentive")
    console.log(user.name)
    oneLevelUser.total_income += bonus;
    oneLevelUser.incentive += bonus;
    if(!oneLevelUser.myTeam.includes(user._id)){
    oneLevelUser.totalTeam += 1;
    oneLevelUser.myTeam.push(user._id   );
    }
    oneLevelUser.incomeHistory.push({
      amount: bonus,
      date: Date.now(),
      from: user._id,
      name: user.name,
      
      courseName: course.title,
      isCourse: true,
    });
    

    await oneLevelUser.save();
  }
};
