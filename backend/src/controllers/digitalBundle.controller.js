import { asynchHandler } from "../utils/AsynchHandler.js";
import DigitalBundle from "../models/digitalBundle.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadCloudinary } from "../utils/Cloudinary.js";
import mongoose from "mongoose";
import fs from 'fs';

// Create a new Digital Bundle
const createDigitalBundle = asynchHandler(async (req, res) => {
    try {
        const { title, description, price, discountPrice, features, video, bonusSkills, sectionOne, sectionTwo, sectionThree, courses, mentor, CertificationSection, FAQSchema } = req.body;
        if (!title) {
            throw new ApiError(400, "Title is required");
        }
        if (!description) {
            throw new ApiError(400, "Description is required");
        }
        if (!price) {
            throw new ApiError(400, "Price is required");
        }
        if (!discountPrice) {
            throw new ApiError(400, "Discount price is required");
        }

        let parsedFeatures = {};
        if (features) {
            parsedFeatures = JSON.parse(features);

            // Validate features structure
            const requiredFields = ["coursesIncluded", "accessType", "availableLanguages"];
            for (const field of requiredFields) {
                if (
                    parsedFeatures[field] === undefined || 
                    parsedFeatures[field] === null ||
                    parsedFeatures[field] === ""
                ) {
                    throw new ApiError(400, `Missing or invalid feature: ${field}`);
                    }
            }
        }

        let parsedVideo = [];
        if (video) {
            parsedVideo = JSON.parse(video);

            if (!Array.isArray(parsedVideo)) {
            throw new ApiError(400, "Video must be an array");
            }

            for (let i = 0; i < parsedVideo.length; i++) {
            const vid = parsedVideo[i];
            if (!vid.title) {
                throw new ApiError(400, `Missing video field: title at index ${i}`);
            }
            if (!vid.videoFile && !req.files?.video?.[i]) {
                throw new ApiError(400, `Missing video field: videoFile at index ${i}`);
            }
            // If videoFile is not present, upload the file to Cloudinary
            if (!vid.videoFilr && req.files?.video?.[i]) {
                const uploadResult = await uploadCloudinary(req.files.video[i].path, "video");
                vid.videoFile = uploadResult.secure_url;
                // Optionally remove local file after upload
                
            }
            }
        }

        let parsedBonusSkills = {};
        if (bonusSkills) {
            parsedBonusSkills = JSON.parse(bonusSkills);

            // Collect missing fields
            const missingFields = [];
            if (!parsedBonusSkills.title) {
            missingFields.push("title");
            }
            if (!Array.isArray(parsedBonusSkills.images)) {
            missingFields.push("images");
            }

            // If images is present, check length
            if (Array.isArray(parsedBonusSkills.images)) {
            if (parsedBonusSkills.images.length > 5) {
                throw new ApiError(400, "No more than 5 images are allowed in bonusSkills.images");
            }
            }

            if (missingFields.length > 0) {
            throw new ApiError(400, `Missing bonusSkills fields: ${missingFields.join(", ")}`);
            }

            // Upload images to Cloudinary if they are file paths (not URLs)
            if (req.files?.bonusSkillsImages && req.files.bonusSkillsImages.length > 0) {
            const uploadedImages = [];
            for (let i = 0; i < req.files.bonusSkillsImages.length; i++) {
                const uploadResult = await uploadCloudinary(req.files.bonusSkillsImages[i].path, "image");
                uploadedImages.push(uploadResult.secure_url);
                
            }
            parsedBonusSkills.images = uploadedImages;
            }
        }

        let parsedSectionOne = {};
        if (sectionOne) {
            parsedSectionOne = JSON.parse(sectionOne);

            // Validate required fields
            const requiredFields = ["title", "images", "highlights"];
            for (const field of requiredFields) {
                if (!parsedSectionOne[field]) {
                    throw new ApiError(400, `Missing sectionOne field: ${field}`);
                }
            }
            // Validate highlights structure
            if (!Array.isArray(parsedSectionOne.highlights) || parsedSectionOne.highlights.length === 0) {
                throw new ApiError(400, "sectionOne.highlights must be a non-empty array");
            }
            for (const highlight of parsedSectionOne.highlights) {
                if (!highlight.title || !highlight.description) {
                    throw new ApiError(400, "Each highlight must have title and description");
                }
            }

            // Upload image if it's a file path
            if (req.files?.sectionOneImage) {
                const uploadResult = await uploadCloudinary(req.files.sectionOneImage.path, "image");
                parsedSectionOne.images = uploadResult.secure_url;
                
            }
        }

        let parsedSectionTwo = {};
        if (sectionTwo) {
            parsedSectionTwo = JSON.parse(sectionTwo);

            // Validate required fields
            const requiredFields = ["title", "highlights"];
            for (const field of requiredFields) {
                if (!parsedSectionTwo[field]) {
                    throw new ApiError(400, `Missing sectionTwo field: ${field}`);
                }
            }
            // Validate highlights structure
            if (!Array.isArray(parsedSectionTwo.highlights) || parsedSectionTwo.highlights.length === 0) {
                throw new ApiError(400, "sectionTwo.highlights must be a non-empty array");
            }
            for (const highlight of parsedSectionTwo.highlights) {
                if (!highlight.title || !highlight.description || !highlight.images) {
                    throw new ApiError(400, "Each highlight must have title, description, and images");
                }
            }

            // upload the image from sectionTwo highlights
            if (req.files?.sectionTwoImage) {
                const uploadResult = await uploadCloudinary(req.files.sectionTwoImage.path, "image");
                parsedSectionTwo.highlights.forEach(highlight => {
                    highlight.images = uploadResult.secure_url;
                });
                
            }
        }

        let parsedSectionThree = {};
        if (sectionThree) {
            parsedSectionThree = JSON.parse(sectionThree);

            // Validate required fields
            const requiredFields = ["title", "highlights"];
            for (const field of requiredFields) {
                if (!parsedSectionThree[field]) {
                    throw new ApiError(400, `Missing sectionThree field: ${field}`);
                }
            }
            // Validate highlights structure
            if (!Array.isArray(parsedSectionThree.highlights) || parsedSectionThree.highlights.length === 0) {
                throw new ApiError(400, "sectionThree.highlights must be a non-empty array");
            }
            for (const highlight of parsedSectionThree.highlights) {
                if (!highlight.title || !highlight.description || !highlight.images) {
                    throw new ApiError(400, "Each highlight must have title, description, and images");
                }
            }

            // upload the image from sectionThree highlights
            if (req.files?.sectionThreeImage) {
                const uploadResult = await uploadCloudinary(req.files.sectionThreeImage.path, "image");
                parsedSectionThree.highlights.forEach(highlight => {
                    highlight.images = uploadResult.secure_url;
                });
                
            }
        }

        let parsedCourses = [];
        if (courses) {
            parsedCourses = JSON.parse(courses);

            // Validate courses structure
            if (
            !parsedCourses.title ||
            !parsedCourses.description ||
            !Array.isArray(parsedCourses.steps) ||
            parsedCourses.steps.length === 0
            ) {
            throw new ApiError(400, "Courses must have title, description, and a non-empty steps array");
            }

            parsedCourses.steps.forEach((step, idx) => {
            if (
                typeof step.stepNumber !== "number" ||
                !step.title ||
                !step.subtitle ||
                !step.description
            ) {
                throw new ApiError(400, `Each step must have stepNumber (number), title, subtitle, and description. Error at step index ${idx}`);
            }
            });
        }

        let parsedMentor = {};
        if (mentor) {
            parsedMentor = JSON.parse(mentor);

            // Validate required fields
            const requiredFields = ["image", "title", "name", "description"];
            for (const field of requiredFields) {
            if (!parsedMentor[field]) {
                throw new ApiError(400, `Missing mentor field: ${field}`);
            }
            }

            // Upload mentor image if it's a file
            if (req.files?.mentorImage) {
            const uploadResult = await uploadCloudinary(req.files.mentorImage.path, "image");
            parsedMentor.image = uploadResult.secure_url;
            
            }
        }
        
        let parsedCertificationSection = {};
        if (CertificationSection) {
            parsedCertificationSection = JSON.parse(CertificationSection);

            // Validate required fields
            const requiredFields = ["title", "description", "points"];
            for (const field of requiredFields) {
            if (!parsedCertificationSection[field]) {
                throw new ApiError(400, `Missing CertificationSection field: ${field}`);
            }
            }
            // Validate points is a non-empty array of strings
            if (
            !Array.isArray(parsedCertificationSection.points) ||
            parsedCertificationSection.points.length === 0 ||
            !parsedCertificationSection.points.every(point => typeof point === "string")
            ) {
            throw new ApiError(400, "CertificationSection.points must be a non-empty array of strings");
            }

            // Upload image if it's a file
            if (req.files?.certificationSectionImage) {
            const uploadResult = await uploadCloudinary(req.files.certificationSectionImage.path, "image");
            parsedCertificationSection.image = uploadResult.secure_url;
            
            }
        }

        let parsedFAQSchema = {};
        if (FAQSchema) {
            parsedFAQSchema = JSON.parse(FAQSchema);

            // Validate required fields
            if (!parsedFAQSchema.title) {
            throw new ApiError(400, "FAQSchema title is required");
            }
            if (
            !Array.isArray(parsedFAQSchema.questions) ||
            parsedFAQSchema.questions.length === 0
            ) {
            throw new ApiError(400, "FAQSchema.questions must be a non-empty array");
            }
            parsedFAQSchema.questions.forEach((q, idx) => {
            if (!q.question) {
                throw new ApiError(400, `FAQSchema.questions[${idx}].question is required`);
            }
            if (!q.answer) {
                throw new ApiError(400, `FAQSchema.questions[${idx}].answer is required`);
            }
            });
        }

        // Create the digital bundle
        const digitalBundle = new DigitalBundle({
            title,
            description,
            price,
            discountPrice,
            features: parsedFeatures,
            video: parsedVideo,
            bonusSkills: parsedBonusSkills,
            sectionOne: parsedSectionOne,
            sectionTwo: parsedSectionTwo,
            sectionThree: parsedSectionThree,
            courses: parsedCourses,
            mentor: parsedMentor,
            CertificationSection: parsedCertificationSection,
            FAQSchema: parsedFAQSchema
        });
        // Save the digital bundle to the database
        const savedBundle = await digitalBundle.save();
        return res
            .status(201)
            .json(new ApiResponse(201, savedBundle, "Digital bundle created successfully"));
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to create digital bundle");
    }
});

