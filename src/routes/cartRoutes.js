

const express = require("express");
const router = express.Router();

const cartController = require("../controllers/cartController");
const authMiddleware = require("../middleware/authenticate");

router.use(authMiddleware);

router.get("/", cartController.getCart);

router.post("/items", cartController.addItem);

router.patch("/items/:menuItemId", cartController.updateQuantity);

router.delete("/items/:menuItemId", cartController.removeItem);

router.delete("/", cartController.clearCart);

module.exports = router;
