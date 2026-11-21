
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const pool = require('./config/db');
const errorMiddleware = require('./middleware/errorMiddleware');

const supplierRoutes = require('./routes/supplierRoutes');
const fruitRoutes = require('./routes/fruitRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const saleRoutes = require('./routes/saleRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
    : [];

app.use(cors({
    origin: (origin, callback) => {
        if (
            !origin ||
            allowedOrigins.includes(origin) ||
            /^http:\/\/localhost:\d+$/.test(origin)
        ) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

app.use(express.json());

app.use('/api/suppliers', supplierRoutes);
app.use('/api/fruits', fruitRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => {
    res.json({
        message: 'Batloung Farm Distribution System API is running'
    });
});

app.get('/api/health', async (req, res) => {
    let connection;

    try {
        connection = await pool.getConnection();
        await connection.ping();

        res.status(200).json({
            status: 'success',
            message: 'Backend and MySQL database are connected'
        });
    } catch (error) {
        console.error('Database connection error:', error);

        res.status(503).json({
            status: 'error',
            message: 'Backend is running, but the database is unavailable'
        });
    } finally {
        if (connection) connection.release();
    }
});

app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found'
    });
});

app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`Batloung Farm API running on port ${PORT}`);
});
