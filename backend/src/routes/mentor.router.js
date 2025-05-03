import express from "express";
import { checkRole } from "../middlewares/role.middleware.js";
import { upload, handleMulterError } from "../middlewares/multer.middleware.js";
import {
  getMentors,
  addMentor,
  updateMentor,
  deleteMentor, 
  addCourseToMentor,
  getMentorById,
} from "../controllers/mentor.controller.js";
import { userAuth } from "../middlewares/auth.middleware.js";

const router = express.Router(); // ✅ Correct

// Routes
router.get("/getAllMentors", getMentors);
router.get("/getMentorById/:mentorId", getMentorById);
router.route("/add")
  .post(
    upload.single('mentorImage'),
    userAuth,
    checkRole(['admin']),
    addMentor
  );

// Update a mentor by ID
router.put("/update/:id", updateMentor);

// Delete a mentor by ID
router.delete("/delete/:id", deleteMentor);

// Add course to mentor
router.patch('/addcourseToMentor', addCourseToMentor);

export default router;
