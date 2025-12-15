import { useState, useEffect } from 'react';
import { FaDiscord, FaTwitter, FaTwitch } from 'react-icons/fa';

export default function SocialSidebar() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
             // Show when scrolled > 300px
             // Hide when near bottom (optional, but requested "hidden at footer")
             /* 
                We can check distance to bottom. 
                But for now let's just do > 300px. 
                If user wants hidden at footer specifically, we can add:
                && window.innerHeight + window.scrollY < document.body.offsetHeight - 100
             */
             const scrolled = window.scrollY > 300;
             const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100;
             
             setIsVisible(scrolled && !nearBottom);
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    return (
        <div className={`social-sidebar ${isVisible ? 'visible' : ''}`}>
            <a href="https://x.com/KilluBysmali" target="_blank" rel="noreferrer" className="social-link twitter" aria-label="Twitter">
                <FaTwitter />
            </a>
            <a href="https://discord.com/invite/TDmwYNnvyT" target="_blank" rel="noreferrer" className="social-link discord" aria-label="Discord">
                <FaDiscord />
            </a>
            <a href="https://www.twitch.tv/killubysmalivt" target="_blank" rel="noreferrer" className="social-link twitch" aria-label="Twitch">
                <FaTwitch />
            </a>
        </div>
    );
}
