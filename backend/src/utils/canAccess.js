export const canAccess = (videoIndex, course, user) => {
    const targetVideo = course.videos[videoIndex];
  
    if (targetVideo?.isPreview) return true;
  
    const purchase = user.purchasedCourses.find(
      (item) => item.course.toString() === course._id.toString()
    );
  
    return !!purchase;
  };
  