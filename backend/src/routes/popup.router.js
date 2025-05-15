import { Router } from "express";
import { createPopup, getPopup, deletePopup,deletePopUpById } from "../controllers/popup.controller.js";
import { checkRole } from "../middlewares/role.middleware.js";
import { userAuth } from "../middlewares/auth.middleware.js";




const router = Router();



router.route("/").get(getPopup);
router.route("/").post(userAuth,checkRole(['admin']),createPopup);
router.route("/:id").delete(userAuth,checkRole(['admin']),deletePopup);
router.route("/delete/:id").delete(userAuth,checkRole(['admin']),deletePopUpById);

export default router;