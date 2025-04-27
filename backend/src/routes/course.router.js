import { Router } from "express";
// import { createCourse, getCourses, getCourseById, getUserCourses, updateCourse, deleteCourse, } from "../controllers/course.controller.js";
import { userAuth } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";
import {upload,handleMulterError} from "../middlewares/multer.middleware.js";
// import { getVideo } from "../utils/courseAccess.js";
import {
  createCourse,
  getCourses,
  getCourseById,
  getMentorCourses,
  updateCourse,
  deleteCourse,
  assignCourse,
  getCourseByName,
  addVideos,
  assignMentor,
} from "../controllers/course.controller.js";

const router = Router();

// router.use(userAuth);

router
  .route("/createCourse")
  .post(
    upload.fields([
      { name: "pdfFile", maxCount: 1 },
      { name: "certificateFile", maxCount: 1 },
      { name: "imageFile", maxCount: 1 }
    ]),
    userAuth,
    checkRole(["admin"]),
    createCourse
  );

router.route("/getCourses").get(getCourses);
router.route("/addVideos/:courseId").patch(addVideos);

router.route("/getCourseByName").get(userAuth, getCourseByName);

router
  .route("/assignMentor")
  .patch(userAuth, checkRole(["admin"]), assignMentor);
router
  .route("/assignCourse")
  .patch(userAuth, checkRole(["admin"]), assignCourse);
  router
  .route("/deleteCourse/:id")
  .delete(userAuth, checkRole(["admin"]), deleteCourse);
router
  .route("/:courseId")
  .get(getCourseById)
  .patch(userAuth, checkRole(["admin"]), upload.fields([
    
      { name: "pdfFile", maxCount: 1 },
      { name: "certificateFile", maxCount: 1 },
      { name: "imageFile", maxCount: 1 }
    
  ]), updateCourse)
  .delete(checkRole(["admin"]), deleteCourse);
router.route("/:userId").get(getMentorCourses);

router.route("/").get(getCourses);

export default router;
