import { Router } from "express";
import { createCourse, getCourses, getCourseById, getUserCourses, updateCourse, deleteCourse, } from "../controllers/course.controller.js";




const router = Router();

router.route('/').post(createCourse).get(getCourses);
router.route('/:id').get(getCourseById).patch(updateCourse).delete(deleteCourse);
router.route('/:userId').get(getUserCourses);
router.route('/:id').get(getCourseById).patch(updateCourse).delete(deleteCourse);


export default router;






