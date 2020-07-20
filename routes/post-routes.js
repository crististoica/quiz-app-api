const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const rateLimit = require("express-rate-limit");
const Router = express.Router();

const User = require("../models/user");
const { verifyToken } = require("../middleware/middleware");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1,
  message: "Too many account registered",
});

const {
  getRandomQuestionsIndex,
  getRandomQuestions,
  gradeQuiz,
} = require("../helpers/quiz");

Router.post("/register", limiter, async (req, res) => {
  const userBody = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  };

  try {
    if (await User.findOne({ email: userBody.email })) {
      throw new Error("Email already used");
    }
    const hash = await bcrypt.hash(userBody.password, 10);
    userBody.password = hash;

    const user = new User(userBody);
    await user.save();

    res.status(200).json({ message: "User registered" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

Router.post("/login", async (req, res) => {
  const userBody = {
    email: req.body.email,
    password: req.body.password,
  };

  try {
    const user = await User.findOne({ email: userBody.email });
    if (user) {
      const correctPassword = await bcrypt.compare(
        userBody.password,
        user.password
      );
      if (correctPassword) {
        const payload = {
          username: user.username,
          id: user.id,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });
        res.cookie("token", token, { maxAge: 3600000, httpOnly: true });

        return res
          .status(200)
          .json({ isLoggedIn: true, username: user.username });
      }
    }

    throw new Error("Invalid credentials");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

Router.post("/verify", (req, res) => {
  const token = req.body.token;

  if (!token) {
    return res.status(401).json({ tokenIsCorrect: false });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET,
    { algorithms: ["HS256"] },
    (error, user) => {
      if (error) {
        return res.status(401).json({ tokenIsCorrect: false });
      }

      return res.status(200).json({ tokenIsCorrect: true });
    }
  );
});

Router.post("/quiz", (req, res) => {
  const subject = req.body.subject;
  const numOfQuestions = req.body.numOfQuestions;

  const rawData = fs.readFileSync("./data/data.json");
  const data = JSON.parse(rawData);

  if (subject === "PL") {
    return res.json(data[subject].normalQuestions.splice(0, 8));
  }

  const indexesArray = getRandomQuestionsIndex(
    numOfQuestions,
    data[subject].length
  );
  const questions = getRandomQuestions(indexesArray, data[subject]);
  res.json(questions);
});

Router.post("/quiz/grade-quiz", (req, res) => {
  const userQuiz = req.body.body;
  const subject = req.body.subject;

  const result = gradeQuiz(userQuiz, subject);
  res.json(result);
});

Router.get("/quiz", verifyToken, (req, res) => {
  res.json({ quiz: "A new quiz" });
});

module.exports = Router;
