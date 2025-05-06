import { ApiError } from "../utils/ApiError.js";
import { asynchHandler } from "../utils/AsynchHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";
import { Mentor } from "../models/mentor.model.js";
// import { uploadCloudinary } from "../utils/Cloudinary.js";
import { Bundle } from "../models/bundle.model.js";
import mongoose from "mongoose";
// Create a course and link it to a bundles
// const createCourse = asynchHandler(async (req, res) => {
//     const {
//         title,
//         image,
//         bundleName,
//         category,
//         video,
//         description,
//         price,
//         duration,
//         courseMentorName
//     } = req.body;

//     try {
//         // Check if the bundle already exists
//         let bundle = await Bundle.findOne({ bundleName });

//         // If the bundle doesn't exist, create a new bundle
//         if (!bundle) {
//             bundle = new Bundle({
//                 bundleName,
//                 // You can customize the description and price as needed
//                 courses: [] // Start with an empty courses array
//             });
//             await bundle.save();
//         }

//         // Create the course and link it to the bundle
//         const course = new Course({
//             title,
//             image,
//             bundle: bundle._id, // Add bundle ID reference here
//             category,
//             video,
//             description,
//             price,
//             duration,
//             courseMentorName
//         });

//         // Save the course to the database
//         await course.save();

//         // Add the course to the bundle's courses array
//         bundle.courses.push(course._id);
//         await bundle.save();

//         return res.status(201).json(new ApiResponse(201, { course }, "Course created successfully"));
//     } catch (error) {
//         console.error(error);
//         throw new ApiError(500, "Internal server error", error);
//     }
// });
// const createCourse = asynchHandler(async (req, res) => {
//   const {
//     title,
//     image,
//     bundleName,
//     category,
//     description,
//     price,
//     duration,
//     courseMentorName,
//     whyCourse,
//     whatYouWillLearn,
//     courseHighlights,
//     whoShouldEnroll,
//     videos = [],
//     isTrending,
//     isOffline,
//   } = req.body;

//   try {
//     // Find or create bundle
//     let bundle = await Bundle.findOne({ bundleName });

//     //   if (!bundle) {
//     //     bundle = new Bundle({
//     //       bundleName,
//     //       courses: []
//     //     });
//     //     await bundle.save();
//     //   }

//     // marking first video as preview true
//     const formattedVideos = videos.map((video, index) => ({
//       title: video.title,
//       url: convertToEmbedUrl(video.url),
//       isPreview: index === 0 ? true : video.isPreview || false,
//     }));
//     const localPdfPath = req.files?.pdfFile
//       ? req.files.pdfFile[0].path
//       : null;
//     const localCertificatePath = req.files?.certificateFile
//       ? req.files.certificateFile[0].path
//       : null;
//     // Create course with videos
//     const course = new Course({
//       title,
//       image,
//       bundleName,
//       description,
//       category,
//       price,
//       duration,
//       bundle: bundle ? bundle._id : null,
//       courseMentorName,
//       videos: formattedVideos,
//       whyCourse,
//       whatYouWillLearn,
//       courseHighlights,
//       whoShouldEnroll,
//       isTrending: isTrending || false,
//       isOffline: isOffline || false,
//       pdfPath:localPdfPath,
//       certificatePath:localCertificatePath,
//     });

//     await course.save();
//     // Add course to bundle
//     if (bundle) {
//       bundle.courses.push(course._id);

