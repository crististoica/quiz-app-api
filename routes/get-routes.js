const express = require("express");
const fs = require("fs");

const Router = express.Router();

const { verifyToken } = require("../middleware/middleware");

Router.get("/verify", verifyToken);
Router.get("/logout", (req, res) => {
  res.cookie("token", req.cookies.token, {
    domain: "localhost",
    path: "/",
    maxAge: 0,
    httpOnly: true,
  });
  res.end();
});

module.exports = Router;
