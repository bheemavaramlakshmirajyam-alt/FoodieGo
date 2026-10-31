

const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");


const createMenuItem = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(
            req.body.restaurantId
        );

        if (!restaurant) {
            return res.status(404).json({
                message: "Restaurant not found. Enter a valid restaurantId."
            });
        }

        const menuItem = await MenuItem.create(req.body);

        res.status(201).json({
            message: "Menu item created successfully",
            data: menuItem
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};


const getMenuItems = async (req, res) => {
    try {
        const menuItems = await MenuItem.find()
            .populate("restaurantId", "name address");

        res.status(200).json({
            message: "Menu items fetched successfully",
            data: menuItems
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
    try {
        
        const filter = {};

        if (req.query.category) {
            filter.category = req.query.category;
        }

        if (req.query.restaurantId) {
            filter.restaurantId = req.query.restaurantId;
        }

        if (req.query.isAvailable !== undefined) {
            filter.isAvailable = req.query.isAvailable === "true";
        }

        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};

            if (req.query.minPrice) {
                filter.price.$gte = Number(req.query.minPrice);
            }

            if (req.query.maxPrice) {
                filter.price.$lte = Number(req.query.maxPrice);
            }
        }

    
        const allowedSortFields = ["price", "name"];

        const sortBy = allowedSortFields.includes(req.query.sort)
            ? req.query.sort
            : "name";

        const order = req.query.order === "desc" ? -1 : 1;

        
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(
            Math.max(parseInt(req.query.limit) || 5, 1),
            100
        );

        const skip = (page - 1) * limit;

        
        const menuItems = await MenuItem.find(filter)
            .sort({ [sortBy]: order })
            .skip(skip)
            .limit(limit);

        const totalItems = await MenuItem.countDocuments(filter);

        res.status(200).json({
            success: true,
            totalItems,
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
            menuItems
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }

};


const getMenuItemById = async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id)
            .populate("restaurantId", "name address");

        if (!menuItem) {
            return res.status(404).json({
                message: "Menu item not found"
            });
        }

        res.status(200).json({
            data: menuItem
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};


const updateMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!menuItem) {
            return res.status(404).json({
                message: "Menu item not found"
            });
        }

        res.status(200).json({
            message: "Menu item updated successfully",
            data: menuItem
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};


const deleteMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findByIdAndDelete(
            req.params.id
        );

        if (!menuItem) {
            return res.status(404).json({
                message: "Menu item not found"
            });
        }

        res.status(200).json({
            message: "Menu item deleted successfully"
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};


module.exports = {
    createMenuItem,
    getMenuItems,
    getMenuItemById,
    updateMenuItem,
    deleteMenuItem
};
