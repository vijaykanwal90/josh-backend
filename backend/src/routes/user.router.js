import { Router } from "express";
import { getUser, updateUser, getUserById } from "../controllers/user.controller.js";

const router = Router();

router.route('/').get(getUser).put(updateUser);
router.route('/:id').get(getUserById);

export default router;