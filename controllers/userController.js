const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const passport = require("../config/passport");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const registerUser = async (req, res) => {
  try {
    const { username, email, password, confPassword, restaurantName } =
      req.body;

    if (!username || !email || !password || !confPassword || !restaurantName) {
      return res.status(400).json({ error: "All fields are required." });
    }

    if (password !== confPassword) {
      throw new Error("Password must match password confirmation");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email,
        restaurantName,
      },
    });
    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    if (error.code === "P2002") {
      res.status(409).json({ message: "Username or email already exists" });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

// Test postman header - Content-Type: application/json

const loginUser = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res
        .status(401)
        .json({ error: "Authentication failed", message: info.message });
    }
    req.logIn(user, async (err) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Login failed, please try again" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: "1h",
      });

      return res.status(200).json({
        message: "Login successful",
        token: token,
        user: {
          id: user.id,
          username: user.username,
          restaurantName: user.restaurantName,
          email: user.email,
        },
      });
    });
  })(req, res, next);
};

const logoutUser = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logout sucessfully" });
    });
  });
};

module.exports = { registerUser, loginUser, logoutUser };
