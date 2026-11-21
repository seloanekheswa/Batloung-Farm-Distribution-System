
const express = require('express');
const router = express.Router();

const {
    createSale
} = require('../controllers/saleController');

// Record a new sale
router.post('/', createSale);

module.exports = router;
