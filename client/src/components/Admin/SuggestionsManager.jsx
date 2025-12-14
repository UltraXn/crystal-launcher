import { useState, useEffect } from 'react'
import { FaTrash, FaCheck, FaSpinner, FaInbox, FaFilter } from 'react-icons/fa'

const API_URL = import.meta.env.VITE_API_URL

export default function SuggestionsManager() {
    const [suggestions, setSuggestions] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchSuggestions = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/suggestions`)
            if(res.ok) {
                const data = await res.json()
                setSuggestions(data)
            }
        } catch(err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSuggestions()
    }, [])

    const handleDelete = async (id) => {
        if(!window.confirm("¿Estás seguro de que quieres eliminar esta sugerencia?")) return
        try {
            await fetch(`${API_URL}/suggestions/${id}`, { method: 'DELETE' })
            fetchSuggestions()
        } catch(err) { console.error(err) }
    }

    return (
        <div className="admin-card">
            <h3 style={{ marginBottom: '1.5rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <FaInbox /> Buzón de Sugerencias
            </h3>
            
            {loading ? (
                <div style={{padding:'2rem', textAlign:'center'}}><FaSpinner className="spin" size={24}/> Cargando...</div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th style={{width:'120px'}}>Fecha</th>
                                <th style={{width:'100px'}}>Tipo</th>
                                <th style={{width:'150px'}}>Usuario</th>
                                <th>Mensaje</th>
                                <th style={{width:'80px'}}>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suggestions.map(s => (
                                <tr key={s.id}>
                                    <td style={{fontSize:'0.85rem', color:'#aaa'}}>{new Date(s.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <span style={{
                                            padding: '2px 8px', borderRadius:'4px', fontSize:'0.75rem', fontWeight:'bold',
                                            background: s.type === 'Bug' ? '#ef4444' : s.type === 'Mod' ? '#3b82f6' : '#22c55e',
                                            color: '#000'
                                        }}>
                                            {s.type}
                                        </span>
                                    </td>
                                    <td style={{fontWeight:'bold', color: s.nickname==='Anónimo'?'#666':'#fff'}}>{s.nickname}</td>
                                    <td style={{maxWidth:'300px', whiteSpace:'pre-wrap'}}>{s.message}</td>
                                    <td>
                                        <button onClick={() => handleDelete(s.id)} className="btn-icon delete" title="Eliminar"><FaTrash /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {suggestions.length === 0 && <p style={{textAlign:'center', padding:'2rem', color:'#666'}}>No hay sugerencias recibidas.</p>}
                </div>
            )}
        </div>
    )
}
