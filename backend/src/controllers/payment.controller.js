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
    const { id, name, phoneNo, email, route,highestPricedBundle } = req.body;
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
        amount: (totalExpectedAmount * 100)-highestPricedBundle, // ✅ calculate correctly and convert to paise
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
    // Step 1: Signature Validation (Crucial for security)
    const razorpaySignature = req.headers["x-razorpay-signature"];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  
    if (!secret) {
      console.error("CRITICAL: Webhook secret is not configured in environment variables.");
      throw new ApiError(500, "Webhook secret not configured");
    }
  
    const isSignatureValid = validateWebhookSignature(
      req.rawBody, // Use the raw body stringified for validation
      razorpaySignature,
      secret
    );
    
    if (!isSignatureValid) {
      console.warn("SECURITY: Invalid webhook signature received. Request rejected.");
      return res.status(400).json(new ApiResponse(false, "Invalid webhook signature."));
    }
  
    // Step 2: Extract relevant data from the webhook payload
    const event = req.body.event;
    const paymentDetails = req.body?.payload?.payment?.entity;
    const orderId = paymentDetails?.order_id;
    
    console.log(`Webhook received for event: '${event}' | Order ID: ${orderId || 'N/A'}`);
  
    // We only care about the final 'payment.captured' event for fulfillment.
    // Ignore all other events like 'payment.authorized', 'order.paid', etc.
    if (event !== 'payment.captured') {
      console.log(`Ignoring event '${event}' as it is not 'payment.captured'.`);
      return res.status(200).json(new ApiResponse(true, `Event '${event}' acknowledged.`));
    }
  
    // From here, we are guaranteed that event is 'payment.captured'
    if (!paymentDetails || !orderId) {
      console.error("Webhook Error: Invalid payload. 'payment.entity' or 'order_id' missing.", JSON.stringify(req.body));
      return res.status(400).json(new ApiResponse(false, "Invalid payload received."));
    }
  
    // Step 3: Find the corresponding payment record in our database
    const payment = await Payment.findOne({ orderId });
  
    if (!payment) {
      // This is a critical error. The order was paid but we have no record of it.
      console.error(`CRITICAL: Payment record not found for Order ID: ${orderId}. Manual intervention required.`);
      // Acknowledge the webhook to prevent Razorpay from resending.
      return res.status(200).json(new ApiResponse(true, "Acknowledged, but payment record not found."));
    }
  
    // Step 4: Idempotency Check - Prevent processing the same order twice
    if (payment.status === 'completed') {
      console.log(`Info: Order ID ${orderId} has already been fulfilled. Ignoring duplicate webhook.`);
      return res.status(200).json(new ApiResponse(true, "Order already completed."));
    }
  
    // Step 5: Find the user associated with this payment
    // Due to the fixed frontend flow, the user should always exist at this point.
    const user = await User.findOne({ email: payment.notes.email });
  
    if (!user) {
      // This indicates a severe race condition or a bug in the registration flow.
      payment.status = 'failed';
      payment.failureReason = 'User not found during webhook processing.';
      await payment.save();
      console.error(`CRITICAL: User not found for email: '${payment.notes.email}' on Order ID: ${orderId}. Payment marked as failed.`);
      return res.status(200).json(new ApiResponse(true, "Acknowledged, but user not found."));
    }
  
    // Step 6: Fulfill the Order (The main logic)
    try {
      payment.userId = user._id;
  
      // --- Assign Bundles ---
      for (const bundleId of payment.bundleIds) {
        console.log(`Assigning bundle ${bundleId} to user ${user._id}`);
        const bundle = await Bundle.findById(bundleId).populate('courses');
        if (!bundle) {
          console.error(`Fulfillment Error: Bundle ${bundleId} not found for Order ID ${orderId}.`);
          continue; // Skip this bundle but try to fulfill the rest of the order
        }
  
        // Add bundle to user if they don't have it
        if (!user.bundles.some(b => b.equals(bundle._id))) {
          user.bundles.push(bundle._id);
        }
        // Add user to bundle's student list
        if (!bundle.students.some(s => s.equals(user._id))) {
          bundle.students.push(user._id);
        }
        
        user.canRefer = true; // Grant referral ability
  
        // Assign all lower-priced bundles and their courses
        const lowerBundles = await Bundle.find({ price: { $lt: bundle.price } }).populate('courses');
        for (const lower of lowerBundles) {
          if (!user.bundles.some(b => b.equals(lower._id))) user.bundles.push(lower._id);
          if (!lower.students.some(s => s.equals(user._id))) lower.students.push(user._id);
          
          for (const course of lower.courses) {
              if (!user.courses.some(c => c.equals(course._id))) user.courses.push(course._id);
              if (!course.students.some(s => s.equals(user._id))) {
                  course.students.push(user._id);
                  await course.save({ validateBeforeSave: false });
              }
          }
          await lower.save({ validateBeforeSave: false });
        }
  
        // Assign all courses within the purchased bundle
        for (const course of bundle.courses) {
          if (!user.courses.some(c => c.equals(course._id))) user.courses.push(course._id);
          if (!course.students.some(s => s.equals(user._id))) {
              course.students.push(user._id);
              await course.save({ validateBeforeSave: false });
          }
        }
  
        await bundle.save({ validateBeforeSave: false });
        console.log(`Bundle ${bundleId} and its contents assigned successfully.`);
      }
  
      // --- Assign Standalone Courses ---
      for (const courseId of payment.courseIds) {
          console.log(`Assigning course ${courseId} to user ${user._id}`);
          const course = await Course.findById(courseId);
          if (!course) {
              console.error(`Fulfillment Error: Course ${courseId} not found for Order ID ${orderId}.`);
              continue;
          }
  
          if (!user.courses.some(c => c.equals(course._id))) {
              user.courses.push(course._id);
              course.students.push(user._id);
              if (course.isTrending) user.canRefer = true;
              await course.save({ validateBeforeSave: false });
              console.log(`Course ${courseId} assigned successfully.`);
          }
      }
  
      // Referral Logic (Run this once after all items are assigned)
      if (user.referredByCode && (payment.bundleIds.length > 0 || payment.courseIds.length > 0)) {
          // Find the bundle with the highest price in the order to calculate commission
          const highestPricedItemAmount = payment.amount; // The total amount paid is a good proxy
  
          const oneLevel = await User.findOne({ sharableReferralCode: user.referredByCode });
          if (oneLevel) {
            oneLevel.total_income += highestPricedItemAmount * 0.25;
            if (!oneLevel.myTeam.some(m => m.equals(user._id))) oneLevel.myTeam.push(user._id);
            oneLevel.totalTeam += 1;
            oneLevel.incomeHistory.push({ amount: highestPricedItemAmount * 0.25, from: user._id });
            await oneLevel.save({ validateBeforeSave: false });
  
            if (oneLevel.referredByCode) {
              const twoLevel = await User.findOne({ sharableReferralCode: oneLevel.referredByCode });
              if (twoLevel) {
                twoLevel.total_income += highestPricedItemAmount * 0.30;
                if (!twoLevel.myTeam.some(m => m.equals(user._id))) twoLevel.myTeam.push(user._id);
                twoLevel.totalTeam += 1;
                twoLevel.incomeHistory.push({ amount: highestPricedItemAmount * 0.30, from: user._id });
                await twoLevel.save({ validateBeforeSave: false });
              }
            }
          }
      }
  
      // --- Finalize Transaction ---
      await user.save({ validateBeforeSave: false });
      
      payment.status = 'completed';
      payment.failureReason = ''; // Clear any previous failure reason
      await payment.save();
  
      console.log(`SUCCESS: Order ID ${orderId} has been successfully fulfilled for user ${user.email}.`);
  
    } catch (error) {
      // If anything goes wrong during fulfillment, mark payment as failed for manual review.
      payment.status = 'failed';
      payment.failureReason = `Fulfillment error: ${error.message}`;
      await payment.save();
      console.error(`CRITICAL: Fulfillment failed for Order ID ${orderId}. Error: ${error.message}`, error.stack);
    }
  
    // Step 7: Send a final success response to Razorpay
    return res.status(200).json(new ApiResponse(true, "Webhook processed successfully."));
  });
  
  const deleteUnpaidUser = asynchHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required to delete an unpaid user.");
    }

    const user = await User.findOne({ email });

    if (!user) {
        // It's not an error if the user is already gone.
        return res.status(200).json(new ApiResponse(200, null, "User not found, no action needed."));
    }
    
    // Optional: You could add a check here to ensure the user truly has no paid courses
    // if(user.courses.length === 0 && user.bundles.length === 0) { ... }

    await User.findByIdAndDelete(user._id);

    console.log(`Cleanup: Deleted user '${email}' who did not complete payment.`);

    return res.status(200).json(new ApiResponse(200, null, "Unpaid user deleted successfully."));
});


  
  
 
export { createPayment,webHookHandler,deleteUnpaidUser};