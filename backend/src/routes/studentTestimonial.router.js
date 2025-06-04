import { createTestimonial, deleteTestimonial, getAllTestimonials, getTestimonialById, updateTestimonial } from "../controllers/studentTestimonial.controller.js";
import { checkRole } from "../middlewares/role.middleware.js";
import { userAuth } from "../middlewares/auth.middleware.js";
import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
// Create a new testimonial
router.route("/create").post(userAuth, checkRole(["admin"]),
upload.single('imageFile'),
createTestimonial);
router.route("/").get(getAllTestimonials);
router.route("/:id").get(getTestimonialById).patch(userAuth, checkRole(["admin"]), upload.single('imageFile'),
updateTestimonial);
router.route("/delete/:id").delete(userAuth, checkRole(["admin"]), deleteTestimonial);



export default router;