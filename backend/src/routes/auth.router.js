import {Router} from 'express';
import { registerUser,loginUser, logoutUser, deleteUser } from '../controllers/auth.controller.js';
import { userAuth } from '../middlewares/auth.middleware.js'
import { checkUserExist } from '../controllers/auth.controller.js';
import { resetPassword } from '../controllers/auth.controller.js';
import { changePassword } from '../controllers/auth.controller.js';
import { forgotPassword } from '../controllers/auth.controller.js';
import { checkRole} from "../middlewares/role.middleware.js";

const router = Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').post(logoutUser);
router.route('/checkuserexist').post(checkUserExist);
router.route('/resetPassword').post(resetPassword);
router.route('/changePassword').post(userAuth, changePassword);
router.route('/forgotPassword').post(forgotPassword);

router.route('/deleteUser/:userId').delete(userAuth, checkRole(['admin']),deleteUser);





export default router;