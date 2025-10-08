import mongoose from "mongoose";
const problemschema= new mongoose.Schema({
    title:{type:String,required:true},
    description:{type:String, required:true},
    inputformat:{type:String,required:true},
    outputformat:{type:String,required:true},
    constraints:{type:String,required:true},
    sampleinput:{type:String,required:true},
    sampleoutput:{type:String,required:true},
    difficulty:{type:String,required:true},
    testcases:[{
        input:{type:String,required:true},
        output:{type:String,required:true},
    }],
    author:{type:String,required:true},
    submissions:[{
        user:{type:String,required:true},
        result:{type:String,required:true},
        language:{type:String,required:true},
        code:{type:String,required:true},
        submission: { type: Date, default: Date.now },
         passed: { type: Number, default: 0 },    // number of test cases passed
       total: { type: Number, default: 0 },     // total number of test cases
         submission: { type: Date, default: Date.now } 
    }],
    acceptedcount:{type:Number,default:0},
    createdAt:{type:Date, default:Date.now},
    updateAt:{type:Date, default:Date.now},

});
problemschema.path("submissions").default([]);
export default mongoose.model("problem",problemschema);