const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.sendStatus(403);
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.sendStatus(403);
    }

    req.user = decoded;

    next();
  });
};

module.exports = verifyToken;
