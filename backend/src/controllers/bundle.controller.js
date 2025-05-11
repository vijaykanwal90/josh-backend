
import { ApiError } from "../utils/ApiError.js";
import { asynchHandler } from "../utils/AsynchHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Bundle } from "../models/bundle.model.js";
import { User } from "../models/user.model.js";
import { Course } from "../models/course.model.js";
import { ObjectId } from "mongodb";
// import { Video } from "../models/video.model";
import mongoose from "mongoose";

const createBundle = asynchHandler(async (req, res) => {
  const { bundleName, description, price, whyBundle } = req.body;
  const bundleImage = req.files?.bundleImage?.[0];
  try {
    let bundle = await Bundle.findOne({ bundleName });
   
    if(bundle){
      throw new ApiError(400, "Bundle already exists");
    }
    const filePath = bundleImage?`/fileStore/${bundleImage.filename}`:null;
      if(filePath==null){
        throw new ApiError(400, "Bundle image is required");
      }
      bundle = new Bundle({
        bundleName,
        description,
        price,
        whyBundle,
        bundleImage: filePath,
        courses: [],
      });

      await bundle.save();
      console.log("bundle created successfyly");
    
    return res
      .status(201)
      .json(new ApiResponse(201, { bundle }, "Bundle created successfully"));
  } catch (error) {
    console.error(error);
    throw new ApiError(500, "Internal server error", error);
  }
});
// Update an existing bundle
const updateBundle = asynchHandler(async (req, res) => {
  const { id } = req.params;

  // Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Invalid bundle ID format"));
  }

  try {
    const existingBundle = await Bundle.findById(id);

    if (!existingBundle) {
      throw new ApiError(404, "Bundle not found");
    }

    // Collect updated fields
    const { bundleName, description, price, whyBundle,isSpecial,discount,hasDiscount } = req.body;

    const updates = {};

    if (bundleName !== undefined) updates.bundleName = bundleName;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = price;
    if (whyBundle !== undefined) updates.whyBundle = whyBundle;
    if (isSpecial !== undefined) updates.isSpecial = isSpecial;
    if (discount !== undefined) updates.discount = discount;
    if (hasDiscount !== undefined) updates.hasDiscount = hasDiscount;
    if(discount ||  hasDiscount){
      updates.price = price - (price * discount) / 100;
    }



    // Handle optional image file
    const bundleImage = req.files?.bundleImage?.[0];
    if (bundleImage) {
      console.log("New bundle image:", bundleImage);
      updates.bundleImage = `/fileStore/${bundleImage.filename}`;
    }

    const updatedBundle = await Bundle.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json(
      new ApiResponse(200, { bundle: updatedBundle }, "Bundle updated successfully")
    );
  } catch (error) {
    console.error("Update bundle error:", error);
    throw new ApiError(500, "Internal server error");
  }
});


const getBundles = asynchHandler(async (req, res) => {
  const { bundleName } = req.query;

  try {
    let bundles;
    if (bundleName && bundleName !== "all") {
      bundles = await Bundle.find({ bundleName }).populate("courses");
    } else {
      bundles = await Bundle.find({}).populate("courses");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { bundles }, "Bundles fetched successfully"));
  } catch (error) {
    console.error(error);
    throw new ApiError(500, "Internal server error", error);
  }
});
const getBundleByName = asynchHandler(async (req, res) => {
  const { name } = req.body;
  try {
    const bundle = await Bundle.find({
      bundleName: { $regex: name, $options: "i" }, // "i" for case-insensitive matching
    });

    if (bundle.length === 0) {
      throw new ApiError(404, "No bundles matching the name found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { bundle }, "Bundle fetched successfully"));
  } catch (error) {
    console.error(error);
    throw new ApiError(500, "Internal server error", error);
  }
});
const getBundleById = asynchHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const bundle = await Bundle.findById(id).populate("courses");
    if (!bundle) {
      throw new ApiError(404, "Bundle not found");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, { bundle }, "Bundle fetched successfully"));
  } catch (error) {
    console.error(error);
    throw new ApiError(500, "Internal server error", error);
  }
});

