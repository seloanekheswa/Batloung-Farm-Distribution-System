
const pool = require('../config/db');

// Record a purchase and update stock safely
const createPurchase = async (purchase) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const { supplier_id, items } = purchase;

        // Validate supplier ID
        if (!Number.isInteger(Number(supplier_id)) || Number(supplier_id) <= 0) {
            throw new Error('Invalid supplier ID');
        }

        // Check whether supplier exists
        const [suppliers] = await connection.query(
            'SELECT supplier_id FROM suppliers WHERE supplier_id = ?',
            [supplier_id]
        );

        if (suppliers.length === 0) {
            throw new Error('Supplier not found');
        }

        if (!Array.isArray(items) || items.length === 0) {
            throw new Error('A purchase must contain at least one item');
        }

        // Combine duplicate fruit and packaging entries
        const combinedItems = new Map();

        for (const item of items) {
            const { fruit_id, quantity, packaging_size, unit_cost } = item;

            const fruitId = Number(fruit_id);
            const itemQuantity = Number(quantity);
            const itemCost = Number(unit_cost);

            if (
                !Number.isInteger(fruitId) ||
                fruitId <= 0 ||
                !Number.isInteger(itemQuantity) ||
                itemQuantity <= 0 ||
                !Number.isFinite(itemCost) ||
                itemCost < 0 ||
                !['Small', 'Medium', 'Large'].includes(packaging_size)
            ) {
                throw new Error('Invalid purchase item details');
            }

            const key = `${fruitId}-${packaging_size}`;

            if (combinedItems.has(key)) {
                combinedItems.get(key).quantity += itemQuantity;
                combinedItems.get(key).unit_cost = itemCost;
            } else {
                combinedItems.set(key, {
                    fruit_id: fruitId,
                    quantity: itemQuantity,
                    packaging_size,
                    unit_cost: itemCost
                });
            }
        }

        console.log(
            'COMBINED PURCHASE ITEMS:',
            Array.from(combinedItems.values())
        );

        let totalAmount = 0;
        const purchaseItems = [];

        // Validate fruits and calculate purchase total
        for (const item of combinedItems.values()) {
            const { fruit_id, quantity, packaging_size, unit_cost } = item;

            const [fruits] = await connection.query(
                `SELECT fruit_id
                 FROM fruits
                 WHERE fruit_id = ? AND status = 'Active'`,
                [fruit_id]
            );

            if (fruits.length === 0) {
                throw new Error(
                    `Fruit ID ${fruit_id} not found or inactive`
                );
            }

            totalAmount += quantity * unit_cost;

            purchaseItems.push({
                fruit_id,
                quantity,
                packaging_size,
                unit_cost
            });
        }

        // Create purchase record
        const [purchaseResult] = await connection.query(
            `INSERT INTO purchases
            (supplier_id, purchase_date, total_amount)
            VALUES (?, CURDATE(), ?)`,
            [supplier_id, totalAmount]
        );

        const purchaseId = purchaseResult.insertId;

        // Save purchase items and increase stock
        for (const item of purchaseItems) {
            await connection.query(
                `INSERT INTO purchase_details
                (purchase_id, fruit_id, quantity, unit_cost, packaging_size)
                VALUES (?, ?, ?, ?, ?)`,
                [
                    purchaseId,
                    item.fruit_id,
                    item.quantity,
                    item.unit_cost,
                    item.packaging_size
                ]
            );

            await connection.query(
                `INSERT INTO stock
                (fruit_id, packaging_size, available_quantity)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE
                available_quantity =
                available_quantity + VALUES(available_quantity)`,
                [
                    item.fruit_id,
                    item.packaging_size,
                    item.quantity
                ]
            );
        }

        await connection.commit();

        return {
            purchase_id: purchaseId,
            supplier_id,
            total_amount: totalAmount,
            items: purchaseItems
        };

    } catch (error) {
        await connection.rollback();
        throw error;

    } finally {
        connection.release();
    }
};

module.exports = {
    createPurchase
};
