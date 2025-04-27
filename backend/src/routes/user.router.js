import { Router } from "express";
import { getUser, updateUser,getAllUser,getUserCourses, getUserIncomeHistory } from "../controllers/user.controller.js";
import { userAuth } from "../middlewares/auth.middleware.js";
import {checkRole} from "../middlewares/role.middleware.js"


const router = Router();
router.use(userAuth);
router.route('/getUsers').get(checkRole(['admin']),getAllUser)
router.route('/:_id/getCourses').get(userAuth,getUserCourses);
router.route('/getIncomeHistory/:userId').get(userAuth,getUserIncomeHistory );
router.route('/').get(getUser)

router.route('/').patch(checkRole(['admin']),updateUser);

export default router;