import mongoose from "mongoose";
const contestSchema=new mongoose.Schema({
    title:{type:String, required:true},
    description:{type:String, required:true},
    startdate:{type:Date, required:true},
    enddate:{type:Date,required:true},
    problems:[{type:mongoose.Schema.Types.ObjectId,ref:"problem"}],
    participants:[{type:mongoose.Schema.Types.ObjectId,ref:"user"}],
    createdat:{type:Date, default:Date.now},
    updateat:{type:Date, default:Date.now},
});
export default mongoose.model("context",contestSchema);