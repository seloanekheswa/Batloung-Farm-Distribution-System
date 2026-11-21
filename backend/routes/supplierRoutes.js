
const express = require('express');
const router = express.Router();

const {
    getAllSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier
} = require('../controllers/supplierController');

// Retrieve all suppliers
router.get('/', getAllSuppliers);

// Retrieve one supplier
router.get('/:id', getSupplierById);

// Register a supplier
router.post('/', createSupplier);

// Update a supplier
router.put('/:id', updateSupplier);

// Delete a supplier
router.delete('/:id', deleteSupplier);

module.exports = router;
