
const saleModel = require('../models/saleModel');

// Record a new sale
const createSale = async (req, res, next) => {
    try {
        const { vendor_id, items, payment_method, amount_paid } = req.body;

        // Validate vendor ID
        if (!vendor_id || !Number.isInteger(Number(vendor_id))) {
            return res.status(400).json({
                status: 'error',
                message: 'A valid vendor ID is required'
            });
        }

        // Validate sale items
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'At least one fruit item is required'
            });
        }

        // Validate payment method
        const validMethods = ['CASH', 'MOBILE_MONEY', 'CREDIT'];

        if (!validMethods.includes(payment_method)) {
            return res.status(400).json({
                status: 'error',
                message: 'Payment method must be CASH, MOBILE_MONEY or CREDIT'
            });
        }

        // Validate amount paid if provided
        if (
            amount_paid !== undefined &&
            (!Number.isFinite(Number(amount_paid)) || Number(amount_paid) < 0)
        ) {
            return res.status(400).json({
                status: 'error',
                message: 'Amount paid must be a valid non-negative number'
            });
        }

        const sale = await saleModel.createSale({
            vendor_id: Number(vendor_id),
            items,
            payment_method,
            amount_paid
        });

        return res.status(201).json({
            status: 'success',
            message: 'Sale recorded and stock updated successfully',
            data: sale
        });

    } catch (error) {
        if (
            error.message === 'Vendor not found' ||
            error.message.includes('not found or inactive') ||
            error.message.includes('Invalid') ||
            error.message.includes('Insufficient stock')
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
    createSale
};
