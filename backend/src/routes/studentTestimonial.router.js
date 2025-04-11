// import express from "express";
import { Router } from "express";
import {
    createTestimonial,
    getAllTestimonials,
    getTestimonialById,
    updateTestimonial,
    deleteTestimonial
} from "../controllers/studentTestimonial.controller.js";

const router = Router();


// Routes
router.post("/", createTestimonial);
router.get("/", getAllTestimonials);
router.get("/:id", getTestimonialById);
router.put("/:id", updateTestimonial);
router.delete("/:id", deleteTestimonial);

export default router;
