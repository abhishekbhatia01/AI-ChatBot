import mongoose from "mongoose";

const promptSchema = new mongoose.Schema({
    prompt:{
        type: String, 
        required: true
    },
    response:{
        type: String,
        required: true
    },
    createdAt:{
        type: Date, 
        default: Date.now
    }
})


const Prompt = mongoose.model("Prompt", promptSchema);

export default Prompt;
