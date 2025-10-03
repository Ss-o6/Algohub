import jwt from "jsonwebtoken";
import user from "../models/users.js";
import dotenv from "dotenv";
dotenv.config();
export const authenticate=async(req,res,next)=>{
    try{
    const token= req.cookies?.token;   
    if(!token){
        return res.status(401).json({message:"Not logged in"});

    }
    const decoded=jwt.verify(token,process.env.SECRET_KEY);
    const us = await user.findById(decoded.id).select("-password");
    if(!us){
        return res.status(401).json({message:"User not found"});

    }
    req.user=us;
    next();
}
catch(error){
    console.error("Authentication error:"+error);
    res.status(401).json({messsage:"Invalid or Expired token"});
}
};
export const authorizeadmin=async(req,res,next)=>{
      if(req.user.role!== "admin"){
        return res.status(403).json({message:"Access denied"})
      }
      next();
};