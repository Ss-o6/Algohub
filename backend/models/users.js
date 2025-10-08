import mongoose from "mongoose";
const userschema=new mongoose.Schema({
    fname:{
        type:String,
        required:true
    },
    lname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:function (){
            return !this.isOAuthUser;
        }
    },
    isOAuthUser:{
        type:Boolean,
        default:false,
    },
    githubId:{
        type:String,
        default:null,
    },
    googleId:{
        type:String,
        default:null
    },
    role:{type:String,default:"user"},
    registrationdate:{type:Date,default:Date.now},
    solvedproblems: [
    {
      problem: { type: mongoose.Schema.Types.ObjectId, ref: "problems" },
      language: String,
      code: String,
      passed: Number,
      total: Number,
      status: String, // "Success" or "Failed"
      lastSubmitted: { type: Date, default: Date.now }
    }
  ],
    participatedcontests: [
        {
            contestID: { type: mongoose.Schema.Types.ObjectId, ref: "Contest" },
            score: Number,
            rank: Number,
            submissionDate: Date
        }
    ],
});

userschema.path("solvedproblems").default([]);
userschema.path("participatedcontests").default([]);


export default mongoose.model("user", userschema);
