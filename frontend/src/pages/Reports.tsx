
import { useEffect, useState } from 'react';
import { RefreshCw, FileBarChart } from 'lucide-react';
import api from '../services/api';

type ReportData = Record<string, unknown>;

const reportSections = [
  { key: 'topFruits', title: 'Top Five Fruits', endpoint: '/reports/top-fruits' },
  { key: 'revenue', title: 'Sales Revenue', endpoint: '/reports/sales-revenue' },
  { key: 'topVendor', title: 'Top Vendor', endpoint: '/reports/top-vendor' },
  { key: 'stock', title: 'Stock by Fruit and Packaging', endpoint: '/reports/stock' },
  { key: 'balances', title: 'Outstanding Vendor Balances', endpoint: '/reports/outstanding-balances' },
];

function extractRows(response: any): ReportData[] {
  let data = response?.data?.data ?? response?.data ?? [];

  if (!Array.isArray(data)) {
    data = [data];
  }

  return data.filter(
    (item: unknown) => item !== null && typeof item === 'object'
  ) as ReportData[];
}

function Reports() {
  const [reports, setReports] = useState<Record<string, ReportData[]>>({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  
const loadReports = async () => {
  setLoading(true);
  setError('');

  try {
    const requests = reportSections.map((section) => {
      // Only request revenue when both dates are selected.
      if (section.key === 'revenue') {
        if (!startDate || !endDate) {
          return Promise.resolve(null);
        }

        return api.get(section.endpoint, {
          params: { startDate, endDate },
        });
      }

      return api.get(section.endpoint);
    });

    const responses = await Promise.all(requests);
    const updatedReports: Record<string, ReportData[]> = {};

    reportSections.forEach((section, index) => {
      if (responses[index] === null) {
        updatedReports[section.key] = [];
      } else {
        updatedReports[section.key] = extractRows(responses[index]);
      }
    });

    setReports(updatedReports);
  } catch (err: any) {
    setError(
      err.response?.data?.message ||
      'Unable to load reports. Please check the backend.'
    );
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    loadReports();
  }, []);

  const formatValue = (value: unknown) => {
    if (value === null || value === undefined) return '-';

    if (typeof value === 'number') {
      return value.toLocaleString('en-ZA');
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  };

  const renderReport = (key: string) => {
    const rows = reports[key] || [];

    if (rows.length === 0) {
      return <p className="empty-message">No records available.</p>;
    }

    const columns = Object.keys(rows[0]);

    return (
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>
                  {column.replaceAll('_', ' ')}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column}>
                    {formatValue(row[column])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Reports</h1>
          <p>View business performance, sales and stock reports.</p>
        </div>

        <button
          className="primary-button"
          onClick={loadReports}
          disabled={loading}
        >
          <RefreshCw size={16} />
          {loading ? 'Loading...' : 'Refresh Reports'}
        </button>
      </div>

      <div className="form-card report-filter">
        <h3>Filter Sales Revenue by Date</h3>

        <div className="report-date-fields">
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <button
            className="primary-button"
            onClick={loadReports}
            disabled={loading || (!!startDate && !!endDate && startDate > endDate)}
          >
            Apply Dates
          </button>
        </div>

        {startDate && endDate && startDate > endDate && (
          <p className="error-message">
            End date must be on or after the start date.
          </p>
        )}
      </div>

      {error && <p className="error-message">{error}</p>}

      {loading && <p>Loading reports...</p>}

      {!loading && !error && (
        <div className="reports-grid">
          {reportSections.map((section) => (
            <section className="report-card" key={section.key}>
              <div className="report-card-heading">
                <FileBarChart size={20} />
                <h3>{section.title}</h3>
              </div>

              {renderReport(section.key)}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

export default Reports;
