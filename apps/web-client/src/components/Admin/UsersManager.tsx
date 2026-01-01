import { useState, useEffect } from 'react'

import { useAuth } from "../../context/AuthContext"

import { useTranslation } from 'react-i18next'
import { supabase } from '../../services/supabaseClient'
import { getAuthHeaders } from '../../services/adminAuth'
import { sendDiscordLog } from '../../services/discordService'

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

interface UsersManagerProps {
    mockUsers?: UserDefinition[];
    mockMedals?: MedalDefinition[];
}

export default function UsersManager({ mockUsers, mockMedals }: UsersManagerProps = {}) {
    const { t } = useTranslation()
    const [users, setUsers] = useState<UserDefinition[]>(mockUsers || [])
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [hasSearched, setHasSearched] = useState(!!mockUsers) // Assume searched if mocks provided
    
    // Medal Management State
    const [availableMedals, setAvailableMedals] = useState<MedalDefinition[]>(mockMedals || [])
    const [editingUser, setEditingUser] = useState<UserDefinition | null>(null)
    const [savingMedals, setSavingMedals] = useState(false)

    // Role Change Modal State
    const [roleChangeModal, setRoleChangeModal] = useState<{ userId: string, newRole: string } | null>(null)

    const { user } = useAuth() as { user: UserDefinition | null } 

    // Fetch available medals on load
    useEffect(() => {
        if (mockMedals) return;
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
            
            const { data: { session } } = await supabase.auth.getSession();
            const headers = getAuthHeaders(session?.access_token || null);

            const res = await fetch(`${API_URL}/users?search=${encodeURIComponent(searchQuery)}`, { headers })
            if(res.ok) {
                const response = await res.json()
                if (Array.isArray(response)) {
                    setUsers(response)
                } else if (response.data && Array.isArray(response.data)) {
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
            const { data: { session } } = await supabase.auth.getSession();
            const headers = { 
                'Content-Type': 'application/json',
                ...getAuthHeaders(session?.access_token || null)
            };

            const res = await fetch(`${API_URL}/users/${userId}/role`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ role: newRole })
            })
            if(res.ok) {
                // Determine target user name for log
                const targetUser = users.find(u => u.id === userId);
                const targetName = targetUser?.username || targetUser?.email || userId;
                const adminName = user?.username || user?.email || 'Unknown Admin';

                // Send Log to Discord
                sendDiscordLog(
                    'Admin Action: Role Change', 
                    `**Admin:** ${adminName}\n**User:** ${targetName}\n**New Role:** ${newRole.toUpperCase()}`, 
                    'action'
                );

                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
                if (user && user.id === userId) {
                    await supabase.auth.refreshSession();
                    window.location.reload();
                }
                setRoleChangeModal(null);
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
            const { data: { session } } = await supabase.auth.getSession();
            const headers = { 
                'Content-Type': 'application/json',
                ...getAuthHeaders(session?.access_token || null)
            };

            const res = await fetch(`${API_URL}/users/${editingUser.id}/metadata`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ metadata: { medals: editingUser.medals } })
            });

            if (res.ok) {
                setUsers(users.map(u => u.id === editingUser.id ? { ...u, medals: editingUser.medals } : u));
                setEditingUser(null);
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
        <div className="admin-card" style={{ background: 'rgba(10, 10, 15, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px', padding: '1.5rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ margin: 0, fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', fontWeight: '900', color: '#fff', letterSpacing: '-0.5px', wordBreak: 'break-word' }}>{t('admin.users.title')}</h3>
                <p style={{ margin: '0.5rem 0 0', color: 'rgba(255,255,255,0.4)', fontSize: 'clamp(0.8rem, 2vw, 0.9rem)' }}>Gestiona los permisos y medallas de la comunidad</p>
            </div>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 100%', minWidth: '200px', position: 'relative' }}>
                    <input 
                        type="text" 
                        placeholder={t('admin.users.search_placeholder')} 
                        className="admin-input-premium" 
                        style={{ paddingLeft: '3rem', width: '100%' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <FaSearch style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                </div>
                <button type="submit" className="modal-btn-primary" style={{ flex: '1 1 auto', minWidth: '140px', height: '52px', borderRadius: '16px', padding: '0 2rem' }}>
                    {t('admin.users.search_btn')}
                </button>
            </form>

            <div className="admin-table-container" style={{ overflow: 'visible', background: 'transparent', border: 'none' }}>
                <table className="admin-table users-table-responsive" style={{ borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                    <thead>
                        <tr>
                            <th style={{ background: 'transparent', border: 'none', paddingLeft: '1.5rem', color: '#666' }}>{t('admin.users.table.user')}</th>
                            <th className="th-mobile-hide" style={{ background: 'transparent', border: 'none', color: '#666' }}>{t('admin.users.table.id')}</th>
                            <th style={{ background: 'transparent', border: 'none', color: '#666' }}>{t('admin.users.table.role')}</th>
                            <th className="th-mobile-hide" style={{ background: 'transparent', border: 'none', color: '#666' }}>{t('admin.users.gamification')}</th>
                            {canManageRoles && <th style={{ background: 'transparent', border: 'none', color: '#666' }}>{t('admin.users.table.change_role')}</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} className="user-table-row" style={{ background: 'rgba(255, 255, 255, 0.02)', transition: 'transform 0.2s', cursor: 'default' }}>
                                <td className="user-cell-main" style={{ border: '1px solid rgba(255,255,255,0.05)', borderRight: 'none', borderRadius: '16px 0 0 16px', padding: '1.25rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                        <div style={{ 
                                            width: '42px', height: '42px', minWidth: '42px', borderRadius: '12px', 
                                            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent)'
                                        }}>
                                            {u.username ? u.username[0].toUpperCase() : u.email[0].toUpperCase()}
                                        </div>
                                        <div style={{ flex: '1', minWidth: '0' }}>
                                            <div style={{fontWeight:'800', color:'#fff', fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{u.username || u.email.split('@')[0]}</div>
                                            <div style={{fontSize:'0.75rem', color:'rgba(255,255,255,0.4)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{u.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="th-mobile-hide" style={{ border: '1px solid rgba(255,255,255,0.05)', borderLeft: 'none', borderRight: 'none', position: 'relative' }}>
                                    <span style={{ fontFamily:'monospace', fontSize:'0.75rem', color:'rgba(255,255,255,0.3)', background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: '6px' }}>
                                        {u.id.substring(0,8)}...
                                    </span>
                                </td>
                                <td className="user-cell-role" style={{ border: '1px solid rgba(255,255,255,0.05)', borderLeft: 'none', borderRight: 'none', minWidth: '120px' }}>
                                    <RoleBadge role={u.role || 'user'} />
                                </td>
                                <td className="th-mobile-hide" style={{ border: '1px solid rgba(255,255,255,0.05)', borderLeft: 'none', borderRight: 'none' }}>
                                    <button 
                                        onClick={() => setEditingUser(u)}
                                        style={{ 
                                            background: u.medals && u.medals.length > 0 ? 'rgba(251, 191, 36, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
                                            border: u.medals && u.medals.length > 0 ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)', 
                                            color: u.medals && u.medals.length > 0 ? '#fbbf24' : 'rgba(255, 255, 255, 0.4)',
                                            borderRadius: '10px',
                                            padding: '0.5rem 1rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.6rem',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            transition: 'all 0.2s',
                                            whiteSpace: 'nowrap'
                                        }}
                                        className="hover-lift"
                                    >
                                        <FaMedal /> {u.medals?.length || 0} {t('admin.users.medals')}
                                    </button>
                                </td>
                                {canManageRoles && (
                                    <td className="user-cell-actions" style={{ border: '1px solid rgba(255,255,255,0.05)', borderLeft: 'none', borderRadius: '0 16px 16px 0', paddingRight: '1.25rem' }}>
                                        <div style={{ position: 'relative' }}>
                                            <select 
                                                className="admin-select-premium" 
                                                style={{ padding: '0.6rem 2.5rem 0.6rem 1rem', fontSize: '0.85rem', minWidth: '140px', width: '100%', backgroundPosition: 'right 0.8rem center' }}
                                                value={u.role || 'user'}
                                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                            >
                                                <option value="neroferno">{t('account.roles.neroferno')}</option>
                                                <option value="killu">{t('account.roles.killu')}</option>
                                                <option value="founder">{t('account.roles.founder')}</option>
                                                <option value="developer">{t('account.roles.developer')}</option>
                                                <option value="admin">{t('account.roles.admin')}</option>
                                                <option value="staff">{t('account.roles.staff', 'Staff')}</option>
                                                <option value="helper">{t('account.roles.helper')}</option>
                                                <option value="donor">{t('account.roles.donor')}</option>
                                                <option value="user">{t('account.roles.user')}</option>
                                            </select>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Empty states */}
                {users.length === 0 && hasSearched && !loading && (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <FaSearch size={48} opacity={0.2} />
                        <div>{t('admin.users.no_results')}</div>
                    </div>
                )}
                {users.length === 0 && !hasSearched && (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FaSearch size={24} opacity={0.5} />
                        </div>
                        <div>{t('admin.users.initial_msg')}</div>
                    </div>
                )}
                {loading && (
                    <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
                        <Loader style={{ height: 'auto', minHeight: '100px' }} />
                    </div>
                )}
            </div>

            {/* Medals Modal */}
            {editingUser && (
                <div className="premium-modal-overlay">
                    <div className="premium-modal-content">
                        <div className="modal-accent-line" />
                        <div className="modal-header-premium">
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>{t('admin.users.medals_of')} <span style={{color: 'var(--accent)'}}>{editingUser.username || editingUser.email.split('@')[0]}</span></h3>
                                <p style={{ margin: '0.25rem 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>Asigna medallas especiales a este usuario</p>
                            </div>
                            <button onClick={() => setEditingUser(null)} className="btn-close-premium"><FaTimes /></button>
                        </div>

                        <div className="modal-body-premium">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.75rem' }}>
                                {availableMedals.map(medal => {
                                    const active = editingUser.medals?.includes(medal.id);
                                    return (
                                        <div 
                                            key={medal.id}
                                            onClick={() => toggleMedal(medal.id)}
                                            style={{
                                                position: 'relative',
                                                border: active ? `1px solid ${medal.color}` : '1px solid rgba(255,255,255,0.05)',
                                                background: active ? `linear-gradient(180deg, ${medal.color}15, ${medal.color}05)` : 'rgba(255,255,255,0.02)',
                                                borderRadius: '16px',
                                                padding: '1rem 0.5rem',
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                transform: active ? 'translateY(-2px)' : 'none',
                                                boxShadow: active ? `0 10px 20px -5px ${medal.color}30` : 'none'
                                            }}
                                        >
                                            <div style={{ 
                                                color: medal.color, 
                                                fontSize: '1.75rem', 
                                                marginBottom: '0.5rem',
                                                filter: active ? `drop-shadow(0 0 10px ${medal.color}60)` : 'grayscale(1) opacity(0.5)',
                                                transition: 'all 0.3s'
                                            }}>
                                                <FaMedal /> 
                                            </div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: '800', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{medal.name}</div>
                                            {active && (
                                                <div style={{ 
                                                    position: 'absolute', top: '8px', right: '8px', 
                                                    background: medal.color, color: '#000', 
                                                    width: '18px', height: '18px', borderRadius: '50%', 
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                                    fontSize: '10px' 
                                                }}>
                                                    <FaCheck />
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                                {availableMedals.length === 0 && <p style={{ color: '#666', gridColumn: '1/-1', textAlign: 'center', padding: '2rem' }}>{t('admin.users.no_medals')}</p>}
                            </div>
                        </div>

                        <div className="modal-footer-premium">
                            <button className="modal-btn-secondary" onClick={() => setEditingUser(null)}>{t('admin.users.role_modal.cancel')}</button>
                            <button className="modal-btn-primary" onClick={handleSaveMedals} disabled={savingMedals}>
                                {savingMedals ? t('admin.users.saving') : t('admin.users.save_medals')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Role Change Confirmation Modal */}
            {roleChangeModal && (
                <div className="premium-modal-overlay">
                    <div className="premium-modal-content" style={{ maxWidth: '450px' }}>
                        <div className="modal-accent-line" style={{ background: 'linear-gradient(90deg, transparent, #ef4444, transparent)', boxShadow: '0 0 20px #ef4444' }} />
                        
                        <div style={{ padding: '3rem 2rem 2rem', textAlign: 'center' }}>
                            <div style={{ 
                                margin: '0 auto 1.5rem', 
                                width: '80px', height: '80px', 
                                background: 'rgba(239, 68, 68, 0.1)', 
                                color: '#ef4444',
                                borderRadius: '50%', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '2rem',
                                boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)'
                            }}>
                                <FaCheck />
                            </div>
                            
                            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', fontWeight: '900' }}>{t('admin.users.role_modal.title')}</h3>
                            
                            <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '2rem', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                {t('admin.users.role_modal.desc')}<br/>
                                <strong style={{ color: '#fff', fontSize: '1.1rem' }}>{users.find(u => u.id === roleChangeModal.userId)?.username || users.find(u => u.id === roleChangeModal.userId)?.email}</strong><br/>
                                {t('admin.users.role_modal.to')} <span className="status-chip" style={{ background: '#fff', color: '#000', margin: '0 5px' }}>{roleChangeModal.newRole}</span>
                            </p>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <button 
                                    className="modal-btn-secondary" 
                                    onClick={() => setRoleChangeModal(null)}
                                    style={{ flex: 1, height: '48px' }}
                                >
                                    {t('admin.users.role_modal.cancel')}
                                </button>
                                <button 
                                    className="modal-btn-primary" 
                                    onClick={confirmRoleChange}
                                    style={{ 
                                        flex: 1, 
                                        height: '48px', 
                                        background: '#ef4444', 
                                        boxShadow: '0 10px 20px rgba(239, 68, 68, 0.2)',
                                        color: '#fff'
                                    }}
                                >
                                    {t('admin.users.role_modal.confirm')}
                                </button>
                            </div>
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
        staff: { label: t('account.roles.staff', 'Staff'), img: '/ranks/staff.png' },
        helper: { label: t('account.roles.helper'), img: '/ranks/helper.png' },
        donor: { label: t('account.roles.donor'), img: '/ranks/rank-donador.png' },
        user: { label: t('account.roles.user'), img: '/ranks/user.png' },
        developer: { label: t('account.roles.developer'), img: '/ranks/developer.png' }
    }
    const current = roles[role] || roles.user

    if(current.img) {
        return <img src={current.img} alt={role} title={current.label} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
    }

    return (
        <span style={{
            background: current.color || '#333',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '0.7rem',
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
            {current.icon} {current.label}
        </span>
    )
}
