import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Section from '../components/Layout/Section';
import Loader from '../components/UI/Loader';
import { getPolicy, Policy } from '../services/policyService';
import ReactMarkdown from 'react-markdown';
import { FaShieldAlt, FaFileContract, FaClock } from 'react-icons/fa';

export default function PolicyPage() {
    const { slug } = useParams<{ slug: string }>();
    const { t } = useTranslation();
    const [policy, setPolicy] = useState<Policy | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                if (!slug) return;
                setLoading(true);
                const data = await getPolicy(slug);
                setPolicy(data);
                setError(false);
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchPolicy();
    }, [slug]);

    if (loading) return (
        <Section>
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader />
            </div>
        </Section>
    );

    if (error || !policy) return (
        <Section>
            <div style={{ minHeight: '60vh', textAlign: 'center', padding: '5rem' }}>
                <FaShieldAlt size={64} color="var(--accent-dim)" style={{ opacity: 0.3, marginBottom: '2rem' }} />
                <h2>{t('policies.not_found', 'Política no encontrada')}</h2>
                <p style={{ color: 'var(--muted)' }}>Lo sentimos, la página que buscas no existe o ha sido movida.</p>
            </div>
        </Section>
    );

    const Icon = policy.slug === 'privacy' ? FaShieldAlt : FaFileContract;

    return (
        <Section>
            <div className="policy-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
                
                <header style={{ marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ 
                            width: '50px', 
                            height: '50px', 
                            background: 'var(--accent-gradient)', 
                            borderRadius: '12px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: '#000'
                        }}>
                            <Icon size={24} />
                        </div>
                        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800 }}>{policy.title}</h1>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', fontSize: '0.9rem' }}>
                        <FaClock size={14} />
                        <span>{t('policies.last_update', 'Última actualización')}: {new Date(policy.updated_at).toLocaleDateString()}</span>
                    </div>
                </header>

                <div className="policy-content" style={{ 
                    background: 'rgba(255,255,255,0.02)', 
                    padding: '3rem', 
                    borderRadius: '20px', 
                    border: '1px solid rgba(255,255,255,0.05)',
                    lineHeight: '1.8',
                    fontSize: '1.1rem',
                    color: '#ccc'
                }}>
                    <ReactMarkdown components={{
                        h2: ({ ...props }) => <h2 style={{ color: '#fff', marginTop: '2.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }} {...props} />,
                        h3: ({ ...props }) => <h3 style={{ color: '#fff', marginTop: '2rem' }} {...props} />,
                        p: ({ ...props }) => <p style={{ marginBottom: '1.2rem' }} {...props} />,
                        ul: ({ ...props }) => <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.5rem' }} {...props} />,
                        li: ({ ...props }) => <li style={{ marginBottom: '0.5rem' }} {...props} />,
                        strong: ({ ...props }) => <strong style={{ color: 'var(--accent)', fontWeight: 600 }} {...props} />
                    }}>
                        {policy.content}
                    </ReactMarkdown>
                </div>

                <div style={{ marginTop: '3rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>
                    <p>© {new Date().getFullYear()} CrystalTides SMP. {t('policies.all_rights', 'Todos los derechos reservados.')}</p>
                </div>
            </div>
        </Section>
    );
}
