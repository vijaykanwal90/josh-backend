// import express from "express";
import { Router } from "express";
import {
    addTestimonial,
    getTestimonials,
    getTestimonialById,
    deleteTestimonial,
    updateTestimonial
} from "../controllers/testimonial.controller.js";

const router = Router();

router.post("/", addTestimonial);
router.get("/", getTestimonials);
router.get("/:id", getTestimonialById);
router.delete("/:id", deleteTestimonial);
router.patch("/:id", updateTestimonial);

export default router;
