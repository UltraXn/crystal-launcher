import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function HeroParticles() {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        // Configuration
        const numParticles = 30
        const colors = ['#89D9D1', '#168C80', '#0C5952', '#ffffff']

        // Create particles
        const particles: HTMLDivElement[] = []
        for (let i = 0; i < numParticles; i++) {
            const el = document.createElement('div')
            el.classList.add('particle')

            // Random initial properties
            const size = Math.random() * 8 + 2 // 2px to 10px
            const color = colors[Math.floor(Math.random() * colors.length)]

            el.style.width = `${size}px`
            el.style.height = `${size}px`
            el.style.backgroundColor = color
            el.style.position = 'absolute'
            el.style.borderRadius = '50%'
            el.style.opacity = String(Math.random() * 0.5 + 0.1) // 0.1 to 0.6
            el.style.left = `${Math.random() * 100}%`
            el.style.top = `${Math.random() * 100}%`
            el.style.filter = `blur(${Math.random() * 2}px)`

            container.appendChild(el)
            particles.push(el)

            // GSAP individual animation for more natural float
            gsap.to(el, {
                x: "random(-100, 100)",
                y: "random(-100, 100)",
                scale: "random(0.5, 1.5)",
                opacity: "random(0.1, 0.6)",
                duration: "random(3, 8)",
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: Math.random() * 2
            });
        }

        return () => {
            // Cleanup particles and their animations
            if (container) {
                while (container.firstChild) {
                    gsap.killTweensOf(container.firstChild);
                    container.removeChild(container.firstChild);
                }
            }
        }
    }, [])

    return (
        <div
            ref={containerRef}
            className="hero-particles"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                zIndex: 1, // Between background (-1) and content (2)
                pointerEvents: 'none' // Click through
            }}
        />
    )
}
