const express = require("express");
const moderationController = require("../controllers/moderationController");

const router = express.Router();

router.get("/", moderationController.dailyModeration);

module.exports = router;