const getAllBundles = asynchHandler(async (req, res) => {
  try {
    console.log("Fetching all bundles");
    // Fetch all bundles and populate the courses field
    const bundles = await Bundle.find().populate("courses");
    return res
      .status(200)
      .json(new ApiResponse(200, { bundles }, "Bundles fetched successfully"));
  } catch (error) {
    console.error(error);
    throw new ApiError(500, "Internal server error");
  }
});
// const assignBundle = asynchHandler(async (req, res) => {
//   // const {userId} = req.body;
//   const bundleId = req.body.bundleId;
//   const userId = req.body.studentId;
//   try {
//     // console.log(bundleId)
//     // console.log(userId)
//      if (
//           !mongoose.Types.ObjectId.isValid(bundleId) ||
//           !mongoose.Types.ObjectId.isValid(userId)
//         ) {
//           throw new ApiError(400, "Invalid Course or Student ID");
//         }
//     const bundle = await Bundle.findById({_id:bundleId});
//     if (!bundle) {
//       throw new ApiError(404, "Bundle not found");
//     }
//     if (bundle.students.includes(userId)) {
//       throw new ApiError(400, "User already assigned to course");
//     }
//     bundle.students.push(userId);
//     const user = await User.findById(userId);
//     if (!user) {
//       throw new ApiError(404, "User not found");
//     }
//     if (user.bundles.includes(bundleId)) {
//       throw new ApiError(400, "Bundle already assigned to user");
//     }
//     user.bundles.push(bundleId);
//     const oneLevelUser = await User.findOne({
//       sharableReferralCode: user.referredByCode,
//     });
//     if (!oneLevelUser) {
//       throw new ApiError(404, "User not found");
//     }
//     // one level up user
//     if (oneLevelUser) {
//       const bonus = bundle.price * 0.25;
//       oneLevelUser.total_income += bonus;
    
