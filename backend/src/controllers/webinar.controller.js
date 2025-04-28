import { asynchHandler } from "../utils/AsynchHandler.js";
import  Webinar  from "../models/webinar.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadCloudinary } from "../utils/Cloudinary.js";

// Add new webinar
const addWebinar = asynchHandler(async (req, res) => {
    try {
        const { title, description, date, time, duration, presenterName, presenterRole } = req.body;
        
        const requiredFields = [
            { field: title, name: "Title" },
            { field: description, name: "Description" },
            { field: date, name: "Date" },
            { field: time, name: "Time" },
            { field: duration, name: "Duration" },
            { field: presenterName, name: "Presenter name" },
            { field: presenterRole, name: "Presenter role" }
        ];
    
        for (const { field, name } of requiredFields) {
            if (!field) {
                throw new ApiError(400, `${name} is required`);
            }
        }
    
        if (!req.files?.thumbnail) {
            throw new ApiError(400, "Thumbnail is required");
        }
    
        if (!req.files?.presenterImage) {
            throw new ApiError(400, "Presenter image is required");
        }
        const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
        const presenterImageLocalPath = req.files?.presenterImage?.[0]?.path;
        const uploadedThumbnail = await uploadCloudinary(thumbnailLocalPath);
        const uploadedPresenterImage = await uploadCloudinary(presenterImageLocalPath);
        const webinar = new Webinar({
            title,
            description,
            date,
            time,
            duration,
            thumbnail: uploadedThumbnail.url,
            presenterName,
            presenterRole,
            presenterImage: uploadedPresenterImage.url
        });
        await webinar.save();

        res.status(200)
        .json(new ApiResponse
            (   
                200,
                { webinar },
                "Webinar added successfully"
            )
        )
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Internal server error");
    }
});

// get all webinars
const getAllWebinars = asynchHandler(async (req, res) => {
    try {
        const webinars = await Webinar.find();
        if (!webinars) {
            throw new ApiError(404, "No webinars found");
        }
        res.status(200)
        .json(new ApiResponse
            (
                200, 
                { webinars }, 
                "Webinars fetched successfully"
            ));
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Internal server error");
    }
});

// get single webinar
const getSingleWebinar = asynchHandler(async (req, res) => {
    try {
        const webinarId = req.params.id;
        const webinar = await Webinar.findById(webinarId);
        if (!webinar) {
            throw new ApiError(404, "Webinar not found");
        }
        res.status(200)
        .json(new ApiResponse
            (
                200, 
                { webinar }, 
                "Webinar fetched successfully"
            ));
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Internal server error");
    }
});

// update webinar
const updateWebinar = asynchHandler(async (req, res) => {
    try {
        const webinarId = req.params.id;
        const { title, description, date, time, duration, presenterName, presenterRole } = req.body;

        const webinar = await Webinar.findById(webinarId);
        if (!webinar) {
            throw new ApiError(404, "Webinar not found");
        }
        if (title) webinar.title = title;
        if (description) webinar.description = description;
        if (date) webinar.date = date;
        if (time) webinar.time = time;
        if (duration) webinar.duration = duration;
        if (presenterName) webinar.presenterName = presenterName;
        if (presenterRole) webinar.presenterRole = presenterRole;
        if (req.files?.thumbnail) {
            const thumbnailLocalPath = req.files.thumbnail[0].path;
            const uploadedThumbnail = await uploadCloudinary(thumbnailLocalPath);
            webinar.thumbnail = uploadedThumbnail.url;
        }
        if (req.files?.presenterImage) {
            const presenterImageLocalPath = req.files.presenterImage[0].path;
            const uploadedPresenterImage = await uploadCloudinary(presenterImageLocalPath);
            webinar.presenterImage = uploadedPresenterImage.url;
        }
        await webinar.save();

        res.status(200)
        .json(new ApiResponse
            (
                200, 
                { webinar }, 
                "Webinar updated successfully"
            ));
        
    }catch (error) {
        console.log(error);
        throw new ApiError(500, "Internal server error");
    }
});

