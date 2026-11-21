
import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Edit, Trash2, X, Truck } from 'lucide-react';
import api from '../services/api';

interface Supplier {
    supplier_id: number;
    business_name: string;
    contact_person: string;
    phone: string;
    province: string;
    address: string;
}

const provinces = [
    'Gauteng',
    'Free State',
    'KwaZulu-Natal',
    'Western Cape',
    'Eastern Cape',
    'Limpopo',
    'Mpumalanga',
    'North West'
];

const emptyForm = {
    business_name: '',
    contact_person: '',
    phone: '',
    province: '',
    address: ''
};

function Suppliers() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [provinceFilter, setProvinceFilter] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const loadSuppliers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/suppliers');

            const records = Array.isArray(response.data)
                ? response.data
                : response.data?.data || [];

            setSuppliers(records);
            setError('');
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                'Unable to load suppliers. Check that the backend is running.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSuppliers();
    }, []);

    const filteredSuppliers = useMemo(() => {
        return suppliers.filter((supplier) => {
            const searchText = search.toLowerCase();

            const matchesSearch =
                supplier.business_name.toLowerCase().includes(searchText) ||
                supplier.contact_person.toLowerCase().includes(searchText) ||
                supplier.phone.toLowerCase().includes(searchText);

            const matchesProvince =
                provinceFilter === '' ||
                supplier.province === provinceFilter;

            return matchesSearch && matchesProvince;
        });
    }, [suppliers, search, provinceFilter]);

    const openAddForm = () => {
        setEditingId(null);
        setForm(emptyForm);
        setMessage('');
        setShowForm(true);
    };

    const openEditForm = (supplier: Supplier) => {
        setEditingId(supplier.supplier_id);

        setForm({
            business_name: supplier.business_name,
            contact_person: supplier.contact_person,
            phone: supplier.phone,
            province: supplier.province,
            address: supplier.address
        });

        setMessage('');
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

            if (editingId !== null) {
                await api.put(`/suppliers/${editingId}`, form);
                setMessage('Supplier updated successfully.');
            } else {
                await api.post('/suppliers', form);
                setMessage('Supplier registered successfully.');
            }

            setShowForm(false);
            setForm(emptyForm);
            setEditingId(null);
            await loadSuppliers();
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                'Unable to save supplier information.'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (supplier: Supplier) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${supplier.business_name}?`
        );

        if (!confirmed) return;

        try {
            setError('');
            setMessage('');

            await api.delete(`/suppliers/${supplier.supplier_id}`);

            setMessage('Supplier deleted successfully.');
            await loadSuppliers();
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                'Unable to delete supplier. The supplier may have linked purchase records.'
            );
        }
    };

    return (
        <div className="management-page">
            <div className="management-heading">
                <div>
                    <h2>Supplier Management</h2>
                    <p>Manage the suppliers who provide fruits to your business.</p>
                </div>

                <button className="primary-button" onClick={openAddForm}>
                    <Plus size={18} />
                    Add Supplier
                </button>
            </div>

            <div className="management-stats">
                <div className="management-stat-card">
                    <div className="management-stat-icon">
                        <Truck size={23} />
                    </div>
                    <div>
                        <span>Total Suppliers</span>
                        <h3>{suppliers.length}</h3>
                    </div>
                </div>
            </div>

            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}

            <div className="management-table-card">
                <div className="table-toolbar">
                    <div>
                        <h3>Registered Suppliers</h3>
                        <p>View and manage supplier information.</p>
                    </div>

                    <div className="table-filters">
                        <div className="management-search">
                            <Search size={17} />
                            <input
                                type="text"
                                placeholder="Search suppliers..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <select
                            value={provinceFilter}
                            onChange={(e) => setProvinceFilter(e.target.value)}
                            aria-label="Filter by province"
                        >
                            <option value="">All Provinces</option>
                            {provinces.map((province) => (
                                <option key={province} value={province}>
                                    {province}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <p className="empty-message">Loading suppliers...</p>
                ) : filteredSuppliers.length === 0 ? (
                    <p className="empty-message">No suppliers found.</p>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Business Name</th>
                                    <th>Contact Person</th>
                                    <th>Phone Number</th>
                                    <th>Province</th>
                                    <th>Address</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredSuppliers.map((supplier) => (
                                    <tr key={supplier.supplier_id}>
                                        <td><strong>{supplier.business_name}</strong></td>
                                        <td>{supplier.contact_person}</td>
                                        <td>{supplier.phone}</td>
                                        <td>{supplier.province}</td>
                                        <td>{supplier.address}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="edit-button"
                                                    title="Edit supplier"
                                                    onClick={() => openEditForm(supplier)}
                                                >
                                                    <Edit size={16} />
                                                </button>

                                                <button
                                                    className="delete-button"
                                                    title="Delete supplier"
                                                    onClick={() => handleDelete(supplier)}
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
                    Showing {filteredSuppliers.length} of {suppliers.length} suppliers
                </div>
            </div>

            {showForm && (
                <div className="modal-overlay">
                    <div className="management-modal">
                        <div className="modal-header">
                            <div>
                                <h3>
                                    {editingId !== null ? 'Edit Supplier' : 'Add New Supplier'}
                                </h3>
                                <p>Enter the supplier's information below.</p>
                            </div>

                            <button
                                className="modal-close"
                                onClick={() => setShowForm(false)}
                                type="button"
                                aria-label="Close form"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Business Name</label>
                                    <input
                                        name="business_name"
                                        value={form.business_name}
                                        onChange={handleInputChange}
                                        placeholder="Enter business name"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Contact Person</label>
                                    <input
                                        name="contact_person"
                                        value={form.contact_person}
                                        onChange={handleInputChange}
                                        placeholder="Enter contact person"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleInputChange}
                                        placeholder="Enter phone number"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Province</label>
                                    <select
                                        name="province"
                                        value={form.province}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select province</option>
                                        {provinces.map((province) => (
                                            <option key={province} value={province}>
                                                {province}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group full-width">
                                    <label>Physical Address</label>
                                    <input
                                        name="address"
                                        value={form.address}
                                        onChange={handleInputChange}
                                        placeholder="Enter physical address"
                                        required
                                    />
                                </div>
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
                                            ? 'Update Supplier'
                                            : 'Save Supplier'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Suppliers;
