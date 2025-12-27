import { useTranslation } from "react-i18next";

interface LoaderProps {
    text?: string;
    style?: React.CSSProperties;
    size?: number;
}

export default function Loader({ text, style, size }: LoaderProps) {
    const { t } = useTranslation();
    // If text is explicitly "", allow it to be empty. If undefined, show default.
    const displayText = text === "" ? null : (text || t('common.loading_content'));
    const circleSize = size || 50;

    return (
        <div className="loader-container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            width: '100%',
            minHeight: size ? 'auto' : '200px',
            ...style
        }}>
            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes jump { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
                .spinner-circle {
                    width: ${circleSize}px; height: ${circleSize}px;
                    border: 2px solid rgba(255, 255, 255, 0.1);
                    border-top: 2px solid var(--accent, #168C80);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                .pulpito-mini {
                    animation: jump 2s infinite ease-in-out;
                }
            `}</style>

            <div className="loader-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: displayText ? '1rem' : 0 }}>
                <div className="spinner-circle"></div>
                {!size && (
                     <img
                        src="/images/ui/logo.webp"
                        alt="Loading..."
                        className="pulpito-mini"
                        style={{ width: '50px', height: 'auto', display: 'block' }}
                    />
                )}
            </div>
            {displayText && <p style={{ color: 'var(--muted, #aaa)', fontSize: '1rem', marginTop: '0.5rem' }}>{displayText}</p>}
        </div>
    )
}
