import { useState, useEffect } from "react"
import { FaMapPin, FaQuestion, FaTimes } from "react-icons/fa"
import Section from "../components/Layout/Section"
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from "framer-motion"
import { getLocations, WorldLocation } from "../services/locationService"
import Loader from "../components/UI/Loader"

export default function Stories() {
    const { t } = useTranslation()
    const [locations, setLocations] = useState<WorldLocation[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null)

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const data = await getLocations()
                setLocations(data)
            } catch (error) {
                console.error("Error loading locations:", error)
                setLocations([]) // Evitar estados de carga infinitos en caso de error
            } finally {
                setLoading(false)
            }
        }
        fetchLocations()
    }, [])

    const selectedPlace = locations.find(p => p.id === selectedPlaceId)

    return (
        <Section title={t('stories.title')}>
            <Section>
                <div className="crystal-card">
                    <p>{t('stories.intro')}</p>
                </div>

                {loading ? (
                    <div className="flex justify-center p-20">
                        <Loader />
                    </div>
                ) : (
                    <div className="places-grid">
                        {locations.map(place => (
                            <div
                                key={place.id}
                                className="place-card"
                                onClick={() => setSelectedPlaceId(place.id)}
                                style={{ cursor: "pointer" }}
                            >
                                <div className="place-image-container">
                                    {place.is_coming_soon ? (
                                        <div className="secret-placeholder">
                                            <div className="secret-overlay"></div>
                                            <FaQuestion className="secret-icon" />
                                        </div>
                                    ) : (
                                        <>
                                            <span className="place-coords-badge">
                                                <FaMapPin style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                                {place.coords}
                                            </span>
                                            <img src={place.image_url || ''} alt={place.title} className="place-image" />
                                        </>
                                    )}
                                </div>
                                <div className="place-content">
                                    <h3 className="place-title" style={place.is_coming_soon ? { color: 'var(--muted)' } : {}}>{place.title}</h3>
                                    <p className="place-desc">{place.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {!loading && locations.length === 0 && (
                    <div className="text-center p-10 opacity-30">
                        <FaQuestion size={40} className="mx-auto mb-4" />
                        <p>Aún no hay historias registradas en el servidor.</p>
                    </div>
                )}
            </Section>

            {/* MODAL / LIGHTBOX */}
            <AnimatePresence>
                {selectedPlace && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedPlaceId(null)}
                        className="modal-overlay"
                        style={{
                            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                            background: "rgba(0,0,0,0.85)", zIndex: 1000,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            padding: "2rem", backdropFilter: "blur(5px)"
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()} 
                            className="story-modal-content"
                        >
                            <button
                                onClick={() => setSelectedPlaceId(null)}
                                style={{
                                    position: "absolute", top: "20px", right: "20px",
                                    background: "rgba(0,0,0,0.5)", border: "none",
                                    color: "#fff", width: "40px", height: "40px", borderRadius: "50%",
                                    cursor: "pointer", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "1.2rem"
                                }}
                            >
                                <FaTimes />
                            </button>

                            <div style={{ height: "400px", position: "relative" }}>
                                {selectedPlace.is_coming_soon ? (
                                    <div className="secret-placeholder" style={{ height: "100%", width: "100%" }}>
                                        <FaQuestion className="secret-icon" style={{ fontSize: "8rem" }} />
                                    </div>
                                ) : (
                                    <img
                                        src={selectedPlace.image_url || ''}
                                        alt={selectedPlace.title}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                )}
                                <div style={{
                                    position: "absolute", bottom: 0, left: 0, right: 0,
                                    background: "linear-gradient(to top, #1a1a20 0%, transparent 100%)",
                                    height: "150px"
                                }}></div>
                            </div>

                            <div className="story-inner-content">
                                <div className="story-modal-header">
                                    <div className="story-modal-title-group">
                                        <h2 style={{ fontSize: "2.2rem", fontWeight: "800", marginBottom: "0.5rem", lineHeight: 1.1, textTransform: "uppercase", letterSpacing: "-1px" }}>
                                            {selectedPlace.title}
                                        </h2>
                                        <span style={{ color: "var(--accent)", fontFamily: "monospace", fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <FaMapPin />
                                            {selectedPlace.coords}
                                        </span>
                                    </div>

                                    {/* AUTORES TAGS (Lista) */}
                                    <div className="story-modal-authors-group">
                                        {selectedPlace.authors && selectedPlace.authors.map((auth, idx) => (
                                            <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.8rem", background: "rgba(255,255,255,0.05)", padding: "0.5rem 1rem", borderRadius: "50px", border: "1px solid rgba(255,255,255,0.1)" }}>
                                                <img
                                                    src={`https://minotar.net/helm/${auth.name}/100.png`}
                                                    alt={auth.name}
                                                    style={{ width: "32px", height: "32px", borderRadius: "50%" }}
                                                />
                                                <div>
                                                    <div style={{ fontSize: "0.6rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: "bold" }}>{t(`stories.roles.${auth.role}`)}</div>
                                                    <div style={{ fontWeight: "bold", color: "#fff", fontSize: "0.9rem" }}>{auth.name}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <p style={{ fontSize: "1.1rem", lineHeight: "1.8", color: "#ccc", whiteSpace: "pre-line" }}>
                                    {selectedPlace.long_description}
                                </p>
                            </div>

                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Section>
    )
}
