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

const createBundle = asynchHandler(async (req, res) => {
    const {
        bundleName,
        description,
        price,
        whyBundle,
        bundleImage
    } = req.body;

    try {
        let bundle = await Bundle.findOne({ bundleName });
        if (!bundle) {
            bundle = new Bundle({
                bundleName,
                description,
                price,
                whyBundle,
                bundleImage: bundleImage || "pending",
                courses: []
            });
            await bundle.save();
        }
        else {
            throw new ApiError(400, "Bundle already exists");
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
    console.log(id);
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
const getBundleByName = asynchHandler(async (req, res) => {
    const { name } = req.body;
    try {
        const bundle = await Bundle.find({
            bundleName: { $regex: name, $options: "i" } // "i" for case-insensitive matching
        });

        if (bundle.length === 0) {
            throw new ApiError(404, "No bundles matching the name found");
        }

        return res.status(200).json(new ApiResponse(200, { bundle }, "Bundle fetched successfully"));
    }
    catch (error) {
        console.error(error);
        throw new ApiError(500, "Internal server error", error);
    }

})
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
        console.log("Fetching all bundles");
        // Fetch all bundles and populate the courses field
        const bundles = await Bundle.find().populate("courses");
        return res.status(200).json(new ApiResponse(200, { bundles }, "Bundles fetched successfully"));
    } catch (error) {
        console.error(error);
        throw new ApiError(500, "Internal server error");
    }
})
const assignBundle = asynchHandler(async (req, res) => {
    // const {userId} = req.body;
    const bundleId = req.body.courseId;
    const userId = req.body.studentId;
    try {
        // console.log(bundleId)
        // console.log(userId)
        const bundle = await Bundle.findById(bundleId);
        if (!bundle) {
            throw new ApiError(404, "Bundle not found");
        }
        if (bundle.students.includes(userId)) {
            throw new ApiError(400, "User already assigned to course");
        }
        bundle.students.push(userId);
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        if (user.bundles.includes(bundleId)) {
            throw new ApiError(400, "Bundle already assigned to user");
        }
        user.bundles.push(bundleId);
        const oneLevelUser = await User.findOne({ sharableReferralCode: user.referredByCode });
        if (!oneLevelUser) {
            throw new ApiError(404, "User not found");
        }
        // one level up user
        if (oneLevelUser) {
            oneLevelUser.total_income += bundle.price * 0.25;
            oneLevelUser.today_income += bundle.price * 0.25;
            oneLevelUser.last_7_days_income += bundle.price * 0.25;
            oneLevelUser.last_30_days_income += bundle.price * 0.25;
            oneLevelUser.myTeam.push(user._id);
            oneLevelUser.totalTeam += 1;
            await oneLevelUser.save();
        }
        // second level user;
        const secondLevelUser = await User.findOne({ sharableReferralCode: oneLevelUser.referredByCode });
        if (secondLevelUser) {
            secondLevelUser.today_income += bundle.price * 0.10;
            secondLevelUser.total_income += secondLevelUser.today_income;

            secondLevelUser.last_7_days_income += bundle.price * 0.10;
            secondLevelUser.last_30_days_income += bundle.price * 0.10;
            secondLevelUser.myTeam.push(user._id);
            secondLevelUser.totalTeam += 1;
            await secondLevelUser.save();
        }
        await bundle.save();
        await user.save();
        return res.status(200).json(new ApiResponse(200, { bundle, user }, "Bundle assigned successfully"));
    }
    catch (error) {
        console.log(error)
        throw new ApiError(500, "Error while assigning bundle", error);
    }
})
export {createBundle,updateBundle,getBundles,getBundleById,getAllBundles,assignBundle,getBundleByName}