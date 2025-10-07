import express from "express";
import dbconnection from "./database/db.js";
import dotenv from "dotenv";
import auth from "./rouites/auth.js"
import cors from "cors";
import contestroute from "./rouites/contestRoute.js";
import problemroute from "./rouites/problemRoute.js";
import userroute from "./rouites/userroute.js";
import passport from "passport";
import session from "express-session";
import cookieParser  from "cookie-parser";
import execution from "./rouites/execution.js";

import "./config/passportconfig.js";
dotenv.config();

const app=express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors({
    origin: "http://localhost:5173",  
  credentials: true   
}))


dbconnection();

const port=5000;
app.use(
    session({
        secret:process.env.SECRET_KEY,
        resave:false,
        saveUninitialized:true,
    })
)
app.use(passport.initialize());
app.use(passport.session());

app.get("/",(req,res)=>{
    res.send("hey!! we are finally here");
});
app.use(cookieParser());
app.use(auth);
app.use(problemroute);
app.use(contestroute);
app.use(userroute);
app.use(execution);

app.listen(port,()=>{
    console.log("server listening on port 5000")
});