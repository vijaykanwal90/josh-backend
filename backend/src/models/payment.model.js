import mongoose from "mongoose";
 const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    notes:{
        name:{
            type: String,
        },
        phoneNo:{
            type: String,
        },
        email:{
            type: String,
        }
    },
    orderId : {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    receipt: {
        type: String,
        required: true,
    },
    currency: {
        type: String,
        default: "INR",
    },
    status:{
        type:String
    },
    paymentId: {
        type: String,
    },
    orderType: {
        type: [String],
        enum: ["bundle", "course"],
      },
      courseIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      }],
      bundleIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bundle",
      }],
      
  
},{
    timestamps: true,
})
const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;

