const jwt = require('jsonwebtoken');
const config = require('../../config');

exports.verifyToken = (req, res, next) => {
  const token = req.cookies.authToken || req.headers['x-access-token'];
  
  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token, process.env.PASSPORD_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }
    req.userId = decoded.id;
    next();
  });
}