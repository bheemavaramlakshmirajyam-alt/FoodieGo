

const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");
const authMiddleware = require("../middleware/authenticate");


router.use(authMiddleware);

router.post("/", orderController.placeOrder);

router.get("/", orderController.getOrders);

router.get("/:id", orderController.getOrderById);

module.exports = router;

