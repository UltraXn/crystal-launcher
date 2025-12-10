import { useState } from "react"
import { Link } from "react-router-dom"
import { FaCopy, FaCheck } from "react-icons/fa"
import HeroBackgroundCarousel from "./HeroBackgroundCarousel"

export default function Hero() {
    const [copied, setCopied] = useState(false)
    const ip = "MC.CrystaltidesSMP.net"

    const handleCopy = () => {
        navigator.clipboard.writeText(ip)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }



    return (
        <section className="hero">
            <HeroBackgroundCarousel />
            <div className="hero-content animate-pop-up">
                <h1>Bienvenido a <span>Crystal Tides SMP</span></h1>
                <p>
                    Sumérgete en un mundo de aventuras, comunidad y creatividad sin límites.
                    ¡Únete a nosotros! Te esperamos ✨
                </p>

                <div className="server-connect-container">
                    <h3>Conectate al Servidor</h3>
                    <div className="server-ip-box">
                        <div className="server-ip-info">
                            <span className="server-edition">Java Edition</span>
                            <span className="server-ip">{ip}</span>
                        </div>
                        <button onClick={handleCopy} className="btn-copy-box">
                            {copied ? <FaCheck /> : <FaCopy />}
                            {copied ? "¡Copiado!" : "Copiar IP"}
                        </button>
                    </div>
                    <a href="#donors" className="btn-donate-hero">Donar</a>
                </div>
            </div>
        </section>
    )
}
