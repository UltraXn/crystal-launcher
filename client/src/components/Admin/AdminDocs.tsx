import { useState } from 'react';
import { FaBook, FaBullhorn, FaUserShield, FaClipboardList, FaTerminal, FaGamepad, FaChevronDown } from 'react-icons/fa';
import MarkdownRenderer from '../UI/MarkdownRenderer';

const DOCS_DATA = [
    // ... (Data remains same)
    {
        id: 'intro',
        title: 'Introducción',
        icon: FaBook,
        content: `
# Panel de Administración CrystalTides

Bienvenido al centro de control. Desde aquí puedes gestionar casi todos los aspectos del servidor y la comunidad.

⚠️ **Advertencia**: Las acciones realizadas aquí tienen impacto directo en el juego y la base de datos en vivo. Úsalas con responsabilidad.
        `
    },
    {
        id: 'staff-hub',
        title: 'Staff Hub',
        icon: FaClipboardList,
        content: `
# 🛡️ Staff Hub

Herramientas para la organización interna del equipo.

### 📋 Kanban Board (Tareas)
Un tablero de gestión de proyectos simple.
- **To Do**: Tareas pendientes.
- **In Progress**: En lo que se está trabajando actualmente.
- **Done**: Tareas finalizadas.

### 📝 Notas de Staff
Un muro de post-its compartidos. Úsalo para dejar recordatorios rápidos.
        `
    },
    {
        id: 'moderation',
        title: 'Moderación & Usuarios',
        icon: FaUserShield,
        content: `
# 👮 Gestión de Usuarios

### Users Manager
Lista completa de usuarios registrados.
- **Roles**: Asignar roles web (Admin, Mod).
- **Ban**: Bloquear acceso a la web.

### Tickets System
Centro de soporte. Prioriza y responde tickets de usuarios.
        `
    },
    {
        id: 'console',
        title: 'Consola & Comandos',
        icon: FaTerminal,
        content: `
# 💻 Consola Remota (Secure Bridge)

Ejecuta comandos en el servidor de Minecraft de forma segura.

### Comandos Comunes
- \`kick <player>\`: Expulsar.
- \`ban <player>\`: Banear.
- \`broadcast <msg>\`: Anuncio global.
        `
    },
    {
        id: 'content',
        title: 'Gestión de Contenido',
        icon: FaBullhorn,
        content: `
# 📢 Contenido Web

### Noticias
Editor de posts tipo blog con Markdown.

### Broadcasts
Controla la alerta superior de la web.

### Encuestas
Crea votaciones para la comunidad.
        `
    },
    {
        id: 'gamification',
        title: 'Gamificación',
        icon: FaGamepad,
        content: `
# 🎮 Gacha & Stats

### Configuración Gacha
- **Cooldown**: 24 horas por usuario.
- **Premios**: Entrega automática in-game.
        `
    }
];

export default function AdminDocs() {
    const [activeTab, setActiveTab] = useState('intro');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const activeDoc = DOCS_DATA.find(d => d.id === activeTab) || DOCS_DATA[0];

    return (
        <div className="admin-docs-container">
            <style>{`
                .admin-docs-container {
                    display: flex;
                    gap: 2rem;
                    height: calc(100vh - 150px);
                    color: #fff;
                    position: relative;
                }
                .docs-sidebar {
                    width: 250px;
                    flex-shrink: 0;
                    border-right: 1px solid rgba(255,255,255,0.1);
                    overflow-y: auto;
                    padding-bottom: 2rem;
                }
                .docs-content {
                    flex: 1;
                    overflow-y: auto;
                    padding-right: 2rem;
                }
                .docs-card {
                    background: rgba(0,0,0,0.2);
                    padding: 2rem;
                    border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .sidebar-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    padding: 0.8rem 1rem;
                    background: transparent;
                    color: #ccc;
                    border: none;
                    border-radius: 0 8px 8px 0;
                    cursor: pointer;
                    text-align: left;
                    width: 100%;
                    transition: all 0.2s;
                    font-size: 0.95rem;
                }
                .sidebar-btn:hover {
                    background: rgba(255,255,255,0.05);
                    color: #fff;
                }
                .sidebar-btn.active {
                    background: var(--accent);
                    color: #000;
                    font-weight: bold;
                }

                /* Mobile Dropdown Styles */
                .mobile-dropdown-container {
                    display: none;
                    position: relative;
                    margin-bottom: 1rem;
                    z-index: 100;
                }
                .mobile-dropdown-btn {
                    width: 100%;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #fff;
                    padding: 1rem;
                    border-radius: 8px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-weight: bold;
                    cursor: pointer;
                }
                .mobile-dropdown-list {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    width: 100%;
                    background: #1a1a1a;
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                    margin-top: 0.5rem;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                    overflow: hidden;
                    animation: fadeIn 0.2s ease;
                }
                .mobile-dropdown-item {
                    padding: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    color: #ccc;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    cursor: pointer;
                }
                .mobile-dropdown-item:last-child { border-bottom: none; }
                .mobile-dropdown-item.active { background: var(--accent); color: #000; }

                /* MOBILE RESPONSIVE MEDIA QUERY */
                @media (max-width: 768px) {
                    .admin-docs-container {
                        flex-direction: column;
                        height: auto;
                        gap: 1rem;
                        overflow: visible; /* Allow absolute dropdown to show */
                    }
                    .docs-sidebar {
                        display: none; /* Hide Desktop Sidebar */
                    }
                    .mobile-dropdown-container {
                        display: block; /* Show Mobile Dropdown */
                    }
                    .docs-content {
                        padding-right: 0;
                        overflow-y: visible;
                    }
                    .docs-card {
                        padding: 1.5rem;
                    }
                    h2 { font-size: 1.5rem !important; }
                }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
            
            {/* Desktop Sidebar */}
            <div className="docs-sidebar">
                <h3 style={{ padding: '0 1rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--muted)' }}>Índice</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem 0' }}>
                    {DOCS_DATA.map(doc => (
                        <button
                            key={doc.id}
                            onClick={() => setActiveTab(doc.id)}
                            className={`sidebar-btn ${activeTab === doc.id ? 'active' : ''}`}
                        >
                            <doc.icon />
                            {doc.title}
                        </button>
                    ))}
                </div>
            </div>

            {/* Mobile Dropdown */}
            <div className="mobile-dropdown-container">
                <button 
                    className="mobile-dropdown-btn"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <activeDoc.icon color="var(--accent)" /> {activeDoc.title}
                    </span>
                    <FaChevronDown style={{ transform: mobileMenuOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                </button>
                
                {mobileMenuOpen && (
                    <div className="mobile-dropdown-list">
                        {DOCS_DATA.map(doc => (
                            <div 
                                key={doc.id}
                                className={`mobile-dropdown-item ${activeTab === doc.id ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveTab(doc.id);
                                    setMobileMenuOpen(false);
                                }}
                            >
                                <doc.icon /> {doc.title}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Área de Contenido */}
            <div className="docs-content">
                <div className="docs-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--accent)', paddingBottom: '1rem' }}>
                        <activeDoc.icon size={30} color="var(--accent)" />
                        <h2 style={{ margin: 0, fontSize: '2rem' }}>{activeDoc.title}</h2>
                    </div>
                    
                    <div className="markdown-body" style={{ color: '#ddd', lineHeight: 1.6 }}>
                        <MarkdownRenderer content={activeDoc.content} />
                    </div>
                </div>
            </div>
        </div>
    );
}
