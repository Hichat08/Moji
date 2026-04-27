// @ts-nocheck
import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Session from "../models/Session.js";
import { OAuth2Client } from "google-auth-library";

const ACCESS_TOKEN_TTL = "30m"; // thường là dưới 15m
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 ngày
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const createAndSendTokens = async (user, res) => {
  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL },
  );

  const refreshToken = crypto.randomBytes(64).toString("hex");

  await Session.create({
    userId: user._id,
    refreshToken,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none", // backend, frontend deploy riêng
    maxAge: REFRESH_TOKEN_TTL,
  });

  return res
    .status(200)
    .json({ message: `User ${user.displayName} đã logged in!`, accessToken });
};

export const signUp = async (req, res) => {
  try {
    const { username, password, email, firstName, lastName } = req.body;

    if (!username || !password || !email || !firstName || !lastName) {
      return res.status(400).json({
        message:
          "Không thể thiếu username, password, email, firstName, và lastName",
      });
    }

    const duplicate = await User.findOne({ username });
    if (duplicate) {
      return res.status(409).json({ message: "username đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      hashedPassword,
      email,
      displayName: `${firstName} ${lastName}`,
    });

    return res.sendStatus(204);
  } catch (error) {
    console.error("Lỗi khi gọi signUp", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const signIn = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Thiếu username hoặc password." });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(401)
        .json({ message: "username hoặc password không chính xác" });
    }

    const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);
    if (!passwordCorrect) {
      return res
        .status(401)
        .json({ message: "username hoặc password không chính xác" });
    }

    return createAndSendTokens(user, res);
  } catch (error) {
    console.error("Lỗi khi gọi signIn", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const googleSignIn = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res
        .status(400)
        .json({ message: "Google credential không tồn tại." });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload?.email || !payload.email_verified) {
      return res
        .status(400)
        .json({ message: "Email Google phải được xác thực." });
    }

    const googleId = payload.sub;
    const email = payload.email.toLowerCase();
    const displayName =
      payload.name ||
      `${payload.given_name || ""} ${payload.family_name || ""}`.trim();
    const avatarUrl = payload.picture;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        if (!user.displayName) user.displayName = displayName;
        await user.save();
      }
    } else {
      const baseUsername = email.split("@")[0].replace(/[^a-zA-Z0-9_-]/g, "");
      let username =
        baseUsername || `google-${crypto.randomBytes(4).toString("hex")}`;
      let exists = await User.findOne({ username });
      let suffix = 1;
      while (exists) {
        username = `${baseUsername}-${suffix}`;
        suffix += 1;
        exists = await User.findOne({ username });
      }

      user = await User.create({
        username,
        email,
        displayName: displayName || email,
        googleId,
        avatarUrl,
      });
    }

    return createAndSendTokens(user, res);
  } catch (error) {
    console.error("Lỗi khi gọi googleSignIn", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const signOut = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      await Session.deleteOne({ refreshToken: token });
      res.clearCookie("refreshToken");
    }

    return res.sendStatus(204);
  } catch (error) {
    console.error("Lỗi khi gọi signOut", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "Token không tồn tại." });
    }

    const session = await Session.findOne({ refreshToken: token });
    if (!session) {
      return res
        .status(403)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    if (session.expiresAt < new Date()) {
      return res.status(403).json({ message: "Token đã hết hạn." });
    }

    const accessToken = jwt.sign(
      {
        userId: session.userId,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Lỗi khi gọi refreshToken", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
