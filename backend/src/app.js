import express from 'express'
import authrouter from './routes/auth.router.js'
import userrouter from './routes/user.router.js'
import courserouter from './routes/course.router.js'
import cookieParser from 'cookie-parser'
import videorouter from './routes/video.router.js'
const app = express();
app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

app.use('/api/v1/auth', authrouter);
app.use('/api/v1/user', userrouter);
app.use('/api/v1/course', courserouter);
app.use('/api/v1/video', videorouter);


export { app }