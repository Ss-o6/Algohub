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
            problemID: { type: mongoose.Schema.Types.ObjectId, ref: "Problem" },
            language: { type: String, required: true },
            submissionDate: Date
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
