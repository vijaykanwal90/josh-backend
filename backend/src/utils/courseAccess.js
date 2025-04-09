import { canAccess } from "../utils/canAccess.js";
import {Course} from "../models/course.model.js";
import {User} from "../models/user.model.js";
const getVideo = async (req, res) => {
  const { courseId, videoIndex } = req.params;
  const user = req.user;

  const course = await Course.findById(courseId).populate("videos");
  await user.populate("courses"); // Optional

  if (!canAccess(videoIndex, course, user)) {
    return res.status(403).json({ message: "Access denied" });
  }

  const video = course.videos[videoIndex];
  res.json(video);
};
export { getVideo };
