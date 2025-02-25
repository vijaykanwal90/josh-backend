import Router from 'express';
import { getWalletDetails} from "../controllers/wallet.controller.js";
import { userAuth } from '../middlewares/auth.middleware.js';
const router = Router();

router.route('/').get(userAuth,getWalletDetails);

export default router;


