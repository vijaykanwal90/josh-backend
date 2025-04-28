import { Router } from 'express';
import { 
    addWebinar,
    getAllWebinars,
    getSingleWebinar,
    updateWebinar,
    deleteWebinar,
    changeWebinarStatus,
    rescheduleWebinar,
    registerForWebinar  
} from "../controllers/webinar.controller.js";
import { userAuth } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js"
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Admin routes (require authentication and admin role)
router.post('/create', 
    userAuth, 
    checkRole('admin'),
    upload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "presenterImage", maxCount: 1 }
    ]), 
    addWebinar);
router.put('/:id', 
    userAuth, 
    checkRole('admin'),
    upload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "presenterImage", maxCount: 1 }
    ]), 
    updateWebinar);
router.delete('/:id', userAuth, checkRole('admin'), deleteWebinar);
router.put('/status/:id', userAuth, checkRole('admin'), changeWebinarStatus);
router.put('/reschedule/:id', userAuth, checkRole('admin'), rescheduleWebinar);
router.get('/:id', userAuth, checkRole('admin'), getSingleWebinar);

// Public routes
router.get('/', getAllWebinars);
router.post('/register/:id', registerForWebinar);

export default router;