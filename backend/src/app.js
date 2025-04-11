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
import cors from 'cors'
import studentTestimonialRouter from "./routes/studentTestimonial.router.js";

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
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

app.use('/api/v1/auth', authrouter);
app.use('/api/v1/user', userrouter);
app.use('/api/v1/course', courserouter);
app.use('/api/v1/video', videorouter);
app.use('/api/v1/wallet',walletrouter);
app.use('/api/v1/discount',discountrouter);
app.use('/api/v1/blog', blogrouter);

app.use("/api/v1/testimonials", testimonialRouter);
app.use("/api/v1/studenttestimonials", studentTestimonialRouter);
app.use('/api/v1/popup',popuprouter);

export { app };