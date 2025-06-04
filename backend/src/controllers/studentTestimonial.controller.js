import { asynchHandler } from "../utils/AsynchHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { StudentTestimonial } from "../models/studentTestimonial.model.js";
import { uploadCloudinary } from "../utils/Cloudinary.js";
// Helper function: Convert normal YouTube link to embeddable link
function convertToEmbedUrl(url) {
  try {
    const parsedUrl = new URL(url);
    const videoId = parsedUrl.searchParams.get("v") || parsedUrl.pathname.split("/").pop();
    return `https://www.youtube.com/embed/${videoId}`;
  } catch (error) {
    console.error("Invalid YouTube URL:", url);
    return url;
  }
}

// @desc    Create a new student testimonial
// @route   POST /api/testimonials
// @access  Admin
export const createTestimonial = asynchHandler(async (req, res) => {
  try {
    const { name, course, testimonialText, videoUrl,rating } = req.body;

    if (!name || !course || !testimonialText,!rating) {
      throw new ApiError(400, "All fields (name, course, testimonialText) are required.");
    }

    // Handle image file upload (optional)
  const imageFile= req.file;
      let cloudinaryImageUrl = null;
  
      if (imageFile) {
        try {
          const result = await uploadCloudinary(imageFile.buffer);
          cloudinaryImageUrl = result?.secure_url || null;
        } catch (err) {
          console.error("Cloudinary upload failed:", err);
          throw new ApiError(500, "Failed to upload mentor image");
        }
      }

    // Process the video URL if provided
    let convertedVideoUrl = "";
    let isVideo = false;
    if (videoUrl) {
      convertedVideoUrl = convertToEmbedUrl(videoUrl);
      isVideo = true;
    }

    const testimonial = await StudentTestimonial.create({
      name,
      course,
      testimonialText,
      image: cloudinaryImageUrl || "",
      isVideo,
      videoUrl: convertedVideoUrl,
      rating
    });

    return res.status(201).json(
      new ApiResponse(201, { testimonial }, "Student testimonial created successfully.")
    );
  } catch (error) {
    console.error("Error creating student testimonial:", error);
    throw new ApiError(500, "Internal server error");
  }
});

// @desc    Get all student testimonials
// @route   GET /api/testimonials
// @access  Public
export const getAllTestimonials = asynchHandler(async (req, res) => {
  try {
    const testimonials = await StudentTestimonial.find().sort({ createdAt: -1 });
    return res.status(200).json(
      new ApiResponse(200, { testimonials }, "Testimonials fetched successfully.")
    );
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    throw new ApiError(500, "Internal server error");
  }
});

// @desc    Get a student testimonial by ID
// @route   GET /api/testimonials/:id
// @access  Public
export const getTestimonialById = asynchHandler(async (req, res) => {
  try {
    const testimonial = await StudentTestimonial.findById(req.params.id);
    if (!testimonial) {
      throw new ApiError(404, "Testimonial not found");
    }
    return res.status(200).json(
      new ApiResponse(200, { testimonial }, "Testimonial fetched successfully.")
    );
  } catch (error) {
    console.error("Error fetching testimonial:", error);
    throw new ApiError(500, "Internal server error");
  }
});

// @desc    Update a student testimonial
// @route   PATCH /api/testimonials/:id
// @access  Admin
export const updateTestimonial = asynchHandler(async (req, res) => {
  try {
    const { name, course, testimonialText, videoUrl,rating } = req.body;

    // Build the update object
    const updatedFields = { name, course, testimonialText,rating };

    // Handle image file update if a new one is provided
    const imageFile= req.file;
    let cloudinaryImageUrl = null;

    if (imageFile) {
      try {
        const result = await uploadCloudinary(imageFile.buffer);
        cloudinaryImageUrl = result?.secure_url || null;
        updatedFields.image = cloudinaryImageUrl;
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        throw new ApiError(500, "Failed to upload mentor image");
      }
    }

    // Process the video URL if provided
    if (videoUrl) {
      updatedFields.videoUrl = convertToEmbedUrl(videoUrl);
      updatedFields.isVideo = true;
    } else {
      updatedFields.videoUrl = "";
      updatedFields.isVideo = false;
    }

    const updatedTestimonial = await StudentTestimonial.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true, runValidators: true }
    );

    if (!updatedTestimonial) {
      throw new ApiError(404, "Testimonial not found");
    }

    return res.status(200).json(
      new ApiResponse(200, { testimonial: updatedTestimonial }, "Testimonial updated successfully.")
    );
  } catch (error) {
    console.error("Error updating testimonial:", error);
    throw new ApiError(500, "Internal server error");
  }
});

// @desc    Delete a student testimonial
// @route   DELETE /api/testimonials/:id
// @access  Admin
export const deleteTestimonial = asynchHandler(async (req, res) => {
  try {
    const deletedTestimonial = await StudentTestimonial.findByIdAndDelete(req.params.id);
    if (!deletedTestimonial) {
      throw new ApiError(404, "Testimonial not found");
    }
    return res.status(200).json(
      new ApiResponse(200, { testimonial: deletedTestimonial }, "Testimonial deleted successfully.")
    );
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    throw new ApiError(500, "Internal server error");
  }
});
