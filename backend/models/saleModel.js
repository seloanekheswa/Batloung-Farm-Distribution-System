
const pool = require('../config/db');

// Record a sale and reduce stock safely
const createSale = async (sale) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const { vendor_id, items, payment_method } = sale;

        // Check whether vendor exists
        const [vendors] = await connection.query(
            'SELECT vendor_id FROM vendors WHERE vendor_id = ?',
            [vendor_id]
        );

        if (vendors.length === 0) {
            throw new Error('Vendor not found');
        }

        // Validate payment method
        const validMethods = ['CASH', 'MOBILE_MONEY', 'CREDIT'];

        if (!validMethods.includes(payment_method)) {
            throw new Error('Invalid payment method');
        }

        if (!Array.isArray(items) || items.length === 0) {
            throw new Error('A sale must contain at least one item');
        }

        // Combine duplicate fruit and packaging entries
        const combinedItems = new Map();

        for (const item of items) {
            const { fruit_id, quantity, packaging_size } = item;

            const fruitId = Number(fruit_id);
            const itemQuantity = Number(quantity);

            if (
                !Number.isInteger(fruitId) ||
                fruitId <= 0 ||
                !Number.isInteger(itemQuantity) ||
                itemQuantity <= 0 ||
                !['Small', 'Medium', 'Large'].includes(packaging_size)
            ) {
                throw new Error('Invalid sale item details');
            }

            const key = `${fruitId}-${packaging_size}`;

            if (combinedItems.has(key)) {
                combinedItems.get(key).quantity += itemQuantity;
            } else {
                combinedItems.set(key, {
                    fruit_id: fruitId,
                    quantity: itemQuantity,
                    packaging_size
                });
            }
        }

        console.log(
            'COMBINED SALE ITEMS:',
            Array.from(combinedItems.values())
        );

        let totalAmount = 0;
        const saleItems = [];

        // Validate combined items and check stock
        for (const item of combinedItems.values()) {
            const { fruit_id, quantity, packaging_size } = item;

            // Get fruit price
            const priceColumn = {
                Small: 'small_price',
                Medium: 'medium_price',
                Large: 'large_price'
            }[packaging_size];

            const [fruits] = await connection.query(
                `SELECT fruit_id, fruit_name, ${priceColumn} AS unit_price
                 FROM fruits
                 WHERE fruit_id = ? AND status = 'Active'`,
                [fruit_id]
            );

            if (fruits.length === 0) {
                throw new Error(
                    `Fruit ID ${fruit_id} not found or inactive`
                );
            }

            // Lock stock row
            const [stockRows] = await connection.query(
                `SELECT available_quantity
                 FROM stock
                 WHERE fruit_id = ? AND packaging_size = ?
                 FOR UPDATE`,
                [fruit_id, packaging_size]
            );

            console.log('STOCK CHECK:', {
                fruit_id,
                packaging_size,
                available: stockRows[0]?.available_quantity,
                requested: quantity
            });

            if (
                stockRows.length === 0 ||
                Number(stockRows[0].available_quantity) < quantity
            ) {
                throw new Error(
                    `Insufficient stock for ${fruits[0].fruit_name} (${packaging_size})`
                );
            }

            const unitPrice = Number(fruits[0].unit_price);

            totalAmount += quantity * unitPrice;

            saleItems.push({
                fruit_id,
                fruit_name: fruits[0].fruit_name,
                quantity,
                packaging_size,
                unit_price: unitPrice
            });
        }

        // Calculate payment details
        const amountPaid = sale.amount_paid === undefined
            ? (payment_method === 'CREDIT' ? 0 : totalAmount)
            : Number(sale.amount_paid);

        if (
            !Number.isFinite(amountPaid) ||
            amountPaid < 0 ||
            amountPaid > totalAmount
        ) {
            throw new Error('Invalid amount paid');
        }

        let paymentStatus = 'UNPAID';

        if (amountPaid === totalAmount) {
            paymentStatus = 'PAID';
        } else if (amountPaid > 0) {
            paymentStatus = 'PARTIALLY_PAID';
        }

        // Create sale record
        const [saleResult] = await connection.query(
            `INSERT INTO sales
            (vendor_id, sale_date, payment_method, payment_status,
             total_amount, amount_paid)
            VALUES (?, CURDATE(), ?, ?, ?, ?)`,
            [
                vendor_id,
                payment_method,
                paymentStatus,
                totalAmount,
                amountPaid
            ]
        );

        const saleId = saleResult.insertId;

        // Save sale items and safely reduce stock
        for (const item of saleItems) {
            await connection.query(
                `INSERT INTO sales_details
                (sale_id, fruit_id, packaging_size, quantity, unit_price)
                VALUES (?, ?, ?, ?, ?)`,
                [
                    saleId,
                    item.fruit_id,
                    item.packaging_size,
                    item.quantity,
                    item.unit_price
                ]
            );

            const [updateResult] = await connection.query(
                `UPDATE stock
                 SET available_quantity = available_quantity - ?
                 WHERE fruit_id = ?
                 AND packaging_size = ?
                 AND available_quantity >= ?`,
                [
                    item.quantity,
                    item.fruit_id,
                    item.packaging_size,
                    item.quantity
                ]
            );

            if (updateResult.affectedRows === 0) {
                throw new Error(
                    `Stock update failed for ${item.fruit_name} (${item.packaging_size})`
                );
            }
        }

        await connection.commit();

        return {
            sale_id: saleId,
            vendor_id,
            total_amount: totalAmount,
            amount_paid: amountPaid,
            outstanding_balance: totalAmount - amountPaid,
            payment_method,
            payment_status: paymentStatus,
            items: saleItems
        };

    } catch (error) {
        await connection.rollback();
        throw error;

    } finally {
        connection.release();
    }
};

module.exports = {
    createSale
};
