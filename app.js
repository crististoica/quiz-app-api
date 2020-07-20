require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const mongoose = require("mongoose");

const cookieParser = require("cookie-parser");

const app = express();

const getRouter = require("./routes/get-routes");
const postRouter = require("./routes/post-routes");
const forumRouter = require("./routes/forum-routes");

app.use(helmet());
app.use(
  cors({
    origin: ["http://127.0.0.1:42279", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use(getRouter);
app.use(postRouter);
app.use(forumRouter);

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server up ==> http://localhost:${PORT}`);
});
