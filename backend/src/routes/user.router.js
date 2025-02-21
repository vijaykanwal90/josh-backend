import { Router } from "express";
import { getUser, updateUser, getUserById } from "../controllers/user.controller.js";

const router = Router();

router.route('/').get(getUser)
router.route('/:id').get(getUserById).patch(updateUser);;

export default router;