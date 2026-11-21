
import { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Trash2, ShoppingCart, RefreshCw } from 'lucide-react';

interface Supplier {
    supplier_id: number;
    business_name: string;
}

interface Fruit {
    fruit_id: number;
    fruit_name: string;
    status: string;
}

interface PurchaseItem {
    fruit_id: string;
    packaging_size: string;
    quantity: string;
    unit_cost: string;
}

const emptyItem: PurchaseItem = {
    fruit_id: '',
    packaging_size: 'Small',
    quantity: '1',
    unit_cost: ''
};

function Purchases() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [fruits, setFruits] = useState<Fruit[]>([]);
    const [supplierId, setSupplierId] = useState('');
    const [items, setItems] = useState<PurchaseItem[]>([{ ...emptyItem }]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [supplierResponse, fruitResponse] = await Promise.all([
                api.get('/suppliers'),
                api.get('/fruits')
            ]);

            const supplierData = supplierResponse.data.data || supplierResponse.data;
            const fruitData = fruitResponse.data.data || fruitResponse.data;

            setSuppliers(Array.isArray(supplierData) ? supplierData : []);
            setFruits(
                Array.isArray(fruitData)
                    ? fruitData.filter((fruit: Fruit) => fruit.status === 'Active')
                    : []
            );
        } catch (err: any) {
            setError(err.response?.data?.message || 'Could not load suppliers and fruits.');
        }
    };

    const updateItem = (
        index: number,
        field: keyof PurchaseItem,
        value: string
    ) => {
        setItems(previous =>
            previous.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        );
    };

    const addItem = () => {
        setItems(previous => [...previous, { ...emptyItem }]);
    };

    const removeItem = (index: number) => {
        setItems(previous => previous.filter((_, i) => i !== index));
    };

    const totalAmount = items.reduce((total, item) => {
        const quantity = Number(item.quantity) || 0;
        const cost = Number(item.unit_cost) || 0;
        return total + quantity * cost;
    }, 0);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessage('');
        setError('');

        if (!supplierId) {
            setError('Please select a supplier.');
            return;
        }

        const validItems = items.every(item =>
            item.fruit_id &&
            Number.isInteger(Number(item.quantity)) &&
            Number(item.quantity) > 0 &&
            item.unit_cost !== '' &&
            Number.isFinite(Number(item.unit_cost)) &&
            Number(item.unit_cost) >= 0
        );

        if (!validItems) {
            setError('Please complete every item with a fruit, valid quantity and unit cost.');
            return;
        }

        const purchaseData = {
            supplier_id: Number(supplierId),
            items: items.map(item => ({
                fruit_id: Number(item.fruit_id),
                packaging_size: item.packaging_size,
                quantity: Number(item.quantity),
                unit_cost: Number(item.unit_cost)
            }))
        };

        try {
            setLoading(true);

            const response = await api.post('/purchases', purchaseData);

            setMessage(
                response.data.message ||
                'Purchase recorded successfully. Stock has been updated.'
            );

            setSupplierId('');
            setItems([{ ...emptyItem }]);
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                'Could not record purchase. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Purchases</h1>
                    <p>Record purchases from fruit suppliers and update stock.</p>
                </div>

                <button className="secondary-button" onClick={loadData}>
                    <RefreshCw size={17} /> Refresh
                </button>
            </div>

            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}

            <div className="form-card">
                <div className="section-heading">
                    <ShoppingCart size={22} />
                    <div>
                        <h2>Record New Purchase</h2>
                        <p>Enter the supplier and the fruits received.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Select Supplier</label>
                        <select
                            value={supplierId}
                            onChange={e => setSupplierId(e.target.value)}
                            required
                        >
                            <option value="">Choose a supplier</option>
                            {suppliers.map(supplier => (
                                <option
                                    key={supplier.supplier_id}
                                    value={supplier.supplier_id}
                                >
                                    {supplier.business_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="purchase-items-heading">
                        <h3>Purchase Items</h3>
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={addItem}
                        >
                            <Plus size={16} /> Add Fruit
                        </button>
                    </div>

                    {items.map((item, index) => (
                        <div className="purchase-item-row" key={index}>
                            <div className="form-group">
                                <label>Fruit</label>
                                <select
                                    value={item.fruit_id}
                                    onChange={e =>
                                        updateItem(index, 'fruit_id', e.target.value)
                                    }
                                    required
                                >
                                    <option value="">Select fruit</option>
                                    {fruits.map(fruit => (
                                        <option
                                            key={fruit.fruit_id}
                                            value={fruit.fruit_id}
                                        >
                                            {fruit.fruit_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Packaging Size</label>
                                <select
                                    value={item.packaging_size}
                                    onChange={e =>
                                        updateItem(index, 'packaging_size', e.target.value)
                                    }
                                >
                                    <option value="Small">Small</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Large">Large</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Quantity</label>
                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={item.quantity}
                                    onChange={e =>
                                        updateItem(index, 'quantity', e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Unit Cost</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.unit_cost}
                                    onChange={e =>
                                        updateItem(index, 'unit_cost', e.target.value)
                                    }
                                    placeholder="Enter cost"
                                    required
                                />
                            </div>

                            <button
                                type="button"
                                className="delete-item-button"
                                onClick={() => removeItem(index)}
                                disabled={items.length === 1}
                                title="Remove item"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}

                    <div className="purchase-total">
                        <span>Purchase Total</span>
                        <strong>
                            M {totalAmount.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                        </strong>
                    </div>

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={loading}
                    >
                        {loading ? 'Recording Purchase...' : 'Record Purchase'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Purchases;
