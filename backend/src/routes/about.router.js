import { Router } from "express";
import   { getAboutPage, createAbout, updateAbout } from "../controllers/about.controller.js";
import { checkRole } from "../middlewares/role.middleware.js";
import { userAuth } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
console.log("About Router Loaded");
// Define the about page route
router.route("/").get(getAboutPage);
// Create About Page (only if not exists)
router.route("/create").post(userAuth,checkRole(['admin']),upload.single("bannerImage"), createAbout);
// Update About Page
router.route("/update").put(userAuth,checkRole(['admin']),upload.single(
    'bannerImage'), updateAbout);

export default router;

