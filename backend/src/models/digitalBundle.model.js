import {mongoose, Schema} from "mongoose";

const digitalBundleSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
    },
    features: {
        coursesIncluded: {
            type: Number,
            required: [true, 'Course count is required'],
        },
        accessType: {
            type: String,
            enum: ['lifetime', 'subscription'],
        },
        availableLanguages: {
            type: String,
            required: [true, 'Language is required'],
        },
    },
    video: [
        {
            title: {
                type: String,
                required: [true, 'Video title is required'],
            },
            videoFile: {
                type: String,
                required: [true, 'Video File is required'],
            },
        }
    ],
    bonusSkills:{
        title: {
            type: String,
            required: [true, 'Bonus skills title is required'],
        },
        // Fixed array definition
        images: {
            type: [String],
            required: [true, 'Image URLs are required'],
        }
    },
    sectionOne: {
        title: {
            type: String,
            required: [true, 'Section one title is required'],
        },
        images: {
            type: String,
            required: [true, 'Section one image URL is required'],
        },
        highlights: [
            {
                title: {
                    type: String,
                    required: [true, 'Highlight title is required'],
                },
                description: {
                    type: String,
                    required: [true, 'Highlight description is required'],
                }
            }
        ]
    },
    sectionTwo: {
        title: {
            type: String,
            required: [true, 'Section one title is required'],
        },
        highlights: [
            {
                title: {
                    type: String,
                    required: [true, 'Highlight title is required'],
                },
                description: {
                    type: String,
                    required: [true, 'Highlight description is required'],
                },
                images: {
                    type: String,
                    required: [true, 'Section one image URL is required'],
                },
            }
        ]
    },
    sectionThree: {
        title: {
            type: String,
            required: [true, 'Section one title is required'],
        },
        highlights: [
            {
                title: {
                    type: String,
                    required: [true, 'Highlight title is required'],
                },
                description: {
                    type: String,
                    required: [true, 'Highlight description is required'],
                },
                images: {
                    type: String,
                    required: [true, 'Section one image URL is required'],
                },
            }
        ]
    },
    courses:{
        title: {
            type: String,
            required: [true, 'Courses title is required'],
        },
        description: {
            type: String,
            required: [true, 'Courses description is required'],
        },
        steps: [
            {
                stepNumber: {
                    type: Number,
                    required: [true, 'Step number is required'],
                },
                title: {
                    type: String,
                    required: [true, 'Step title is required'],
                },
                subtitle: {
                    type: String,
                    required: [true, 'Step subtitle is required'],
                },
                // Fixed typo: types → type
                description: {
                    type: String,  // Corrected property name
                    required: [true, 'Step description is required'],
                },
            }
        ]
    },
    mentor:{
        image: {
            type: String,
            required: [true, 'Mentor image is required'],
        },
        title: {
            type: String,
            required: [true, 'Mentor title is required'],
        },
        name: {
            type: String,
            required: [true, 'Mentor name is required'],
        },
        description: {
            type: String,
            required: [true, 'Mentor description is required'],
        },
    },
    CertificationSection: {
        title: {
            type: String,
            required: [true, 'Certification section title is required'],
        },
        description: {
            type: String,
            required: [true, 'Certification section description is required'],
        },
        image: {
            type: String,
            required: [true, 'Certification section image URL is required'],
        },
        // Fixed array definition
        points: {
            type: [String],
            required: [true, 'Certification points are required'],
        }
    },
    FAQSchema: {
        title: {
            type: String,
            required: [true, 'FAQ title is required'],
        },
        questions: [
            {
                question: {
                    type: String,
                    required: [true, 'Question is required'],
                },
                answer: {
                    type: String,
                    required: [true, 'Answer is required'],
                }
            }
        ]
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
    },
    discountPrice: {
        type: Number,
        required: [true, 'Discount price is required'],
    },
}, 
{
    timestamps: true,
});

const DigitalBundle = mongoose.model('DigitalBundle', digitalBundleSchema);
export default DigitalBundle;