// delete webinar
const deleteWebinar = asynchHandler(async (req, res) => {
    try {
        const webinarId = req.params.id;
        const webinar = await Webinar.findById(webinarId);
        if (!webinar) {
            throw new ApiError(404, "Webinar not found");
        }
        await webinar.deleteOne();
        res.status(200)
        .json(new ApiResponse
            (
                200, 
                {}, 
                "Webinar deleted successfully"
            ));
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Internal server error");
    }
});

// change webinar status
const changeWebinarStatus = asynchHandler(async (req, res) => {
    try {
        const webinarId = req.params.id;
        const webinar = await Webinar.findById(webinarId);
        if (!webinar) {
            throw new ApiError(404, "Webinar not found");
        }

        const { status } = req.body;
        if (!status) {
            throw new ApiError(400, "Status is required");
        }
        const currentStatus = webinar.status;

        // Define allowed status transitions
        const allowedTransitions = {
            scheduled: ["cancelled", "live"],
            live: ["completed"],
            cancelled: [], 
            completed: []  
        };

        // Check if current status is valid
        if (!allowedTransitions.hasOwnProperty(currentStatus)) {
            throw new ApiError(400, `Invalid current status: ${currentStatus}`);
        }

        // Handle cancellation (allowed from any state)
        if (status === "cancelled") {
            webinar.status = status;
        } 
        // Validate other transitions
        else {
            const allowedStatuses = allowedTransitions[currentStatus];
            if (!allowedStatuses.includes(status)) {
                throw new ApiError(400, `Invalid transition from ${currentStatus} to ${status}`);
            }
            webinar.status = status;
        }

        // Auto-transition to "completed" if live webinar has ended
        if (currentStatus === "live" && status !== "completed") {
            const webinarDateTime = new Date(`${webinar.date}T${webinar.time}`);
            const webinarEndTime = new Date(webinarDateTime.getTime() + webinar.duration * 60000);
            if (new Date() >= webinarEndTime) {
                webinar.status = "completed";
            }
        }

        await webinar.save();

        res.status(200).json(
            new ApiResponse(
                200, 
                { webinar }, 
                "Webinar status updated successfully"
            )
        );
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Internal server error");
    }
});

// reshedule webinar
const rescheduleWebinar = asynchHandler(async (req, res) => {
    try {
        const webinarId = req.params.id;
        const { date, time, duration } = req.body;
    
        // Check if at least one field is provided
        if (!date && !time && !duration) {
            throw new ApiError(400, "At least one field (date, time, duration) is required");
        }

        const webinar = await Webinar.findById(webinarId);
        if (!webinar) {
            throw new ApiError(404, "Webinar not found");
        }

        // Update fields only if they exist in the request
        if (date) webinar.date = date;
        if (time) webinar.time = time;
        if (duration) webinar.duration = duration;

        await webinar.save();

        res.status(200).json(
            new ApiResponse(
                200, 
                { webinar }, 
                "Webinar rescheduled successfully"
            )
        );
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Internal server error");
    }
});

// register for webinar
const registerForWebinar = asynchHandler(async (req, res) => {
    try {
        const webinarId = req.params.id;
        const { name, email, mobile } = req.body;
        const requiredFields = [
            { field: name, name: "Name" },
            { field: email, name: "Email" },
            { field: mobile, name: "Mobile" }
        ];
        for (const { field, name } of requiredFields) {
            if (!field) {
                throw new ApiError(400, `${name} is required`);
            }
        }
        const webinar = await Webinar.findById(webinarId);
        if (!webinar) {
            throw new ApiError(404, "Webinar not found");
        }
        const userExists = webinar.webinarUsers.find(user => user.email === email);
        if (userExists) {
            throw new ApiError(400, "User already registered for this webinar");
        }
        const user = {
            name,
            email,
            mobile,
            registeredAt: new Date()
        };
        webinar.webinarUsers.push(user);
        await webinar.save();
        res.status(200)
        .json(new ApiResponse
            (
                200, 
                { user }, 
                "User registered for webinar successfully"
            ));
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Internal server error");
    }
});

export { 
    addWebinar,
    getAllWebinars,
    getSingleWebinar,
    updateWebinar,
    deleteWebinar,
    changeWebinarStatus,
    rescheduleWebinar,
    registerForWebinar 
};