const express = require("express");
const { getSuggestCarBaseOnUserNeed } = require("../controller/chatBoxController");
const router = express.Router();

router.post("/suggestCar", getSuggestCarBaseOnUserNeed  );

module.exports = router;
