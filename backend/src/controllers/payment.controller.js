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
    // Step 1: Get signature from header and secret from .env
    const razorpaySignature = req.headers["x-razorpay-signature"];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!razorpaySignature) {
        throw new ApiError(400, "Razorpay signature not found in headers");
    }
    if (!secret) {
        console.error("RAZORPAY_WEBHOOK_SECRET is not configured in .env file");
        throw new ApiError(500, "Internal server error: Webhook secret not configured");
    }

    // Step 2: Validate the signature using the RAW request body
    // This assumes you have configured Express to provide `req.rawBody`
    const isSignatureValid = validateWebhookSignature(req.rawBody, razorpaySignature, secret);

    if (!isSignatureValid) {
        // If the signature is not valid, reject the request.
        return res.status(400).json(new ApiResponse(false, "Invalid webhook signature"));
    }

    // If the signature is valid, we can now safely use the parsed body.
    const { event, payload } = req.body;

    // Step 3: Process ONLY the 'order.paid' event for fulfillment
    if (event === 'order.paid') {
        const orderEntity = payload.order.entity;
        const paymentEntity = payload.payment.entity;

        const payment = await Payment.findOne({ orderId: orderEntity.id });

        if (!payment) {
            console.error(`Webhook Critical: Payment record not found for Order ID: ${orderEntity.id}.`);
            return res.status(200).json(new ApiResponse(true, "Acknowledged, but payment record not found."));
        }

        if (payment.status === 'completed') {
            console.log(`Webhook Info: Order ID ${orderEntity.id} has already been processed.`);
            return res.status(200).json(new ApiResponse(true, "Order already completed."));
        }

        const user = await User.findOne({ email: payment.notes.email });
        if (!user) {
            payment.status = 'failed';
            payment.notes.error = `User with email ${payment.notes.email} not found.`;
            await payment.save();
            console.error(`Webhook Critical: User not found for email: ${payment.notes.email}. Order: ${orderEntity.id}`);
            return res.status(200).json(new ApiResponse(true, "Acknowledged, but user not found."));
        }

        // --- Start Fulfillment Logic ---
        try {
            // -- BUNDLE ASSIGNMENT LOGIC --
            for (const bundleIdToAssign of payment.bundleIds) {
                const purchasedBundle = await Bundle.findById(bundleIdToAssign);
                if (!purchasedBundle) {
                    console.error(`Fulfillment Error: Purchased Bundle with ID ${bundleIdToAssign} not found. Skipping.`);
                    continue;
                }

                // 1. Assign the main bundle purchased
                if (!user.bundles.includes(purchasedBundle._id)) {
                    user.bundles.push(purchasedBundle._id);
                }
                if (!purchasedBundle.students.includes(user._id)) {
                    purchasedBundle.students.push(user._id);
                    await purchasedBundle.save({ validateBeforeSave: false });
                }
                
                // 2. Assign all lower-priced bundles for free
                const lowerBundles = await Bundle.find({ price: { $lt: purchasedBundle.price } });
                for (const lowerBundle of lowerBundles) {
                    if (!user.bundles.includes(lowerBundle._id)) {
                        user.bundles.push(lowerBundle._id);
                    }
                    if (!lowerBundle.students.includes(user._id)) {
                        lowerBundle.students.push(user._id);
                        await lowerBundle.save({ validateBeforeSave: false });
                    }
                }

                // 3. User becomes eligible to refer
                user.canRefer = true;

                // 4. Referral Bonus Logic (based on the *purchased* bundle's price)
                if (user.referredByCode) {
                    const oneLevelUser = await User.findOne({ sharableReferralCode: user.referredByCode });
                    if (oneLevelUser) {
                        oneLevelUser.total_income += purchasedBundle.price * 0.25;
                        if (!oneLevelUser.myTeam.includes(user._id)) {
                            oneLevelUser.myTeam.push(user._id);
                            oneLevelUser.totalTeam += 1;
                        }
                        oneLevelUser.incomeHistory.push({ amount: purchasedBundle.price * 0.25, from: user._id });
                        
                        // 2nd-level referral
                        if (oneLevelUser.referredByCode) {
                            const secondLevelUser = await User.findOne({ sharableReferralCode: oneLevelUser.referredByCode });
                            if (secondLevelUser) {
                                secondLevelUser.total_income += purchasedBundle.price * 0.30;
                                if (!secondLevelUser.myTeam.includes(user._id)) {
                                    secondLevelUser.myTeam.push(user._id);
                                    secondLevelUser.totalTeam += 1;
                                }
                                secondLevelUser.incomeHistory.push({ amount: purchasedBundle.price * 0.30, from: user._id });
                                await secondLevelUser.save({ validateBeforeSave: false });
                            }
                        }
                        await oneLevelUser.save({ validateBeforeSave: false });
                    }
                }
            }

            // -- INDIVIDUAL COURSE ASSIGNMENT LOGIC --
            for (const courseIdToAssign of payment.courseIds) {
                const course = await Course.findById(courseIdToAssign);
                if (!course || user.courses.includes(course._id)) continue;
                
                user.courses.push(course._id);
                course.students.push(user._id);
                if (course.isTrending) user.canRefer = true;
                await course.save({ validateBeforeSave: false });
            }
            
            // -- FINAL STEP: CONSOLIDATE ALL COURSES FROM ALL ASSIGNED BUNDLES --
            await user.populate({
                path: 'bundles',
                populate: { path: 'courses', model: 'Course' }
            });

            for (const bundle of user.bundles) {
                for (const course of bundle.courses) {
                    if (!user.courses.includes(course._id)) {
                        user.courses.push(course._id);
                    }
                    if (!course.students.includes(user._id)) {
                        course.students.push(user._id);
                        await course.save({ validateBeforeSave: false });
                    }
                }
            }

            // All fulfillment succeeded. Finalize the user and payment records.
            await user.save({ validateBeforeSave: false });

            payment.status = 'completed';
            payment.paymentId = paymentEntity.id;
            payment.userId = user._id;
            await payment.save();

            console.log(`Successfully fulfilled all items for Order ID: ${orderEntity.id}`);

        } catch (error) {
            payment.status = 'assignment_failed';
            payment.notes.error = error.message || "Unknown error during item assignment.";
            await payment.save();
            console.error(`Webhook CRITICAL: Fulfillment failed for Order ID ${orderEntity.id}. Error:`, error);
        }
    } else {
        console.log(`Webhook Info: Received and ignored event: ${event}`);
    }

    return res.status(200).json(new ApiResponse(true, "Webhook processed successfully"));
});

export { createPayment, webHookHandler };