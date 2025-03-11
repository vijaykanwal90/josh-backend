import { Router } from "express";
import { createPopup, getPopup, deletePopup } from "../controllers/popup.controller.js";
import { checkRole } from "../middlewares/role.middleware.js";
import { userAuth } from "../middlewares/auth.middleware.js";



const router = Router();
router.use(userAuth);


router.route("/").get(checkRole(['admin']),getPopup);
router.route("/").post(checkRole(['admin']),createPopup);
router.route("/:id").delete(checkRole(['admin']),deletePopup);

export default router;