
const purchaseModel = require('../models/purchaseModel');

// Create a new purchase
const createPurchase = async (req, res, next) => {
    try {
        const { supplier_id, items } = req.body;

        // Check required information
        if (!supplier_id || !Number.isInteger(Number(supplier_id))) {
            return res.status(400).json({
                status: 'error',
                message: 'A valid supplier ID is required'
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'At least one fruit item is required'
            });
        }

        // Record purchase
        const purchase = await purchaseModel.createPurchase({
            supplier_id: Number(supplier_id),
            items
        });

        return res.status(201).json({
            status: 'success',
            message: 'Purchase recorded and stock updated successfully',
            data: purchase
        });

    } catch (error) {
        if (
            error.message === 'Supplier not found' ||
            error.message.includes('not found or inactive') ||
            error.message.includes('Invalid')
        ) {
            return res.status(400).json({
                status: 'error',
                message: error.message
            });
        }

        next(error);
    }
};

module.exports = {
    createPurchase
};
