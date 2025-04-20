import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    bundleName: {
      type: String,
    },

    category: {
      type: String,
    },
    courseIntrovideo: {
      type: String,
    },
    // 👇 Multiple videos with preview flag
    videos: [
      {
        title: String,
        url: String,
        isPreview: {
          type: Boolean,
          default: false, // true for first video
        },
      },
    ],

    description: {
      type: String,
    },

    price: {
      type: Number,
      required: true,
    },

    duration: {
      type: String,
    },

    bundle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bundle",
    },

    // 👇 Track enrolled students
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    mentor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Mentor",
      },
    ],
    whatYouWillLearn: [
      {
        type: String,
      },
    ],
    whyCourse: [
      {
        type: String,
      },
    ],
    whoShouldEnroll: [
      {
        type: String,
      },
    ],
    stillConfused: [
      {
        type: String,
      },
    ],
    reasonWhyJoshGuru: [
      {
        type: String,
      },
    ],
    courseHighlights: [
      {
        type: String,
      },
    ],

    HowWillHelpYou: {
      type: String,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    isOffline: {
      type: Boolean,
      default: false,
    },
    pdfPath:{
      type: String,
    },
    certificatePath:{
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

export const Course = mongoose.model("Course", courseSchema);
