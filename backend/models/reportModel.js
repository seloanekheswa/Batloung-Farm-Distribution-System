
const pool = require('../config/db');

// 1. Get the five most frequently sold fruits
const getTopFiveFruits = async () => {
    const [rows] = await pool.query(
        `SELECT
            f.fruit_id,
            f.fruit_name,
            SUM(sd.quantity) AS total_boxes_sold
         FROM sales_details sd
         JOIN fruits f ON sd.fruit_id = f.fruit_id
         GROUP BY f.fruit_id, f.fruit_name
         ORDER BY total_boxes_sold DESC
         LIMIT 5`
    );

    return rows;
};

// 2. Get total sales revenue within a date range
const getSalesRevenue = async (startDate, endDate) => {
    const [rows] = await pool.query(
        `SELECT
            COUNT(sale_id) AS total_sales,
            COALESCE(SUM(total_amount), 0) AS total_revenue
         FROM sales
         WHERE sale_date BETWEEN ? AND ?`,
        [startDate, endDate]
    );

    return rows[0];
};

// 3. Get the vendor who purchased the highest number of boxes
const getTopVendor = async () => {
    const [rows] = await pool.query(
        `SELECT
            v.vendor_id,
            v.vendor_name,
            SUM(sd.quantity) AS total_boxes_purchased
         FROM sales s
         JOIN vendors v ON s.vendor_id = v.vendor_id
         JOIN sales_details sd ON s.sale_id = sd.sale_id
         GROUP BY v.vendor_id, v.vendor_name
         ORDER BY total_boxes_purchased DESC
         LIMIT 1`
    );

    return rows;
};

// 4. Get current stock for every fruit and packaging size
const getStockReport = async () => {
    const [rows] = await pool.query(
        `SELECT
            f.fruit_name,
            st.packaging_size,
            st.available_quantity
         FROM stock st
         JOIN fruits f ON st.fruit_id = f.fruit_id
         ORDER BY f.fruit_name, st.packaging_size`
    );

    return rows;
};

// 5. Get outstanding payment balances for each vendor
const getOutstandingBalances = async () => {
    const [rows] = await pool.query(
        `SELECT
            v.vendor_id,
            v.vendor_name,
            COALESCE(SUM(s.total_amount - s.amount_paid), 0)
                AS outstanding_balance
         FROM vendors v
         LEFT JOIN sales s ON v.vendor_id = s.vendor_id
         GROUP BY v.vendor_id, v.vendor_name
         ORDER BY outstanding_balance DESC`
    );

    return rows;
};

module.exports = {
    getTopFiveFruits,
    getSalesRevenue,
    getTopVendor,
    getStockReport,
    getOutstandingBalances
};
