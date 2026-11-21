
const Fruit = require('../models/fruitModel');

const validFruits = [
    'Apples',
    'Bananas',
    'Oranges',
    'Mangoes',
    'Grapes'
];

const validStatuses = ['Active', 'Inactive'];

const validPackagingSizes = ['Small', 'Medium', 'Large'];

// Validate fruit information
const validateFruit = (data, isUpdate = false) => {
    const {
        fruit_name,
        small_price,
        medium_price,
        large_price,
        status
    } = data;

    if (
        !fruit_name ||
        small_price === undefined ||
        medium_price === undefined ||
        large_price === undefined
    ) {
        return 'Fruit name and all three prices are required';
    }

    if (!validFruits.includes(fruit_name)) {
        return 'Invalid fruit name';
    }

    const prices = [small_price, medium_price, large_price];

    if (prices.some(price =>
        typeof price !== 'number' ||
        !Number.isFinite(price) ||
        price < 0
    )) {
        return 'Prices must be valid non-negative numbers';
    }

    if (isUpdate && !validStatuses.includes(status)) {
        return 'Status must be Active or Inactive';
    }

    return null;
};

// Get all fruits
const getAllFruits = async (req, res, next) => {
    try {
        const fruits = await Fruit.getAllFruits();

        res.status(200).json({
            status: 'success',
            data: fruits
        });
    } catch (error) {
        next(error);
    }
};

// Get fruit by ID
const getFruitById = async (req, res, next) => {
    try {
        const fruit = await Fruit.getFruitById(req.params.id);

        if (!fruit) {
            return res.status(404).json({
                message: 'Fruit not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: fruit
        });
    } catch (error) {
        next(error);
    }
};

// Register fruit
const createFruit = async (req, res, next) => {
    try {
        const validationError = validateFruit(req.body);

        if (validationError) {
            return res.status(400).json({
                message: validationError
            });
        }

        const fruitId = await Fruit.createFruit(req.body);

        res.status(201).json({
            status: 'success',
            message: 'Fruit registered successfully',
            fruit_id: fruitId
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                message: 'This fruit is already registered'
            });
        }

        next(error);
    }
};

// Update fruit
const updateFruit = async (req, res, next) => {
    try {
        const validationError = validateFruit(req.body, true);

        if (validationError) {
            return res.status(400).json({
                message: validationError
            });
        }

        const existingFruit = await Fruit.getFruitById(req.params.id);

        if (!existingFruit) {
            return res.status(404).json({
                message: 'Fruit not found'
            });
        }

        await Fruit.updateFruit(req.params.id, req.body);

        res.status(200).json({
            status: 'success',
            message: 'Fruit updated successfully'
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                message: 'This fruit name is already registered'
            });
        }

        next(error);
    }
};

// Delete fruit
const deleteFruit = async (req, res, next) => {
    try {
        const existingFruit = await Fruit.getFruitById(req.params.id);

        if (!existingFruit) {
            return res.status(404).json({
                message: 'Fruit not found'
            });
        }

        await Fruit.deleteFruit(req.params.id);

        res.status(200).json({
            status: 'success',
            message: 'Fruit deleted successfully'
        });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({
                message: 'Cannot delete this fruit because it has linked stock, purchase or sales records'
            });
        }

        next(error);
    }
};

// Get stock by fruit and packaging size
const getFruitStock = async (req, res, next) => {
    try {
        const { packagingSize } = req.params;

        if (!validPackagingSizes.includes(packagingSize)) {
            return res.status(400).json({
                message: 'Packaging size must be Small, Medium or Large'
            });
        }

        const stock = await Fruit.getFruitStock(
            req.params.id,
            packagingSize
        );

        res.status(200).json({
            status: 'success',
            data: stock
        });
    } catch (error) {
        next(error);
    }
};

// Get low-stock items
const getLowStock = async (req, res, next) => {
    try {
        const threshold = req.query.threshold === undefined
            ? 10
            : Number(req.query.threshold);

        if (!Number.isInteger(threshold) || threshold < 0) {
            return res.status(400).json({
                message: 'Threshold must be a non-negative whole number'
            });
        }

        const fruits = await Fruit.getLowStock(threshold);

        res.status(200).json({
            status: 'success',
            threshold,
            data: fruits
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllFruits,
    getFruitById,
    createFruit,
    updateFruit,
    deleteFruit,
    getFruitStock,
    getLowStock
};
