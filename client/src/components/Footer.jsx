import { FaArrowUp } from "react-icons/fa"
import { Link } from "react-router-dom"

export default function Footer() {
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        })
    }

    return (
        <footer className="site-footer">
            <div className="footer-content">
                <div className="footer-section brand-section">
                    <Link to="/" onClick={scrollToTop} style={{ textDecoration: 'none' }}>
                        <h3><img src="/logo.webp" alt="Crystal Tides SMP Logo" className="footer-logo" width="50" height="50" />CrystalTides SMP</h3>
                    </Link>
                    <p className="slogan">¡La mejor opción es diversión en Crystal Tides SMP!</p>
                </div>

                <div className="footer-section">
                    <h3>SERVIDOR</h3>
                    <ul>
                        <li><a href="#rules">Reglas</a></li>
                        <li><Link to="/map">Mapa Online</Link></li>
                        <li><a href="#suggestions">Sugerencias</a></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3>COMUNIDAD</h3>
                    <ul>
                        <li><a href="#news">Noticias</a></li>
                        <li><a href="#contests">Eventos</a></li>
                        <li><a href="#stories">Historias</a></li>
                        <li><a href="#donors" style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Donar / VIP</a></li>
                    </ul>
                </div>

                <button className="scroll-top-btn" onClick={scrollToTop} aria-label="Volver arriba">
                    <FaArrowUp />
                </button>
            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Crystal Tides SMP. Todos los derechos reservados.</p>
            </div>
        </footer>
    )
}
