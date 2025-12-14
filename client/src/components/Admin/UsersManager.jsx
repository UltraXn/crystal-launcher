import { useState } from 'react'
import { FaSearch } from 'react-icons/fa'
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/services/supabaseClient"

const API_URL = import.meta.env.VITE_API_URL

export default function UsersManager() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [emailQuery, setEmailQuery] = useState('')
    const [hasSearched, setHasSearched] = useState(false)

    const { user, logout } = useAuth() // Get current user and logout function

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!emailQuery.trim()) return

        try {
            setLoading(true)
            setHasSearched(true)
            // Backend should handle query param ?email=...
            const res = await fetch(`${API_URL}/users?email=${encodeURIComponent(emailQuery)}`)
            if(res.ok) {
                const data = await res.json()
                setUsers(data)
            }
        } catch (error) {
            console.error("Error fetching users", error)
        } finally {
            setLoading(false)
        }
    }

    const handleRoleChange = async (userId, newRole) => {
        if(!confirm(`¿Cambiar rol a ${newRole}?`)) return
        try {
            const res = await fetch(`${API_URL}/users/${userId}/role`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            })
            if(res.ok) {
                // Refresh list locally
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
                
                // Si el usuario se cambia el rol a SÍ MISMO, cerramos sesión para forzar la actualización de permisos
                // Esto soluciona que el token se quede con el rol antiguo
                if (user && user.id === userId) {
                    await logout()
                    window.location.href = '/login'
                }
            } else {
                alert("Error actualizando rol")
            }
        } catch (error) {
            console.error(error)
        }
    }

    const canManageRoles = ['neroferno', 'killu'].includes(user?.user_metadata?.role)

    return (
        <div className="admin-card">
            <h3 style={{ marginBottom: '1rem' }}>Gestión de Usuarios</h3>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <input 
                    type="text" 
                    placeholder="Buscar usuario por correo (ej: steve@mail.com)" 
                    className="admin-input" // Assume this class exists or is basic input style
                    value={emailQuery}
                    onChange={(e) => setEmailQuery(e.target.value)}
                    style={{ 
                        flex: 1, 
                        padding: '0.8rem', 
                        borderRadius: '6px', 
                        border: '1px solid #444', 
                        background: 'rgba(0,0,0,0.2)', 
                        color: '#fff' 
                    }}
                />
                <button type="submit" className="btn-action close" style={{ background: 'var(--accent)', color: '#000' }}>
                    <FaSearch /> Buscar
                </button>
            </form>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Usuario/Email</th>
                            <th>ID</th>
                            <th>Rol Actual</th>
                            {canManageRoles && <th>Cambiar Rol</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td>
                                    <div style={{fontWeight:'bold', color:'#fff'}}>{u.email}</div>
                                    <div style={{fontSize:'0.8rem', color:'#666'}}>Registrado: {new Date(u.created_at).toLocaleDateString()}</div>
                                </td>
                                <td style={{fontFamily:'monospace', fontSize:'0.8rem', color:'#555'}}>{u.id.substring(0,8)}...</td>
                                <td>
                                    <RoleBadge role={u.role || 'user'} />
                                </td>
                                {canManageRoles && (
                                    <td>
                                        <select 
                                            className="admin-input" 
                                            style={{padding:'0.3rem', width:'auto', background:'#222', color:'#fff', border:'1px solid #444', borderRadius:'4px'}}
                                            value={u.role || 'user'}
                                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                        >
                                            <option value="user">Usuario</option>
                                            <option value="donor">Donador</option>
                                            <option value="founder">Fundador</option>
                                            <option value="admin">Admin</option>
                                            <option value="helper">Helper</option>
                                            <option value="neroferno">Neroferno</option>
                                            <option value="killu">Killu</option>
                                        </select>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && hasSearched && !loading && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No se encontraron usuarios con ese correo.</div>
                )}
                {users.length === 0 && !hasSearched && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Usa el buscador para encontrar usuarios.</div>
                )}
                {loading && <div style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>Buscando...</div>}
            </div>
        </div>
    )
}

function RoleBadge({ role }) {
    const roles = {
        neroferno: { label: 'Neroferno', img: '/ranks/rank-neroferno.png' },
        killu: { label: 'Killu', img: '/ranks/rank-killu.png' },
        founder: { label: 'Fundador', img: '/ranks/rank-fundador.png' },
        admin: { label: 'Admin', img: '/ranks/admin.png' },
        helper: { label: 'Helper', img: '/ranks/helper.png' },
        donor: { label: 'Donador', img: '/ranks/rank-donador.png' },
        user: { label: 'Usuario', img: '/ranks/user.png' }
    }
    const current = roles[role] || roles.user

    if(current.img) {
        return <img src={current.img} alt={role} title={current.label} />
    }

    return (
        <span style={{
            background: current.color || '#333',
            color: '#fff',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            textTransform: 'uppercase'
        }}>
            {current.icon} {current.label}
        </span>
    )
}
