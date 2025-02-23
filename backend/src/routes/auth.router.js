import {Router} from 'express';
import { registerUser,loginUser, logoutUser } from '../controllers/auth.controller.js';
import { userAuth } from '../middlewares/auth.middleware.js';
const router = Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').post(userAuth,logoutUser);



export default router;