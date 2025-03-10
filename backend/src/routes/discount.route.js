import { Router } from "express";
import { checkRole } from "../middlewares/role.middleware.js";
import { userAuth } from "../middlewares/auth.middleware.js";
import { addDiscount, removeDiscount } from "../controllers/dicount.controller.js";

const router = Router();


router.use(userAuth);


router.route("/").patch(checkRole(['admin']), addDiscount).delete(checkRole(['admin']), removeDiscount);

export default router;

