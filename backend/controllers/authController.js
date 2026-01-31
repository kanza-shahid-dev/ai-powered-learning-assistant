import jwt from "jsonwebtoken";
import User from "../models/User.js";

//Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "1d",
  });
};

//@desc   Register a new user
//@route  POST /api/auth/register
//@access Public
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    //check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        error:
          userExists.email === email
            ? "Email already in use"
            : "Username already in use",
        statusCode: 400,
        message: "User already exists",
      });
    }

    // create user
    const user = await User.create({ username, email, password });

    //generate token
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
        },
        token,
      },
      message: "User registered successfully",
    });
  } catch (error) {
    next(error);
  }
};

//@desc   Login user
//@route  POST /api/auth/login
//@access Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide email and password",
        statusCode: 400,
        message: "Invalid input",
      });
    }

    //check for user (including password)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
        statusCode: 401,
        message: "Authentication failed",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
        statusCode: 401,
        message: "Authentication failed",
      });
    }
    //generate token
    const token = generateToken(user._id);
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
        },
        token,
      },
      message: "Login successful",
    });
  } catch (error) {
    next(error);
  }
};

//@desc   Get user profile
//@route  GET /api/auth/profile
//@access Private
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      message: "User profile fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

//@desc   Update user profile
//@route  PUT /api/auth/profile
//@access Private
export const updateProfile = async (req, res, next) => {
  try {
    const { username, email, profileImage } = req.body;

    const user = await User.findById(req.user._id);

    if (email && email !== user.email) {
      return res.status(400).json({
        success: false,
        error: "Email cannot be changed",
      });
    }

    if (username) user.username = username;
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
      message: "User profile updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

//@desc   Change user password
//@route  POST /api/auth/change-password
//@access Private
export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Please provide old and new password",
        statusCode: 400,
        message: "Invalid input",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    //check old password
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Old password is incorrect",
        statusCode: 401,
        message: "Authentication failed",
      });
    }

    //update to new password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};
