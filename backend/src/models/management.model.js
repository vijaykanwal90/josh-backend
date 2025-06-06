import mongoose from "mongoose";
const managementSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true,
        default: "https://imgs.search.brave.com/NMzO0gk1mG66HLjobL6cKbzIGQj-Z1vMNZ1sq044kmE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTM0/MjI1NDAzMC9waG90/by9wb3J0cmFpdC1v/Zi1hLXlvdW5nLW1h/bi1hdC13b3JrLmpw/Zz9zPTYxMng2MTIm/dz0wJms9MjAmYz1z/TTZ5RkJsU0VnS20x/WDZFOTE5cjI4a1Vw/RzRybmRRM01UMlQ4/MjNoT3c4PQ"
      },
      name: {
        type: String,
        required: true,
        unique: true

      },
      role: {
        type: String,
        required: true
      }
})
export const Management = mongoose.model("Management", managementSchema);