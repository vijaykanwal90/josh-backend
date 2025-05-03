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
  removeCourseFromMentor
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
router.route("/update/:id").patch(upload.single('mentorImage'),
userAuth,
checkRole(['admin']), updateMentor);

// Delete a mentor by ID
router.route("/delete/:id").delete(userAuth,checkRole(['admin']), deleteMentor);

// Add course to mentor
router.route('/addcourseToMentor').patch(userAuth, checkRole(['admin']), addCourseToMentor);
router.route('/removeCourse').patch(userAuth, checkRole(['admin']), removeCourseFromMentor);

export default router;
