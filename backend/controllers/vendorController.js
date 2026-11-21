
const Vendor = require('../models/vendorModel');

// Validate vendor information
const validateVendor = (data) => {
    const { vendor_name, phone_number, location } = data;

    if (!vendor_name || !phone_number || !location) {
        return 'Vendor name, phone number and location are required';
    }

    if (!/^[0-9+\-\s]{7,20}$/.test(phone_number)) {
        return 'Please enter a valid phone number';
    }

    return null;
};

// Get all vendors
const getAllVendors = async (req, res, next) => {
    try {
        const vendors = await Vendor.getAllVendors();

        res.status(200).json({
            status: 'success',
            data: vendors
        });
    } catch (error) {
        next(error);
    }
};

// Get vendor by ID
const getVendorById = async (req, res, next) => {
    try {
        const vendor = await Vendor.getVendorById(req.params.id);

        if (!vendor) {
            return res.status(404).json({
                message: 'Vendor not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: vendor
        });
    } catch (error) {
        next(error);
    }
};

// Search vendors by name or phone
const searchVendors = async (req, res, next) => {
    try {
        const searchTerm = req.query.search;

        if (!searchTerm || !searchTerm.trim()) {
            return res.status(400).json({
                message: 'Please provide a name or phone number to search'
            });
        }

        const vendors = await Vendor.searchVendors(searchTerm.trim());

        res.status(200).json({
            status: 'success',
            data: vendors
        });
    } catch (error) {
        next(error);
    }
};

// Register a vendor
const createVendor = async (req, res, next) => {
    try {
        const validationError = validateVendor(req.body);

        if (validationError) {
            return res.status(400).json({
                message: validationError
            });
        }

        const vendorId = await Vendor.createVendor(req.body);

        res.status(201).json({
            status: 'success',
            message: 'Vendor registered successfully',
            vendor_id: vendorId
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                message: 'This phone number is already registered'
            });
        }

        next(error);
    }
};

// Update vendor
const updateVendor = async (req, res, next) => {
    try {
        const validationError = validateVendor(req.body);

        if (validationError) {
            return res.status(400).json({
                message: validationError
            });
        }

        const existingVendor = await Vendor.getVendorById(req.params.id);

        if (!existingVendor) {
            return res.status(404).json({
                message: 'Vendor not found'
            });
        }

        const vendorData = {
            ...req.body,
            registration_date: req.body.registration_date ||
                existingVendor.registration_date
        };

        await Vendor.updateVendor(req.params.id, vendorData);

        res.status(200).json({
            status: 'success',
            message: 'Vendor updated successfully'
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                message: 'This phone number is already registered'
            });
        }

        next(error);
    }
};

// Delete vendor
const deleteVendor = async (req, res, next) => {
    try {
        const existingVendor = await Vendor.getVendorById(req.params.id);

        if (!existingVendor) {
            return res.status(404).json({
                message: 'Vendor not found'
            });
        }

        await Vendor.deleteVendor(req.params.id);

        res.status(200).json({
            status: 'success',
            message: 'Vendor deleted successfully'
        });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({
                message: 'This vendor cannot be deleted because sales records are linked to this vendor'
            });
        }

        next(error);
    }
};

module.exports = {
    getAllVendors,
    getVendorById,
    searchVendors,
    createVendor,
    updateVendor,
    deleteVendor
};
