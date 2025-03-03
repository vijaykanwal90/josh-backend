import { Router } from "express";
import { getUser, updateUser } from "../controllers/user.controller.js";
import { userAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(userAuth);
router.route('/').get(getUser)
router.route('/').patch(updateUser);

export default router;