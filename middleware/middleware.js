const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ isLoggedIn: false });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET,
    { algorithms: ["HS256"] },
    (error, user) => {
      if (error) {
        console.log(error.message);
        return res.status(401).json({ isLoggedIn: false });
      }

      return res
        .status(200)
        .json({ isLoggedIn: true, username: user.username, id: user.id });
    }
  );
}

module.exports = {
  verifyToken,
};
