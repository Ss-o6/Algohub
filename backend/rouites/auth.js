import express from "express"
import user from "../models/users.js"
import otpstore from "../utils/otpstore.js";
import sendemail from "../utils/sendemail.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import passport from "passport";

dotenv.config();
const router= express.Router();

router.post("/generate-otp",async(req,res)=>{
    try {
      const {email}=req.body;
    
      const us=await user.findOne({email})
      if(us){
        return res.status(400).json({success:false, message:"email already registered"});
      }
      const otp= crypto.randomInt(100000,999999).toString();
      const expires=Date.now()+5*60*1000;
      otpstore.set(email,{otp,expires});
      await sendemail(email, "Algohub",otp);
      res.status(200).json({message:"Otp send successfully"});
    } catch (error) {
      console.log("error sending otp:",error);
      res.status(500).json({message:"error sending otp"});
    }
});
router.post("/validate-otp",(req,res)=>{
  try {
    const {email, otp}=req.body;
    const record= otpstore.get(email);
    if(!record) return res.status(400).json({message:"otp not found, request once more"});
    if(record.otp!= otp) return res.status(400).json({message:"invalid otp"});
    if(record.expires < Date.now()) return res.status(400).json({message:"Otp expired!!"});
    otpstore.set(email, { ...record, verified: true });
    res.json("otp verified successfully");
  } catch (error) {
    console.log("otp validation failed",error);
    res.json({message :"otp validation failed"});
  }
});
router.post("/register",async(req,res)=>{
  
   try {
      const {fname, lname, email, password}= req.body;
      const otpRecord = otpstore.get(email);
  if (!otpRecord || !otpRecord.verified) {
    return res.status(400).json({ message: "Email not verified via OTP" });
  }
      //check the data is valid or not
      if(!(fname && lname && email && password)){
        return res.status(400).send("please enter all the required things")
      }
      //check if it already exists in the db
      const existinguser= await user.findOne({email});
      if(existinguser){
        return res.status(400).send("user already exists");
      }
      
      //encrypt the password
      const hashpass= await bcrypt.hashSync(password, 10);
      
      //save the user
      const us= await user.create({
          fname,
          lname,
          email,
          password: hashpass,
      });
      //generate the jwt token and send it to user
      const token= jwt.sign({id:us._id, email},process.env.SECRET_KEY,{
        expiresIn:"1h"
      });
      us.token=token;
      us.password=undefined;
      res.status(201).json({
        message:"you have successfully register",
        us
      })

   } catch (error) {
    console.log("Error happened during registration",error.message);
    res.status(500).send("An error ocured while registering. Please try again!")
   }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!(email && password)) {
      return res.status(400).json({ message: "Please enter all the information" });
    }

    const userexists = await user.findOne({ email });
    if (!userexists) {
      return res.status(404).json({ message: "User doesn't exist, please register!" });
    }

    const userauth = await bcrypt.compare(password, userexists.password);
    if (!userauth) {
      return res.status(401).json({ message: "Email/Password is incorrect" });
    }

    const token = jwt.sign({ id: userexists._id, email }, process.env.SECRET_KEY, { expiresIn: "1h" });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      user: { id: userexists._id, email: userexists.email },
      token,
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Something went wrong. Please try again later." });
  }
});

router.get("/google",passport.authenticate("google",{scope:["profile", "email"]}));
router.get("/google/callback",passport.authenticate("google",{session:false, failureRedirect:"/login"}),(req,res)=>{
   const token=jwt.sign(

    {
      id:req.user._id, email:req.user.email 
    },process.env.SECRET_KEY,
    {expiresIn:"1h"}
   )

res.cookie("token",token,{
  httpOnly:true,
  secure:process.env.NODE_ENV==="production",
  sameSite:"strict",
  maxAge:60*1000*60
});
res.redirect("/homepage");
});
router.get("/github",passport.authenticate("github",{scope:["user:email"]}));
router.get("/github/callback",passport.authenticate("github",{session:false,failureRedirect:"/login"}),(req,res)=>{
  const token=jwt.sign({
    id:req.user._id, email:req.user.email}
    ,process.env.SECRET_KEY,
    {expiresIn:"1h"})
    res.cookie("token",token,{
      httpOnly:true,
      secure:process.env.NODE_ENV==="production",
    sameSite:"strict",
   maxAge:60*1000*1000
});
res.redirect("/homepage");
});

export default router;