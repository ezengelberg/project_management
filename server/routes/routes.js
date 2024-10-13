const express = require("express");

const {loginUser} = require("../controllers/UserController");


const router = express.Router();

router.get('/', (req, res) => {
    res.send(`Server API is running on port ${5000}...`);
});

router.post('/login', loginUser);

module.exports = router;