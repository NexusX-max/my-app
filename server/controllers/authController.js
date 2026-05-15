import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

/**
 * 🔑 JWT Token Generator
 */
const generateToken = (id) => {
    return jwt.sign(
        { id: id.toString() }, 
        process.env.JWT_SECRET || "onyx_secret_key", 
        { expiresIn: "30d" }
    );
};

// ==========================================
// 📝 রেজিস্ট্রেশন (Custom Username Generation)
// ==========================================
export const register = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    
    try {
        // ১. ইনপুট ভ্যালিডেশন (নিশ্চিত করা যেন ডাটা ফাঁকা না থাকে)
        if (!firstName || !email || !password) {
            return res.status(400).json({ msg: "Please provide all required fields." });
        }

        // ২. ইমেইল চেক
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ msg: "Email already exists." });
        }

        // ৩. ডাইনামিক ইউজারনেম জেনারেশন
        // নাম থেকে স্পেস রিমুভ করে ছোট হাতের অক্ষরে কনভার্ট করা
        const baseName = `${firstName}${lastName || ''}`.toLowerCase().replace(/\s+/g, '');
        const randomSuffix = crypto.randomBytes(2).toString('hex').toLowerCase();
        
        // ফাইনাল ইউজারনেম (e.g., naimusshakib_a1b2)
        const generatedUsername = `${baseName}_${randomSuffix}`;
        
        // ৪. ইউনিক অনিক্স কোড (ONYX-XXXX)
        const onyxSuffix = crypto.randomBytes(2).toString('hex').toUpperCase();

        // ৫. ইউজার ক্রিয়েশন
        const user = await User.create({ 
            firstName, 
            lastName, 
            email, 
            password, 
            username: generatedUsername,
            onyxCode: `ONYX-${onyxSuffix}`
        });

        // নোট: User মডেলের 'pre-save' মিডলওয়্যার থাকায় fullName অটোমেটিক তৈরি হবে

        res.status(201).json({ 
            success: true,
            token: generateToken(user._id), 
            user: { 
                id: user._id,
                username: user.username, 
                fullName: user.fullName, 
                onyxCode: user.onyxCode 
            }
        });

    } catch (error) {
        console.error("❌ Registration error details:", error);
        res.status(500).json({ 
            success: false,
            msg: "Registration error.", 
            error: error.message 
        });
    }
};
// ==========================================
// 🔑 লগইন (Simple Login)
// ==========================================
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).select("+password");
        if (!user) return res.status(401).json({ msg: "User not found." });

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(401).json({ msg: "Invalid password." });

        res.json({ 
            success: true,
            token: generateToken(user._id), 
            user: { username: user.username, onyxCode: user.onyxCode, avatar: user.avatar }
        });
    } catch (error) {
        res.status(500).json({ msg: "Login error." });
    }
};

// ==========================================
// 🛠️ রুট এরর এড়ানোর জন্য বাকি ফাংশনগুলো (খালি রাখা হয়েছে)
// ==========================================
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (error) { res.status(500).json({ msg: "Fetch failed." }); }
};

export const forgotPassword = async (req, res) => res.json({ msg: "Feature disabled." });
export const resetPassword = async (req, res) => res.json({ msg: "Feature disabled." });
export const googleLogin = async (req, res) => res.json({ msg: "Google disabled." });
export const updateProfile = async (req, res) => res.json({ msg: "Update later." });
export const refreshToken = async (req, res) => res.json({ token: generateToken(req.user.id) });

// বায়োমেট্রিক ফাংশনগুলো স্টাব হিসেবে রাখা হলো যাতে ইমপোর্ট এরর না দেয়
export const generateRegistrationOptions = (req, res) => res.status(501).json({ msg: "Not implemented" });
export const verifyRegistration = (req, res) => res.status(501).json({ msg: "Not implemented" });
export const generateAuthOptions = (req, res) => res.status(501).json({ msg: "Not implemented" });
export const verifyAuthentication = (req, res) => res.status(501).json({ msg: "Not implemented" });