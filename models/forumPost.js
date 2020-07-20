const mongoose = require("mongoose");

const repliesSubschema = new mongoose.Schema(
  {
    author: {
      username: {
        type: String,
        required: true,
      },
      id: {
        type: String,
        required: true,
      },
    },
    answer: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const forumPostSchema = new mongoose.Schema(
  {
    author: {
      username: {
        type: String,
        required: true,
      },
      id: {
        type: String,
        required: true,
      },
    },
    content: {
      title: {
        type: String,
      },
      quizWrongQuestion: {
        type: Object,
        rqeuired: true,
      },
      postContent: {
        type: String,
        required: true,
      },
    },
    replies: [repliesSubschema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("forumposts", forumPostSchema);
