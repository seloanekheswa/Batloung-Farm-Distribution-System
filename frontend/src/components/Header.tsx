
import { Bell, Search } from 'lucide-react';

interface HeaderProps {
    pageTitle: string;
}

function Header({ pageTitle }: HeaderProps) {
    return (
        <header className="dashboard-header">
            <div className="header-title">
                <h1>{pageTitle}</h1>
                <p>Welcome back! Manage your farm distribution operations.</p>
            </div>

            <div className="header-actions">
                <div className="header-search">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search..."
                        aria-label="Search"
                    />
                </div>

                <button className="notification-button" aria-label="Notifications">
                    <Bell size={20} />
                    <span className="notification-dot"></span>
                </button>

                <div className="header-profile">
                    <div className="profile-avatar">A</div>
                    <div>
                        <strong>Administrator</strong>
                        <span>Admin</span>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
