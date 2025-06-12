import { ApiError } from "../utils/ApiError.js";
import { asynchHandler } from "../utils/AsynchHandler.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import bcrypt from 'bcryptjs';
import { Wallet } from "../models/Wallet.model.js";
import sendMail from "../utils/sendMail.js";
import crypto from 'crypto';
// import { JsonWebToken } from "jsonwebtoken";

const registerUser = asynchHandler(async (req, res) => {
    let { name, email, password, referralCode, mobilenumber ,adminGeneratedPassword} = req.body;
    try {
        console.log("on registreation")
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
            console.log("exists")
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
        let assignedPassword='';
        if(adminGeneratedPassword){
            assignedPassword=adminGeneratedPassword
        }
        const user = new User({
            name,
            email,
            password: hashedPassword,
            sharableReferralCode,
            mobilenumber,
            referredByCode: referralCode,
            adminGeneratedPassword:assignedPassword
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

        if (user) {
            const signupDate = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            await sendMail({
            from: process.env.MAIL,
            to: email,
            subject: "Welcome to JoshGuru – Start Your Learning Journey!",
            text: `Hi ${name},
Thank you for signing up on JoshGuru.com! We’re excited to have you join our community of learners.

Your Signup Details:
Email: ${email}
Account Type: Free
Signup Date: ${signupDate}

Now that you’re registered, you can:
✔ Explore hundreds of courses on coding, business, design, and more.
 ✔ Track your progress with personalized dashboards
✔ Earn certificates upon course completion
            
Get Started Now:
🔹 Browse Courses: https://joshguru.com/courses
🔹 Complete Your Profile: https://joshguru.com/dashboard

Need help? Check out our FAQs or contact our support team at support@joshguru.com.

Happy Learning!

Best Regards,  
Team JoshGuru  
JoshGuru.com

Follow us on:  
Facebook: https://www.facebook.com/JoshGurukul?rdid=lv8OwIlSc66NsvPR&share_url=https%3A%2F%2Fwww.facebookcom%2Fshare%2F1AmhJ2wYRN%2F#  
Twitter: https://x.com/JoshguruOffice?t=CjZFVCpl7yCGwUfoiFevjA&s=09  
Instagram: https://www.instagram.com/joshguru.in/?igsh=MXo5aWFkN3dmd3Yw#`                
 });
        }



        return res.status(200).json(new ApiResponse(201, { user }, "User registered successfully"));

    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Internal server error");
    }
});
const adminUserRegister = asynchHandler(async (req, res) => {
    console.log("In admin user register");

    let { name, email, password, referralCode, mobilenumber, adminGeneratedPassword } = req.body;

    try {
        if (!name || !email || !password || !mobilenumber) {
            throw new ApiError(400, "All required fields must be provided");
        }

        email = email.toLowerCase();

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { mobilenumber }]
        });

        if (existingUser) {
            if (existingUser.mobilenumber === mobilenumber) {
                throw new ApiError(400, "Mobile number already exists");
            }
            if (existingUser.email === email) {
                throw new ApiError(400, "Email already exists");
            }
        }

        // Validate referral code if provided
        let referredByUser = null;
        if (referralCode) {
            referredByUser = await User.findOne({ sharableReferralCode: referralCode });
            if (!referredByUser) {
                throw new ApiError(400, "Invalid referral code");
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate unique referral code
        const namePart = name.split(" ")[0].toUpperCase();
        const mobilePart = mobilenumber.slice(-4);
        const randomPart = Math.floor(1000 + Math.random() * 9000);
        const sharableReferralCode = `${namePart}${mobilePart}${randomPart.toString().substring(0, 1)}`;

        const assignedPassword = adminGeneratedPassword || '';

        // Create user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            sharableReferralCode,
            mobilenumber,
            referredByCode: referralCode || null,
            adminGeneratedPassword: assignedPassword
        });

        await user.save();
        console.log(user)
        // Create wallet
        const wallet = await new Wallet({
            user: user._id
        }).save();

        if (!wallet) {
            throw new ApiError(500, "Unable to create wallet");
        }

        // Reward referrer
        if (referredByUser) {
            const refWallet = await Wallet.findOne({ user: referredByUser._id });

            if (refWallet) {
                refWallet.balance += 1000;
                refWallet.referedUsers.push(user._id);
                await refWallet.save();
            } else {
                throw new ApiError(500, "Referrer wallet not found");
            }
        }
        
        return res.status(201).json(new ApiResponse(201, { user }, "User registered successfully"));

    } catch (error) {
        console.error(error);
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
            .populate({
                path: 'bundles',
                options: { sort: { price: 1 } } // Sort by price ascending
            })
            .exec();

        if (!user || !(await user.verifyPassword(password))) {
            throw new ApiError(401, "Invalid credentials");
        }
        const token = await user.getJWT();
        res.cookie('token', token, {
            httpOnly: true,
            secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
        });
        

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
const adminPasswordChange = asynchHandler(async (req, res) => {
    try {
        const { email } = req.user;
        const { oldPassword, newPassword } = req.body;

        const userExist = await User.findOne({ email }).select("+password"); // ✅ Correct method

        if (!userExist) {
            throw new ApiError(404, "User does not exist");
        }

        const isPasswordMatched = await bcrypt.compare(oldPassword, userExist.password); // ✅ Correct comparison

        if (!isPasswordMatched) {
            throw new ApiError(400, "Password does not match");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        userExist.password = hashedPassword;

        await userExist.save(); // ✅ Save updated user

        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });
    } catch (error) {
        throw new ApiError(500, `Internal Server Error: ${error.message}`);
    }
});



const assignAdmin = asynchHandler(async(req,res)=>{

})
const removeAdmin = asynchHandler(async(req,res)=>{

})
const checkUserExist = asynchHandler(async (req, res) => {
    console.log("check user exist")
    console.log(req.body)
    let { mobilenumber,email } = req.body;
    console.log(mobilenumber)
    console.log("this is to check")
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
        console.log(user)
        if(user){
        throw new ApiError(400, "Email already exists");
        }   
        if (!user) {
          return  res.status(200).json(new ApiResponse(400, null, "User not found")); 
        }
       console.log("not exist")
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

// Forgot Password - Generate reset token and send email
const forgotPassword = asynchHandler(async (req, res) => {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
        // For security, don't reveal if email doesn't exist
        return res.status(200).json(
            new ApiResponse(200, {}, "If your email is registered, you'll receive a password reset link shortly.")

        );
    }

    // Generate reset token and set expiration (1 hour)
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    try {
        // Send password reset email
        await sendMail({
            from: process.env.MAIL,
            to: user.email,
            subject: "Reset Your JoshGuru Password",
            text: `Hi ${user.name},
We received a request to reset your password for your JoshGuru account. 
To proceed, click the link below:
Reset Password: ${resetUrl}
(Link expires in 1 hour)

Can't click the button? 
Copy paste this link into your browser: ${resetUrl}

Didn't request this? Ignore this email—your account is still secure.

For help, contact our support team at ${process.env.SUPPORT_EMAIL}.

Stay safe,\nThe JoshGuru Team
${process.env.CLIENT_URL}`
        });

        return res.status(200).json(
            new ApiResponse(200, {}, "Password reset email sent successfully")
        );
    } catch (error) {
        // Reset token if email fails
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        throw new ApiError(500, "Email could not be sent");
    }
});

// Reset Password - Process password reset
const resetPassword = asynchHandler(async (req, res) => {
    const { token, password } = req.body;
    
    if (!token) {
        throw new ApiError(400, "Password reset token is required");
    }

    // Hash token to match database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    // Find user by token and check expiration
    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        throw new ApiError(400, "Invalid or expired token");
    }

    // Update password and clear reset fields
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    console.log(hashedPassword)
    console.log("new user with password"+user.password)
    // Notify user about password change
    await sendMail({
        from: process.env.MAIL,
        to: user.email,
        subject: "Your JoshGuru Password Has Been Changed",
        text: `Hi ${user.name},
This is a confirmation that the password for your JoshGuru account (${user.email}) 
was recently changed.
If you made this change, no further action is needed.

If you didn't change your password, please contact our support team immediately at ${process.env.SUPPORT_EMAIL}.

Stay safe,
The JoshGuru Team
${process.env.CLIENT_URL}`
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "Password has been reset successfully")
    );
});

// Change Password (for logged-in users)
const changePassword = asynchHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Current password is incorrect");
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Send password change notification
    await sendMail({
        from: process.env.MAIL,
        to: user.email,
        subject: "Your JoshGuru Password Was Changed",
        text: `Hi ${user.name},
This is a confirmation that your JoshGuru password was recently changed.

If you made this change, no further action is needed.

If you didn't change your password, please contact our support team immediately at ${process.env.SUPPORT_EMAIL}.

Stay safe,
The JoshGuru Team
${process.env.CLIENT_URL}`
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    );
});

export { registerUser, loginUser, logoutUser, checkUserExist , deleteUser, forgotPassword, resetPassword, changePassword,adminPasswordChange,assignAdmin,removeAdmin, adminUserRegister };