
import {
    LayoutDashboard,
    Truck,
    Apple,
    Users,
    Package,
    ShoppingCart,
    Store,
    BarChart3,
    Leaf
} from 'lucide-react';

interface SidebarProps {
    activePage: string;
    setActivePage: (page: string) => void;
}

const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Suppliers', icon: Truck },
    { name: 'Fruits', icon: Apple },
    { name: 'Vendors', icon: Users },
    { name: 'Stock', icon: Package },
    { name: 'Purchases', icon: ShoppingCart },
    { name: 'Sales', icon: Store },
    { name: 'Reports', icon: BarChart3 }
];

function Sidebar({ activePage, setActivePage }: SidebarProps) {
    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="brand-icon">
                    <Leaf size={25} />
                </div>
                <div>
                    <h2>Batloung Farm</h2>
                    <span>Distribution System</span>
                </div>
            </div>

            <div className="sidebar-label">MAIN MENU</div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.name}
                            className={`nav-item ${
                                activePage === item.name ? 'active' : ''
                            }`}
                            onClick={() => setActivePage(item.name)}
                        >
                            <Icon size={19} />
                            <span>{item.name}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <div className="admin-avatar">A</div>
                <div>
                    <strong>Administrator</strong>
                    <span>System Manager</span>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
