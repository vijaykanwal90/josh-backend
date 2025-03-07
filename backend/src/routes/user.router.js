import { Router } from "express";
import { getUser, updateUser,getAllUser } from "../controllers/user.controller.js";
import { userAuth } from "../middlewares/auth.middleware.js";
import {checkRole} from "../middlewares/role.middleware.js"
import { checkUser } from "../controllers/user.controller.js";

const router = Router();

router.use(userAuth);
router.route('/admin').get(checkRole(['admin']),checkUser);
router.route('/getUsers').get(checkRole(['admin']),getAllUser)

router.route('/').get(getUser)

router.route('/').patch(checkRole(['admin']),updateUser);

export default router;