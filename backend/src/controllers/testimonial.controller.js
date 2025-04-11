import { Testimonial } from "../models/testimonial.model.js"; 

// Add a new testimonial
export const addTestimonial = async (req, res) => {
    try {
        const testimonial = new Testimonial(req.body);
        await testimonial.save();
        res.status(201).json({ message: "Testimonial added successfully", testimonial });
    } catch (error) {
        res.status(400).json({ message: "Failed to add testimonial", error: error.message });
    }
};

// Get all testimonials
export const getTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find().sort({ createdAt: -1 });
        res.status(200).json(testimonials);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch testimonials", error: error.message });
    }
};

// Get a single testimonial by ID
export const getTestimonialById = async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ message: "Testimonial not found" });
        }
        res.status(200).json(testimonial);
    } catch (error) {
        res.status(500).json({ message: "Error fetching testimonial", error: error.message });
    }
};

// Delete a testimonial
export const deleteTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ message: "Testimonial not found" });
        }
        res.status(200).json({ message: "Testimonial deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting testimonial", error: error.message });
    }
};

// Update a testimonial
export const updateTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!testimonial) {
            return res.status(404).json({ message: "Testimonial not found" });
        }
        res.status(200).json({ message: "Testimonial updated successfully", testimonial });
    } catch (error) {
        res.status(400).json({ message: "Failed to update testimonial", error: error.message });
    }
};
