import { Gallery } from "../models/gallery.model.js";

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
    const image  = req.files?.galleryImage?.[0];
    try {
        const gallery = await Gallery.findByIdAndUpdate(
            id,
            { title, category },
            { new: true }
        );
        if (image) {
            gallery.image = `/fileStore/${image.filename}`;
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
    const image = req.files?.galleryImage?.[0];
    
    try {
        if (!image) {
            return res.status(400).json({ message: "Image is required" });
        }
        const imagePath = `/fileStore/${image.filename}`;
        const gallery = await Gallery.create({
            title,
            image: imagePath,
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