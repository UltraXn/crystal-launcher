import { useTranslation } from "react-i18next";
import "../../styles/loader.css";

interface LoaderProps {
    text?: string;
    style?: React.CSSProperties;
    size?: number;
    minimal?: boolean;
    fullScreen?: boolean;
}

export default function Loader({ text, style, size, minimal, fullScreen }: LoaderProps) {
    const { t } = useTranslation();
    
    // In minimal mode, we only show a small spinner
    if (minimal) {
        return (
            <div className="loader-minimal" style={style}>
                <div className="spinner-ring" style={{ width: size, height: size }}></div>
                {text && <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>{text}</span>}
            </div>
        );
    }

    const displayText = text === "" ? null : (text || t('common.loading_content'));

    return (
        <div className={`premium-loader-container ${fullScreen ? 'loader-fullscreen' : ''}`} style={style}>
            <div className="loader-visual-wrapper">
                {/* Orbital Rings */}
                <div className="loader-ring loader-ring-1"></div>
                <div className="loader-ring loader-ring-2"></div>
                <div className="loader-ring loader-ring-3"></div>
                
                {/* Glow & Shine */}
                <div className="loader-shine"></div>
                
                {/* Logo */}
                <div className="loader-logo-glow">
                    <img
                        src="/images/ui/logo.webp"
                        alt="Loading..."
                    />
                </div>
            </div>

            {displayText && (
                <div className="loader-text-premium">
                    {displayText}
                </div>
            )}
        </div>
    )
}
