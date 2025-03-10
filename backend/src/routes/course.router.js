import { Router } from "express";
import { createCourse, getCourses, getCourseById, getUserCourses, updateCourse, deleteCourse, } from "../controllers/course.controller.js";
import { userAuth } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";

import { createBundle, updateBundle, getBundles } from "../controllers/course.controller.js";

const router = Router();

router.use(userAuth);
router.route('/createCourse').post(checkRole(['admin']),createCourse);
router.route('/getCourses').get(getCourses);
router.route('/updateBundle').patch(checkRole(['admin']),updateBundle);
router.route('/getBundles').get(getBundles);
router.route('/createBundle').post(checkRole(['admin']),createBundle);
router.route('/:id').get(getCourseById).patch(updateCourse).delete(checkRole(['admin']),deleteCourse);
router.route('/:userId').get(getUserCourses);
router.route('/:id').get(getCourseById).patch(updateCourse).delete(deleteCourse);


export default router;






