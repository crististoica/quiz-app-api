const express = require("express");
const jwt = require("jsonwebtoken");
const moment = require("moment");

const ForumPost = require("../models/forumPost");
const User = require("../models/user");
const TotalPosts = require("../models/totalPosts");

const Router = express.Router();

Router.post("/create-post", async (req, res) => {
  const token = req.cookies.token;
  const postBody = req.body;

  if (!token) {
    return res.status(401).json({ message: "You are not logged in" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET,
    { algorithms: ["HS256"] },
    async (err, payload) => {
      if (err)
        return res.status(401).json({ message: "You are not logged in" });

      const user = await User.findOne({ _id: payload.id });
      if (user) {
        const authorBody = {
          username: user.username,
          id: user.id,
        };
        postBody.author = authorBody;
        const post = new ForumPost(postBody);
        await post.save();

        const subject = postBody.content.quizWrongQuestion.subject;

        await TotalPosts.updateOne({}, { $inc: { [subject]: 1 } });
      }
    }
  );

  res.end();
});

Router.post("/answer-post", (req, res) => {
  // make sure answer is not empty
  if (req.body.answer.trim().length === 0) {
    return res.status(422).json({ error: "Nu poti trimite un raspuns gol" });
  }
  // verify token
  const token = req.cookies.token;
  console.log(token);
  jwt.verify(
    token,
    process.env.JWT_SECRET,
    { algorithms: ["HS256"] },
    async (err, payload) => {
      if (err) {
        return res.status(401).json({ message: "You are not logged in" });
      }
      // if token valid -> search DB for post _id
      const postId = req.body.postId;
      const post = await ForumPost.findById(postId);
      // if post valid -> update replies
      if (!post) {
        return res.status(500).json({ error: "Eroare" });
      } else {
        post.replies.push({
          author: {
            username: payload.username,
            id: payload.id,
          },
          answer: req.body.answer,
        });
        await post.save();
        return res.json({ message: "Raspuns creat" });
      }
    }
  );
});

Router.get("/posts/:subject", async (req, res) => {
  const subject = req.params.subject;

  const posts = await ForumPost.find({
    "content.quizWrongQuestion.subject": subject,
  });

  if (posts) {
    const formatData = () => {
      const data = [];

      posts.forEach((post) => {
        data.push({
          author: post.author.username,
          title: post.content.title,
          content: post.content.postContent,
          replies: post.replies.length,
          createdAt: moment(post.createdAt).format("DD/MM/YYYY"),
          id: post._id,
        });
      });

      return data;
    };
    return res.json(formatData());
  }

  res.json({ message: "No posts" });
});

Router.get("/get-post/:post_id", async (req, res) => {
  const id = req.params.post_id;
  console.log(id);
  try {
    const post = await ForumPost.findById(id);
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Server error (post may not exist)" });
  }
  res.end();
});

Router.get("/total-posts", async (req, res) => {
  const data = await TotalPosts.find();
  res.json(data[0]);
});

module.exports = Router;
