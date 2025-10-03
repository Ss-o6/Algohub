import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

 const sendemail= async(to, subject, otp)=>{
    try {
        const transporter= nodemailer.createTransport({
        service: "Gmail",
        auth:{
            user :process.env.EMAIL_USER,
            pass:process.env.USER_PASS,
        },
});

await transporter.sendMail({
    from: process.env.EMAIL_USER,
     to, 
     subject, 
     text: `Your OTP is ${otp}. It expires in 5 minutes.`,
     html:`<p>Your OTP is <b>${otp}</b>. It expires in 5 minutes.</p>`,
});
console.log("email sent successfully");

    } catch (error) {
        console.log("error.sending email",error.message);
    }
}
export default sendemail;