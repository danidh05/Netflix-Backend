import { User } from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { generateTokenandSetCookie } from "../utils/generateToken.js";

export async function signup(req, res) {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "invalid email" });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existingUserByEmail = await User.findOne({ email: email });
    if (existingUserByEmail) {
      return res
        .status(400)
        .json({ success: false, message: "email already exists" });
    }

    const existingUSerByUsername = await User.findOne({ username: username });
    if (existingUSerByUsername) {
      return res
        .status(400)
        .json({ success: false, message: "Username already exists" });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const PROFILE_PICS = ["/avatar1.png", "/avatar2.png", "/avatar3.png"]; //will be taken from the frontend

    const image = PROFILE_PICS[Math.floor(Math.random() * PROFILE_PICS.length)]; //gives a random photo from the profile pics default value

    const newUser = new User({
      email: email,
      password: hashedPassword,
      username: username,
      image, //recall image:image fiye 7otta image awal kelme teb3a lal db wtene we7de teb3a lal var hon belfile
    });

    generateTokenandSetCookie(newUser._id, res);
    await newUser.save();
    //remove password from the response
    res.status(201).json({
      success: true,
      user: {
        ...newUser._doc,
        password: "",
      },
    });
  } catch (error) {
    console.log("Error in signup Controller", error.message);
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // 1. Validate Request Input
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // 2. Find User by Email
    const user = await User.findOne({ email: email });

    // 3. Check if User Exists
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    // 4. Verify Password
    const isPasswordCorrect = await bcryptjs.compare(password, user.password);

    // 5. Check if Password is Correct
    if (!isPasswordCorrect) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    // 6. Generate Token and Set Cookie
    generateTokenandSetCookie(user._id, res);

    // 7. Send Success Response with User Data
    res.status(200).json({
      success: true,
      user: {
        ...user._doc,
        password: "",
      },
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
}

export async function logout(req, res) {
  try {
    //we just clear the cookie and send the response so user is logged out
    res.clearCookie("jwt-netflix");
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
}

export async function authCheck(req, res) {
  try {
    // console.log("req.user:", req.user);
    res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    console.log("Error in authCheck controller", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}
//XYcAj4MOqgBFf0tF;

//mongodb+srv://danidh20052005:XYcAj4MOqgBFf0tF@cluster0.hub21.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
