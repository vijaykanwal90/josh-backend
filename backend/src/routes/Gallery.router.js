import { Router } from "express";
import { userAuth } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";
import {getAllGalleries, createGallery, updateGallery, deleteGalleryImage } from "../controllers/gallery.contoller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(userAuth);
router.route('/').get(getAllGalleries).post(checkRole(['admin']),
 upload.fields([
        { name: 'galleryImage', maxCount: 1 },
    ]),
createGallery);
router.route('/:id').put(checkRole(['admin']),
upload.fields([
        { name: 'galleryImage', maxCount: 1 },
    ]),
updateGallery);
router.route('/:id').delete(checkRole(['admin']), deleteGalleryImage);
export default router;