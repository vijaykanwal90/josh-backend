import { Privacy } from "../models/Privacy.model.js";


const getPrivacy = async (req, res) => {
    try{
        console.log("get privacy")
        const {contentType}= req.query;
        console.log(contentType)
        const privacy = await Privacy.findOne({contentType})
        if(!privacy){
            return res.status(404).json({message: "Privacy not found"})
        }
        res.status(200).json({message: "Privacy fetched successfully", data: privacy})
    }
    catch(err){
        console.log(err)
        res.status(500).json({message: "Internal server error"})
    }
}

const getAll = async(req,res)=>{
    try{
        const privacy = await Privacy.find();
        if(!privacy){
            return res.status(404).json({message: "Privacy not found"})
        }
        res.status(200).json({message: "Privacy fetched successfully", data: privacy})
    }
    catch(error){
        console.log(error)
        res.status(500).json({message: "Internal server error"})
    }
}
const updatePrivacy = async (req, res) => {
    try {
        const { contentType } = req.query;
        const { content, renderedContent } = req.body;
        const privacy = await Privacy.findOneAndUpdate(
            { contentType },
            { content, renderedContent },
            { new: true }
        );
        if (!privacy) {
            return res.status(404).json({ message: "Privacy not found" });
        }
        res.status(200).json({ message: "Privacy updated successfully", data: privacy });
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Internal server error"})
        
    }
}

export {
    
    getPrivacy,
    getAll,
    updatePrivacy,
   
}