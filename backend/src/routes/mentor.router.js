import express from "express";
import {
  addMentor,
  updateMentor,
  deleteMentor, 
  addCourseToMentor
} from "../controllers/mentor.controller.js";
import Router from "express";
const router = Router();

// Add a mentor
router.post("/add", addMentor);
// router.post("/addCourseToMentor", addCourseToMentor);
// router.route('/update/:id').patch(addCourseToMentor);



// Update a mentor by ID
router.put("/update/:id", updateMentor);

// Delete a mentor by ID
router.delete("/delete/:id", deleteMentor);
router.route('/addcourseToMentor').patch(addCourseToMentor);


export default router;
