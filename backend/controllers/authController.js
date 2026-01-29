import jwt from "jsonwebtoken";
import User from "../models/User.js";

//Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
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
          username,
          email,
          profileImage,
          createdAt,
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
  } catch (error) {
    next(error);
  }
};

//@desc   Get user profile
//@route  GET /api/auth/profile
//@access Private
export const getProfile = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};

//@desc   Update user profile
//@route  PUT /api/auth/profile
//@access Private
export const updateProfile = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};

//@desc   Change user password
//@route  POST /api/auth/change-password
//@access Private
export const changePassword = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};
