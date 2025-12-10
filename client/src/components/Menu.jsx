import { useState } from 'react'
import { FaBars } from 'react-icons/fa'
import { Link } from 'react-router-dom'

export default function Menu() {
    const [isOpen, setIsOpen] = useState(false)

    const closeMenu = () => setIsOpen(false)

    return (
        <div className="menu-container">
            <button
                className="menu-trigger"
                onClick={() => setIsOpen(!isOpen)}
            >
                <FaBars className="menu-icon" />
                <span className="menu-text">MENU</span>
            </button>

            <div className={`menu-dropdown ${isOpen ? 'active' : ''}`}>
                <Link to="/account" className="menu-item" onClick={closeMenu}>Cuenta</Link>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }}></div>

                <Link to="/#rules" className="menu-item" onClick={closeMenu}>Reglas</Link>
                <Link to="/#donors" className="menu-item" onClick={closeMenu}>Donadores</Link>

                <div style={{ padding: '0.5rem 1rem 0.2rem', fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '0.5rem' }}>
                    Sobre el Servidor
                </div>
                <Link to="/#news" className="menu-item" onClick={closeMenu}>Noticias</Link>
                <Link to="/#events" className="menu-item" onClick={closeMenu}>Eventos</Link>
                <Link to="/#stories" className="menu-item" onClick={closeMenu}>Historias</Link>
            </div>
        </div>
    )
}
