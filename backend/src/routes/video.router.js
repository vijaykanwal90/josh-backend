import { Router } from "express";
import {userAuth} from "../middlewares/auth.middleware.js";
import {
     publishVideo,
     getAllVideos,
     getVideoById,
     deleteVideo,
     updateVideo,
    getAllVideosByCourseId
    } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(userAuth);

router.route("/").get(getAllVideos);
router.route("/upload")
.post(
 //jaate hue milkr jana middle ware
    upload.fields([
   {
    name :"videoFile",
    maxCount : 1
     },
     {
       name :"thumbnail",
       maxCount : 1
     }
    ]),
    publishVideo
    );

router.route("/:videoId")
.get(getVideoById)
.delete(deleteVideo)
.patch(upload.single("thumbnail"),updateVideo);

router.route("/coursevideo/:courseId").get(getAllVideosByCourseId);

export default router;