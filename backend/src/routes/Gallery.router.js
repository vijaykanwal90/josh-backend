import { Router } from "express";
import { userAuth } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";
import { getAllGalleries, createGallery, updateGallery, deleteGalleryImage, getGalleryByCategory } from "../controllers/gallery.contoller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.route('/category/:category').get(getGalleryByCategory);

router.route('/')
    .get(getAllGalleries)
    .post(
        userAuth,
        checkRole(['admin']),
        upload.fields([{ name: 'galleryImage', maxCount: 1 }]),
        createGallery
    );

router.route('/:id')
    .put(
        userAuth, checkRole(['admin']),
        upload.fields([{ name: 'galleryImage', maxCount: 1 }]),
        updateGallery
    )
    .delete(userAuth, checkRole(['admin']), deleteGalleryImage);

export default router;