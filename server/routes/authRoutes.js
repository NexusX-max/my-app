import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

// কন্ট্রোলার থেকে ফাংশনগুলো ইমপোর্ট করা
import { 
  register, 
  login, 
  refreshToken, 
  getMe, 
  updateProfile,
  googleLogin,
  forgotPassword,
  resetPassword,
  // পাসকি রেজিস্ট্রেশনের জন্য (নিশ্চিত করো কন্ট্রোলারে এই নামে আছে)
  generateRegistrationOptions, 
  verifyRegistration,
  // পাসকি লগইনের জন্য
  generateAuthOptions, 
  verifyAuthentication 
} from '../controllers/authController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/* ==========================================================
    🔐 ১. স্ট্যান্ডার্ড অথেন্টিকেশন (Email/Password)
========================================================= */
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);


/* ==========================================================
    🖐️ ২. পাসকি ও বায়োমেট্রিক (WebAuthn Protocol)
========================================================== */
// --- ১. রেজিস্ট্রেশন প্রোটোকল (Registration) ---
// ধাপ ১: চ্যালেঞ্জ জেনারেট করা
// ফ্রন্টএন্ড কল: fetch('/api/auth/register-options')
router.get('/register-options', generateRegistrationOptions);

// ধাপ ২: বায়োমেট্রিক ডাটা ভেরিফাই করা
// ফ্রন্টএন্ড কল: fetch('/api/auth/verify-registration')
router.post('/verify-registration', verifyRegistration);


// --- ২. লগইন প্রোটোকল (Login/Authentication) ---
router.get('/login-options', generateAuthOptions);

// ধাপ ২: বায়োমেট্রিক সিগনেচার ভেরিফাই করা
/** * 🛠️ গুরুত্বপূর্ণ ফিক্স: 
 * তোমার ফ্রন্টএন্ড '/api/auth/verify-login' খুঁজছে। 
 * তাই এখানে 'verify-login' ই দিতে হবে, নাহলে ৪MD এরর আসবে।
 */
router.post('/verify-login', verifyAuthentication);


/* ==========================================================
    🛰️ ৩. পাসওয়ার্ড রিকভারি (Recovery Protocol)
========================================================== */
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);


/* ==========================================================
    🌐 ৪. গুগল OAuth2 (Social Login)
========================================================== */

// ফ্রন্টএন্ড থেকে আসা গুগল টোকেন ভেরিফাই করা
router.post('/google', googleLogin); 

// গুগলের সাইন-ইন পেজে নিয়ে যাওয়া
router.get('/google/redirect', passport.authenticate('google', { 
  scope: ['profile', 'email'],
  prompt: 'select_account' 
}));

// গুগল থেকে ফিরে আসার পর কলব্যাক
router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    try {
      const token = jwt.sign(
        { id: req.user._id.toString() }, 
        process.env.JWT_SECRET, 
        { expiresIn: '30d' }
      );

      const frontendURL = process.env.NODE_ENV === 'production' 
        ? "https://onyx-drift.com" 
        : "http://localhost:5173";

      // টোকেন সহ ফ্রন্টএন্ডে রিডাইরেক্ট
      res.redirect(`${frontendURL}/login-success?token=${token}`);
    } catch (error) {
      console.error("🔥 Google Auth Redirect Error:", error);
      const frontendURL = process.env.NODE_ENV === 'production' 
        ? "https://www.onyx-drift.com/" 
        : "http://localhost:5173";
      res.redirect(`${frontendURL}/login?error=auth_failed`);
    }
  }
);

export default router;