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
    founderImage: {
        type: String,
        default: "https://imgs.search.brave.com/NMzO0gk1mG66HLjobL6cKbzIGQj-Z1vMNZ1sq044kmE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTM0/MjI1NDAzMC9waG90/by9wb3J0cmFpdC1v/Zi1hLXlvdW5nLW1h/bi1hdC13b3JrLmpw/Zz9zPTYxMng2MTIm/dz0wJms9MjAmYz1z/TTZ5RkJsU0VnS20x/WDZFOTE5cjI4a1Vw/RzRybmRRM01UMlQ4/MjNoT3c4PQ"
    },
    aboutFounder: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});
export const About = mongoose.model("About", aboutSchema);