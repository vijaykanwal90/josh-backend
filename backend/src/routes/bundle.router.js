import { Router } from "express";
import { userAuth } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";
import { createBundle, updateBundle, getBundles, getAllBundles, getBundleById, assignBundle, getBundleByName, addCourseToBundle, removeCourseFromBundle, removeBundle } from "../controllers/bundle.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.route('/getBundleByName').get(userAuth, getBundleByName);
router.route('/getBundles').get(getBundles);
router.route('/getAllBundles').get(getAllBundles);
router.route('/getBundle/:id').get(getBundleById);
router.route('/createBundle').post(
    userAuth,
    checkRole(['admin']),
    upload.single('bundleImage'),
    createBundle
);

router.route('/assignBundle').patch(userAuth, checkRole(['admin']), assignBundle);
router.route('/addCourses').patch(userAuth, checkRole(['admin']), addCourseToBundle);
router.route('/remove-course').patch(userAuth, checkRole(['admin']), removeCourseFromBundle);
router.route('/removeBundle/:id').delete(userAuth, checkRole(['admin']), removeBundle);
router.route("/:id").patch(
    userAuth,
    checkRole(["admin"]),
    upload.single('bundleImage'),
    updateBundle
  );
export default router;                                                                                                                               