import { Router } from "express";
// import { createCourse, getCourses, getCourseById, getUserCourses, updateCourse, deleteCourse, } from "../controllers/course.controller.js";
import { userAuth } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";

import { createCourse,
    getCourses,
    getCourseById,
    getUserCourses,
    updateCourse,
    deleteCourse,
    createBundle,
    updateBundle,
    getBundles,
    getAllBundles,
    getBundleById,
    assignBundle,
    assignCourse,
    getCourseByName,
    getBundleByName

} from "../controllers/course.controller.js";

const router = Router();

// router.use(userAuth);

router.route('/createCourse').post(userAuth,checkRole(['admin']),createCourse);
router.route('/getCourses').get(getCourses);
router.route('/updateBundle').patch(userAuth,checkRole(['admin']),updateBundle);
router.route('/getCourseByName').get(userAuth,getCourseByName);
router.route('/getBundleByName').get(userAuth,getBundleByName);
router.route('/getBundles').get(getBundles);
router.route('/getAllBundles').get(getAllBundles);
router.route('/bundles/:id').get(getBundleById);
router.route('/createBundle').post(userAuth,checkRole(['admin']),createBundle);
router.route('/assignBundle').patch(userAuth,checkRole(['admin']),assignBundle);
router.route('/assignCourse').patch(userAuth,checkRole(['admin']),assignCourse);
router.route('/:id').get(getCourseById).patch(userAuth,updateCourse).delete(checkRole(['admin']),deleteCourse);
router.route('/:userId').get(getUserCourses);
router.route('/:id').get(getCourseById).patch(userAuth,checkRole(['admin']),updateCourse).delete(userAuth,checkRole(['admin']),deleteCourse);


export default router;






