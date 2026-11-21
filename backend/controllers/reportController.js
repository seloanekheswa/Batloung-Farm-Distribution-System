
const reportModel = require('../models/reportModel');

// 1. Top five fruits
const getTopFiveFruits = async (req, res, next) => {
    try {
        const data = await reportModel.getTopFiveFruits();

        res.status(200).json({
            status: 'success',
            data
        });
    } catch (error) {
        next(error);
    }
};

// 2. Sales revenue between dates
const getSalesRevenue = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                status: 'error',
                message: 'Please provide startDate and endDate'
            });
        }

        const datePattern = /^\d{4}-\d{2}-\d{2}$/;

        if (
            !datePattern.test(startDate) ||
            !datePattern.test(endDate) ||
            startDate > endDate
        ) {
            return res.status(400).json({
                status: 'error',
                message: 'Please provide valid dates in YYYY-MM-DD format'
            });
        }

        const data = await reportModel.getSalesRevenue(startDate, endDate);

        res.status(200).json({
            status: 'success',
            data
        });
    } catch (error) {
        next(error);
    }
};

// 3. Vendor with the most boxes purchased
const getTopVendor = async (req, res, next) => {
    try {
        const data = await reportModel.getTopVendor();

        res.status(200).json({
            status: 'success',
            data
        });
    } catch (error) {
        next(error);
    }
};

// 4. Stock report
const getStockReport = async (req, res, next) => {
    try {
        const data = await reportModel.getStockReport();

        res.status(200).json({
            status: 'success',
            data
        });
    } catch (error) {
        next(error);
    }
};

// 5. Outstanding balances
const getOutstandingBalances = async (req, res, next) => {
    try {
        const data = await reportModel.getOutstandingBalances();

        res.status(200).json({
            status: 'success',
            data
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getTopFiveFruits,
    getSalesRevenue,
    getTopVendor,
    getStockReport,
    getOutstandingBalances
};
