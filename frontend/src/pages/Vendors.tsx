
import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Edit, Trash2, X, Users } from 'lucide-react';
import api from '../services/api';

interface Vendor {
    vendor_id: number;
    vendor_name: string;
    phone_number: string;
    location: string;
    registration_date: string;
}

const emptyForm = {
    vendor_name: '',
    phone_number: '',
    location: '',
    registration_date: new Date().toISOString().split('T')[0]
};

function Vendors() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const loadVendors = async () => {
        try {
            setLoading(true);
            const response = await api.get('/vendors');

            const records = Array.isArray(response.data)
                ? response.data
                : response.data?.data || [];

            setVendors(records);
            setError('');
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                'Unable to load vendors. Check that the backend is running.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVendors();
    }, []);

    const filteredVendors = useMemo(() => {
        return vendors.filter((vendor) => {
            const searchText = search.toLowerCase();

            return (
                vendor.vendor_name.toLowerCase().includes(searchText) ||
                vendor.phone_number.toLowerCase().includes(searchText)
            );
        });
    }, [vendors, search]);

    const openAddForm = () => {
        setEditingId(null);
        setForm(emptyForm);
        setMessage('');
        setError('');
        setShowForm(true);
    };

    const openEditForm = (vendor: Vendor) => {
        setEditingId(vendor.vendor_id);

        setForm({
            vendor_name: vendor.vendor_name,
            phone_number: vendor.phone_number,
            location: vendor.location,
            registration_date: vendor.registration_date
                ? vendor.registration_date.substring(0, 10)
                : ''
        });

        setMessage('');
        setError('');
        setShowForm(true);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>
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
                await api.put(`/vendors/${editingId}`, form);
                setMessage('Vendor updated successfully.');
            } else {
                await api.post('/vendors', form);
                setMessage('Vendor registered successfully.');
            }

            setShowForm(false);
            setForm(emptyForm);
            setEditingId(null);
            await loadVendors();
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                'Unable to save vendor information.'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (vendor: Vendor) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${vendor.vendor_name}?`
        );

        if (!confirmed) return;

        try {
            setError('');
            setMessage('');

            await api.delete(`/vendors/${vendor.vendor_id}`);

            setMessage('Vendor deleted successfully.');
            await loadVendors();
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                'Unable to delete vendor. The vendor may have linked sales records.'
            );
        }
    };

    const formatDate = (date: string) => {
        if (!date) return 'N/A';

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) return date;

        return parsedDate.toLocaleDateString();
    };

    return (
        <div className="management-page">
            <div className="management-heading">
                <div>
                    <h2>Vendor Management</h2>
                    <p>Register and manage the street vendors who buy from your farm.</p>
                </div>

                <button className="primary-button" onClick={openAddForm}>
                    <Plus size={18} />
                    Register Vendor
                </button>
            </div>

            <div className="management-stats">
                <div className="management-stat-card">
                    <div className="management-stat-icon">
                        <Users size={23} />
                    </div>
                    <div>
                        <span>Registered Vendors</span>
                        <h3>{vendors.length}</h3>
                    </div>
                </div>
            </div>

            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}

            <div className="management-table-card">
                <div className="table-toolbar">
                    <div>
                        <h3>Registered Vendors</h3>
                        <p>View and manage vendor contact information.</p>
                    </div>

                    <div className="table-filters">
                        <div className="management-search">
                            <Search size={17} />
                            <input
                                type="text"
                                placeholder="Search name or phone..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <p className="empty-message">Loading vendors...</p>
                ) : filteredVendors.length === 0 ? (
                    <p className="empty-message">No vendors found.</p>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Vendor Name</th>
                                    <th>Phone Number</th>
                                    <th>Location</th>
                                    <th>Registration Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredVendors.map((vendor) => (
                                    <tr key={vendor.vendor_id}>
                                        <td><strong>{vendor.vendor_name}</strong></td>
                                        <td>{vendor.phone_number}</td>
                                        <td>{vendor.location}</td>
                                        <td>{formatDate(vendor.registration_date)}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="edit-button"
                                                    title="Edit vendor"
                                                    onClick={() => openEditForm(vendor)}
                                                >
                                                    <Edit size={16} />
                                                </button>

                                                <button
                                                    className="delete-button"
                                                    title="Delete vendor"
                                                    onClick={() => handleDelete(vendor)}
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
                    Showing {filteredVendors.length} of {vendors.length} vendors
                </div>
            </div>

            {showForm && (
                <div className="modal-overlay">
                    <div className="management-modal">
                        <div className="modal-header">
                            <div>
                                <h3>
                                    {editingId !== null ? 'Edit Vendor' : 'Register New Vendor'}
                                </h3>
                                <p>Enter the vendor's registration information.</p>
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
                                <div className="form-group">
                                    <label>Vendor Name</label>
                                    <input
                                        name="vendor_name"
                                        value={form.vendor_name}
                                        onChange={handleInputChange}
                                        placeholder="Enter vendor name"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input
                                        name="phone_number"
                                        value={form.phone_number}
                                        onChange={handleInputChange}
                                        placeholder="Enter phone number"
                                        required
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Business Location</label>
                                    <input
                                        name="location"
                                        value={form.location}
                                        onChange={handleInputChange}
                                        placeholder="Enter vendor location in Maseru"
                                        required
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Registration Date</label>
                                    <input
                                        type="date"
                                        name="registration_date"
                                        value={form.registration_date}
                                        onChange={handleInputChange}
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
                                            ? 'Update Vendor'
                                            : 'Register Vendor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Vendors;
