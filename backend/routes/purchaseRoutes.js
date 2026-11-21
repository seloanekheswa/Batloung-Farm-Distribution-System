
const express = require('express');
const router = express.Router();

const {
    createPurchase
} = require('../controllers/purchaseController');

// Record a new purchase
router.post('/', createPurchase);

module.exports = router;
