

const mongoose = require("mongoose");

const Cart = require("../models/Cart");
const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");

const calculateOrderTotal = require("../utils/calculateOrderTotal");

exports.placeOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { deliveryAddress } = req.body;

    if (
      typeof deliveryAddress !== "string" ||
      !deliveryAddress.trim()
    ) {
      return res.status(400).json({
        message: "Delivery address is required"
      });
    }

    let createdOrder;

    await session.withTransaction(async () => {
      const cart = await Cart.findOne({
        user: req.user.id
      }).session(session);

      if (!cart || cart.items.length === 0) {
        throw new Error("Your cart is empty");
      }

      const orderItems = [];
      let restaurantId = null;

      for (const cartItem of cart.items) {
        const menuItem = await MenuItem.findById(
          cartItem.menuItem
        ).session(session);

        if (!menuItem) {
          throw new Error("A menu item no longer exists");
        }

        if (menuItem.isAvailable !== true) {
          throw new Error(
            `${menuItem.name} is not available`
          );
        }

        if (
          !Number.isInteger(cartItem.quantity) ||
          cartItem.quantity <= 0
        ) {
          throw new Error("Invalid cart quantity");
        }

        // Use restaurantId because that is the field
        // defined in your MenuItem model.
        if (!menuItem.restaurantId) {
          throw new Error("Menu item has no restaurant");
        }

        const currentRestaurantId =
          menuItem.restaurantId.toString();

        if (
          restaurantId &&
          restaurantId !== currentRestaurantId
        ) {
          throw new Error(
            "Items must belong to one restaurant"
          );
        }

        restaurantId = currentRestaurantId;

        orderItems.push({
          menuItem: menuItem._id,
          itemName: menuItem.name,
          unitPrice: menuItem.price,
          quantity: cartItem.quantity
        });
      }

      // Calculate prices using database prices
      const calculated = calculateOrderTotal(orderItems);

      const orders = await Order.create(
        [{
          user: req.user.id,
          items: calculated.items,
          subtotal: calculated.subtotal,
          total: calculated.total,
          deliveryAddress: deliveryAddress.trim(),
          status: "placed"
        }],
        { session }
      );

      createdOrder = orders[0];

      // Clear cart only after order creation
      cart.items = [];
      await cart.save({ session });
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: createdOrder
    });

  } catch (error) {
    const clientErrors = [
      "Your cart is empty",
      "A menu item no longer exists",
      "Items must belong to one restaurant",
      "Invalid cart quantity",
      "Menu item has no restaurant"
    ];

    if (
      clientErrors.includes(error.message) ||
      error.message.endsWith("is not available")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    console.error("Order error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to place order"
    });

  } finally {
    await session.endSession();
  }
};


exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id
    })
      .populate("items.menuItem")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });

  } catch (error) {
    console.error("Get orders error:", error);

    res.status(500).json({
      message: "Failed to get orders"
    });
  }
};


exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid order ID"
      });
    }

    const order = await Order.findOne({
      _id: id,
      user: req.user.id
    }).populate("items.menuItem");

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      order
    });

  } catch (error) {
    console.error("Get order by ID error:", error);

    res.status(500).json({
      message: "Failed to get order"
    });
  }
};
