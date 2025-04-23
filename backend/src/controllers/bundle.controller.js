// import { Router } from "express";
// import { userAuth } from "../middlewares/auth.middleware";
// import { checkRole } from "../middlewares/role.middleware";
import { ApiError } from "../utils/ApiError.js";
import { asynchHandler } from "../utils/AsynchHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Bundle } from "../models/bundle.model.js";
import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";
// import { Video } from "../models/video.model";
import mongoose from "mongoose";

const createBundle = asynchHandler(async (req, res) => {
  const { bundleName, description, price, whyBundle, bundleImage } = req.body;

  try {
    let bundle = await Bundle.findOne({ bundleName });
    if (!bundle) {
      bundle = new Bundle({
        bundleName,
        description,
        price,
        whyBundle,
        bundleImage: bundleImage || "pending",
        courses: [],
      });
      await bundle.save();
    } else {
      throw new ApiError(400, "Bundle already exists");
    }

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
  // console.log(id);
  try {
    const updatedBundle = await Bundle.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedBundle) {
      throw new ApiError(404, "Bundle not found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, { updatedBundle }, "Bundle updated successfully")
      );
  } catch (error) {
    console.error(error);
    throw new ApiError(500, "Internal server error", error);
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

  try {
    if (
      !mongoose.Types.ObjectId.isValid(bundleId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      throw new ApiError(400, "Invalid Course or Student ID");
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

    const oneLevelUser = await User.findOne({
      sharableReferralCode: user.referredByCode,
    });
    if (!oneLevelUser) throw new ApiError(404, "Referrer user not found");

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

    if (secondLevelUser) {
      const bonus2 = bundle.price * 0.1;
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

    await Promise.all([bundle.save(), user.save()]);

    return res.status(200).json(
      new ApiResponse(200, { bundle, user }, "Bundle assigned successfully")
    );

  } catch (error) {
    console.error("Assign Bundle Error:", error);
    throw new ApiError(500, "Error while assigning bundle", error);
  }
});

export {
  createBundle,
  updateBundle,
  getBundles,
  getBundleById,
  getAllBundles,
  assignBundle,
  getBundleByName,
};
