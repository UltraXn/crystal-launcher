import Menu from "./Menu"
import { Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { FaUserCircle } from "react-icons/fa"

export default function Navbar() {
    const { user } = useAuth()

    return (
        <header className="navbar">
            <div className="navbar-brand">
                <Link to="/">
                    <img src="/logo.png" alt="Crystal Tides SMP Logo" className="navbar-logo" />
                </Link>
            </div>

            <div className="nav-links">
                <Menu />
                <div className="nav-auth">
                    {user ? (
                        <Link to="/account" className="nav-btn primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaUserCircle size={18} />
                            <span>Mi Perfil</span>
                        </Link>
                    ) : (
                        <>
                            <Link to="/login" className="nav-btn">Log In</Link>
                            <Link to="/register" className="nav-btn primary">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
