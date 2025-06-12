import { Router } from 'express';
import { createPayment,webHookHandler,deleteUnpaidUser } from '../controllers/payment.controller.js';


const router =  Router();

router.route("/create").post(createPayment);
router.route("/webhook").post(webHookHandler);
router.route("/delete-unpaid-user").post(deleteUnpaidUser);

export default router;