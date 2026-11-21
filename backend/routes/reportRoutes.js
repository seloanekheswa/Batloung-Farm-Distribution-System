
const express = require('express');
const router = express.Router();

const {
    getTopFiveFruits,
    getSalesRevenue,
    getTopVendor,
    getStockReport,
    getOutstandingBalances
} = require('../controllers/reportController');

router.get('/top-fruits', getTopFiveFruits);
router.get('/sales-revenue', getSalesRevenue);
router.get('/top-vendor', getTopVendor);
router.get('/stock', getStockReport);
router.get('/outstanding-balances', getOutstandingBalances);

module.exports = router;
