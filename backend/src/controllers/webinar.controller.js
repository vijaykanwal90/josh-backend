import { asynchHandler } from "../utils/AsynchHandler.js";
import  Webinar  from "../models/webinar.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadCloudinary } from "../utils/Cloudinary.js";
import sendMail from "../utils/sendMail.js";
import twilio from 'twilio';
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
import { Parser } from 'json2csv';
import mongoose from 'mongoose';

// Add new webinar
const addWebinar = asynchHandler(async (req, res) => {
    try {
        const { title, description, categories, date, time, duration, presenterName, presenterRole, agenda } = req.body;
        
        const requiredFields = [
            { field: title, name: "Title" },
            { field: description, name: "Description" },
            { field: categories, name: "Category" },
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

        // Parse agenda JSON if it exists
        let parsedAgenda = [];
        if (agenda) {
            try {
                parsedAgenda = JSON.parse(agenda);
                
                // Validate agenda items
                if (!Array.isArray(parsedAgenda) || parsedAgenda.length === 0) {
                    throw new ApiError(400, "At least one agenda item is required");
                }
                
                // Validate each agenda item
                for (const item of parsedAgenda) {
                    if (!item.title || !item.title.trim()) {
                        throw new ApiError(400, "Agenda item title is required");
                    }
                    if (!item.description || !item.description.trim()) {
                        throw new ApiError(400, "Agenda item description is required");
                    }
                    if (!item.timeToComplete || !item.timeToComplete.trim()) {
                        throw new ApiError(400, "Agenda item time to complete is required");
                    }
                    
                    // Validate time format (HH:MM)
                    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
                    if (!timeRegex.test(item.timeToComplete)) {
                        throw new ApiError(400, "Time to complete must be in HH:MM format");
                    }
                }
                
                // Check for duplicate titles
                const titles = new Set();
                for (const item of parsedAgenda) {
                    if (titles.has(item.title.trim())) {
                        throw new ApiError(400, "Duplicate agenda item titles are not allowed");
                    }
                    titles.add(item.title.trim());
                }
            } catch (error) {
                if (error instanceof ApiError) {
                    throw error;
                }
                throw new ApiError(400, error.message || "Invalid agenda format");
            }
        }
        
        const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
        const presenterImageLocalPath = req.files?.presenterImage?.[0]?.path;
        const uploadedThumbnail = await uploadCloudinary(thumbnailLocalPath);
        const uploadedPresenterImage = await uploadCloudinary(presenterImageLocalPath);
        
        const webinar = new Webinar({
            title,
            description,
            categories,
            date,
            time,
            duration,
            thumbnail: uploadedThumbnail.url,
            presenterName,
            presenterRole,
            presenterImage: uploadedPresenterImage.url,
            agenda: parsedAgenda // Add agenda to the webinar
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
        throw new ApiError(500, error.message || "Internal server error");
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
        throw new ApiError(500, error.message || "Internal server error");
    }
});

// update webinar
const updateWebinar = asynchHandler(async (req, res) => {
    try {
        let isRescheduled = false;
        const webinarId = req.params.id;
        const { title, description, categories, date, time, duration, presenterName, presenterRole, agenda } = req.body;

        const webinar = await Webinar.findById(webinarId);
        if (!webinar) {
            throw new ApiError(404, "Webinar not found");
        }
        
        if (title) webinar.title = title;
        if (description) webinar.description = description;
        if (categories) webinar.categories = categories;
        if (date && webinar.date !== date) {
            webinar.date = date;
            isRescheduled = true;
        }
        if (time && webinar.time !== time) {
            webinar.time = time;
            isRescheduled = true;
        }
        if (duration) webinar.duration = duration;
        if (presenterName) webinar.presenterName = presenterName;
        if (presenterRole) webinar.presenterRole = presenterRole;
        
        // Update agenda if provided
        if (agenda) {
            try {
                const parsedAgenda = JSON.parse(agenda);
                
                // Validate agenda items
                if (!Array.isArray(parsedAgenda) || parsedAgenda.length === 0) {
                    throw new ApiError(400, "At least one agenda item is required");
                }
                
                // Validate each agenda item
                for (const item of parsedAgenda) {
                    if (!item.title || !item.title.trim()) {
                        throw new ApiError(400, "Agenda item title is required");
                    }
                    if (!item.description || !item.description.trim()) {
                        throw new ApiError(400, "Agenda item description is required");
                    }
                    if (!item.timeToComplete || !item.timeToComplete.trim()) {
                        throw new ApiError(400, "Agenda item time to complete is required");
                    }
                    
                    // Validate time format (HH:MM)
                    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
                    if (!timeRegex.test(item.timeToComplete)) {
                        throw new ApiError(400, "Time to complete must be in HH:MM format");
                    }
                }
                
                // Check for duplicate titles
                const titles = new Set();
                for (const item of parsedAgenda) {
                    if (titles.has(item.title.trim())) {
                        throw new ApiError(400, "Duplicate agenda item titles are not allowed");
                    }
                    titles.add(item.title.trim());
                }
                
                // Update the agenda
                webinar.agenda = parsedAgenda;
            } catch (error) {
                if (error instanceof ApiError) {
                    throw error;
                }
                throw new ApiError(400, error.message || "Invalid agenda format");
            }
        }
        
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

        if (isRescheduled) {
            await sendMail({
            from: process.env.MAIL,
            to: webinar.webinarUsers.map(user => user.email),
            subject: `Webinar Rescheduled - ${webinar.title}`,
            text: `The webinar "${webinar.title}" has been rescheduled.\nNew Date: ${webinar.date}\nNew Time: ${webinar.time}\n\nThank you!`
            });
        }

        res.status(200)
        .json(new ApiResponse
            (
            200, 
            { webinar }, 
            "Webinar updated successfully"
            ));
        
    } catch (error) {
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
        throw new ApiError(500, error.message || "Internal server error");
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
        await sendMail({
            from: process.env.MAIL,
            to: email,
            subject: `Webinar Registration Confirmation - ${webinar.title}`,
            text: `Hi ${name},\n\nYou have successfully registered for the webinar: ${webinar.title}.\nDate: ${webinar.date}\n\nThank you!`
        });
        client.messages
        .create({
            body: `Hi ${name},\n\nYou have successfully registered for the webinar: ${webinar.title}.\nDate: ${webinar.date}\n\nThank you!`,
            from: 'whatsapp:+14155238886',
            to: 'whatsapp:+919579396984'
        })
        .then(message => console.log('WhatsApp message sent:', message.sid))
        .catch(error => console.error('Error sending WhatsApp message:', error));

        res.status(200)
        .json(new ApiResponse
            (
                200, 
                { user }, 
                "User registered for webinar successfully"
            ));
    } catch (error) {
        console.log(error);
        throw new ApiError(500, error.message || "Internal server error");
    }
});

// set link for webinar
const setWebinarLink = asynchHandler(async (req, res) => {
    try {
        const webinarId = req.params.id;
        const { link } = req.body;
        if (!link) {
            throw new ApiError(400, "Link is required");
        }
        const webinar = await Webinar.findById(webinarId);
        if (!webinar) {
            throw new ApiError(404, "Webinar not found");
        }
        webinar.link = link;
        await webinar.save();
        await sendMail({
            from: process.env.MAIL,
            to: webinar.webinarUsers.map(user => user.email),
            subject: `Webinar Link - ${webinar.title}`,
            text: `The link for the webinar "${webinar.title}" is now available.\nLink: ${link}\n\nThank you!`
        });
        res.status(200)
        .json(new ApiResponse
            (
                200, 
                { webinar }, 
                "Webinar link set successfully"
            ));
    } catch (error) {
        console.log(error);
        throw new ApiError(500, error.message || "Internal server error");
    }
});

// send mail to all users
const sendMailToAllUsers = asynchHandler(async (req, res) => {
    try {
        const webinarId = req.params.id;
        const { subject, text } = req.body;
        if (!subject || !text) {
            throw new ApiError(400, "Subject and text are required");
        }
        const webinar = await Webinar.findById(webinarId);
        if (!webinar) {
            throw new ApiError(404, "Webinar not found");
        }
        await sendMail({
            from: process.env.MAIL,
            to: webinar.webinarUsers.map(user => user.email),
            subject,
            text
        });
        res.status(200)
        .json(new ApiResponse
            (
                200, 
                {}, 
                "Mail sent to all users successfully"
            ));
    } catch (error) {
        console.log(error);
        throw new ApiError(500, error.message ||"Internal server error");
    }
});

// Export webinarusers data to csv
const exportWebinarUsersToCSV = asynchHandler(async (req, res) => {
    try {
        // 1. Properly extract ID from URL parameters
        const { id } = req.params;

        // 2. Validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid webinar ID format"
            });
        }

        // 3. Find the webinar with proper ID casting
        const webinar = await Webinar.findById(id);
        if (!webinar) {
            return res.status(404).json({
                success: false,
                message: "Webinar not found"
            });
        }

        // 4. Check for registered users
        if (!webinar.webinarUsers?.length) {
            return res.status(400).json({
                success: false,
                message: "No registered users for this webinar"
            });
        }

        // 5. Prepare CSV data
        const usersData = webinar.webinarUsers.map(user => ({
            Name: user.name,
            Email: user.email,
            Mobile: user.mobile,
            'Registration Date': new Date(user.registeredAt).toLocaleString()
        }));

        // 6. Configure CSV parser
        const parser = new Parser({
            fields: ['Name', 'Email', 'Mobile', 'Registration Date']
        });

        // 7. Generate CSV
        const csv = parser.parse(usersData);

        // 8. Set response headers
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 
            `attachment; filename="${webinar.title.replace(/ /g,'_')}_users.csv"`
        );

        // 9. Send CSV response
        res.send(csv);

    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to export users",
            error: error.message
        });
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
    registerForWebinar,
    setWebinarLink,
    sendMailToAllUsers,
    exportWebinarUsersToCSV 
};