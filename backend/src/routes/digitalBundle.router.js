import { Router } from 'express';
import { 
  createDigitalBundle,
  updateDigitalBundle,
  getDigitalBundleById,
  getAllDigitalBundles
} from '../controllers/digitalBundle.controller.js';
import { userAuth } from '../middlewares/auth.middleware.js';
import { checkRole } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Create route
router.route('/createDigitalBundle').post(
  userAuth,
  checkRole(['admin']),
  upload.any(), // Accept any field name
  createDigitalBundle
);

// Update route
router.route('/updateDigitalBundle/:id').post(
  userAuth,
  checkRole(['admin']),
  upload.any(), // Accept any field name
  updateDigitalBundle
);

// Read routes
router.route('/getDigitalBundles').get(getAllDigitalBundles);
router.route('/getDigitalBundleById/:id').get(getDigitalBundleById);

export default router;