//       await bundle.save();
//     }
//     console.log("course created");
//     return res
//       .status(201)
//       .json(
//         new ApiResponse(
//           201,
//           { course },
//           "Course created with videos successfully"
//         )
//       );
//   } catch (error) {
//     console.error(error);
//     throw new ApiError(500, "Internal server error", error);
//   }
// });
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
      whyCourse,
      whatYouWillLearn,
      courseHighlights,
      whoShouldEnroll,
      isTrending,
      isOffline
    } = req.body;
    let { courseIntrovideo } = req.body;
    // console.log("Creating course...");

    // Parse videos if sent as JSON string
    let videos = [];
    if (req.body.videos) {
      try {
        // console.log("Parsing videos...");
        const parsed = JSON.parse(req.body.videos);
        if (Array.isArray(parsed)) {
          videos = parsed;
        } else {
          console.warn("Videos field is not an array.");
        }
      } catch (e) {
        console.warn("Invalid videos format. Proceeding without videos.");
      }
    }

    // Find or create bundle if bundleName is provided
    let bundle = null;
    if (bundleName) {
      bundle = await Bundle.findOne({ bundleName });
      if (!bundle) {
        bundle = new Bundle({ bundleName });
        await bundle.save();
        console.log("New bundle created:", bundleName);
      }
    }

    // Format videos and mark first as preview
    const formattedVideos = videos.map((video, index) => ({
      title: video.title || `Video ${index + 1}`,
      url: video.url ? convertToEmbedUrl(video.url) : "",
      isPreview: index === 0 ? true : video.isPreview || false,
    }));

    // Handle file uploads
    const imageFile = req.files?.imageFile?.[0];
    const localImagePath = imageFile
      ? `/fileStore/${imageFile.filename}`
      : null;

    const pdfFile = req.files?.pdfFile?.[0];
    const localPdfPath = pdfFile ? `/fileStore/${pdfFile.filename}` : null;

    const certificateFile = req.files?.certificateFile?.[0];
    const localCertificatePath = certificateFile
      ? `/fileStore/${certificateFile.filename}`
      : null;
      if(courseIntrovideo !==undefined){
        courseIntrovideo = convertToEmbedUrl(req.body.courseIntrovideo);
      }
    // Create course
    const course = new Course({
      title,
      image: localImagePath,
      bundleName,
      description,
      category,
      price: Number(price),
      duration: Number(duration),
      bundle: bundle ? bundle._id : null,
      courseMentorName,
      videos: formattedVideos,
      whyCourse,
      whatYouWillLearn,
      courseHighlights,
      whoShouldEnroll,
      isTrending: isTrending === "true",
      isOffline: isOffline === "true",
      pdfPath: localPdfPath,
      certificatePath: localCertificatePath,
      courseIntrovideo,
    });

    console.log("Saving course...");
    await course.save();

    // Associate course with bundle
    if (bundle) {
      bundle.courses.push(course._id);
      await bundle.save();
    }

    console.log("Course created successfully");

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
    throw new ApiError(500, "Internal server error", error);
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

// Create a new bundle

// Fetch all bundles or specific bundles by name

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

// Update a course by its ID
// const updateCourse = asynchHandler(async (req, res) => {
//   const { id } = req.params;
//   console.log("on updating course");
//   try {
//     console.log(req.body)
//     const course = await Course.findByIdAndUpdate(id, req.body, {
//       new: true,
//       runValidators: true,
//     });

//     if (!course) {
//       throw new ApiError(404, "Course not found");
//     }

//     return res
//       .status(200)
//       .json(new ApiResponse(200, { course }, "Course updated successfully"));
//   } catch (error) {
//     console.error(error);
//     throw new ApiError(500, "Internal server error");
//   }
// });
// const updateCourse = asynchHandler(async (req, res) => {
//   const { id } = req.params;
//   console.log("on updating course");
//   console.log(req.body);

//   try {
//     const updatedFields = { ...req.body };

//     // ✅ Only parse 'videos' if it's present and a string
//     if (req.body.videos !== undefined) {
//       // If it's a string, try to parse it into an array of objects
//       if (typeof req.body.videos === "string") {
//         try {
//           // Ensure the videos field is a valid array of objects
//           const parsedVideos = JSON.parse(req.body.videos);

//           if (Array.isArray(parsedVideos)) {
//             updatedFields.videos = parsedVideos;
//           } else {
//             return res.status(400).json({
//               error: "'videos' should be an array of objects, but got something else.",
//             });
//           }
//         } catch (err) {
//           return res.status(400).json({
//             error: "Invalid JSON format for 'videos'. It should be a valid array of objects.",
//           });
//         }
//       } else if (Array.isArray(req.body.videos)) {
//         // If it's already an array, we don't need to parse it
//         updatedFields.videos = req.body.videos;
//       } else {
//         // If 'videos' is neither an array nor a valid JSON string, return an error
//         return res.status(400).json({
//           error: "'videos' must be either an array or a valid JSON string representation of an array.",
//         });
//       }
//     }

