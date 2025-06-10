import { asynchHandler } from "../utils/AsynchHandler.js";
import { ApiError } from "../utils/ApiError.js";
import Payment from "../models/payment.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import razorpayInstance from "../../utils/razorpay.js";
import { Course } from "../models/course.model.js";
import { Bundle } from "../models/bundle.model.js";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils.js";
import { User } from "../models/user.model.js";

const createPayment = asynchHandler(async (req, res) => {
    const { id, name, phoneNo, email } = req.body;
  try {
    
      if (!Array.isArray(id) || id.length === 0) {
        throw new ApiError(400, "At least one ID is required");
      }
    
      let courseIds = [];
      let bundleIds = [];
      let totalExpectedAmount = 0;
    
      for (const itemId of id) {
        const course = await Course.findById(itemId);
        if (course) {
          courseIds.push(course._id);
          totalExpectedAmount += course.price;
          continue;
        }
    
        const bundle = await Bundle.findById(itemId);
        if (bundle) {
          bundleIds.push(bundle._id);
          totalExpectedAmount += bundle.price;
          continue;
        }
    
        throw new ApiError(404, `No Course or Bundle found with ID: ${itemId}`);
      }
    
      const options = {
        amount: totalExpectedAmount * 100, // ✅ calculate correctly and convert to paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        notes: {
          name: name || "N/A",
          phoneNo: phoneNo || "N/A",
          email: email || "N/A",
        },
      };
    
      const razorpayOrder = await razorpayInstance.orders.create(options);
    
      const orderTypes = [];
      if (courseIds.length) orderTypes.push("course");
      if (bundleIds.length) orderTypes.push("bundle");
    
      const newPayment = new Payment({
        notes: options.notes,
        orderId: razorpayOrder.id,
        amount: totalExpectedAmount,
        receipt: razorpayOrder.receipt,
        currency: "INR",
        status: "created",
        orderType: orderTypes,
        courseIds,
        bundleIds,
      });
    
      await newPayment.save();
    
      return res.status(200).json(
        new ApiResponse(true, "Payment created successfully", razorpayOrder)
      );
  } catch (error) {
    console.error("Error creating payment:", error);
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json(new ApiResponse(false, error.message));
    }
    return res.status(500).json(new ApiResponse(false, "Internal Server Error"));
  }
  });



