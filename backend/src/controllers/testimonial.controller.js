import { asynchHandler } from "../utils/AsynchHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Testimonial } from "../models/testimonial.model.js";
import path from "path";

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
    video, // This is the video URL
  } = req.body;

  // Validate required fields
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
  const thumbnailFile = files["thumbnail"]?.[0];
  const representativeFile = files["representativeImage"]?.[0];

  // Store as relative path for serving later
  const thumbnail = thumbnailFile ? `/filestore/${thumbnailFile.filename}` : undefined;
  const representativeImage = representativeFile ? `/filestore/${representativeFile.filename}` : undefined;

  // Convert video URL if provided
  const embedVideoUrl = video ? convertToEmbedUrl(video) : undefined;

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

  return res
    .status(201)
    .json(new ApiResponse(201, { testimonial }, "Testimonial created successfully."));
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
    representative,
  };

  const files = req.files || {};
  const thumbnailFile = files["thumbnail"]?.[0];
  const representativeFile = files["representativeImage"]?.[0];

  if (thumbnailFile) {
    updatedFields.thumbnail = `/filestore/${thumbnailFile.filename}`;
  }
  if (representativeFile) {
    updatedFields.representativeImage = `/filestore/${representativeFile.filename}`;
  }

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
