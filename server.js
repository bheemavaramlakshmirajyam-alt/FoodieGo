

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const restaurantRoutes = require("./src/routes/restaurantRoutes");
const menuItemRoutes = require("./src/routes/menuItemRoutes");
const authRoutes = require("./src/routes/authRoutes");
const adminRoutes = require("./src/routes/adminRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.send("FoodieGo API is running");
});

// Restaurant routes
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/menuItems", menuItemRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// Check environment variable
console.log("MongoDB URI loaded:", !!process.env.MONGO_URI);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully");

        app.listen(process.env.PORT || 5000, () => {
            console.log(`Server running on port ${process.env.PORT || 5000}`);
        });
    })
    .catch((error) => {
        console.log("MongoDB Connection Error:", error.message);
    });

module.exports = app;
