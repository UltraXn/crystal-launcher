import { useState, useEffect } from 'react'

import { useAuth } from "../../context/AuthContext"

import { useTranslation } from 'react-i18next'
import { supabase } from '../../services/supabaseClient'

const API_URL = import.meta.env.VITE_API_URL
import { FaSearch, FaMedal, FaTimes, FaCheck } from 'react-icons/fa'
import Loader from "../UI/Loader"

interface UserDefinition {
    id: string;
    email: string;
    username?: string;
    role?: string;
    medals?: number[]; // Assuming medal IDs are optional strings or needed? Code uses strings or numbers?
    created_at: string;
    user_metadata?: { role?: string };
}

interface MedalDefinition {
    id: number;
    name: string;
    color: string;
    icon: string;
    description: string;
}

export default function UsersManager() {
    const { t } = useTranslation()
    const [users, setUsers] = useState<UserDefinition[]>([])
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [hasSearched, setHasSearched] = useState(false)
    
    // Medal Management State
    const [availableMedals, setAvailableMedals] = useState<MedalDefinition[]>([])
    const [editingUser, setEditingUser] = useState<UserDefinition | null>(null)
    const [savingMedals, setSavingMedals] = useState(false)

    // Role Change Modal State
    const [roleChangeModal, setRoleChangeModal] = useState<{ userId: string, newRole: string } | null>(null)

    const { user } = useAuth() as { user: UserDefinition | null } 

    // Fetch available medals on load
    useEffect(() => {
        fetch(`${API_URL}/settings`)
            .then(res => {
                if(!res.ok) throw new Error("Fetch failed");
                return res.json();
            })
            .then(data => {
                if(data.medal_definitions) {
                    try {
                        const parsed = typeof data.medal_definitions === 'string' ? JSON.parse(data.medal_definitions) : data.medal_definitions;
                        setAvailableMedals(Array.isArray(parsed) ? parsed : []);
                    } catch { setAvailableMedals([]); }
                }
            })
            .catch(console.warn);
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchQuery.trim()) return

        try {
            setLoading(true)
            setHasSearched(true)
            // Changed query param to 'search' to allow backend to handle email OR username searching
            const res = await fetch(`${API_URL}/users?search=${encodeURIComponent(searchQuery)}`)
            if(res.ok) {
                const response = await res.json()
                if (Array.isArray(response)) {
                    setUsers(response)
                } else if (response.data && Array.isArray(response.data)) {
                     // Handle wrapped response { success: true, data: [...] }
                    setUsers(response.data);
                } else {
                    console.error("Unexpected users response format:", response);
                    setUsers([]);
                    if (response.error || response.message) alert(response.error || response.message);
                }
            }
        } catch (error) {
            console.error("Error fetching users", error)
        } finally {
            setLoading(false)
        }
    }

    const handleRoleChange = (userId: string, newRole: string) => {
        setRoleChangeModal({ userId, newRole });
    }

    const confirmRoleChange = async () => {
        if (!roleChangeModal) return;
        const { userId, newRole } = roleChangeModal;

        try {
            const res = await fetch(`${API_URL}/users/${userId}/role`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            })
            if(res.ok) {
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
                if (user && user.id === userId) {
                    // Refresh session instead of logout to update UI reactively
                    await supabase.auth.refreshSession();
                    window.location.reload(); // Reload to ensure all components re-render with new permissions
                }
                setRoleChangeModal(null); // Close modal
            } else {
                alert(t('admin.users.error_role'))
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleSaveMedals = async () => {
        if (!editingUser) return;
        setSavingMedals(true);
        try {
            // Merge existing metadata with new medals array
            const res = await fetch(`${API_URL}/users/${editingUser.id}/metadata`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ metadata: { medals: editingUser.medals } })
            });

            if (res.ok) {
                // Update local user list
                setUsers(users.map(u => u.id === editingUser.id ? { ...u, medals: editingUser.medals } : u));
                setEditingUser(null); // Close modal
            } else {
                alert(t('admin.users.error_medals'));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSavingMedals(false);
        }
    };

    const toggleMedal = (medalId: number) => {
        if (!editingUser) return;
        const hasMedal = editingUser.medals?.includes(medalId);
        let newMedals = editingUser.medals || [];
        
        if (hasMedal) {
            newMedals = newMedals.filter(id => id !== medalId);
        } else {
            newMedals = [...newMedals, medalId];
        }
        setEditingUser({ ...editingUser, medals: newMedals });
    };

    const canManageRoles = ['neroferno', 'killu'].includes(user?.user_metadata?.role || '');

    return (
        <div className="admin-card">
            <h3 style={{ marginBottom: '1rem' }}>{t('admin.users.title')}</h3>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <input 
                    type="text" 
                    placeholder={t('admin.users.search_placeholder', 'Buscar por Nickname...')} 
                    className="admin-input" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ flex: 1 }}
                />
                <button type="submit" className="btn-action close" style={{ background: 'var(--accent)', color: '#000' }}>
                    <FaSearch /> {t('admin.users.search_btn')}
                </button>
            </form>

            <div className="admin-table-container" style={{ overflow: 'auto' }}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>{t('admin.users.table.user')}</th>
                            <th className="th-mobile-hide">{t('admin.users.table.id')}</th>
                            <th>{t('admin.users.table.role')}</th>
                            <th className="th-mobile-hide">{t('admin.users.gamification')}</th>
                            {canManageRoles && <th>{t('admin.users.table.change_role')}</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td>
                                    <div style={{fontWeight:'bold', color:'#fff'}}>{u.username || u.email}</div>
                                    <div style={{fontSize:'0.7rem', color:'#888', marginBottom: '4px'}}>{u.email}</div>
                                    <div style={{fontSize:'0.8rem', color:'#666'}}>{t('admin.users.registered')}: {new Date(u.created_at).toLocaleDateString()}</div>
                                </td>
                                <td className="th-mobile-hide" style={{fontFamily:'monospace', fontSize:'0.8rem', color:'#555'}}>{u.id.substring(0,8)}...</td>
                                <td>
                                    <RoleBadge role={u.role || 'user'} />
                                </td>
                                <td className="th-mobile-hide">
                                    <button 
                                        onClick={() => setEditingUser(u)}
                                        style={{ 
                                            background: 'rgba(251, 191, 36, 0.1)', 
                                            border: '1px solid #fbbf24', 
                                            color: '#fbbf24',
                                            borderRadius: '4px',
                                            padding: '0.3rem 0.6rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontSize: '0.8rem'
                                        }}
                                    >
                                        <FaMedal /> {u.medals?.length || 0} {t('admin.users.medals')}
                                    </button>
                                </td>
                                {canManageRoles && (
                                    <td style={{ minWidth: '130px' }}>
                                        <select 
                                            className="admin-input" 
                                            style={{
                                                padding:'0.4rem 0.6rem', 
                                                width:'100%', 
                                                minWidth: '120px',
                                                background:'#222', 
                                                color:'#fff', 
                                                border:'1px solid #444', 
                                                borderRadius:'4px', 
                                                cursor:'pointer',
                                                fontSize: '0.85rem'
                                            }}
                                            value={u.role || 'user'}
                                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                        >
                                            <option value="neroferno">{t('account.roles.neroferno')}</option>
                                            <option value="killu">{t('account.roles.killu')}</option>
                                            <option value="founder">{t('account.roles.founder')}</option>
                                            <option value="developer">{t('account.roles.developer')}</option>
                                            <option value="admin">{t('account.roles.admin')}</option>
                                            <option value="helper">{t('account.roles.helper')}</option>
                                            <option value="donor">{t('account.roles.donor')}</option>
                                            <option value="user">{t('account.roles.user')}</option>
                                        </select>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Empty states */}
                {users.length === 0 && hasSearched && !loading && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>{t('admin.users.no_results')}</div>
                )}
                {users.length === 0 && !hasSearched && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>{t('admin.users.initial_msg')}</div>
                )}
                {loading && (
                    <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
                        <Loader style={{ height: 'auto', minHeight: '100px' }} />
                    </div>
                )}
            </div>

            {/* Medals Modal */}
            {editingUser && (
                <div className="modal-overlay">
                    <div className="admin-card" style={{ width: '500px', maxHeight: '80vh', overflowY: 'auto', border: '1px solid #444', animation: 'fadeIn 0.2s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0 }}>{t('admin.users.medals_of')} {editingUser.username || editingUser.email.split('@')[0]}</h3>
                            <button onClick={() => setEditingUser(null)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><FaTimes /></button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            {availableMedals.map(medal => {
                                const active = editingUser.medals?.includes(medal.id);
                                return (
                                    <div 
                                        key={medal.id}
                                        onClick={() => toggleMedal(medal.id)}
                                        style={{
                                            border: `1px solid ${active ? medal.color : '#333'}`,
                                            background: active ? `${medal.color}20` : 'rgba(255,255,255,0.02)',
                                            borderRadius: '6px',
                                            padding: '0.5rem',
                                            cursor: 'pointer',
                                            textAlign: 'center',
                                            opacity: active ? 1 : 0.6,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ color: medal.color, fontSize: '1.5rem', marginBottom: '0.2rem' }}>
                                            <FaMedal /> 
                                        </div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>{medal.name}</div>
                                        {active && <div style={{ color: 'var(--accent)', fontSize: '0.8rem', marginTop: '0.2rem' }}><FaCheck /></div>}
                                    </div>
                                )
                            })}
                            {availableMedals.length === 0 && <p style={{ color: '#666', gridColumn: '1/-1' }}>{t('admin.users.no_medals')}</p>}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button className="btn-secondary" onClick={() => setEditingUser(null)}>{t('admin.users.role_modal.cancel')}</button>
                            <button className="btn-primary" onClick={handleSaveMedals} disabled={savingMedals}>
                                {savingMedals ? t('admin.users.saving') : t('admin.users.save_medals')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Role Change Confirmation Modal */}
            {roleChangeModal && (
                <div className="modal-overlay">
                    <div className="admin-card" style={{ width: '450px', maxWidth: '95%', border: '1px solid #444', animation: 'fadeIn 0.2s', textAlign: 'center', padding: '2rem' }}>
                        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '50%' }}>
                                <FaCheck size={30} color="var(--accent)" />
                            </div>
                        </div>
                        
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.4rem' }}>{t('admin.users.role_modal.title')}</h3>
                        
                        <p style={{ color: '#ccc', marginBottom: '2rem', lineHeight: '1.6' }}>
                            {t('admin.users.role_modal.desc')}<br/>
                            <strong style={{ color: '#fff' }}>{users.find(u => u.id === roleChangeModal.userId)?.username || users.find(u => u.id === roleChangeModal.userId)?.email}</strong><br/>
                            {t('admin.users.role_modal.to')} <strong style={{ color: 'var(--accent)', textTransform: 'uppercase' }}>{roleChangeModal.newRole}</strong>.
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button 
                                className="btn-secondary" 
                                onClick={() => setRoleChangeModal(null)}
                                style={{
                                    border: '1px solid #444',
                                    color: '#ccc',
                                    padding: '0.8rem 1.5rem',
                                    borderRadius: '8px',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    flex: 1
                                }}
                            >
                                {t('admin.users.role_modal.cancel')}
                            </button>
                            <button 
                                className="btn-primary" 
                                onClick={confirmRoleChange}
                                style={{
                                    background: 'var(--accent)',
                                    color: '#000',
                                    border: 'none',
                                    padding: '0.8rem 1.5rem',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    flex: 1
                                }}
                            >
                                {t('admin.users.role_modal.confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

function RoleBadge({ role }: { role: string }) {
    const { t } = useTranslation()
    
    interface RoleInfo { label: string; img?: string; color?: string; icon?: React.ReactNode; }
    
    const roles: Record<string, RoleInfo> = {
        neroferno: { label: t('account.roles.neroferno'), img: '/ranks/rank-neroferno.png' },
        killu: { label: t('account.roles.killu'), img: '/ranks/rank-killu.png' },
        founder: { label: t('account.roles.founder'), img: '/ranks/rank-fundador.png' },
        admin: { label: t('account.roles.admin'), img: '/ranks/admin.png' },
        helper: { label: t('account.roles.helper'), img: '/ranks/helper.png' },
        donor: { label: t('account.roles.donor'), img: '/ranks/rank-donador.png' },
        user: { label: t('account.roles.user'), img: '/ranks/user.png' },
        developer: { label: t('account.roles.developer'), img: '/ranks/developer.png' }
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
