
const pool = require('../config/db');

// Get all vendors
const getAllVendors = async () => {
    const [rows] = await pool.query(
        'SELECT * FROM vendors ORDER BY vendor_id DESC'
    );
    return rows;
};

// Get vendor by ID
const getVendorById = async (id) => {
    const [rows] = await pool.query(
        'SELECT * FROM vendors WHERE vendor_id = ?',
        [id]
    );
    return rows[0];
};

// Search vendors by name or phone number
const searchVendors = async (searchTerm) => {
    const [rows] = await pool.query(
        `SELECT * FROM vendors
         WHERE vendor_name LIKE ?
         OR phone_number LIKE ?
         ORDER BY vendor_id DESC`,
        [`%${searchTerm}%`, `%${searchTerm}%`]
    );
    return rows;
};

// Register a new vendor
const createVendor = async (vendor) => {
    const { vendor_name, phone_number, location, registration_date } = vendor;

    const [result] = await pool.query(
        `INSERT INTO vendors
        (vendor_name, phone_number, location, registration_date)
        VALUES (?, ?, ?, COALESCE(?, CURDATE()))`,
        [vendor_name, phone_number, location, registration_date || null]
    );
    return result.insertId;
};

// Update vendor details
const updateVendor = async (id, vendor) => {
    const { vendor_name, phone_number, location, registration_date } = vendor;

    const [result] = await pool.query(
        `UPDATE vendors
         SET vendor_name = ?,
             phone_number = ?,
             location = ?,
             registration_date = ?
         WHERE vendor_id = ?`,
        [vendor_name, phone_number, location, registration_date, id]
    );
    return result.affectedRows;
};

// Delete vendor
const deleteVendor = async (id) => {
    const [result] = await pool.query(
        'DELETE FROM vendors WHERE vendor_id = ?',
        [id]
    );
    return result.affectedRows;
};

// Export all functions
module.exports = {
    getAllVendors,
    getVendorById,
    searchVendors,
    createVendor,
    updateVendor,
    deleteVendor
};
