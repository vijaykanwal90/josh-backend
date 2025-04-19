import { ApiError } from "../utils/ApiError.js";
import { asynchHandler } from "../utils/AsynchHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";
import { Mentor } from "../models/mentor.model.js";
// import { uploadCloudinary } from "../utils/Cloudinary.js";
import { Bundle } from "../models/bundle.model.js";

// Create a course and link it to a bundle
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
const createCourse = asynchHandler(async (req, res) => {
    const {
        title,
        image,
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
        videos = [],
        isTrending,
        isOffline
    } = req.body;

    try {
        // Find or create bundle
        let bundle = await Bundle.findOne({ bundleName });

        //   if (!bundle) {
        //     bundle = new Bundle({
        //       bundleName,
        //       courses: []
        //     });
        //     await bundle.save();
        //   }

        // marking first video as preview true
        const formattedVideos = videos.map((video, index) => ({
            title: video.title,
            url: convertToEmbedUrl(video.url),
            isPreview: index === 0 ? true : (video.isPreview || false)
        }));

        // Create course with videos
        const course = new Course({
            title,
            image,
            bundleName,
            description,
            category,
            price,
            duration,
            bundle: bundle ? bundle._id : null,
            courseMentorName,
            videos: formattedVideos,
            whyCourse,
            whatYouWillLearn,
            courseHighlights,
            whoShouldEnroll,
            isTrending: isTrending || false,
            isOffline  : isOffline || false
        });

        await course.save();
        // Add course to bundle
        if (bundle) {
            bundle.courses.push(course._id);

            await bundle.save();
        }
        console.log("course created");
        return res.status(201).json(
            new ApiResponse(201, { course }, "Course created with videos successfully")
        );

    } catch (error) {
        console.error(error);
        throw new ApiError(500, "Internal server error", error);
    }
});

const addVideos = asynchHandler(async (req, res) => {
    const { courseId } = req.params;
    const { videos  } = req.body;
    console.log(videos)
    try {
        const course = await Course.findById(courseId);
        if (!course) {
            throw new ApiError(404, "Course not found");
        }
        console.log("adding videos ")
        const isCourseEmpty = course.videos.length === 0;

        const newVideos = videos.map((video, index) => ({
            title: video.title,
            url: convertToEmbedUrl(video.url),
            isPreview: isCourseEmpty && index === 0 || video.isPreview || false

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
    console.log(name)
    try {
        const course = await Course.find({
            title: { $regex: name, $options: "i" }
        });

        if (course.length === 0) {
            throw new ApiError(404, "No bundles matching the name found");
        }

        return res.status(200).json(new ApiResponse(200, { course }, "Course fetched successfully"));
    }
    catch (error) {
        console.error(error);
        throw new ApiError(500, "Internal server error", error);
    }

})


// Fetch all courses
const getCourses = asynchHandler(async (req, res) => {
    try {
      const courses = await Course.find()
        .populate("mentor")  // Populating mentor
        .populate("students");  // Populating enrolled users
  
      return res.status(200).json(
        new ApiResponse(200, { courses }, "Courses fetched successfully")
      );
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
    console.log("updateing course")
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
        console.log("course deleting")
        if (!course) {
            throw new ApiError(404, "Course not found");
        }

        return res.status(200).json(new ApiResponse(200, { course }, "Course deleted successfully"));
    } catch (error) {
        console.error(error);
        throw new ApiError(500, "Internal server error");
    }
});
const assignCourse = asynchHandler(async (req, res) => {
    const { courseId, studentId } = req.body;

    try {
        console.log(courseId);
        console.log(studentId);

        const course = await Course.findById(courseId);
        if (!course) {
            throw new ApiError(404, "Course not found");
        }

        // ✅ Update all videos to be previewable
        course.videos = course.videos.map(video => ({
            ...video._doc,
            isPreview: true
        }));

        // ✅ Avoid duplicate assignment
        if (course.students.includes(studentId)) {
            throw new ApiError(400, "User already assigned to course");
        }

        course.students.push(studentId);

        const user = await User.findById(studentId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        if (user.courses.includes(courseId)) {
            throw new ApiError(400, "Course already assigned to user");
        }

        user.courses.push(courseId);

        await course.save();
        await user.save();

        return res.status(200).json(new ApiResponse(200, { course, user }, "Course assigned and all videos unlocked (as previews)"));
    }
    catch (error) {
        console.log(error);
        throw new ApiError(500, "Internal server error", error);
    }
});




export {
    createCourse,
    getCourses,
    getCourseById,
    getUserCourses,
    updateCourse,
    deleteCourse,
    
    
    assignCourse,
    
    getCourseByName,

    assignMentor,
    addVideos
};
function convertToEmbedUrl(url) {
    try {
        const parsedUrl = new URL(url);
        const videoId = parsedUrl.pathname.split('/').pop();
        const query = parsedUrl.search; // includes ?si=...
        return `https://www.youtube.com/embed/${videoId}${query}`;
    } catch (error) {
        console.error("Invalid URL:", url);
        return url; // return as-is if something fails
    }
}
