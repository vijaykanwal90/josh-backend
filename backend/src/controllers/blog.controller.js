import { asynchHandler } from "../utils/AsynchHandler.js";
import { Wallet } from "../models/Wallet.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Blog } from "../models/blog.model.js";

const getBlogs = asynchHandler(async (req, res) => {
   try{
      const blogs = await Blog.find();
      if(!blogs){
         return ApiError(res, 404, "Blogs not found");
      }
      return ApiResponse(res, 200, true, "Blogs fetched successfully", blogs);
   }
   catch(error){
      return ApiError(res, 500, "Internal server error while fetching blogs", error);
   }

}
);
const addBlog = asynchHandler(async (req, res) => {
   try{
      const {title,image,category,authorName,description,content} = req.body;
      const blog = new Blog({
         title,
         image,
         category,
         authorName,
         description,
         content
      });
      await blog.save();
      return ApiResponse(res, 200, true, "Blog added successfully", blog);
   }
   catch(error){
      return ApiError(res, 500, "Internal server error while adding blog", error);
   }

}
);




export { getBlogs, addBlog };

