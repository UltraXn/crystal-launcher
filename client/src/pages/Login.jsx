import { useState } from 'react'
import { FaEnvelope, FaLock, FaSignInAlt, FaDiscord, FaTwitch } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const { login, loginWithProvider } = useAuth()
    const navigate = useNavigate()

    const handleProviderLogin = async (provider) => {
        try {
            setError('')
            await loginWithProvider(provider)
            // No navigate needed here as OAuth redirects the page
        } catch (err) {
            setError(`Error al iniciar con ${provider}: ` + err.message)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        try {
            await login(email, password)
            navigate('/') // O ir a /account
        } catch (err) {
            setError('Error al iniciar sesión: ' + err.message)
        }
    }

    return (
        <div className="account-page">
            <div className="account-container">
                <div className="account-card animate-pop-up">
                    <div className="account-header">
                        <h2>Iniciar Sesión</h2>
                        <p>Bienvenido de nuevo a CrystalTides</p>
                    </div>

                    {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}

                    <form className="account-form" onSubmit={handleSubmit}>
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
                            <input
                                type="password"
                                placeholder="••••••••••••"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="btn-submit">
                            <FaSignInAlt /> Ingresar
                        </button>
                    </form>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                        <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>O continúa con</span>
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
                            ¿No tienes cuenta? <Link to="/register" className="btn-text">Regístrate</Link>
                        </p>
                        <Link to="/" className="back-link">← Volver al inicio</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
