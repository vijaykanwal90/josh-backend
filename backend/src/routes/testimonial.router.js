import { Router } from "express";
import {
  createTestimonial,
  deleteTestimonial,
  getAllTestimonials,
  getTestimonialById,
  updateTestimonial
} from "../controllers/testimonial.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { userAuth } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";

const router = Router();

router
  .route("/")
  .get(getAllTestimonials)
  
  router.route("/").post(
    userAuth,
    checkRole(["admin"]),
    upload.fields([
      { name: "thumbnail", maxCount: 1 },
      { name: "representativeImage", maxCount: 1 }
    ]),
    createTestimonial
  );

router
  .route("/:id")
  .get(getTestimonialById)
  router.route("/:id").patch(
    userAuth,
    checkRole(["admin"]),
    upload.fields([
      { name: "thumbnail", maxCount: 1 },
      { name: "representativeImage", maxCount: 1 }
    ]),
    updateTestimonial
  )
  router.route("/:id").delete(userAuth, checkRole(["admin"]), deleteTestimonial);

export default router;
