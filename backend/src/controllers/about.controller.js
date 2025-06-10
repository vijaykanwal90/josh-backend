import { asynchHandler } from "../utils/AsynchHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { About } from "../models/about.model.js";
import { uploadCloudinary } from "../utils/Cloudinary.js";
// Get About Page
 const getAboutPage = asynchHandler(async (req, res) => {
  console.log("Fetching About Page");
 try {
   const about = await About.findOne();
   if (!about) {
     throw new ApiError(404, "About page not found");
   }
   return res.status(200).json({
     success: true,
     message: "About page fetched successfully",
     data: about
   });
 } catch (error) {
   console.error("Error fetching About page:", error);
   throw new ApiError(500, "Internal Server Error");
  
 }
});

// Create About Page (only if not exists)
 const createAbout = asynchHandler(async (req, res) => {
 try {
  const bannerImage = req.file;
  // const founderImage = req.files?.founderImage ? req.files.founderImage[0] : null;
  // let cloudinaryfounderImageImageUrl = null;
  let cloudinaryBannerImageUrl = null

  // if (cloudinaryfounderImageImageUrl) {
  //   try {
  //     const result = await uploadCloudinary(founderImage.path);
  //     cloudinaryfounderImageImageUrl = result?.secure_url || null;
  //   } catch (err) {
  //     console.error("Cloudinary upload failed to upload founderImage:", err);
  //     throw new ApiError(500, "Failed to upload bundle image");
  //   }

  // }
  if (cloudinaryBannerImageUrl) {
    try {
      const result = await uploadCloudinary(bannerImage.path);
      cloudinaryBannerImageUrl = result?.secure_url || null;
    } catch (err) {
      console.error("Cloudinary upload failed to upload bannerImage:", err);
      throw new ApiError(500, "Failed to upload banner image");
    }
  }
   const existing = await About.findOne();
   if (existing) {
     throw new ApiError(400, "About page already exists. Use update instead.");
   }
 
   const description = req.body.description;
   const ourMission = req.body.ourMission;
   const ourVision = req.body.ourVision;
   const aboutFounder = req.body.aboutFounder;
   const bannerImageUrl = cloudinaryBannerImageUrl || null;
    // const founderImageUrl = cloudinaryfounderImageImageUrl || null;
   
    if (!description || !ourMission || !ourVision || !aboutFounder) {
      throw new ApiError(400, "All fields are required");
    }

   const about = await About.create({
     description,
     ourMission,
     ourVision,
     aboutFounder,
     bannerImage: bannerImageUrl
    //  founderImage: founderImageUrl
   });
    console.log("About Page created successfully:", about);
   if (!about) {
     throw new ApiError(500, "Failed to create About page");
   }
   return res.status(201).json({
     success: true,
     message: "About page created successfully",
     data: about
   });
 } catch (error) {
   console.error("Error creating About page:", error);
   throw new ApiError(500, "Internal Server Error");
  
 }
});

// Update About Page
const updateAbout = asynchHandler(async (req, res) => {
  try {
    console.log("Updating About Page");

    const about = await About.findOne();
    if (!about) {
      throw new ApiError(404, "About page not found");
    }

    const { description, ourMission, ourVision, aboutFounder } = req.body;
    const bannerImageFile = req.file || null;
    // const founderImageFile = req.files?.founderImage?.[0] || null;
   console.log(bannerImageFile)
    let cloudinaryBannerImageUrl = null;
    // let cloudinaryFounderImageUrl = null;

    if (bannerImageFile) {
      try {
        const result = await uploadCloudinary(bannerImageFile.path);
        cloudinaryBannerImageUrl = result?.secure_url || null;
      } catch (err) {
        console.error("Cloudinary upload failed for bannerImage:", err);
        throw new ApiError(500, "Failed to upload banner image");
      }
    }

    // if (founderImageFile) {
    //   try {
    //     const result = await uploadCloudinary(founderImageFile.buffer);
    //     cloudinaryFounderImageUrl = result?.secure_url || null;
    //   } catch (err) {
    //     console.error("Cloudinary upload failed for founderImage:", err);
    //     throw new ApiError(500, "Failed to upload founder image");
    //   }
    // }

    // Build the update object dynamically
    const updateData = {
      description,
      ourMission,
      ourVision,
      aboutFounder,
    };

    if (cloudinaryBannerImageUrl) {
      updateData.bannerImage = cloudinaryBannerImageUrl;
    }
    // if (cloudinaryFounderImageUrl) {
    //   updateData.founderImage = cloudinaryFounderImageUrl;
    // }

    // Perform a single update operation
    const updated = await About.findByIdAndUpdate(about._id, updateData, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      message: "About page updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating About page:", error);
    throw new ApiError(500, "Internal Server Error");
  }
});


export { getAboutPage, createAbout, updateAbout };
