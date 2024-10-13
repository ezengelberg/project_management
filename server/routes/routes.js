const express = require("express");

const router = express.Router();

router.get('/', (req, res) => {
    res.send(`Server API is running on port ${5000}...`);
});

module.exports = router;