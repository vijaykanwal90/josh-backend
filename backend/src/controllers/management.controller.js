import { asynchHandler } from "../utils/AsynchHandler.js";
import { ApiError } from "../utils/ApiError.js";
// import { About } from "../models/about.model.js";
import { uploadCloudinary } from "../utils/Cloudinary.js";
import { Management } from "../models/management.model.js";
import mongoose from "mongoose";
const getManagementTeam= asynchHandler(async(req,res)=>{
    const team = await Management.find();
    if (!team || team.length === 0) {
        throw new ApiError(404, "Management team not found");
    }
    return res.status(200).json({
        success: true,
        message: "Management team fetched successfully",
        data: team
    });
})
const createManagement = asynchHandler(async(req,res)=>{
    console.log("adding management member");
    const {name, role} = req.body;
    if (!name || !role) {
        throw new ApiError(400, "Name and role are required");
    }
    const existingMember = await Management.findOne({ name });
    if (existingMember) {
        throw new ApiError(400, "Management member already exists with this name");
    }
    const image = req.file;
    let cloudinaryImageUrl = null;
    if (image) {
        try {
            const result = await uploadCloudinary(image.buffer);
            cloudinaryImageUrl = result?.secure_url || null;
        } catch (err) {
            console.error("Cloudinary upload failed:", err);
            throw new ApiError(500, "Failed to upload management image");
        }
    }
    const managementMember = await Management.create({
        name,
        role,
        image: cloudinaryImageUrl || "https://imgs.search.brave.com/NMzO0gk1mG66HLjobL6cKbzIGQj-Z1vMNZ1sq044kmE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YXMuc2VydmljZXMu/Y29tL2ltYWdlcy9k/ZXYvZGVmYXVsdC1w/b3J0cmFpdC5wbmc"
    });
    return res.status(201).json({
        success: true,
        message: "Management member created successfully",
        data: managementMember
    });

})
const deleteManagement = asynchHandler(async (req, res) => {
    console.log("Management member delete request received");
  
    const { id } = req.params;
    console.log("ID received:", id);
  
    if (!id) {
      throw new ApiError(400, "Management member ID is required");
    }
  
    // Check if it's a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid management member ID format");
    }
  
    // Now delete using ObjectId
    const objectId = new mongoose.Types.ObjectId(id);
    const managementMember = await Management.findByIdAndDelete(objectId);
  
    if (!managementMember) {
      throw new ApiError(404, "Management member not found");
    }
  
    return res.status(200).json({
      success: true,
      message: "Management member deleted successfully",
      data: managementMember,
    });
  });
export { getManagementTeam, createManagement, deleteManagement };