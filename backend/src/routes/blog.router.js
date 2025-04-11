import Router from 'express';
// import { getWalletDetails} from "../controllers/wallet.controller.js";
import { userAuth } from '../middlewares/auth.middleware.js';
import { getBlogs, addBlog } from '../controllers/blog.controller.js';
const router = Router();

router.route('/').get(getBlogs);
router.route('/addBlog').get(addBlog);


export default router;


