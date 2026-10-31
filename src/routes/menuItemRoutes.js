

const express = require("express");
const router = express.Router();

const menuItemController = require("../controllers/menuItemController");


router.post("/", menuItemController.createMenuItem);


router.get("/", menuItemController.getMenuItems);


router.get("/:id", menuItemController.getMenuItemById);


router.patch("/:id", menuItemController.updateMenuItem);


router.delete("/:id", menuItemController.deleteMenuItem);

module.exports = router;
