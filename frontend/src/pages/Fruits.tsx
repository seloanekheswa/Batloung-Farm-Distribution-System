
import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Edit, Trash2, X, Apple } from 'lucide-react';
import api from '../services/api';

interface Fruit {
    fruit_id: number;
    fruit_name: string;
    description: string;
    small_price: number;
    medium_price: number;
    large_price: number;
    status: string;
}

const fruitOptions = [
    'Apples',
    'Bananas',
    'Oranges',
    'Mangoes',
    'Grapes'
];

const emptyForm = {
    fruit_name: '',
    description: '',
    small_price: '',
    medium_price: '',
    large_price: '',
    status: 'Active'
};

function Fruits() {
    const [fruits, setFruits] = useState<Fruit[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const loadFruits = async () => {
        try {
            setLoading(true);

            const response = await api.get('/fruits');

            const records = Array.isArray(response.data)
                ? response.data
                : response.data?.data || [];

            setFruits(records);
            setError('');
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                'Unable to load fruits. Check that the backend is running.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFruits();
    }, []);

    const filteredFruits = useMemo(() => {
        return fruits.filter((fruit) => {
            const matchesSearch =
                fruit.fruit_name.toLowerCase().includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === '' || fruit.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [fruits, search, statusFilter]);

    const openAddForm = () => {
        setEditingId(null);
        setForm(emptyForm);
        setMessage('');
        setError('');
        setShowForm(true);
    };

    const openEditForm = (fruit: Fruit) => {
        setEditingId(fruit.fruit_id);

        setForm({
            fruit_name: fruit.fruit_name,
            description: fruit.description || '',
            small_price: String(fruit.small_price),
            medium_price: String(fruit.medium_price),
            large_price: String(fruit.large_price),
            status: fruit.status
        });

        setMessage('');
        setError('');
        setShowForm(true);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError('');
            setMessage('');

            const data = {
                ...form,
                small_price: Number(form.small_price),
                medium_price: Number(form.medium_price),
                large_price: Number(form.large_price)
            };

            if (editingId !== null) {
                await api.put(`/fruits/${editingId}`, data);
                setMessage('Fruit information updated successfully.');
            } else {
                await api.post('/fruits', data);
                setMessage('Fruit registered successfully.');
            }

            setShowForm(false);
            setForm(emptyForm);
            setEditingId(null);

            await loadFruits();
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                'Unable to save fruit information.'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (fruit: Fruit) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${fruit.fruit_name}?`
        );

        if (!confirmed) return;

        try {
            setError('');
            setMessage('');

            await api.delete(`/fruits/${fruit.fruit_id}`);

            setMessage('Fruit deleted successfully.');
            await loadFruits();
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                'Unable to delete this fruit. It may have linked stock, purchases or sales.'
            );
        }
    };

    const toggleStatus = async (fruit: Fruit) => {
        const newStatus = fruit.status === 'Active' ? 'Inactive' : 'Active';

        const confirmed = window.confirm(
            `Change ${fruit.fruit_name} status to ${newStatus}?`
        );

        if (!confirmed) return;

        try {
            setError('');
            setMessage('');

            await api.put(`/fruits/${fruit.fruit_id}`, {
                fruit_name: fruit.fruit_name,
                description: fruit.description,
                small_price: Number(fruit.small_price),
                medium_price: Number(fruit.medium_price),
                large_price: Number(fruit.large_price),
                status: newStatus
            });

            setMessage(`${fruit.fruit_name} is now ${newStatus}.`);
            await loadFruits();
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                'Unable to update fruit status.'
            );
        }
    };

    return (
        <div className="management-page">
            <div className="management-heading">
                <div>
                    <h2>Fruit Management</h2>
                    <p>Manage fruit varieties, descriptions and selling prices.</p>
                </div>

                <button className="primary-button" onClick={openAddForm}>
                    <Plus size={18} />
                    Add Fruit
                </button>
            </div>

            <div className="management-stats">
                <div className="management-stat-card">
                    <div className="management-stat-icon">
                        <Apple size={23} />
                    </div>
                    <div>
                        <span>Total Fruits</span>
                        <h3>{fruits.length}</h3>
                    </div>
                </div>

                <div className="management-stat-card">
                    <div className="management-stat-icon">
                        <Apple size={23} />
                    </div>
                    <div>
                        <span>Active Fruits</span>
                        <h3>
                            {fruits.filter(fruit => fruit.status === 'Active').length}
                        </h3>
                    </div>
                </div>
            </div>

            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}

            <div className="management-table-card">
                <div className="table-toolbar">
                    <div>
                        <h3>Registered Fruits</h3>
                        <p>View and manage fruit prices and status.</p>
                    </div>

                    <div className="table-filters">
                        <div className="management-search">
                            <Search size={17} />
                            <input
                                type="text"
                                placeholder="Search fruits..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            aria-label="Filter by status"
                        >
                            <option value="">All Statuses</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <p className="empty-message">Loading fruits...</p>
                ) : filteredFruits.length === 0 ? (
                    <p className="empty-message">No fruits found.</p>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Fruit Name</th>
                                    <th>Description</th>
                                    <th>Small Price</th>
                                    <th>Medium Price</th>
                                    <th>Large Price</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredFruits.map((fruit) => (
                                    <tr key={fruit.fruit_id}>
                                        <td><strong>{fruit.fruit_name}</strong></td>
                                        <td>{fruit.description || 'N/A'}</td>
                                        <td>M{Number(fruit.small_price).toFixed(2)}</td>
                                        <td>M{Number(fruit.medium_price).toFixed(2)}</td>
                                        <td>M{Number(fruit.large_price).toFixed(2)}</td>
                                        <td>
                                            <button
                                                className={`fruit-status ${fruit.status === 'Active' ? 'active' : 'inactive'}`}
                                                onClick={() => toggleStatus(fruit)}
                                                title="Click to change status"
                                            >
                                                {fruit.status}
                                            </button>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="edit-button"
                                                    title="Edit fruit"
                                                    onClick={() => openEditForm(fruit)}
                                                >
                                                    <Edit size={16} />
                                                </button>

                                                <button
                                                    className="delete-button"
                                                    title="Delete fruit"
                                                    onClick={() => handleDelete(fruit)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="table-footer">
                    Showing {filteredFruits.length} of {fruits.length} fruits
                </div>
            </div>

            {showForm && (
                <div className="modal-overlay">
                    <div className="management-modal">
                        <div className="modal-header">
                            <div>
                                <h3>
                                    {editingId !== null ? 'Edit Fruit' : 'Add New Fruit'}
                                </h3>
                                <p>Enter the fruit information and selling prices.</p>
                            </div>

                            <button
                                className="modal-close"
                                type="button"
                                onClick={() => setShowForm(false)}
                                aria-label="Close form"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label>Fruit Name</label>
                                    <select
                                        name="fruit_name"
                                        value={form.fruit_name}
                                        onChange={handleInputChange}
                                        required
                                        disabled={editingId !== null}
                                    >
                                        <option value="">Select fruit</option>
                                        {fruitOptions.map((fruit) => (
                                            <option key={fruit} value={fruit}>
                                                {fruit}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group full-width">
                                    <label>Description</label>
                                    <input
                                        name="description"
                                        value={form.description}
                                        onChange={handleInputChange}
                                        placeholder="Enter fruit description"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Small Box Price (M)</label>
                                    <input
                                        type="number"
                                        name="small_price"
                                        value={form.small_price}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Medium Box Price (M)</label>
                                    <input
                                        type="number"
                                        name="medium_price"
                                        value={form.medium_price}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Large Box Price (M)</label>
                                    <input
                                        type="number"
                                        name="large_price"
                                        value={form.large_price}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>

                                {editingId !== null && (
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select
                                            name="status"
                                            value={form.status}
                                            onChange={handleInputChange}
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={saving}
                                >
                                    {saving
                                        ? 'Saving...'
                                        : editingId !== null
                                            ? 'Update Fruit'
                                            : 'Save Fruit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Fruits;
