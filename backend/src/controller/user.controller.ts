import type { CookieOptions, Request, Response } from "express";
import User from "../model/user.model.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { RegisterInput } from "../schemas/registerSchema.js";
import { LoginInput } from "../schemas/loginSchema.js";
import { Types } from "mongoose";

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// GeneretAccessAndRefreshToken
const generateAccessAndRefreshToken = async (
  userId: Types.ObjectId,
): Promise<TokenPair> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(401, "userId not match");
  }
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;

  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

// RegisterUser
const registerUser = asyncHandler(
  async (req: Request<{}, {}, RegisterInput>, res: Response) => {
    const { username, email, password } = req.body;

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      throw new ApiError(409, "Email or username already exists");
    }

    const newUser = await User.create({ username, email, password });
    const user = await User.findById(newUser._id).select("-password");

    if (!user)
      throw new ApiError(500, "Something went wrong while creating user");

    res
      .status(201)
      .json(new ApiResponse(201, user, "User registered successfully"));
  },
);

//LoginUser
const loginUser = asyncHandler(
  async (req: Request<{}, {}, LoginInput>, res: Response): Promise<void> => {
    const { username, password } = req.body;

    const loggedIn = await User.findOne({ username });

    if (!loggedIn) {
      throw new ApiError(401, "user not registered");
    }

    const isPasswordValid = await loggedIn.isPasswordCorrect(password);

    if (!isPasswordValid) {
      throw new ApiError(401, "User Password are wrong");
    }

    // generate refresh and access token
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      loggedIn._id,
    );

    const loggedInUser = await User.findById(loggedIn._id).select(
      "-password -refreshToken",
    );
    const options: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken, loggedInUser: loggedInUser },
          "user successfully logged in.",
        ),
      );
  },
);

const logoutUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    await User.findByIdAndUpdate(req.user._id, {
      $unset: { refreshToken: 1 },
    });

    const options: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    };

    res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, null, "User logged out successfully"));
  },
);

const getCurrentUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    res
      .status(200)
      .json(new ApiResponse(200, req.user, "Current user fetched"));
  },
);

export { registerUser, loginUser, logoutUser, getCurrentUser };
