import express from "express";
import Contest from "../models/contest.js";
import{authenticate, authorizeadmin} from "../middleware/requireauth.js";
const router=express.Router();
router.post("/createcontest",authenticate,authorizeadmin,async(req,res)=>{
    try {
        const{title,description,startdate,enddate,problems,participants}=req.body;
        participants.push(req.user.id);
        if(!(title && description && startdate &&enddate && Array.isArray(problems) && Array.isArray(participants))){
           return res.status(400).json({error:"Please provide all the fields"})
        }
      
        const newcontest=await Contest.create({
            title,description,startdate,enddate,problems,participants

        });
        res.status(201).json({message:"Contest created successfully",newcontest});
    } catch (error) {
        res.status(500).json({message:"Failed to create contest",error:error.message})
    }
});
router.put("/editcontest/:id",authenticate, authorizeadmin,async(req,res)=>{
    try{
   const updates=req.body;
   const {id} =req.params;
   updates.updatedat=Date.now();
   const updated=await Contest.findByIdAndUpdate(
    id,
    {$set:updates},
    {new:true}
   );
   if(!updated){
    return res.status(404).json({message:"Contest not found"});
   }
   res.status(200).json({ message: "Contest updated successfully", contest: updated });

}catch(error){
    res.status(500).json({message:"Failed to update contest",error:error.message});
}
});
router.delete("/deletecontest/:id",authenticate, authorizeadmin,async(req,res)=>{
    try {
        const deletep = await Contest.findByIdAndDelete(req.params.id);
        if(!deletep) return res.status(404).json({message:"Contest not found"});
        res.status(200).json({ message: "Contest deleted successfully" });

    } catch (error) {
        res.status(500).json({message:"Failed to delete contest",error:error.message});
    }
});
export default router;