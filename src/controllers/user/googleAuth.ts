import { Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";
const EXPIRATION_TIME: string = process.env.JWT_EXPIRES_IN || "1d";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export const googleAuth = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const { credential } = req.body;

        if (!credential) {
            res.status(400).json({ message: "Google credential is required" });
            return;
        }

        if (!GOOGLE_CLIENT_ID) {
            res.status(500).json({ message: "Google OAuth is not configured on the server" });
            return;
        }

        // Verify the Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) {
            res.status(401).json({ message: "Invalid Google token" });
            return;
        }

        const { sub: googleId, email, name, given_name } = payload;

        if (!email || !googleId) {
            res.status(400).json({ message: "Email and Google ID are required" });
            return;
        }

        // Check if user exists by googleId or email
        let user = await User.findOne({
            $or: [{ googleId }, { email }],
        });

        if (user) {
            // User exists - update googleId if not set
            if (!user.googleId) {
                user.googleId = googleId;
                user.authProvider = "google";
                await user.save();
            }
        } else {
            // Create new user
            // Generate username from email or name
            let username = email.split("@")[0];

            // Ensure username is unique
            let usernameExists = await User.findOne({ username });
            let counter = 1;
            while (usernameExists) {
                username = `${email.split("@")[0]}${counter}`;
                usernameExists = await User.findOne({ username });
                counter++;
            }

            user = new User({
                username,
                email,
                googleId,
                authProvider: "google",
                nickname: given_name || name || username,
                dateCreated: new Date(),
                dateLastLogin: new Date(),
                courseBatchesProgress: [],
            });

            await user.save();
        }

        // Update last login date
        (user as any).dateLastLogin = new Date();
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: EXPIRATION_TIME } as SignOptions,
        );

        // Set cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });

        res.status(200).json({
            message: "Google authentication successful",
            token,
            fallbackRequired: process.env.NODE_ENV === "production" ? true : false,
        });
    } catch (err) {
        console.error("Google auth error:", err);
        const message =
            err instanceof Error ? err.message : "An unknown error occurred";
        res.status(500).json({ error: message });
    }
};
