import { ApiError } from "../utils/ApiError.js";
import { asynchHandler } from "../utils/AsynchHandler.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import bcrypt from 'bcryptjs';
import { Wallet } from "../models/Wallet.model.js";
const registerUser = asynchHandler(async (req, res) => {
    const { name, email, password, referralcode, mobilenumber } = req.body;
    try {
        // const validateUser = validateUserInput({ name, email, password, refrralcode, mobilenumber });
        // if(!validateUser){
        //     throw new ApiError(400, "Invalid input");
        // }
        // console.log(name);

        console.log("register user");
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
        if (referralcode) {


            const getReferralCode = await User.findOne({ sharableReferralCode: referralcode });
            if (!getReferralCode) {
                throw new ApiError(400, "Invalid referral code");
            }
        }
        const namePart = name.substring(0, 3).toUpperCase();
        console.log("mobile number");
        console.log("mobile ", typeof mobilenumber);
        const mobilePart = mobilenumber.slice(-4);
        const randomPart = Math.floor(1000 + Math.random() * 9000);
        const sharableReferralCode = `${namePart}${mobilePart}${randomPart.toString().substring(0, 1)}`;
        const user = new User({
            name,
            email,
            password: hashedPassword,
            sharableReferralCode,
            mobilenumber
        });

        await user.save();
        const wallet = await new Wallet({
            user: user._id
        }).save();
        if (!wallet) {
            throw new ApiError(500, "Unable to create wallet");
        }
        if (referralcode) {
            const referralUser = await User.findOne({ sharableReferralCode: referralcode });
            if (referralUser) {
                const wallet = await Wallet.findOne({ user: referralUser._id });

                wallet.balance += 1000;
                wallet.referedUsers.push(user._id);
                await wallet.save();

            }
            else {
                throw new ApiError(400, "Invalid referral code");
            }
        }
        console.log(wallet);
        console.log(user);
        return res.status(200).json(new ApiResponse(201, { user }, "User registered successfully"));

    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Internal server error");
    }
});

const loginUser = asynchHandler(async (req, res) => {
    const { email, password } = req.body;
    try {
        console.log("in logged route")
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

        return res.status(200).json(new ApiResponse(200, { user }, "User logged in successfully"));

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


export { registerUser, loginUser, logoutUser };