//     // ✅ Attach file paths only if present
//     const imageFile = req.files?.imageFile?.[0];
//     const pdfFile = req.files?.pdfFile?.[0];
//     const certificateFile = req.files?.certificateFile?.[0];

//     if (imageFile) {
//       updatedFields.image = `/fileStore/${imageFile.filename}`;
//     }

//     if (pdfFile) {
//       updatedFields.pdfPath = `/fileStore/${pdfFile.filename}`;
//     }

//     if (certificateFile) {
//       updatedFields.certificatePath = `/fileStore/${certificateFile.filename}`;
//     }

//     const course = await Course.findByIdAndUpdate(id, updatedFields, {
//       new: true,
//       runValidators: true,
//     });

//     if (!course) {
//       throw new ApiError(404, "Course not found");
//     }

//     return res
//       .status(200)
//       .json(new ApiResponse(200, { course }, "Course updated successfully"));
//   } catch (error) {
//     console.error(error);
//     throw new ApiError(500, "Internal server error");
//   }
// });

const updateCourse = asynchHandler(async (req, res) => {
  const { courseId } = req.params;

  try {
    
    // Validate the ID format
  console.log("this is id")
    console.log(courseId)
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

    // Handle file uploads with sanitized filenames
    ["imageFile", "pdfFile", "certificateFile"].forEach((fileType) => {
      const file = req.files?.[fileType]?.[0];
      if (file) {
        const fieldName =
          fileType === "imageFile"
            ? "image"
            : fileType === "pdfFile"
            ? "pdfPath"
            : "certificatePath";

        updatedFields[fieldName] = `/fileStore/${file.filename}`;
      }
    });

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
    if(req.body.courseIntrovideo !==undefined){
      updatedFields.courseIntrovideo = convertToEmbedUrl(req.body.courseIntrovideo);
    }
    const course = await Course.findByIdAndUpdate(courseId, updatedFields, {
      new: true,
      runValidators: true,
    });

    if (!course) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Course not found"));
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
// const assignCourse = asynchHandler(async (req, res) => {
//   const { courseId, studentId } = req.body;

//   try {
//     console.log(courseId);
//     console.log(studentId);

//     const course = await Course.findById(courseId);
//     if (!course) {
//       throw new ApiError(404, "Course not found");
//     }

//     // ✅ Update all videos to be previewable
//     course.videos = course.videos.map((video) => ({
//       ...video._doc,
//       isPreview: true,
//     }));

//     // ✅ Avoid duplicate assignment
//     if (course.students.includes(studentId)) {
//       throw new ApiError(400, "User already assigned to course");
//     }


//     const user = await User.findById(studentId);
//     if (!user) {
//       throw new ApiError(404, "User not found");
//     }
 
//     if (user.courses.includes(courseId)) {
//       throw new ApiError(400, "Course already assigned to user");
//     }
//     if(course.isTrending){

    
//     const oneLevelUser = await User.findOne({
//       sharableReferralCode: user.referredByCode,
//     });
//     if(oneLevelUser){
//       oneLevelUser.total_income += course.price * 0.1;
//       oneLevelUser.incomeHistory.push({
//         amount: course.price * 0.1,
//         date: Date.now(),
//         from: user._id,
//       });
//       oneLevelUser.totalTeam += 1;
//       oneLevelUser.myTeam.push(user._id);
//       oneLevelUser.incentive += course.price * 0.1;
//       await oneLevelUser.save();
//     }
//   }
//     course.students.push(studentId);
//     user.courses.push(courseId);

//     await course.save();
//     await user.save();

//     return res
//       .status(200)
//       .json(
//         new ApiResponse(
//           200,
//           { course, user },
//           "Course assigned and all videos unlocked (as previews)"
//         )
//       );
//   } catch (error) {
//     console.log(error);
//     throw new ApiError(500, "Internal server error", error);
//   }
// });
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
    course.videos = course.videos.map((video) => ({
      ...video.toObject(), // safer than _doc
      isPreview: true,
    }));

    // ✅ Handle referral incentive if course is trending
    if (course.isTrending) {
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
    throw new ApiError(500, "Internal server error", error);
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
    const bonus = course.price * 0.05;
    console.log(bonus)
    console.log("user exists")

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
    });
    

    await oneLevelUser.save();
  }
};
