import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import axios from "axios";
import User from "../models/users.js";
import dotenv from "dotenv";
dotenv.config();
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let us = await User.findOne({ email });

        if (us) {
          if (!us.googleId) {
            us.googleId = profile.id;
            us.isOAuthUser = true;
            await us.save();
          }
        } else {
          us = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: email,
            username: email.split("@")[0],
            isOAuthUser: true,
          });
        }

        done(null, us);
      } catch (error) {
        done(error, null);
      }
    }
  )
);


passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "github/callback", 
      scope: ["user:email"], 
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let email;

        if (profile.emails && profile.emails.length > 0) {
          email = profile.emails[0].value;
        } else {
          const emailResponse = await axios.get(
            "https://api.github.com/user/emails",
            {
              headers: { Authorization: `token ${accessToken}` },
            }
          );
          const primaryEmail = emailResponse.data.find(
            (e) => e.primary && e.verified
          );
          email = primaryEmail ? primaryEmail.email : null;
        }

        if (!email) {
          throw new Error("No email found for GitHub user");
        }

        let us = await User.findOne({ email });

        if (us) {
          if (!us.githubId) {
            us.githubId = profile.id;
            us.isOAuthUser = true;
            await us.save();
          }
        } else {
          us = await User.create({
            githubId: profile.id,
            name: profile.displayName || profile.username, // ✅ safe fallback
            email: email,
            username: profile.username,
            isOAuthUser: true,
          });
        }

        done(null, us);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

export default passport;