//       // oneLevelUser.myTeam.push(user._id);
//       let alreadyInTeam = oneLevelUser.myTeam.some(id => id.toString() === user._id.toString());
//       if (!alreadyInTeam) {
//         oneLevelUser.myTeam.push(user._id);
//       oneLevelUser.totalTeam += 1;
//       }
//       oneLevelUser.incomeHistory.push({
//         amount: bonus,
//         date: Date.now(),
//         from: user._id,
//       });
//       await oneLevelUser.save();
//     }
//     // second level user;
//     const secondLevelUser = await User.findOne({
//       sharableReferralCode: oneLevelUser.referredByCode,
//     });
//     if (secondLevelUser) {
//       // secondLevelUser.today_income += bundle.price * 0.1;
//       const bonus = bundle.price * 0.1;
//       secondLevelUser.total_income += bonus;
//       let alreadyInTeam = secondLevelUser.myTeam.some(id => id.toString() === user._id.toString());
//       if (!alreadyInTeam) {
//         secondLevelUser.myTeam.push(user._id);
//       secondLevelUser.totalTeam += 1;
//       }
//       secondLevelUser.incomeHistory.push({
//         amount: bonus,
//         date: Date.now(),
//         from: user._id,
//       });
//       await secondLevelUser.save();
//     }
//     await bundle.save();
//     await user.save();
//     return res
//       .status(200)
//       .json(
//         new ApiResponse(200, { bundle, user }, "Bundle assigned successfully")
//       );
//   } catch (error) {
//     console.log(error);
//     throw new ApiError(500, "Error while assigning bundle", error);
//   }
// });
const assignBundle = asynchHandler(async (req, res) => {
  const bundleId = req.body.bundleId;
  const userId = req.body.studentId;
  console.log(bundleId);
  console.log(userId);

  try {
    if (
      !mongoose.Types.ObjectId.isValid(bundleId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      throw new ApiError(400, "Invalid Bundle or Student ID");
    }

    const bundle = await Bundle.findById(bundleId);
    if (!bundle) throw new ApiError(404, "Bundle not found");
    if (bundle.students.includes(userId))
      throw new ApiError(400, "User already assigned to course");

    bundle.students.push(userId);

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");
    if (user.bundles.includes(bundleId))
      throw new ApiError(400, "Bundle already assigned to user");

    user.bundles.push(bundleId);
    user.canRefer = true;
    const oneLevelUser = await User.findOne({
      sharableReferralCode: user.referredByCode,
    });
    if (oneLevelUser) {
      // throw new ApiError(404, "Referrer user not found");
      const bonus = bundle.price * 0.25;
      oneLevelUser.total_income += bonus;
      if (!oneLevelUser.myTeam.some(id => id.toString() === user._id.toString())) {
        oneLevelUser.myTeam.push(user._id);
        oneLevelUser.totalTeam += 1;
      }
      oneLevelUser.incomeHistory.push({
        amount: bonus,
        date: Date.now(),
        from: user._id,
      });
      await oneLevelUser.save();
      const secondLevelUser = oneLevelUser?.referredByCode
      ? await User.findOne({ sharableReferralCode: oneLevelUser.referredByCode })
      : null;
//  second - akshay 
//  onelevel- modi- 
//  current- rahul
//  vijay
// vivek
    if (secondLevelUser) {
      const bonus2 = bundle.price * 0.3;
      secondLevelUser.total_income += bonus2;
      if (!secondLevelUser.myTeam.some(id => id.toString() === user._id.toString())) {
        secondLevelUser.myTeam.push(user._id);
        secondLevelUser.totalTeam += 1;
      }
      secondLevelUser.incomeHistory.push({
        amount: bonus2,
        date: Date.now(),
        from: user._id,
      });
      await secondLevelUser.save();
    }
    }
   

   

    await Promise.all([bundle.save(), user.save()]);

    return res.status(200).json(
      new ApiResponse(200, { bundle, user }, "Bundle assigned successfully")
    );

  } catch (error) {
    console.error("Assign Bundle Error:", error);
    throw new ApiError(500, "Error while assigning bundle", error);
  }
});

const addCourseToBundle = asynchHandler(async(req,res)=>{
    try {
        const {bundleId} = req.body;
        const {courses} = req.body;
        console.log("hello from the add course")
        const bundle = await Bundle.findById(bundleId);
        if(!bundle){
            throw new ApiError(404,"Bundle not found");
        }
        if(!courses || courses.length === 0){
            throw new ApiError(400,"Courses are required");
        }
        // Check if the courses exist
        // console.log("courses",courses);
        const courseIds = courses.map((course) => new ObjectId(course));
        // console.log("courseIds",courseIds);
        const coursesToAdd = await Course.find({ _id: { $in: courseIds } });
        if (coursesToAdd.length === 0) {
            throw new ApiError(404, "No courses found");
        }
        // Check if the courses are already in the bundle
        const existingCourses = bundle.courses.filter((course) =>
            coursesToAdd.some((newCourse) => newCourse._id.equals(course))
        );
        if (existingCourses.length > 0) {
            throw new ApiError(400, "Some courses are already in the bundle");
        }
        // Add bundle and bundleName to the courses
        for (const course of coursesToAdd) {
            course.bundle = bundle._id;
            course.bundleName = bundle.bundleName;
            await course.save();
        }
        // Add the new courses to the bundle
        bundle.courses.push(...coursesToAdd);
        await bundle.save();
        return res.status(200).json(new ApiResponse(200,{bundle},"Courses added to bundle successfully"));
    } catch (error) {
        console.error("Error adding courses to bundle:", error);
        throw new ApiError(500, "error while adding the course", error);  
    }
}) 


const removeCourseFromBundle = asynchHandler(async(req,res)=>{
  try {
    const {bundleId} = req.body;
    const {courseId} = req.body;
    const bundle = await Bundle.findById(bundleId);
    if(!bundle){
        throw new ApiError(404,"Bundle not found");
    }
    const course = await Course.findById(courseId);
    if(!course){
        throw new ApiError(404,"Course not found");
    }
    // Check if the course is already in the bundle
    const existingCourse = bundle.courses.find((c) => c._id.equals(courseId));
    if (!existingCourse) {
        throw new ApiError(400, "Course not found in the bundle");
    }
    // Remove the course from the bundle
    const removedBundleFromCourse = await Course.findByIdAndUpdate(courseId, { $unset: { bundle: "",bundleName:"" } }, { new: true });
    if (!removedBundleFromCourse) {
        throw new ApiError(404, "Bundle not removed from course");
    }
  
    bundle.courses = bundle.courses.filter((c) => !c._id.equals(courseId));
    await bundle.save();
    return res.status(200).json(new ApiResponse(200,{bundle},"Course removed from bundle successfully"));
  } catch (error) {
    console.error("Error removing course from bundle:", error);
    throw new ApiError(500, "error while removing the course", error);  
    
  }
})

const removeBundle = asynchHandler(async (req, res) => {
  const { id } = req.params;
  const bundleId = new mongoose.Types.ObjectId(id);

  try {
    const bundle = await Bundle.findByIdAndDelete(bundleId);
    if (!bundle) {
      throw new ApiError(404, "Bundle not found");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Bundle deleted successfully"));
  } catch (error) {
    console.error(error);
    throw new ApiError(500, "Internal server error", error);
  }
}
);


export {
  createBundle,
  updateBundle,
  getBundles,
  getBundleById,
  getAllBundles,
  assignBundle,
  getBundleByName,
  addCourseToBundle,
  removeCourseFromBundle,
  removeBundle,
};