const webHookHandler = asynchHandler(async (req, res) => {
  // Step 1: Signature Validation
 try {
  const razorpaySignature = req.headers["x-razorpay-signature"];
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  
  if (!secret) {
    throw new ApiError(500, "Webhook secret not configured");
  }
  
  // Validate signature
  const isSignatureValid = validateWebhookSignature(req.rawBody, razorpaySignature, secret);
  
  if (!isSignatureValid) {
    throw new ApiError(400, "Invalid webhook signature");
  }
  
  // Safely extract paymentDetails
  const paymentDetails = req.body?.payload?.payment?.entity;
  
  if (!paymentDetails || !paymentDetails.order_id) {
    console.error("Webhook Error: Invalid payment payload:", JSON.stringify(req.body));
    throw new ApiError(400, "Invalid payment payload. Order ID missing.");
  }
  
  // Correct usage
  const payment = await Payment.findOne({ orderId: paymentDetails.order_id });

       console.log(payment)
   
       if (!payment) {
         console.error(`Webhook Critical: Payment record not found for Order ID: ${paymentDetails.orderId}. Manual check required.`);
         return res.status(200).json(new ApiResponse(200, null, "Acknowledged, but payment record not found."));
       }
   
       // Idempotency Check: If we've already completed this, don't do it again.
       if (payment.status === 'completed') {
         console.log(`Webhook Info: Order ID ${paymentDetails.orderId} has already been processed.`);
         return res.status(200).json(new ApiResponse(200, null, "Order already completed."));
       }
   
       // Find the user who made the payment
       const user = await User.findOne({ email: payment.notes.email });
       if (!user) {
           payment.status = 'failed';
           await payment.save();
           console.error(`Webhook Critical: User not found for email: ${payment.notes.email}. Order: ${paymentDetails.orderId}`);
           return res.status(200).json(new ApiResponse(200, null, "Acknowledged, but user not found."));
       }
       
       payment.userId = user._id;
       payment.status = paymentDetails.status;
       try {
         for (const bundleIdToAssign of payment.bundleIds) {
           console.log(`Attempting to assign bundle ${bundleIdToAssign} to user ${user._id}`);
           const bundle = await Bundle.findById(bundleIdToAssign).populate('courses');
           if (!bundle) {
               console.error(`Fulfillment Error: Bundle with ID ${bundleIdToAssign} not found. Skipping.`);
               continue; // Skip to the next item
           }
   
           // Idempotency check for this specific bundle
           if (user.bundles.includes(bundle._id)) {
               console.log(`User already has bundle ${bundle._id}. Skipping.`);
               continue;
           }
   
           // Assign bundle to user and vice-versa
           user.bundles.push(bundle._id);
           bundle.students.push(user._id);
           user.canRefer = true;
   
           // 2. Assign all lower-priced bundles for free
           const lowerBundles = await Bundle.find({ price: { $lt: bundle.price } });
           for (const lowerBundle of lowerBundles) {
               if (!user.bundles.includes(lowerBundle._id)) {
                   user.bundles.push(lowerBundle._id);
               }
               if (!lowerBundle.students.includes(user._id)) {
                   lowerBundle.students.push(user._id);
                   await lowerBundle.save({ validateBeforeSave: false });
               }
           }

           // Referral Bonus Logic
           if (user.referredByCode) {
               const oneLevelUser = await User.findOne({ sharableReferralCode: user.referredByCode });
               if (oneLevelUser) {
                   oneLevelUser.total_income += bundle.price * 0.25;
                   if (!oneLevelUser.myTeam.includes(user._id)) oneLevelUser.myTeam.push(user._id); oneLevelUser.totalTeam += 1;
                   oneLevelUser.incomeHistory.push({ amount: bundle.price * 0.25, from: user._id });
                   
                   if (oneLevelUser.referredByCode) {
                       const secondLevelUser = await User.findOne({ sharableReferralCode: oneLevelUser.referredByCode });
                       if (secondLevelUser) {
                           secondLevelUser.total_income += bundle.price * 0.30;
                           if (!secondLevelUser.myTeam.includes(user._id)) secondLevelUser.myTeam.push(user._id); secondLevelUser.totalTeam += 1;
                           secondLevelUser.incomeHistory.push({ amount: bundle.price * 0.30, from: user._id });
                           await secondLevelUser.save({ validateBeforeSave: false });
                       }
                   }
                   await oneLevelUser.save({ validateBeforeSave: false });
               }
           }
           
           // Assign all courses within the bundle
           for (const courseInBundle of bundle.courses) {
               if (!user.courses.includes(courseInBundle._id)) user.courses.push(courseInBundle._id);
               if (!courseInBundle.students.includes(user._id)) {
                   courseInBundle.students.push(user._id);
                   await courseInBundle.save({ validateBeforeSave: false });
               }
           }
           await bundle.save({ validateBeforeSave: false });
           console.log(`Successfully assigned bundle ${bundleIdToAssign}.`);
         }
   
         // --- IN-LINED COURSE ASSIGNMENT LOGIC ---
         for (const courseIdToAssign of payment.courseIds) {
           console.log(`Attempting to assign course ${courseIdToAssign} to user ${user._id}`);
           const course = await Course.findById(courseIdToAssign);
           if (!course) {
               console.error(`Fulfillment Error: Course with ID ${courseIdToAssign} not found. Skipping.`);
               continue;
           }
   
           if (user.courses.includes(course._id)) {
               console.log(`User already has course ${course._id}. Skipping.`);
               continue;
           }
           
           course.students.push(user._id);
           user.courses.push(course._id);
           
           if (course.isTrending) user.canRefer = true;
   
           await course.save({ validateBeforeSave: false });
           console.log(`Successfully assigned course ${courseIdToAssign}.`);
         }
         
         // All assignments succeeded, now save the user and mark payment as completed
         await user.save({ validateBeforeSave: false });
         
         await payment.save()
         console.log(`Successfully fulfilled all items for Order ID: ${paymentDetails.orderId}`);
   
       } catch (error) {
         // If ANY assignment fails, we catch it here.
         payment.status = 'failed';
        
         console.error(`Webhook CRITICAL: Fulfillment failed for Order ID ${paymentDetails.orderId}. Error: ${error.message}`);
       }
   
       // Save the final state of the payment record, whether 'completed' or 'assignment_failed'
       await payment.save();
       
   
    return  res.status(200).json(new ApiResponse(200, null, "Webhook processed successfully"));
   
 } catch (error) {
    console.error("Webhook Error:", error);
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json(new ApiResponse(false, error.message));
    }
    return res.status(500).json(new ApiResponse(false, "Internal Server Error"));
 }
});
 
export { createPayment,webHookHandler };
