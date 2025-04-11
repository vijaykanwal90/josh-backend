import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    image: {
      type: String,
    },
    bundleName: {
      type: String,
    },
    courseMentorName: {
      type: String,
    },
  
    // 👇 Multiple videos with preview flag
    videos: [
      {
        title: String,
        url: String,
        isPreview: {
          type: Boolean,
          default: false  // true for first video
        }
      }
    ],
  
    description: {
      type: String,
    },
  
    price: {
      type: Number,
      required: true
    },
  
    duration: {
      type: String,
    },
  
    bundle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bundle',
    },
  
    // 👇 Track enrolled students
    students: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    mentor: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mentor'
      }],
    whyCourse: [{
      type: String
    }],
    whatYouWillLearn: [{
        type: String
        }],
    courseHighlights: [{
        type: String
        }],
    whoShouldEnroll: [{
        type: String
        }],
    isTrending: {
      type: Boolean,
      default: false
    },
  
  }, {
    timestamps: true
  });
  
export const Course = mongoose.model('Course', courseSchema);
