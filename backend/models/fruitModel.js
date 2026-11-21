
const pool = require('../config/db');

// Get all fruits
const getAllFruits = async () => {
    const [rows] = await pool.query(
        'SELECT * FROM fruits ORDER BY fruit_id DESC'
    );
    return rows;
};

// Get one fruit by ID
const getFruitById = async (id) => {
    const [rows] = await pool.query(
        'SELECT * FROM fruits WHERE fruit_id = ?',
        [id]
    );
    return rows[0];
};

// Register a new fruit
const createFruit = async (fruit) => {
    const {
        fruit_name,
        description,
        small_price,
        medium_price,
        large_price
    } = fruit;

    const [result] = await pool.query(
        `INSERT INTO fruits
        (fruit_name, description, small_price, medium_price, large_price)
        VALUES (?, ?, ?, ?, ?)`,
        [
            fruit_name,
            description || null,
            small_price,
            medium_price,
            large_price
        ]
    );

    return result.insertId;
};

// Update fruit details
const updateFruit = async (id, fruit) => {
    const {
        fruit_name,
        description,
        small_price,
        medium_price,
        large_price,
        status
    } = fruit;

    const [result] = await pool.query(
        `UPDATE fruits
        SET fruit_name = ?,
            description = ?,
            small_price = ?,
            medium_price = ?,
            large_price = ?,
            status = ?
        WHERE fruit_id = ?`,
        [
            fruit_name,
            description || null,
            small_price,
            medium_price,
            large_price,
            status,
            id
        ]
    );

    return result.affectedRows;
};

// Delete a fruit
const deleteFruit = async (id) => {
    const [result] = await pool.query(
        'DELETE FROM fruits WHERE fruit_id = ?',
        [id]
    );

    return result.affectedRows;
};

// Get stock for a particular fruit and packaging size
const getFruitStock = async (id, packagingSize) => {
    const [rows] = await pool.query(
        `SELECT f.fruit_name, s.packaging_size, s.available_quantity
         FROM stock s
         JOIN fruits f ON s.fruit_id = f.fruit_id
         WHERE s.fruit_id = ? AND s.packaging_size = ?`,
        [id, packagingSize]
    );

    return rows;
};

// Get all low-stock items
const getLowStock = async (threshold = 10) => {
    const [rows] = await pool.query(
        `SELECT f.fruit_name, s.packaging_size, s.available_quantity
         FROM stock s
         JOIN fruits f ON s.fruit_id = f.fruit_id
         WHERE s.available_quantity <= ?
         ORDER BY s.available_quantity ASC`,
        [threshold]
    );

    return rows;
};

module.exports = {
    getAllFruits,
    getFruitById,
    createFruit,
    updateFruit,
    deleteFruit,
    getFruitStock,
    getLowStock
};
