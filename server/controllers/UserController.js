const User = require("../models/User");

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, password });
    if (user) {
      res.status(200).json(user);
    }
  } catch (error) {
    res.status(500).json({ message: `שם משתמש או סיסמא לא נכונים ${email} ${password}`, });
  }
};
