import type { CookieOptions, Request, Response } from "express";
import { Types } from "mongoose";
import jwt, { type JwtPayload } from "jsonwebtoken";
import User from "../model/user.model.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import type { RegisterInput } from "../schemas/registerSchema.js";
import type { LoginInput } from "../schemas/loginSchema.js";

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface RefreshTokenPayload extends JwtPayload {
  _id: string;
}

const cookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
});

const generateAccessAndRefreshToken = async (
  userId: Types.ObjectId,
): Promise<TokenPair> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(401, "User not found");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const registerUser = asyncHandler(
  async (
    req: Request<{}, {}, RegisterInput>,
    res: Response,
  ): Promise<void> => {
    const { username, email, password } = req.body;
    const existing = await User.findOne({ $or: [{ email }, { username }] });

    if (existing) {
      throw new ApiError(409, "Email or username already exists");
    }

    const newUser = await User.create({ username, email, password });
    const user = await User.findById(newUser._id).select("-password");

    if (!user) {
      throw new ApiError(500, "Something went wrong while creating user");
    }

    res
      .status(201)
      .json(new ApiResponse(201, user, "User registered successfully"));
  },
);

const loginUser = asyncHandler(
  async (
    req: Request<{}, {}, LoginInput>,
    res: Response,
  ): Promise<void> => {
    const { username, email, password } = req.body;
    const loggedIn = await User.findOne(
      email ? { email } : { username },
    );

    if (!loggedIn || !(await loggedIn.isPasswordCorrect(password))) {
      throw new ApiError(401, "Invalid username or password");
    }

    const { accessToken, refreshToken } =
      await generateAccessAndRefreshToken(loggedIn._id);
    const loggedInUser = await User.findById(loggedIn._id).select(
      "-password -refreshToken",
    );
    const options = cookieOptions();

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { loggedInUser },
          "User successfully logged in",
        ),
      );
  },
);

const logoutUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    await User.findByIdAndUpdate(req.user._id, {
      $unset: { refreshToken: 1 },
    });

    const options = cookieOptions();
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

const refreshAccessToken = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const incomingRefreshToken = req.cookies?.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Refresh token is required");
    }

    const secret = process.env.REFRESH_TOKEN_SECRET;
    if (!secret) {
      throw new ApiError(500, "REFRESH_TOKEN_SECRET is not defined");
    }

    let decodedToken: RefreshTokenPayload;
    try {
      decodedToken = jwt.verify(
        incomingRefreshToken,
        secret,
      ) as RefreshTokenPayload;
    } catch {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const user = await User.findById(decodedToken._id);
    if (!user || user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh token has been revoked");
    }

    const { accessToken, refreshToken } =
      await generateAccessAndRefreshToken(user._id);
    const options = cookieOptions();

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, null, "Access token refreshed"));
  },
);

export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  refreshAccessToken,
};
