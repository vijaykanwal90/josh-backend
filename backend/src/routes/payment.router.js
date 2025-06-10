import express from 'express';
import { Router } from 'express';
import { createPayment,webHookHandler } from '../controllers/payment.controller.js';


const router =  Router();

router.route("/create").post(createPayment);
router.route("/webhook").post(webHookHandler);

export default router;