import { Router } from "express";

import { checkRole } from "../middlewares/role.middleware.js";
import { userAuth } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {getManagementTeam, createManagement, deleteManagement } from "../controllers/management.controller.js"
const router = Router();
console.log("About Router Loaded");
// Define the about page route
router.route("/getTeam").get(getManagementTeam);
// Create About Page (only if not exists)
router.route("/create").post(userAuth,checkRole(['admin']),upload.single('image'), createManagement);
// Update About Page
router.route("/delete/:id").delete(userAuth,checkRole(['admin']), deleteManagement);

export default router;

