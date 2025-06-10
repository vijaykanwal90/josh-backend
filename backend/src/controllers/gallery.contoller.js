import { Gallery } from "../models/gallery.model.js";
import { uploadCloudinary } from "../utils/Cloudinary.js";
const getAllGalleries = async (req, res) => {
    try {
        const galleries = await Gallery.find();
        res.status(200).json(galleries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    }
const getGalleryByCategory = async (req, res) => {  
    const { category } = req.params;
    try {
        const galleries = await Gallery.find({ category });
        res.status(200).json(galleries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    }

 const updateGallery = async (req, res) => {
    const { id } = req.params;
    const { title, category } = req.body;
    const galleryImage = req.file;
    let cloudinaryImageUrl ;
    try {
        const gallery = await Gallery.findByIdAndUpdate(
            id,
            { title, category },
            { new: true }
        );
        if (galleryImage) {
            try {
                const result = await uploadCloudinary(galleryImage.path);
                cloudinaryImageUrl = result?.secure_url || null;
                gallery.image = cloudinaryImageUrl;
              } catch (err) {
                console.error("Cloudinary upload failed:", err);
                throw new ApiError(500, "Failed to upload mentor image");
              }
        }
        await gallery.save();
       return  res.status(200).json({
        message: "Gallery updated successfully",
        gallery});
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
    }
const deleteGalleryImage = async (req, res) => {
    const { id } = req.params;
    try {
        const gallery = await Gallery.findByIdAndDelete(id);
       return  res.status(200).json(
        {
        message: "Gallery image successfully",   
            gallery
        }
    );
    } catch (error) {
       return res.status(500).json({ message: error.message });
    }
}
const createGallery = async (req, res) => {
    const { title, category } = req.body;
    const galleryImage = req.file;
    let cloudinaryImageUrl ;
    
    try {
        if (galleryImage) {
            try {
                const result = await uploadCloudinary(galleryImage.path);
                cloudinaryImageUrl = result?.secure_url || null;
                // gallery.image = cloudinaryImageUrl;
              } catch (err) {
                console.error("Cloudinary upload failed:", err);
                throw new ApiError(500, "Failed to upload mentor image");
              }
        }
        const gallery = await Gallery.create({
            title,
            image: cloudinaryImageUrl,
            category
        });
        res.status(200).json({
            message: "Gallery created successfully",
            gallery});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export { getAllGalleries, createGallery, updateGallery, deleteGalleryImage,getGalleryByCategory };