// Update an existing Digital Bundle by ID
const updateDigitalBundle = asynchHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const updateFields = {};
        const {
            title, description, price, discountPrice, 
            features, video, bonusSkills, sectionOne,
            sectionTwo, sectionThree, courses, mentor,
            CertificationSection, FAQSchema
        } = req.body;

        console.log("Update Digital Bundle Request Body:", req.files);
        

        // Find existing bundle
        const existingBundle = await DigitalBundle.findById(id);
        if (!existingBundle) {
            throw new ApiError(404, "Digital bundle not found");
        }

        // Helper function for Cloudinary upload
        const uploadFile = async (file, type = "image") => {
            const uploadResult = await uploadCloudinary(file.path, type);
            return uploadResult.secure_url;
        };

        // Process simple fields
        if (title !== undefined) {
            if (!title.trim()) throw new ApiError(400, "Title is required");
            updateFields.title = title;
        }
        if (description !== undefined) updateFields.description = description;
        if (price !== undefined) {
            if (isNaN(price)) throw new ApiError(400, "Price must be a number");
            updateFields.price = price;
        }
        if (discountPrice !== undefined) {
            if (isNaN(discountPrice)) throw new ApiError(400, "Discount price must be a number");
            updateFields.discountPrice = discountPrice;
        }

        // Process features
        if (features !== undefined) {
            let parsedFeatures = JSON.parse(features);
            const requiredFields = ["coursesIncluded", "accessType", "availableLanguages"];
            for (const field of requiredFields) {
                if (!parsedFeatures[field]) {
                    throw new ApiError(400, `Missing feature: ${field}`);
                }
            }
            updateFields.features = parsedFeatures;
        }

        // Process videos
        if (video !== undefined) {
            let parsedVideo = JSON.parse(video);
            if (!Array.isArray(parsedVideo)) {
                throw new ApiError(400, "Video must be an array");
            }
            
            // Get all video files with indexed field names
            const videoFiles = req.files?.filter(file => file.fieldname.startsWith('videoFile_')) || [];
            console.log("Video Files:", videoFiles);
            
            // Create index-to-file mapping
            const videoMap = new Map();
            videoFiles.forEach(file => {
                const index = parseInt(file.fieldname.split('_')[1]);
                if (!isNaN(index)) {
                    videoMap.set(index, file);
                }
            });

            const finalVideoArray = [];

            for (let i = 0; i < parsedVideo.length; i++) {
                const vid = parsedVideo[i];
                
                if (!vid.title) {
                    throw new ApiError(400, `Missing video title at index ${i}`);
                }

                // Start with existing URL
                let videoUrl = vid.videoFile || '';
                console.log("Video URL before upload:", videoUrl);
                
                // Upload new file if provided for this specific index
                if (videoMap.has(i)) {
                    videoUrl = await uploadFile(videoMap.get(i), "video");
                    console.log("Video URL after upload:", videoUrl);
                }

                // Validate video URL exists
                if (!videoUrl) {
                    throw new ApiError(400, `Video file is required for video at index ${i}`);
                }

                finalVideoArray.push({
                    title: vid.title,
                    videoFile: videoUrl,
                });
            }

            updateFields.video = finalVideoArray;
        }

        // Process bonusSkills
        if (bonusSkills !== undefined) {
            let parsedBonusSkills = JSON.parse(bonusSkills);
            
            // Get all bonus skills images with indexed field names
            const bonusSkillsImages = req.files?.filter(file => file.fieldname.startsWith('bonusSkillsImage_')) || [];
            
            // Validate bonusSkills structure
            if (!parsedBonusSkills.title) {
                throw new ApiError(400, "Bonus skills title is required");
            }
            if (!Array.isArray(parsedBonusSkills.images)) {
                throw new ApiError(400, "Bonus skills images must be an array");
            }
            
            // Create index-to-file mapping
            const imageMap = new Map();
            bonusSkillsImages.forEach(file => {
                const index = parseInt(file.fieldname.split('_')[1]);
                if (!isNaN(index)) {
                    imageMap.set(index, file);
                }
            });
            
            // Update images only for indexes with new files
            const updatedImages = [...parsedBonusSkills.images];
            for (let i = 0; i < updatedImages.length; i++) {
                if (imageMap.has(i)) {
                    updatedImages[i] = await uploadFile(imageMap.get(i));
                }
            }
            
            // Add new images beyond the original array length
            const maxIndex = Math.max(...imageMap.keys());
            for (let i = updatedImages.length; i <= maxIndex; i++) {
                if (imageMap.has(i)) {
                    updatedImages.push(await uploadFile(imageMap.get(i)));
                }
            }
            
            parsedBonusSkills.images = updatedImages;
            updateFields.bonusSkills = parsedBonusSkills;
        }

        // Process sectionOne - FIXED ERROR HERE
        if (sectionOne !== undefined) {
            let parsedSectionOne = JSON.parse(sectionOne);
            const sectionOneImage = req.files?.filter(file => file.fieldname === 'sectionOneImage') || [];
            
            // Validate required fields
            if (!parsedSectionOne.title) {
                throw new ApiError(400, "Section one title is required");
            }
            if (!Array.isArray(parsedSectionOne.highlights) || !parsedSectionOne.highlights.length) {
                throw new ApiError(400, "Section one highlights must be a non-empty array");
            }
            
            // Only process image if a file was actually uploaded
            if (sectionOneImage.length > 0) {
                parsedSectionOne.images = await uploadFile(sectionOneImage[0]);
            } else if (!parsedSectionOne.images) {
                // Maintain existing image if no new file and no image in request
                parsedSectionOne.images = existingBundle.sectionOne?.images || "";
            }
            
            updateFields.sectionOne = parsedSectionOne;
        }

        // Process sectionTwo
        if (sectionTwo !== undefined) {
            let parsedSectionTwo = JSON.parse(sectionTwo);
            const sectionTwoImages = req.files?.filter(file => file.fieldname.startsWith('sectionTwoImage_')) || [];
            
            // Validate required fields
            if (!parsedSectionTwo.title) {
                throw new ApiError(400, "Section two title is required");
            }
            if (!Array.isArray(parsedSectionTwo.highlights) || !parsedSectionTwo.highlights.length) {
                throw new ApiError(400, "Section two highlights must be a non-empty array");
            }

            // Create a map of index to file
            const imageMap = new Map();
            sectionTwoImages.forEach(file => {
                const index = parseInt(file.fieldname.split('_')[1]);
                if (!isNaN(index)) {
                    imageMap.set(index, file);
                }
            });

            // Process images with their correct indexes
            for (let i = 0; i < parsedSectionTwo.highlights.length; i++) {
                if (imageMap.has(i)) {
                    const imageUrl = await uploadFile(imageMap.get(i));
                    parsedSectionTwo.highlights[i].images = imageUrl;
                }
            }
            
            updateFields.sectionTwo = parsedSectionTwo;
        }

        // Process sectionThree
        if (sectionThree !== undefined) {
            let parsedSectionThree = JSON.parse(sectionThree);
            const sectionThreeImages = req.files?.filter(file => file.fieldname.startsWith('sectionThreeImage_')) || [];
            console.log("Section Three Images:", sectionThreeImages);
            
            
            // Validate required fields
            if (!parsedSectionThree.title) {
                throw new ApiError(400, "Section three title is required");
            }
            if (!Array.isArray(parsedSectionThree.highlights) || !parsedSectionThree.highlights.length) {
                throw new ApiError(400, "Section three highlights must be a non-empty array");
            }

            // Create index-to-file mapping
            const imageMap = new Map();
            sectionThreeImages.forEach(file => {
                // Correct index extraction - use last part after underscore
                const parts = file.fieldname.split('_');
                const index = parseInt(parts[parts.length - 1]);
                if (!isNaN(index)) {
                    imageMap.set(index, file);
                }
            });

            // Update highlights with new images
            for (let i = 0; i < parsedSectionThree.highlights.length; i++) {
                if (imageMap.has(i)) {
                    parsedSectionThree.highlights[i].images = await uploadFile(imageMap.get(i));
                    console.log("Updated Section Three Highlight Image:", parsedSectionThree.highlights[i].images);
                    
                }
            }
            
            updateFields.sectionThree = parsedSectionThree;
        }

        // Process courses
        if (courses !== undefined) {
            let parsedCourses = JSON.parse(courses);
            if (!parsedCourses.title || !parsedCourses.description || !Array.isArray(parsedCourses.steps) || !parsedCourses.steps.length) {
                throw new ApiError(400, "Courses require title, description, and non-empty steps array");
            }
            updateFields.courses = parsedCourses;
        }

        // Process mentor
        if (mentor !== undefined) {
            let parsedMentor = JSON.parse(mentor);
            const mentorImage = req.files?.filter(file => file.fieldname === 'mentorImage') || [];
            
            if (!parsedMentor.title || !parsedMentor.name || !parsedMentor.description) {
                throw new ApiError(400, "Mentor requires title, name, and description");
            }
            
            if (mentorImage.length > 0) {
                parsedMentor.image = await uploadFile(mentorImage[0]);
            } else if (!parsedMentor.image) {
                // Maintain existing image if no new file and no image in request
                parsedMentor.image = existingBundle.mentor?.image || "";
            }
            
            updateFields.mentor = parsedMentor;
        }

        // Process CertificationSection
        if (CertificationSection !== undefined) {
            let parsedCertificationSection = JSON.parse(CertificationSection);
            const certificationSectionImage = req.files?.filter(file => file.fieldname === 'certificationSectionImage') || [];
            
            if (!parsedCertificationSection.title || 
                !parsedCertificationSection.description || 
                !Array.isArray(parsedCertificationSection.points)) {
                throw new ApiError(400, "Certification requires title, description, and points array");
            }
            
            if (certificationSectionImage.length > 0) {
                parsedCertificationSection.image = await uploadFile(certificationSectionImage[0]);
            } else if (!parsedCertificationSection.image) {
                // Maintain existing image
                parsedCertificationSection.image = existingBundle.CertificationSection?.image || "";
            }
            
            updateFields.CertificationSection = parsedCertificationSection;
        }

        // Process FAQSchema
        if (FAQSchema !== undefined) {
            let parsedFAQSchema = JSON.parse(FAQSchema);
            if (!parsedFAQSchema.title || !Array.isArray(parsedFAQSchema.questions) || !parsedFAQSchema.questions.length) {
                throw new ApiError(400, "FAQ requires title and non-empty questions array");
            }
            updateFields.FAQSchema = parsedFAQSchema;
        }

        // Update the bundle only if there are changes
        if (Object.keys(updateFields).length > 0) {
            const updatedBundle = await DigitalBundle.findByIdAndUpdate(
                id,
                { $set: updateFields },
                { new: true, runValidators: true }
            );

            return res
                .status(200)
                .json(new ApiResponse(200, updatedBundle, "Digital bundle updated successfully"));
        } else {
            return res
                .status(200)
                .json(new ApiResponse(200, existingBundle, "No changes detected"));
        }
        
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to update digital bundle");
    }
});

// Get a single Digital Bundle by ID
const getDigitalBundleById = asynchHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid digital bundle ID");
    }

    const digitalBundle = await DigitalBundle.findById(id);

    if (!digitalBundle) {
      throw new ApiError(404, "Digital bundle not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, digitalBundle, "Digital bundle retrieved successfully"));
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Failed to get digital bundle");
  }
});

// Get all Digital Bundles with pagination and filtering
const getAllDigitalBundles = asynchHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, title } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (title) {
      query.title = { $regex: title, $options: 'i' };
    }

    // Fetch bundles with pagination
    const bundles = await DigitalBundle.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Get total count for pagination metadata
    const total = await DigitalBundle.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json(new ApiResponse(200, {
      bundles,
      pagination: {
        total,
        totalPages,
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit)
      }
    }, "Digital bundles retrieved successfully"));
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Failed to get digital bundles");
  }
});

export {
  createDigitalBundle,
  updateDigitalBundle,
  getDigitalBundleById,
  getAllDigitalBundles
};