import React, { useEffect } from 'react';

const KoFiWidget = ({
    kofiId = "G2G03Y8FL",
    color = "#0C7075",
    text = "¡Dona por Ko-Fi!",
    overlay = false
}) => {
    useEffect(() => {
        // Load the Ko-Fi script
        const scriptId = 'kofi-widget-script';
        if (document.getElementById(scriptId)) return;

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://storage.ko-fi.com/cdn/widget/Widget_2.js';
        script.async = true;

        script.onload = () => {
            if (window.kofiwidget2) {
                window.kofiwidget2.init(text, color, kofiId);
                // The draw command appends the button to the body, usually fixed position
                window.kofiwidget2.draw();
            }
        };

        document.body.appendChild(script);

        // Cleanup function
        return () => {
            // Usually we might want to remove the widget on unmount, 
            // but the ko-fi widget attaches to body and doesn't have an easy "remove" method in provided script usually.
            // We can try to finding the element it creates.
            // The widget usually creates a div with class 'btn-container' or similar fixed to bottom left/right.
            // For now, persist it or we could manually remove the created styles/elements if needed.
            // Given usage, it likely stays for the session.

            // To be safe, if we navigate away, we might want to hide it.
            // Let's look for the iframe or div it creates.
            const kofiContainer = document.querySelector('.kofi-widget-overlay-2'); // Approximate class
            const kofiButton = document.querySelector('[id^="kofi-widget-overlay"]');

            // It's tricky with external scripts. A better React way is a static button, but user asked for script.
        };
    }, [kofiId, color, text]);

    return null; // This component doesn't render anything in the react tree, it appends to body
};

const KoFiButton = ({ kofiId = "G2G03Y8FL" }) => {
    return (
        <a
            href={`https://ko-fi.com/${kofiId}`}
            target="_blank"
            rel="noreferrer"
            className='btn-donate-hero'
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '1.5rem',
                backgroundColor: '#29abe0', // Ko-Fi blue/cyan match
                borderColor: '#29abe0',
                color: '#fff'
            }}
        >
            <img
                src="https://storage.ko-fi.com/cdn/cup-border.png"
                alt="Ko-fi donation icon"
                style={{ height: '20px', width: 'auto' }}
            />
            <span>¡Dona en Ko-Fi!</span>
        </a>
    );
}

export { KoFiWidget, KoFiButton };
