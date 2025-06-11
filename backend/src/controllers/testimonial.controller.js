import { asynchHandler } from "../utils/AsynchHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Testimonial } from "../models/testimonial.model.js";
import path from "path";
import { uploadCloudinary } from "../utils/Cloudinary.js";
 
// Helper to embed YouTube URL
function convertToEmbedUrl(url) {
  try {
    const parsedUrl = new URL(url);
    const videoId = parsedUrl.searchParams.get("v") || parsedUrl.pathname.split("/").pop();
    return `https://www.youtube.com/embed/${videoId}`;
  } catch (err) {
    console.error("Invalid YouTube URL:", url);
    return url;
  }
}

// @desc    Create a testimonial
// @route   POST /api/testimonials
// @access  Admin
// import { uploadCloudinary } from "../utils/cloudinary.utils.js"; // Make sure this is properly imported

export const createTestimonial = asynchHandler(async (req, res) => {
  const {
    name,
    location,
    designation,
    studentsImpacted,
    teachersUsing,
    improvementMetric,
    quote,
    rating,
    representative,
    video, // Video URL
  } = req.body;

  // Validation
  if (
    !name ||
    !location ||
    !designation ||
    !studentsImpacted ||
    !teachersUsing ||
    !improvementMetric ||
    !quote ||
    !rating ||
    !representative
  ) {
    throw new ApiError(400, "All fields are required.");
  }

  const files = req.files || {};
  let thumbnail = undefined;
  let representativeImage = undefined;

  // Handle image uploads using Cloudinary
  const fileTypes = ["thumbnail", "representativeImage"];
  for (const fileType of fileTypes) {
    const file = files[fileType]?.[0];
    if (file) {
      try {
        const result = await uploadCloudinary(file.path);
        console.log(result)
        if (fileType === "thumbnail") {
          thumbnail = result?.secure_url;
        } else if (fileType === "representativeImage") {
          representativeImage = result?.secure_url;
        }
      } catch (err) {
        console.error(`Cloudinary upload failed for ${fileType}:`, err);
        throw new ApiError(500, `Failed to upload ${fileType}`);
      }
    }
  }

  // Convert video URL to embed format
  const embedVideoUrl = video ? convertToEmbedUrl(video) : undefined;

  // Save testimonial
  const testimonial = await Testimonial.create({
    name,
    location,
    designation,
    studentsImpacted,
    teachersUsing,
    improvementMetric,
    quote,
    rating,
    representative,
    video: embedVideoUrl,
    thumbnail,
    representativeImage,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      { testimonial },
      "Testimonial created successfully."
    )
  );
});


// @desc    Get all testimonials
// @route   GET /api/testimonials
// @access  Public
export const getAllTestimonials = asynchHandler(async (req, res) => {
  const testimonials = await Testimonial.find().sort({ createdAt: -1 });
  return res
    .status(200)
    .json(new ApiResponse(200, { testimonials }, "Testimonials fetched successfully."));
});

// @desc    Get single testimonial
// @route   GET /api/testimonials/:id
// @access  Public
export const getTestimonialById = asynchHandler(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) throw new ApiError(404, "Testimonial not found");
  return res
    .status(200)
    .json(new ApiResponse(200, { testimonial }, "Testimonial fetched successfully."));
});

// @desc    Update testimonial
// @route   PATCH /api/testimonials/:id
// @access  Admin


export const updateTestimonial = asynchHandler(async (req, res) => {
  const {
    name,
    location,
    designation,
    studentsImpacted,
    teachersUsing,
    improvementMetric,
    quote,
    rating,
    representative,
    video,
  } = req.body;

  const updatedFields = {
    name,
    location,
    designation,
    studentsImpacted,
    teachersUsing,
    improvementMetric,
    quote,
    rating,
    representative
    
  };

  const files = req.files || {};

  // Handle Cloudinary uploads
  const fileTypes = ["thumbnail", "representativeImage"];
  for (const fileType of fileTypes) {
    const file = files[fileType]?.[0];
    if (file) {
      try {
        const result = await uploadCloudinary(file.path);
        if (fileType === "thumbnail") {
          updatedFields.thumbnail = result?.secure_url;
        } else if (fileType === "representativeImage") {
          updatedFields.representativeImage = result?.secure_url;
        }
      } catch (err) {
        console.error(`Cloudinary upload failed for ${fileType}:`, err);
        throw new ApiError(500, `Failed to upload ${fileType}`);
      }
    }
  }

  // Convert video URL if provided
  if (video) {
    updatedFields.video = convertToEmbedUrl(video);
  }

  const updated = await Testimonial.findByIdAndUpdate(req.params.id, updatedFields, {
    new: true,
    runValidators: true,
  });

  if (!updated) throw new ApiError(404, "Testimonial not found");

  return res
    .status(200)
    .json(new ApiResponse(200, { testimonial: updated }, "Testimonial updated successfully."));
});


// @desc    Delete testimonial
// @route   DELETE /api/testimonials/:id
// @access  Admin
export const deleteTestimonial = asynchHandler(async (req, res) => {
  const deleted = await Testimonial.findByIdAndDelete(req.params.id);
  if (!deleted) throw new ApiError(404, "Testimonial not found");
  return res
    .status(200)
    .json(new ApiResponse(200, { testimonial: deleted }, "Testimonial deleted successfully."));
});
