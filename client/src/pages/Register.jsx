import { useState } from 'react'
import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaGamepad, FaDiscord, FaTwitch, FaEye, FaEyeSlash } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function Register() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [minecraftUser, setMinecraftUser] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState('')
    const { register, loginWithProvider } = useAuth()
    const navigate = useNavigate()

    const handleProviderLogin = async (provider) => {
        try {
            setError('')
            await loginWithProvider(provider)
        } catch (err) {
            setError(`Error al registrarse con ${provider}: ` + err.message)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            return setError('Las contraseñas no coinciden')
        }

        try {
            const { user } = await register(email, password)
            if (user) {
                // Aquí podríamos guardar el usuario de minecraft en la base de datos
                // usando supabase.from('profiles').insert({ user_id: user.id, minecraft_username: minecraftUser })
                alert('Registro exitoso! Por favor verifica tu email.')
                navigate('/login')
            }
        } catch (err) {
            setError('Error al registrarse: ' + err.message)
        }
    }

    return (
        <div className="account-page">
            <div className="account-container">
                <div className="account-card animate-pop-up">
                    <div className="account-header">
                        <h2>Crear Cuenta</h2>
                        <p>Únete a la aventura hoy mismo</p>
                    </div>

                    {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}

                    <form className="account-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label><FaGamepad /> Usuario de Minecraft</label>
                            <input
                                type="text"
                                placeholder="Tu username exacto"
                                required
                                value={minecraftUser}
                                onChange={(e) => setMinecraftUser(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label><FaEnvelope /> Email</label>
                            <input
                                type="email"
                                placeholder="correo@ejemplo.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label><FaLock /> Contraseña</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ paddingRight: '2.5rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '0.75rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--muted)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '0.25rem'
                                    }}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label><FaLock /> Confirmar Contraseña</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    style={{ paddingRight: '2.5rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '0.75rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--muted)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '0.25rem'
                                    }}
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn-submit">
                            <FaUserPlus /> Registrarse
                        </button>
                    </form>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                        <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>O regístrate con</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <button
                            type="button"
                            onClick={() => handleProviderLogin('discord')}
                            className="btn-submit"
                            style={{ background: '#5865F2', marginTop: 0 }}
                        >
                            <FaDiscord size={20} /> Discord
                        </button>
                        <button
                            type="button"
                            onClick={() => handleProviderLogin('twitch')}
                            className="btn-submit"
                            style={{ background: '#9146FF', marginTop: 0 }}
                        >
                            <FaTwitch size={20} /> Twitch
                        </button>
                    </div>

                    <div className="account-footer">
                        <p>
                            ¿Ya tienes cuenta? <Link to="/login" className="btn-text">Inicia Sesión</Link>
                        </p>
                        <Link to="/" className="back-link">← Volver al inicio</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
