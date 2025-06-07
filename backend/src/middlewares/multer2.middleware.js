import multer from "multer";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";

// Get __filename and __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the upload directory path
const uploadPath = path.join(__dirname, "../../../..", "josh-web/client/public/fileStore");
console.log("multer")
// Ensure that the directory exists (create it if it doesn't exist)
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath); // Set the destination directory for uploaded files
  },
  filename: function (req, file, cb) {
    // You can modify the filename here if you need
    cb(null, Date.now() + "_" + file.originalname); // Prefixing file with timestamp to avoid name collisions
  },
});

// File filter function to validate file types (Optional)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|jpg|jpeg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Only PDF, JPG, JPEG, PNG files are allowed.'), false); // Reject the file with error
  }
};

// Create multer instance with storage and file filter
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // Limit file size to 10MB (optional)
});

// Error handling middleware for file upload errors
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Handle multer-specific errors (e.g., file size too large)
    return res.status(400).json({ message: ` here is the muler eror Multer error: ${err.message}` });
  } else if (err) {
    // Handle custom file filter errors
    return res.status(400).json({ message: `File upload error occured: ${err.message}` });
  }
  next(); // Proceed if no error
};
