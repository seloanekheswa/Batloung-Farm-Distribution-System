
import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Suppliers from './pages/Suppliers';
import Fruits from './pages/Fruits';
import Stock from './pages/Stock';
import Vendors from './pages/Vendors';
import Purchases from './pages/Purchases';
import Sales from './pages/Sales';
import Reports from './pages/Reports';
import './App.css';

function App() {
    const [activePage, setActivePage] = useState('Dashboard');

    const navigationItems = [
        'Dashboard',
        'Suppliers',
        'Fruits',
        'Stock',
        'Vendors',
        'Purchases',
        'Sales',
        'Reports'
    ];

    const renderPage = () => {
        switch (activePage) {
            case 'Dashboard':
                return <Dashboard />;
            case 'Suppliers':
                return <Suppliers />;
            case 'Fruits':
                return <Fruits />;
            case 'Stock':
                return <Stock />;
            case 'Vendors':
                return <Vendors />;
            case 'Purchases':
                return <Purchases />;
            case 'Sales':
                return <Sales />;
            case 'Reports':
                return <Reports />;
            default:
                return (
                    <div className="coming-soon">
                        <h2>{activePage}</h2>
                        <p>
                            The {activePage.toLowerCase()} section
                            will be developed next.
                        </p>
                    </div>
                );
        }
    };

    return (
        <div className="app-container">

            <header className="top-navigation">
                <div className="brand">
                    <div className="brand-icon">BF</div>
                    <div className="brand-text">
                        <h2>BATLOUNG FARM</h2>
                        <span>DISTRIBUTION SYSTEM</span>
                    </div>
                </div>

                <nav className="navigation-links">
                    {navigationItems.map((item) => (
                        <button
                            key={item}
                            className={`nav-link ${
                                activePage === item ? 'active' : ''
                            }`}
                            onClick={() => setActivePage(item)}
                        >
                            {item}
                        </button>
                    ))}
                </nav>
            </header>

            <main className="main-content">
                

                {renderPage()}
            </main>

        </div>
    );
}

export default App;
