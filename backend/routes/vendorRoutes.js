
const express = require('express');
const router = express.Router();

const {
    getAllVendors,
    getVendorById,
    searchVendors,
    createVendor,
    updateVendor,
    deleteVendor
} = require('../controllers/vendorController');

// Search vendors by name or phone
router.get('/search', searchVendors);

// Get all vendors
router.get('/', getAllVendors);

// Register a vendor
router.post('/', createVendor);

// Get vendor by ID
router.get('/:id', getVendorById);

// Update vendor
router.put('/:id', updateVendor);

// Delete vendor
router.delete('/:id', deleteVendor);

module.exports = router;
