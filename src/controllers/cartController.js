

const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const MenuItem = require("../models/MenuItem");

// Helper: Validate quantity
const isValidQuantity = (quantity) => {
  return Number.isInteger(quantity) && quantity > 0;
};

// 1. GET CART
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({
      user: req.user.id
    }).populate("items.menuItem");

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: []
      });
    }

    let subtotal = 0;

    const items = cart.items.map((item) => {
      const menuItem = item.menuItem;

      const price = menuItem ? menuItem.price : 0;
      const lineTotal = price * item.quantity;

      subtotal += lineTotal;

      return {
        menuItem,
        quantity: item.quantity,
        lineTotal
      };
    });

    res.status(200).json({
      success: true,
      cart: {
        _id: cart._id,
        items,
        subtotal
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to get cart"
    });
  }
};


// 2. ADD ITEM
exports.addItem = async (req, res) => {
  try {
    const { menuItemId, quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(menuItemId)) {
      return res.status(400).json({
        message: "Invalid menu item ID"
      });
    }

    if (!isValidQuantity(quantity)) {
      return res.status(400).json({
        message: "Quantity must be a positive integer"
      });
    }

    const menuItem = await MenuItem.findById(menuItemId);

    if (!menuItem) {
      return res.status(404).json({
        message: "Menu item not found"
      });
    }

    if (menuItem.isAvailable !== true) {
      return res.status(400).json({
        message: "Menu item is not available"
      });
    }

    let cart = await Cart.findOne({
      user: req.user.id
    });

    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        items: []
      });
    }

    const existingItem = cart.items.find(
      (item) => item.menuItem.toString() === menuItemId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        menuItem: menuItemId,
        quantity
      });
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      cart
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to add item"
    });
  }
};


// 3. UPDATE QUANTITY
exports.updateQuantity = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(menuItemId)) {
      return res.status(400).json({
        message: "Invalid menu item ID"
      });
    }

    if (!isValidQuantity(quantity)) {
      return res.status(400).json({
        message: "Quantity must be a positive integer"
      });
    }

    const cart = await Cart.findOne({
      user: req.user.id
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found"
      });
    }

    const item = cart.items.find(
      (item) => item.menuItem.toString() === menuItemId
    );

    if (!item) {
      return res.status(404).json({
        message: "Item not found in cart"
      });
    }

    item.quantity = quantity;

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Quantity updated",
      cart
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to update quantity"
    });
  }
};


// 4. REMOVE ITEM
exports.removeItem = async (req, res) => {
  try {
    const { menuItemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(menuItemId)) {
      return res.status(400).json({
        message: "Invalid menu item ID"
      });
    }

    const cart = await Cart.findOne({
      user: req.user.id
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found"
      });
    }

    const initialLength = cart.items.length;

    cart.items = cart.items.filter(
      (item) => item.menuItem.toString() !== menuItemId
    );

    if (cart.items.length === initialLength) {
      return res.status(404).json({
        message: "Item not found in cart"
      });
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to remove item"
    });
  }
};


// 5. CLEAR CART
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user.id
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found"
      });
    }

    cart.items = [];

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to clear cart"
    });
  }
};
