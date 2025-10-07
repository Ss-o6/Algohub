import express from "express";
import Problem from "../models/problems.js"
import User from "../models/users.js";
import{authenticate, authorizeadmin} from "../middleware/requireauth.js";
const router=express.Router();
router.get("/problems",authenticate,async(req,res)=>{
     try {
        const problems=await Problem.find({});
        const solvedids= req.user.solvedproblems.map(p=>p.problemID.toString());
        const problemwithstatus=problems.map(p=>({
            _id:p._id,
            title:p.title,
            difficulty:p.difficulty,
            solved:solvedids.includes(p._id.toString()),
        }));
        res.json({
            user:req.user,
            problems:problemwithstatus});
     } catch (error) {
        res.status(500).json({message:"Failed to fetch problems",error:error.message});
        
        
     }
});
router.get("/problems/:id",authenticate,async(req,res)=>{
    try {
        const problem= await Problem.findById(req.params.id);
        if(!problem) return res.status(404).json({message:"Problem not found"});
        res.json({PROBLEM:problem});
    } catch (error) {
        res.status(404).json({message:"Failed to fetch problem",error:error.message});
    }
});


// Route: GET /problems/:id/issolved
router.get("/problems/:id/issolved", authenticate, async (req, res) => {
  try {
    const problemId = req.params.id;
    const userId = req.user.id;

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ success: false, message: "Problem not found" });
    }

    // Check if the user has a fully accepted submission
    const isSolved = problem.submissions.some(
      (sub) => sub.user === userId && sub.passed === sub.total
    );

    res.json({ success: true, isSolved });
  } catch (error) {
    console.error("Error checking solved status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



router.post("/addproblem",authenticate,authorizeadmin,async(req,res)=>{
    try {
        const{title,description,inputformat,outputformat,constraints,sampleinput,sampleoutput,difficulty,testcases}=req.body;
        if(!(title && description && inputformat && outputformat && constraints && sampleinput && sampleoutput && difficulty && Array.isArray(testcases))){
           return res.status(400).json({error:"Please provide all the fields"})
        }
        const user= await User.findById(req.user.id);
        const authorName = `${user.firstname} ${user.lastname}`;
        const problem=await Problem.create({
            title,description,inputformat,outputformat,constraints,
            sampleinput,sampleoutput,difficulty,testcases,
            author:authorName

        });
        res.status(201).json({message:"Problem added successfully",problem});
    } catch (error) {
        res.status(500).json({message:"Failed to add problem",error:error.message})
    }
});
router.put("/editproblem/:id",authenticate, authorizeadmin,async(req,res)=>{
    try{
   const updates=req.body;
   const {id} =req.params;
   updates.updatedAt=Date.now();
   const updated=await Problem.findByIdAndUpdate(
    id,
    {$set:updates},
    {new:true}
   );
   if(!updated){
    return res.status(404).json({message:"Problem not found"});
   }
   res.status(200).json({ message: "Problem updated successfully", problem: updated });

}catch(error){
    res.status(500).json({message:"Failed toupdate problem",error:error.message});
}
});
router.delete("/deleteproblem/:id",authenticate, authorizeadmin,async(req,res)=>{
    try {
        const deletep = await Problem.findByIdAndDelete(req.params.id);
        if(!deletep) return res.status(404).json({message:"Problem not found"});
        res.status(200).json({ message: "Problem deleted successfully" });

    } catch (error) {
        res.status(500).json({message:"Failed to delete problem",error:error.message});
    }
});
export default router;