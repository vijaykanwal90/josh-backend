import { Router } from "express";
import { userAuth } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";
import { createBundle, updateBundle, getBundles, getAllBundles, getBundleById, assignBundle,  getBundleByName, addCourseToBundle, removeCourseFromBundle ,removeBundle} from "../controllers/bundle.controller.js";
const router = Router();
router.route('/updateBundle/:id').patch(userAuth,checkRole(['admin']),updateBundle);
router.route('/getBundleByName').get(userAuth,getBundleByName);
router.route('/getBundles').get(getBundles);
router.route('/getAllBundles').get(getAllBundles);
router.route('/getBundle/:id').get(getBundleById);
router.route('/createBundle').post(userAuth,checkRole(['admin']),createBundle);
router.route('/assignBundle').patch(userAuth,checkRole(['admin']),assignBundle);
router.route('/addCourseToBundle').patch(userAuth,checkRole(['admin']),addCourseToBundle);
router.route('/removeCourseFromBundle').patch(userAuth,checkRole(['admin']),removeCourseFromBundle);
router.route('/removeBundle/:id').delete(userAuth,checkRole(['admin']),removeBundle);
export default router