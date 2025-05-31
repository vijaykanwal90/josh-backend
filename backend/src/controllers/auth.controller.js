import { ApiError } from "../utils/ApiError.js";
import { asynchHandler } from "../utils/AsynchHandler.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import bcrypt from 'bcryptjs';
import { Wallet } from "../models/Wallet.model.js";
import sendMail from "../utils/sendMail.js";
// import { JsonWebToken } from "jsonwebtoken";

const registerUser = asynchHandler(async (req, res) => {
    let { name, email, password, referralCode, mobilenumber } = req.body;
    try {
        // const validateUser = validateUserInput({ name, email, password, refrralcode, mobilenumber });
        // if(!validateUser){
        //     throw new ApiError(400, "Invalid input");
        // }
        // console.log(name);
        // console.log("this is referral code of who refer this user")
        // console.log(referralCode)
        console.log("user registration ")
        email = email.toLowerCase();

        // console.log("register user");

        const exists = await User.findOne({
            $or: [{ email }, { mobilenumber }]
        });
        if (exists) {
            if (exists.mobilenumber == mobilenumber) {
                throw new ApiError(400, "Mobile number already exists");
            }
            else if (exists.email == email) {
                throw new ApiError(400, "Email already exists");
            }
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        if (referralCode) {


            const getreferralCode = await User.findOne({ sharableReferralCode: referralCode });
            if (!getreferralCode) {
                throw new ApiError(400, "Invalid referral code");
            }
        }
        const namePart = name.split(" ")[0].toUpperCase();

        // console.log("mobile number");
        // console.log("mobile ", typeof mobilenumber);
        const mobilePart = mobilenumber.slice(-4);
        const randomPart = Math.floor(1000 + Math.random() * 9000);
    
        const sharableReferralCode = `${namePart}${mobilePart}${randomPart.toString().substring(0, 1)}`;
        const user = new User({
            name,
            email,
            password: hashedPassword,
            sharableReferralCode,
            mobilenumber,
            referredByCode: referralCode,
        });
        // console.log(user)
        await user.save();
        const wallet = await new Wallet({
            user: user._id
        }).save();
        if (!wallet) {
            throw new ApiError(500, "Unable to create wallet");
        }
        if (referralCode) {
            // console.log("got the referral code")
            const referralUser = await User.findOne({ sharableReferralCode: referralCode });
            if (referralUser) {
                // console.log("user found")
                const wallet = await Wallet.findOne({ user: referralUser._id });

                wallet.balance += 1000;
                wallet.referedUsers.push(user._id);
                await wallet.save();

            }
            else {
                throw new ApiError(400, "Invalid referral code");
            }
        }
        // console.log(wallet);
        // console.log(user);
        if(user){
            const email = await sendMail({
                from: process.env.MAIL,
                to: email,
                subject: "Welcome to JoshGuru!",
                text: `Hi ${name},\n\n
                Welcome to JoshGuru! We're thrilled to have you on board.\n\n`
              })   
            if (!email) {
                throw new ApiError(500, "Unable to send welcome email");
            }
           }
    

        return res.status(200).json(new ApiResponse(201, { user }, "User registered successfully"));

    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Internal server error");
    }
});
const loginUser = asynchHandler(async (req, res) => {
    let { email, password } = req.body;
    try {
        email = email.toLowerCase();
       
        console.log("in logged in route")
        const user = await User
            .findOne({ email })
            .select("+password")
            .exec();

        if (!user || !(await user.verifyPassword(password))) {
            throw new ApiError(401, "Invalid credentials");
        }
        const token = await user.getJWT();
        res.cookie('token', token, {
            httpOnly: true,
            secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
        });
        // const token = JsonWebTokenError.sign(
        //     {userId: user._id},
        //     process.env.JWT_SECRET,
        //     { expiresIn: '24h' }   
        // )

        return res.status(200).json(new ApiResponse(200, { token,user }, "User logged in successfully"));

    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Internal server error");
    }
}
);
const logoutUser = (req, res) => {
    try {
        res.clearCookie('token');
    return res.status(200).json(new ApiResponse(200, {}, "User logged out successfully"));
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Internal server error");
    }
}

const checkUserExist = asynchHandler(async (req, res) => {
    console.log(req.body)
    let { mobilenumber,email } = req.body;
    console.log(mobilenumber)
    console.log(email);
    try {
        let user = await User.findOne(
            {
                mobilenumber
            }
        )
        console.log(user)
        if(user){
            throw new ApiError(400, "Mobile number already exists");
        }
        if (!user) {
             user = await User.findOne(
                {
                    email
                }
            )
        }
        if(user){
        throw new ApiError(400, "Email already exists");
        }   
        if (!user) {
          return  res.status(200).json(new ApiResponse(200, null, "User not found")); 
        }
       
    } catch (error) {
        console.log(error);
        return res.status(500).json(new ApiResponse(500, null, error.message));
    }
}
);
const deleteUser = asynchHandler (async (req,res)=>{
    try {
        const { userId } = req.params;
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json(new ApiResponse(404, null, "User not found"));
        }
        return res.status(200).json(new ApiResponse(200, null, "User deleted successfully"));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new ApiResponse(500, null, error.message));
    }
})

export { registerUser, loginUser, logoutUser, checkUserExist , deleteUser};