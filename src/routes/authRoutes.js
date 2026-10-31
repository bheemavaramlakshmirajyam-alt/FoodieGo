
const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");

const authenticate = require("../middleware/authenticate");

router.post("/register", authController.registerUser);

router.post("/login", authController.loginUser);

router.get("/me", authenticate, authController.getMe);

module.exports = router;