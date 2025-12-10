import Section from "@/components/Section"

export default function Rules() {
    return (
        <Section title="reglas del servidor">
            <p style={{ marginBottom: "2rem" }}>Estas son las reglas a seguir en el servidor de Minecraft.</p>

            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <li style={{ background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <h3 style={{ color: "var(--accent)", marginBottom: "0.5rem" }}>1. PVP Permitido (Con Consentimiento)</h3>
                        <p style={{ color: "var(--muted)" }}>Estará permitido el PVP mientras sea acordado entre 2 o más jugadores. No abusen de un jugador que no quiera PVP.</p>
                    </li>
                    <li style={{ background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <h3 style={{ color: "var(--accent)", marginBottom: "0.5rem" }}>2. No Robar ni Griefing</h3>
                        <p style={{ color: "var(--muted)" }}>Está prohibido robar a los demás. Pueden tradear o ayudar a sus compañeros, pero no saquear sus cosas. Destruir propiedades o matar mascotas ajenas será castigado con <strong>permaban</strong>. Contamos con Core Protect para revisar el historial de interacciones.</p>
                    </li>
                    <li style={{ background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <h3 style={{ color: "var(--accent)", marginBottom: "0.5rem" }}>3. Bases en Aldeas</h3>
                        <p style={{ color: "var(--muted)" }}>Si estableces tu base en una aldea, deja un letrero o señalización VISIBLE (como una muralla) para que otros jugadores sepan que está ocupada y no la saqueen ni lastimen a los aldeanos.</p>
                    </li>
                    <li style={{ background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <h3 style={{ color: "var(--accent)", marginBottom: "0.5rem" }}>4. Granjas Automatizadas</h3>
                        <p style={{ color: "var(--muted)" }}>No está permitido hacer construcciones 100% automatizadas. Las granjas que usen ALDEANOS están rotundamente prohibidas (incluye granjas de hierro y de producción de aldeanos).<br /><br /><strong>Excepción:</strong> Construcciones semi-automáticas que requieran activación manual (botón, palanca, etc.).</p>
                    </li>
                    <li style={{ background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <h3 style={{ color: "var(--accent)", marginBottom: "0.5rem" }}>5. No Mega Construcciones</h3>
                        <p style={{ color: "var(--muted)" }}>No se permiten castillos gigantes que abarquen grandes cantidades de CHUNKS. Pueden construir aldeas y estructuras grandes, siempre que una sola construcción no abarque un rango excesivo.</p>
                    </li>
                    <li style={{ background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <h3 style={{ color: "var(--accent)", marginBottom: "0.5rem" }}>6. Limpieza del Bioma</h3>
                        <p style={{ color: "var(--muted)" }}>Deben deshacer las construcciones temporales que contrasten con el bioma (pilares de tierra, cobblestone, puentes temporales, etc.).</p>
                    </li>
                    <li style={{ background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <h3 style={{ color: "var(--accent)", marginBottom: "0.5rem" }}>7. Estética</h3>
                        <p style={{ color: "var(--muted)" }}>Las construcciones deben ser estéticamente atractivas. No se pide ser un experto, pero evita hacer cosas "a medias" o sin esfuerzo.</p>
                    </li>
                    <li style={{ background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <h3 style={{ color: "var(--accent)", marginBottom: "0.5rem" }}>8. Streaming y Comunidad</h3>
                        <p style={{ color: "var(--muted)" }}>Son libres de hacer stream dando crédito a <strong>Killu</strong> y <strong>Neroferno</strong>. Pueden invitar seguidores y amigos siempre que respeten las reglas y se unan al Discord.</p>
                    </li>
                    <li style={{ background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <h3 style={{ color: "var(--accent)", marginBottom: "0.5rem" }}>9. Reportes y Seguridad</h3>
                        <p style={{ color: "var(--muted)" }}>Usen <code>/co inspect</code> para revisar interacciones. Para reclamos por robo o destrucción, contactar a <strong>Killu</strong>. <br /><br /><strong>Importante:</strong> No tomen la justicia en sus manos. Notifiquen a los administradores en lugar de imponer sanciones no autorizadas.</p>
                    </li>
                </ul>
            </div>
        </Section>
    )
}
