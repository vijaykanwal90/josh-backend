import { ApiError } from "../utils/ApiError.js";
import { asynchHandler } from "../utils/AsynchHandler.js";
import { Course } from "../models/course.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadCloudinary } from "../utils/Cloudinary.js";
import { Bundle } from "../models/bundle.model.js";
// const createCourse = asynchHandler(async (req, res) => {
//     const { title,
//         image,
//         bundleName,
//         category,
//         video,
//         description,
//         price,
//         duration,
//         courseMentorName } = req.body;
        
//     try {
        
        
//         const course = new Course({
//             title,
//             image,
//             bundleName,
//             category,
//             video,
//             description,
//             price,
//             duration,
//             courseMentorName,


//         });
//         await course.save();
//         console.log("course controller")
//         console.log(course)



//         // const validateCourse = validateCourseInput({ title, description, price, duration });
//         // if (!validateCourse) {
//         //     throw new ApiError(400, "Invalid input");
//         // }
//         return res.status(200).json(new ApiResponse(201, { course }, "Course created successfully"));
//     } catch (error) {
//         console.log(error);
//         throw new ApiError(500, "Internal server error", error);
//     }
// }
// );
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
                // description: `${bundleName} `, // You can customize the description
                
                
                // price: , // You can decide how you want to handle the bundle price
                courses: [] // Start with an empty courses array
            });

            await bundle.save();
        }

        // Create the course and link it to the bundle
        const course = new Course({
            title,
            image,
            bundle: bundle._id,  // Add bundle ID reference here
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

        console.log("Course created and added to bundle");
        console.log(course);

        return res.status(200).json(new ApiResponse(201, { course }, "Course created successfully"));
    } catch (error) {
        console.error(error);
        throw new ApiError(500, "Internal server error", error);
    }
});
const createBundle = asynchHandler(async(req,res)=>{
     const {
        bundleName,
        description,
        oldPrice,
        price
     } = req.body;
     try{
        let bundle = await Bundle.findOne({ bundleName });
        if(!bundle){
            bundle = new Bundle({
                bundleName,
                description,
                oldPrice,
                price,
                courses: []
            });
            await bundle.save();
        }
       
        return res.status(200).json(new ApiResponse(201, { bundle }, "bundle created successfully"));
     }
     catch(error){
         console.error(error);
         throw new ApiError(500, "Internal server error", error);

     }
})
const updateBundle = asynchHandler(async(req,res)=>{
    const {id} = req.params;
    
    const bundle = await Bundle.findById(id);
    if(!bundle){
        throw new ApiError(404, "Bundle not found");
    }
    try{
        const updatedBundle = await Bundle.findByIdAndUpdate
        (id,req.body,{
            new:true,
            runValidators:true
        });
        return res.status(200).json(new ApiResponse(200, { updatedBundle }, "Bundle updated successfully"));
    }
    catch(error){
        console.error(error);
        throw new ApiError(500, "Internal server error", error);
    }
})
const getBundles = asynchHandler(async(req,res)=>{
      const {bundleName} = req.query;
      try{
        let bundles;
        if(bundleName && bundleName !== "all"){
            bundles = await Bundle.find({bundleName});
      }
        else{
            bundles = await Bundle.find({});
        }
        return res.status(200).json(new ApiResponse(200, { bundles }, "bundles fetched successfully"));
    }
      catch(error){
        console.error(error);
        throw new ApiError(500, "Internal server error", error);
      }
});
const getCourses = asynchHandler(async (req, res) => {
    try {
        const courses = await Course.find();
        return res.status(200).json(new ApiResponse(200, { courses }, "Courses fetched successfully"));
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
        return res.status(200).json(new ApiResponse(200, { course }, "Course fetched successfully"));
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
        return res.status(200).json(new ApiResponse(200, { courses }, "Courses fetched successfully"));
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
        return res.status(200).json(new ApiResponse(200, { course }, "Course updated successfully"));
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
        return res.status(200).json(new ApiResponse(200, { course }, "Course deleted successfully"));
    } catch (error) {
        throw new ApiError(500, "Internal server error");
    }
}
);





export { createCourse, getCourses, getCourseById, getUserCourses, updateCourse, deleteCourse , createBundle , updateBundle , getBundles};