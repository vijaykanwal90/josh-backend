import mongoose from "mongoose";
const aboutSchema = new mongoose.Schema({

    bannerImage: {
        type: String,
        default: "https://imgs.search.brave.com/EXwVjlu69nlOpqcH2aLHiiRkB5Y3GHb-FY5xbalGhK0/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTE5/ODk5NjE1OC9waG90/by9jcm93ZC1vZi1z/dWNjZXNzZnVsLWJ1/c2luZXNzLXBlb3Bs/ZS1ob2xkaW5nLWEt/YmFubmVyLWluLWEt/Ym9hcmQtcm9vbS5q/cGc_cz02MTJ4NjEy/Jnc9MCZrPTIwJmM9/MDRka1JpanJaU1dI/YTlVSDNSWUx3cFA4/SU96ek5ubGZzREl6/aVdScnByaz0"
    },
    description: {
        type: String,
        required: true
    },
    ourMission: {
        type: String,
        required: true
    
    },
    ourVision: {
        type: String,
        required: true
    },
  
}, {
    timestamps: true
});
export const About = mongoose.model("About", aboutSchema);