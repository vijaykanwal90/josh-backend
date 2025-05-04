import express from 'express'
import authrouter from './routes/auth.router.js'
import userrouter from './routes/user.router.js'
import courserouter from './routes/course.router.js';
import walletrouter from './routes/wallet.router.js';
import cookieParser from 'cookie-parser'
import videorouter from './routes/video.router.js'
import discountrouter from './routes/discount.route.js'
import popuprouter from './routes/popup.router.js'
import testimonialRouter from './routes/testimonial.router.js'
import blogrouter from './routes/blog.router.js'
import bundlerouter from './routes/bundle.router.js'
import cors from 'cors'
import studentTestimonialRouter from "./routes/studentTestimonial.router.js";
import privacyRouter from './routes/privacy.router.js';
import webinar from './routes/webinar.router.js';
import mentorrouter from './routes/mentor.router.js'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path';

const app = express();
const URL = process.env.FRONTEND_URL;
// console.log(URL)
app.use(cookieParser());
const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true,
    optionsSuccessStatus: 200,
    methods:"GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ['Content-Type', 'Authorization'],


}
app.use(cors(corsOptions))
app.options("*",cors(corsOptions)) // now added 

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
// In your Express backend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/files", express.static(path.join(__dirname, "../../josh-web/client/public/fileStore")));




app.use('/api/v1/auth', authrouter);
app.use('/api/v1/user', userrouter);
app.use('/api/v1/bundle', bundlerouter);
app.use('/api/v1/course', courserouter);
app.use('/api/v1/video', videorouter);
app.use('/api/v1/wallet',walletrouter);
app.use('/api/v1/discount',discountrouter);
app.use('/api/v1/blog', blogrouter);
app.use("/api/v1/mentors", mentorrouter);
app.use('/api/v1/webinar', webinar);

app.use("/api/v1/testimonials", testimonialRouter);
app.use("/api/v1/studenttestimonials", studentTestimonialRouter);
app.use('/api/v1/popup',popuprouter);
app.use('/api/v1/privacy', privacyRouter);

export { app };