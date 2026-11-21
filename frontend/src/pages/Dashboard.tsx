
import { useEffect, useState } from 'react';
import {
    Apple,
    Truck,
    Users,
    Package,
    AlertTriangle
} from 'lucide-react';
import api from '../services/api';

interface StockItem {
    fruit_name: string;
    packaging_size: string;
    available_quantity: number;
}

function getArray(response: any): any[] {
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.data?.data)) return response.data.data;
    return [];
}

function Dashboard() {
    const [fruitCount, setFruitCount] = useState(0);
    const [supplierCount, setSupplierCount] = useState(0);
    const [vendorCount, setVendorCount] = useState(0);
    const [totalStock, setTotalStock] = useState(0);
    const [lowStock, setLowStock] = useState<StockItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError('');

                const results = await Promise.allSettled([
                    api.get('/fruits'),
                    api.get('/suppliers'),
                    api.get('/vendors'),
                    api.get('/reports/stock'),
                    api.get('/fruits/low-stock')
                ]);

                const fruits = results[0].status === 'fulfilled'
                    ? getArray(results[0].value)
                    : [];

                const suppliers = results[1].status === 'fulfilled'
                    ? getArray(results[1].value)
                    : [];

                const vendors = results[2].status === 'fulfilled'
                    ? getArray(results[2].value)
                    : [];

                const stock = results[3].status === 'fulfilled'
                    ? getArray(results[3].value)
                    : [];

                const lowStockItems = results[4].status === 'fulfilled'
                    ? getArray(results[4].value)
                    : [];

                setFruitCount(fruits.length);
                setSupplierCount(suppliers.length);
                setVendorCount(vendors.length);

                const stockTotal = stock.reduce(
                    (total: number, item: any) =>
                        total + Number(item.available_quantity || 0),
                    0
                );

                setTotalStock(stockTotal);
                setLowStock(lowStockItems);

                if (results.every(result => result.status === 'rejected')) {
                    setError('Unable to connect to the backend. Please check that the server is running.');
                }
            } catch {
                setError('Unable to load dashboard information.');
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    const summaryCards = [
        {
            title: 'Total Fruits',
            value: fruitCount,
            icon: Apple,
            color: 'green'
        },
        {
            title: 'Total Suppliers',
            value: supplierCount,
            icon: Truck,
            color: 'blue'
        },
        {
            title: 'Registered Vendors',
            value: vendorCount,
            icon: Users,
            color: 'purple'
        },
        {
            title: 'Available Stock',
            value: totalStock,
            icon: Package,
            color: 'orange'
        }
    ];

    return (
        <div className="dashboard-content">
            <div className="welcome-section">
                <div>
                    <h2>Dashboard Overview</h2>
                    <p>Here is what's happening in your distribution business.</p>
                </div>
                <span className="date-label">
                    {new Date().toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    })}
                </span>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="summary-grid">
                {summaryCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <div className="summary-card" key={card.title}>
                            <div className={`summary-icon ${card.color}`}>
                                <Icon size={23} />
                            </div>

                            <div>
                                <p>{card.title}</p>
                                <h3>{loading ? '...' : card.value.toLocaleString()}</h3>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="dashboard-section">
                <div className="section-heading">
                    <div>
                        <h3>Low Stock Alert</h3>
                        <p>Fruits that need restocking.</p>
                    </div>

                    <span className="alert-count">
                        {loading ? '...' : lowStock.length} items
                    </span>
                </div>

                {loading ? (
                    <p className="empty-message">Loading stock information...</p>
                ) : lowStock.length === 0 ? (
                    <p className="empty-message">No low-stock items found.</p>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Fruit</th>
                                    <th>Packaging Size</th>
                                    <th>Available Quantity</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {lowStock.map((item, index) => (
                                    <tr key={`${item.fruit_name}-${item.packaging_size}-${index}`}>
                                        <td>{item.fruit_name}</td>
                                        <td>{item.packaging_size}</td>
                                        <td>{item.available_quantity}</td>
                                        <td>
                                            <span className="status-badge low">
                                                <AlertTriangle size={13} />
                                                Low Stock
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
