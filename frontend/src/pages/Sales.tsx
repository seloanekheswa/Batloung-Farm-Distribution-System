
import { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Trash2, ShoppingCart, RefreshCw } from 'lucide-react';

interface Vendor {
    vendor_id: number;
    vendor_name: string;
}

interface Fruit {
    fruit_id: number;
    fruit_name: string;
    small_price: number;
    medium_price: number;
    large_price: number;
    status: string;
}

interface SaleItem {
    fruit_id: string;
    packaging_size: string;
    quantity: string;
}

const emptyItem: SaleItem = {
    fruit_id: '',
    packaging_size: 'Small',
    quantity: '1'
};

function Sales() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [fruits, setFruits] = useState<Fruit[]>([]);
    const [vendorId, setVendorId] = useState('');
    const [items, setItems] = useState<SaleItem[]>([{ ...emptyItem }]);
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [amountPaid, setAmountPaid] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [vendorResponse, fruitResponse] = await Promise.all([
                api.get('/vendors'),
                api.get('/fruits')
            ]);

            const vendorData = vendorResponse.data.data || vendorResponse.data;
            const fruitData = fruitResponse.data.data || fruitResponse.data;

            setVendors(Array.isArray(vendorData) ? vendorData : []);
            setFruits(
                Array.isArray(fruitData)
                    ? fruitData.filter((fruit: Fruit) => fruit.status === 'Active')
                    : []
            );
        } catch (err: any) {
            setError(err.response?.data?.message || 'Could not load vendors and fruits.');
        }
    };

    const updateItem = (
        index: number,
        field: keyof SaleItem,
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

    const getPrice = (item: SaleItem) => {
        const fruit = fruits.find(
            f => f.fruit_id === Number(item.fruit_id)
        );

        if (!fruit) return 0;

        if (item.packaging_size === 'Small') return Number(fruit.small_price);
        if (item.packaging_size === 'Medium') return Number(fruit.medium_price);
        return Number(fruit.large_price);
    };

    const totalAmount = items.reduce((total, item) => {
        return total + getPrice(item) * (Number(item.quantity) || 0);
    }, 0);

    const paymentAmount = paymentMethod === 'CREDIT'
        ? Number(amountPaid) || 0
        : amountPaid === '' ? totalAmount : Number(amountPaid);

    const outstandingBalance = totalAmount - paymentAmount;

    const paymentStatus = paymentAmount >= totalAmount
        ? 'PAID'
        : paymentAmount > 0
            ? 'PARTIALLY_PAID'
            : 'UNPAID';

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessage('');
        setError('');

        if (!vendorId) {
            setError('Please select a vendor.');
            return;
        }

        const validItems = items.every(item =>
            item.fruit_id &&
            Number.isInteger(Number(item.quantity)) &&
            Number(item.quantity) > 0
        );

        if (!validItems) {
            setError('Please select a fruit and enter a valid quantity for every item.');
            return;
        }

        if (
            !Number.isFinite(paymentAmount) ||
            paymentAmount < 0 ||
            paymentAmount > totalAmount
        ) {
            setError('Amount paid must be between zero and the sale total.');
            return;
        }

        const saleData = {
            vendor_id: Number(vendorId),
            items: items.map(item => ({
                fruit_id: Number(item.fruit_id),
                packaging_size: item.packaging_size,
                quantity: Number(item.quantity)
            })),
            payment_method: paymentMethod,
            amount_paid: paymentAmount
        };

        try {
            setLoading(true);

            const response = await api.post('/sales', saleData);

            setMessage(
                response.data.message ||
                'Sale recorded and stock updated successfully.'
            );

            setVendorId('');
            setItems([{ ...emptyItem }]);
            setPaymentMethod('CASH');
            setAmountPaid('');
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                'Could not record sale. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Sales</h1>
                    <p>Record fruit sales to registered street vendors.</p>
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
                        <h2>Record New Sale</h2>
                        <p>Select a vendor and enter the fruits being sold.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Select Vendor</label>
                        <select
                            value={vendorId}
                            onChange={e => setVendorId(e.target.value)}
                            required
                        >
                            <option value="">Choose a vendor</option>
                            {vendors.map(vendor => (
                                <option
                                    key={vendor.vendor_id}
                                    value={vendor.vendor_id}
                                >
                                    {vendor.vendor_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="purchase-items-heading">
                        <h3>Sale Items</h3>
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
                                <label>Unit Price</label>
                                <input
                                    type="text"
                                    value={`M ${getPrice(item).toFixed(2)}`}
                                    readOnly
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
                        <span>Sale Total</span>
                        <strong>
                            M {totalAmount.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                        </strong>
                    </div>

                    <div className="form-group">
                        <label>Payment Method</label>
                        <select
                            value={paymentMethod}
                            onChange={e => {
                                setPaymentMethod(e.target.value);
                                setAmountPaid('');
                            }}
                        >
                            <option value="CASH">Cash</option>
                            <option value="MOBILE_MONEY">Mobile Money</option>
                            <option value="CREDIT">Credit</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Amount Paid (M)</label>
                        <input
                            type="number"
                            min="0"
                            max={totalAmount}
                            step="0.01"
                            value={paymentMethod === 'CREDIT' ? amountPaid : (amountPaid === '' ? totalAmount : amountPaid)}
                            onChange={e => setAmountPaid(e.target.value)}
                            placeholder="Enter amount paid"
                        />
                    </div>

                    <div className="payment-summary">
                        <div>
                            <span>Payment Status</span>
                            <strong>{paymentStatus}</strong>
                        </div>
                        <div>
                            <span>Outstanding Balance</span>
                            <strong>
                                M {Math.max(0, outstandingBalance).toFixed(2)}
                            </strong>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={loading}
                    >
                        {loading ? 'Recording Sale...' : 'Record Sale'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Sales;
