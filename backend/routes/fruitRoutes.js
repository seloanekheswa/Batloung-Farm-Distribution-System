
const express = require('express');
const router = express.Router();

const {
    getAllFruits,
    getFruitById,
    createFruit,
    updateFruit,
    deleteFruit,
    getFruitStock,
    getLowStock
} = require('../controllers/fruitController');

// Low-stock route (must come before /:id)
router.get('/low-stock', getLowStock);

// Get all fruits
router.get('/', getAllFruits);

// Register a fruit
router.post('/', createFruit);

// Get stock by fruit ID and packaging size
router.get('/:id/stock/:packagingSize', getFruitStock);

// Get one fruit
router.get('/:id', getFruitById);

// Update a fruit
router.put('/:id', updateFruit);

// Delete a fruit
router.delete('/:id', deleteFruit);

module.exports = router;
