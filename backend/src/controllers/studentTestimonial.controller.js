import { StudentTestimonial } from "../models/studentTestimonial.model.js";

// Create a new testimonial
export const createTestimonial = async (req, res) => {
    try {
        const newTestimonial = new StudentTestimonial(req.body);
        const savedTestimonial = await newTestimonial.save();
        res.status(201).json(savedTestimonial);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all testimonials
export const getAllTestimonials = async (req, res) => {
    try {
        const testimonials = await StudentTestimonial.find().sort({ createdAt: -1 });
        res.status(200).json(testimonials);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single testimonial by ID
export const getTestimonialById = async (req, res) => {
    try {
        const testimonial = await StudentTestimonial.findById(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ error: "Testimonial not found" });
        }
        res.status(200).json(testimonial);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a testimonial
export const updateTestimonial = async (req, res) => {
    try {
        const updatedTestimonial = await StudentTestimonial.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedTestimonial) {
            return res.status(404).json({ error: "Testimonial not found" });
        }
        res.status(200).json(updatedTestimonial);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a testimonial
export const deleteTestimonial = async (req, res) => {
    try {
        const deletedTestimonial = await StudentTestimonial.findByIdAndDelete(req.params.id);
        if (!deletedTestimonial) {
            return res.status(404).json({ error: "Testimonial not found" });
        }
        res.status(200).json({ message: "Testimonial deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
