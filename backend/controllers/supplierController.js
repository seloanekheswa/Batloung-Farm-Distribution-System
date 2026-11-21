
const Supplier = require('../models/supplierModel');

// Allowed South African provinces
const validProvinces = [
    'Gauteng',
    'Free State',
    'KwaZulu-Natal',
    'Western Cape',
    'Eastern Cape',
    'Limpopo',
    'Mpumalanga',
    'North West'
];

// Validate supplier information
const validateSupplier = (data) => {
    const {
        business_name,
        contact_person,
        phone,
        province,
        address
    } = data;

    if (!business_name || !contact_person || !phone || !province || !address) {
        return 'All supplier fields are required';
    }

    if (!validProvinces.includes(province)) {
        return 'Invalid South African province';
    }

    return null;
};

// Get all suppliers
const getAllSuppliers = async (req, res, next) => {
    try {
        const suppliers = await Supplier.getAllSuppliers();

        res.status(200).json({
            status: 'success',
            data: suppliers
        });
    } catch (error) {
        next(error);
    }
};

// Get supplier by ID
const getSupplierById = async (req, res, next) => {
    try {
        const supplier = await Supplier.getSupplierById(req.params.id);

        if (!supplier) {
            return res.status(404).json({
                message: 'Supplier not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: supplier
        });
    } catch (error) {
        next(error);
    }
};

// Register supplier
const createSupplier = async (req, res, next) => {
    try {
        const validationError = validateSupplier(req.body);

        if (validationError) {
            return res.status(400).json({
                message: validationError
            });
        }

        const supplierId = await Supplier.createSupplier(req.body);

        res.status(201).json({
            status: 'success',
            message: 'Supplier registered successfully',
            supplier_id: supplierId
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

// Update supplier
const updateSupplier = async (req, res, next) => {
    try {
        const validationError = validateSupplier(req.body);

        if (validationError) {
            return res.status(400).json({
                message: validationError
            });
        }

        const existingSupplier = await Supplier.getSupplierById(req.params.id);

        if (!existingSupplier) {
            return res.status(404).json({
                message: 'Supplier not found'
            });
        }

        await Supplier.updateSupplier(req.params.id, req.body);

        res.status(200).json({
            status: 'success',
            message: 'Supplier updated successfully'
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

// Delete supplier
const deleteSupplier = async (req, res, next) => {
    try {
        const existingSupplier = await Supplier.getSupplierById(req.params.id);

        if (!existingSupplier) {
            return res.status(404).json({
                message: 'Supplier not found'
            });
        }

        await Supplier.deleteSupplier(req.params.id);

        res.status(200).json({
            status: 'success',
            message: 'Supplier deleted successfully'
        });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({
                message: 'Cannot delete supplier because purchase records are linked to it'
            });
        }

        next(error);
    }
};

module.exports = {
    getAllSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier
};
