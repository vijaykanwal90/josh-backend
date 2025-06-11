import { asynchHandler } from "../utils/AsynchHandler.js";
import { ApiError } from "../utils/ApiError.js";
import Payment from "../models/payment.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import razorpayInstance from "../utils/razorpay.js";
import { Course } from "../models/course.model.js";
import { Bundle } from "../models/bundle.model.js";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils.js";
import { User } from "../models/user.model.js";

const createPayment = asynchHandler(async (req, res) => {
    const { id, name, phoneNo, email, route } = req.body;
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
    
        throw new ApiError(404,`No Course or Bundle found with ID: ${itemId}`);
      }
    
      const options = {
        amount: totalExpectedAmount * 100, // ✅ calculate correctly and convert to paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        notes: {
          name: name || "N/A",
          phoneNo: phoneNo || "N/A",
          email: email || "N/A",
          route:route || "N/A",
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
    try {
      // Step 1: Signature Validation
      const razorpaySignature = req.headers["x-razorpay-signature"];
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  
      if (!secret) {
        throw new ApiError(500, "Webhook secret not configured");
      }
  
      const isSignatureValid = validateWebhookSignature(req.rawBody, razorpaySignature, secret);
      if (!isSignatureValid) {
        throw new ApiError(400, "Invalid webhook signature");
      }
  
      const paymentDetails = req.body?.payload?.payment?.entity;
      const orderId = paymentDetails?.order_id;
  
      console.log("Webhook Info: Payment Details:", JSON.stringify(paymentDetails));
  
      if (!paymentDetails || !orderId) {
        console.error("Webhook Error: Invalid payment payload:", JSON.stringify(req.body));
        throw new ApiError(400, "Invalid payment payload. Order ID missing.");
      }
  
      const payment = await Payment.findOne({ orderId });
      console.log(payment);
    if (paymentDetails.status !== "captured") {
        payment.status = 'failed';
        await payment.save();
        console.warn(`Payment not captured. Status: ${paymentDetails.status}. Skipping fulfillment.`);
        return res.status(200).json(new ApiResponse(200, null, "Payment not captured. Ignoring."));
      }
      
      if (!payment) {
        console.error(`Webhook Critical: Payment record not found for Order ID: ${orderId}. Manual check required.`);
        return res.status(200).json(new ApiResponse(200, null, "Acknowledged, but payment record not found."));
      }
  
      if (payment.status === 'completed') {
        console.log(`Webhook Info: Order ID ${orderId} has already been processed.`);
        return res.status(200).json(new ApiResponse(200, null, "Order already completed."));
      }
      const user = await User.findOne({ email: payment.notes.email });
      if (!user) {
        payment.status = 'failed';
        await payment.save();
        console.error(`Webhook Critical: User not found for email: ${payment.notes.email}. Order: ${orderId}`);
        return res.status(200).json(new ApiResponse(200, null, "Acknowledged, but user not found."));
      }
    
      payment.userId = user._id;
      if(user && paymentDetails.status !== 'captured' && payment.notes.route==="signup") {
        console.log("user created but payment is not captured");
        await User.findOneAndDelete(user._id);
      }  
  
      try {
        // --- Assign Bundles ---
        for (const bundleIdToAssign of payment.bundleIds) {
          console.log(`Assigning bundle ${bundleIdToAssign} to user ${user._id}`);
          const bundle = await Bundle.findById(bundleIdToAssign).populate('courses');
          if (!bundle) {
            console.error(`Fulfillment Error: Bundle ${bundleIdToAssign} not found.`);
            continue;
          }
  
          if (!user.bundles.includes(bundle._id)) {
            user.bundles.push(bundle._id);
          }
          if (!bundle.students.includes(user._id)) {
            bundle.students.push(user._id);
          }
  
          user.canRefer = true;
  
          // Assign lower-priced bundles and their courses
          const lowerBundles = await Bundle.find({ price: { $lt: bundle.price } }).populate('courses');
          for (const lower of lowerBundles) {
            if (!user.bundles.includes(lower._id)) {
              user.bundles.push(lower._id);
            }
            if (!lower.students.includes(user._id)) {
              lower.students.push(user._id);
            }
  
            for (const course of lower.courses) {
              if (!user.courses.includes(course._id))
                { user.courses.push(course._id);}
              if (!course.students.includes(user._id)) {
                course.students.push(user._id);
              }
                await course.save({ validateBeforeSave: false });
              
            }
  
            await lower.save({ validateBeforeSave: false });
          }
  
          // Referral logic
          if (user.referredByCode) {
            const oneLevel = await User.findOne({ sharableReferralCode: user.referredByCode });
            if (oneLevel) {
              oneLevel.total_income += bundle.price * 0.25;
              if (!oneLevel.myTeam.includes(user._id)) oneLevel.myTeam.push(user._id);
              oneLevel.totalTeam += 1;
              oneLevel.incomeHistory.push({ amount: bundle.price * 0.25, from: user._id });
  
              if (oneLevel.referredByCode) {
                const twoLevel = await User.findOne({ sharableReferralCode: oneLevel.referredByCode });
                if (twoLevel) {
                  twoLevel.total_income += bundle.price * 0.30;
                  if (!twoLevel.myTeam.includes(user._id)) twoLevel.myTeam.push(user._id);
                  twoLevel.totalTeam += 1;
                  twoLevel.incomeHistory.push({ amount: bundle.price * 0.30, from: user._id });
                  await twoLevel.save({ validateBeforeSave: false });
                }
              }
  
              await oneLevel.save({ validateBeforeSave: false });
            }
          }
  
          for (const course of bundle.courses) {
            if (!user.courses.includes(course._id)) user.courses.push(course._id);
            if (!course.students.includes(user._id)) {
              course.students.push(user._id);
              await course.save({ validateBeforeSave: false });
            }
          }
  
          await bundle.save({ validateBeforeSave: false });
          console.log(`Bundle ${bundleIdToAssign} assigned.`);
        }
  
        // --- Assign Courses ---
        for (const courseId of payment.courseIds) {
          console.log(`Assigning course ${courseId} to user ${user._id}`);
          const course = await Course.findById(courseId);
          if (!course) {
            console.error(`Fulfillment Error: Course ${courseId} not found.`);
            continue;
          }
  
          if (!user.courses.includes(course._id)) {
            user.courses.push(course._id);
            course.students.push(user._id);
            if (course.isTrending) user.canRefer = true;
            await course.save({ validateBeforeSave: false });
            console.log(`Course ${courseId} assigned.`);
          } else {
            console.log(`User already has course ${courseId}. Skipping.`);
          }
        }
  
        await user.save({ validateBeforeSave: false });
        payment.status = 'completed';
        console.log(`Order ID ${orderId} successfully fulfilled.`);
  
      } catch (error) {
        payment.status = 'failed';
        console.error(`Webhook CRITICAL: Fulfillment failed for Order ID ${orderId}. Error: ${error.message}`);
      }
  
        await payment.save()
  
      return res.status(200).json(new ApiResponse(200, null, "Webhook processed successfully"));
  
    } catch (error) {
      console.error("Webhook Error:", error);
      const statusCode = error instanceof ApiError ? error.statusCode : 500;
      return res.status(statusCode).json(new ApiResponse(false, error.message || "Internal Server Error"));
    }
  });
  
  
 
export { createPayment,webHookHandler };