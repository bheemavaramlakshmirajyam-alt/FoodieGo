
const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authenticate");

const authorizeRole = require("../middleware/authorizeRole");

router.get(
    "/dashboard",
    authenticate,
    authorizeRole("admin"),
    (req, res) => {

        res.status(200).json({
            success: true,
            message: "Welcome to Admin Dashboard"
        });

    }
);

module.exports = router;