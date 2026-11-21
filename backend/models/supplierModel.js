
const pool = require('../config/db');

// Get all suppliers
const getAllSuppliers = async () => {
    const [rows] = await pool.query(
        'SELECT * FROM suppliers ORDER BY supplier_id DESC'
    );

    return rows;
};

// Get supplier by ID
const getSupplierById = async (id) => {
    const [rows] = await pool.query(
        'SELECT * FROM suppliers WHERE supplier_id = ?',
        [id]
    );

    return rows[0];
};

// Register a new supplier
const createSupplier = async (supplier) => {
    const {
        business_name,
        contact_person,
        phone,
        province,
        address
    } = supplier;

    const [result] = await pool.query(
        `INSERT INTO suppliers
        (business_name, contact_person, phone, province, address)
        VALUES (?, ?, ?, ?, ?)`,
        [business_name, contact_person, phone, province, address]
    );

    return result.insertId;
};

// Update supplier
const updateSupplier = async (id, supplier) => {
    const {
        business_name,
        contact_person,
        phone,
        province,
        address
    } = supplier;

    const [result] = await pool.query(
        `UPDATE suppliers
        SET business_name = ?,
            contact_person = ?,
            phone = ?,
            province = ?,
            address = ?
        WHERE supplier_id = ?`,
        [business_name, contact_person, phone, province, address, id]
    );

    return result.affectedRows;
};

// Delete supplier
const deleteSupplier = async (id) => {
    const [result] = await pool.query(
        'DELETE FROM suppliers WHERE supplier_id = ?',
        [id]
    );

    return result.affectedRows;
};

module.exports = {
    getAllSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier
};
