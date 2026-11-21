
import { useEffect, useMemo, useState } from 'react';
import { Search, Package, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../services/api';

interface StockItem {
    fruit_id: number;
    fruit_name: string;
    packaging_size: string;
    available_quantity: number;
}

function Stock() {
    const [stock, setStock] = useState<StockItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sizeFilter, setSizeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [error, setError] = useState('');

    const loadStock = async () => {
        try {
            setLoading(true);

            const response = await api.get('/reports/stock');

            const records = Array.isArray(response.data)
                ? response.data
                : response.data?.data || [];

            setStock(records);
            setError('');
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                'Unable to load stock information.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStock();
    }, []);

    const filteredStock = useMemo(() => {
        return stock.filter((item) => {
            const matchesSearch = item.fruit_name
                .toLowerCase()
                .includes(search.toLowerCase());

            const matchesSize =
                sizeFilter === '' ||
                item.packaging_size === sizeFilter;

            const isLow = Number(item.available_quantity) <= 10;

            const matchesStatus =
                statusFilter === '' ||
                (statusFilter === 'Low Stock' && isLow) ||
                (statusFilter === 'In Stock' && !isLow);

            return matchesSearch && matchesSize && matchesStatus;
        });
    }, [stock, search, sizeFilter, statusFilter]);

    const totalStock = stock.reduce(
        (total, item) => total + Number(item.available_quantity || 0),
        0
    );

    const lowStockCount = stock.filter(
        item => Number(item.available_quantity) <= 10
    ).length;

    const inStockCount = stock.filter(
        item => Number(item.available_quantity) > 10
    ).length;

    return (
        <div className="management-page">
            <div className="management-heading">
                <div>
                    <h2>Stock Management</h2>
                    <p>Monitor available fruit quantities by packaging size.</p>
                </div>

                <button className="secondary-button" onClick={loadStock}>
                    Refresh Stock
                </button>
            </div>

            <div className="management-stats stock-stats">
                <div className="management-stat-card">
                    <div className="management-stat-icon">
                        <Package size={23} />
                    </div>
                    <div>
                        <span>Total Available Stock</span>
                        <h3>{loading ? '...' : totalStock.toLocaleString()}</h3>
                    </div>
                </div>

                <div className="management-stat-card">
                    <div className="stock-alert-icon">
                        <AlertTriangle size={23} />
                    </div>
                    <div>
                        <span>Low Stock Items</span>
                        <h3>{loading ? '...' : lowStockCount}</h3>
                    </div>
                </div>

                <div className="management-stat-card">
                    <div className="stock-good-icon">
                        <CheckCircle size={23} />
                    </div>
                    <div>
                        <span>Items In Stock</span>
                        <h3>{loading ? '...' : inStockCount}</h3>
                    </div>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="management-table-card">
                <div className="table-toolbar">
                    <div>
                        <h3>Available Stock</h3>
                        <p>Stock quantities for each fruit and packaging size.</p>
                    </div>

                    <div className="table-filters">
                        <div className="management-search">
                            <Search size={17} />
                            <input
                                type="text"
                                placeholder="Search fruit..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <select
                            value={sizeFilter}
                            onChange={(e) => setSizeFilter(e.target.value)}
                            aria-label="Filter by packaging size"
                        >
                            <option value="">All Sizes</option>
                            <option value="Small">Small</option>
                            <option value="Medium">Medium</option>
                            <option value="Large">Large</option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            aria-label="Filter by stock status"
                        >
                            <option value="">All Stock Statuses</option>
                            <option value="In Stock">In Stock</option>
                            <option value="Low Stock">Low Stock</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <p className="empty-message">Loading stock information...</p>
                ) : filteredStock.length === 0 ? (
                    <p className="empty-message">No stock records found.</p>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Fruit Name</th>
                                    <th>Packaging Size</th>
                                    <th>Available Quantity</th>
                                    <th>Stock Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredStock.map((item, index) => {
                                    const quantity = Number(item.available_quantity);
                                    const low = quantity <= 10;

                                    return (
                                        <tr key={`${item.fruit_id}-${item.packaging_size}-${index}`}>
                                            <td><strong>{item.fruit_name}</strong></td>
                                            <td>{item.packaging_size}</td>
                                            <td>{quantity.toLocaleString()}</td>
                                            <td>
                                                <span className={`stock-status ${low ? 'low' : 'available'}`}>
                                                    {low ? (
                                                        <AlertTriangle size={14} />
                                                    ) : (
                                                        <CheckCircle size={14} />
                                                    )}
                                                    {low ? 'Low Stock' : 'In Stock'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="table-footer">
                    Showing {filteredStock.length} of {stock.length} stock records
                </div>
            </div>
        </div>
    );
}

export default Stock;
