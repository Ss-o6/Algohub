import express from "express";
import User from "../models/users.js";
import Problem from "../models/problems.js";
import Contest from "../models/contest.js";
import {authenticate} from "../middleware/requireauth.js";

const router=express.Router();
router.get("/me", authenticate,async(req,res)=>{
    try {
        console.log("me  found");
        const user= await User.findById(req.user.id);
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        const solvedproblems= await Promise.all(
            user.solvedproblems.map(async (problem)=>{
                const problemdetails= await Problem.findById(problem.problemID);
                return{
                    id:problem.problemID,
                    title:problemdetails?.title||"Unknown",
                    difficulty:problemdetails?.difficulty ||"Unknown",
                    author:problemdetails?.author ||"Unknown",
                    totalsubmissions:problemdetails?.submissions.length ||0,
                    acceptedcount:problemdetails?.acceptedcount||0,
                    language:problem.language,
                    submissiondate:problem.submissiondate,
                };
            })
        );
        const participatedcontests= await Promise.all(
            user.participatedcontests.map(async (contest)=>{
                const contestdetails=await Contest.findById(contest.contestID);
                return {
                    id:contest.contestID,
                    title:contestdetails?.title ||"Unknown",
                    score:contest.score,
                    rank:contest.rank,
                    submissiondate:contest.submissiondate,
                };
            })
        );
        res.json({
            user:{
                id:user._id,
                fname:user.fname,
                lname:user.lname,
                email:user.email,
                role:user.role,
                
            },
            problems:solvedproblems,
            contests:participatedcontests,
        });
    } catch (error) {
        res
        .status(500).json({message:"Failed to fetch user data",error:error.message});
    }
});
router.put("/update-profile", authenticate, async(req,res)=>{
    const {fname,lname}=req.body;
    const userid=req.user.id;
    try{
        await User.findByIdAndUpdate(
            userid,
            {$set:{fname,lname}},
            {new:true}
        );
        res.status(200).json({success:true,message:"Profile updated successfully!"});
    }catch(error){
        console.error("Error updating profile",error);
        res.status(500).json({message:"Error in updating profile",error});
    }
});
router.put("/update-email",authenticate,async(req,res)=>{
    const{email}=req.body;
    const userid=req.user.id;
    try {
        const existinguser=await User.findOne({email});
        if(existinguser && existinguser._id.toString()!==userid){
            return res.status(400).json({success:false,message:"Email already in use"});
        }
        await User.findByIdAndUpdate(
            userid,
            {$set:{email}},
            {new:true}
        );
        res.status(200).json({success:true,message:"Email updated!"})
    } catch (error) {
        console.error("Error updating email");
        res.status(500).json({message:"Error in updating the email",error});
    }
});
export default router;
