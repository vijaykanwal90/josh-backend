import { Router } from "express";
import { createCourse, getCourses, getCourseById, getUserCourses, updateCourse, deleteCourse, } from "../controllers/course.controller.js";
import { userAuth } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";



const router = Router();

router.use(userAuth);
router.route('/').post(checkRole(['admin']),createCourse).get(getCourses);
router.route('/:id').get(getCourseById).patch(updateCourse).delete(checkRole(['admin']),deleteCourse);
router.route('/:userId').get(getUserCourses);
router.route('/:id').get(getCourseById).patch(updateCourse).delete(deleteCourse);


export default router;






