import { useEffect, useRef } from 'react'

export default function TentacleCursor() {
    const cursorRef = useRef<HTMLDivElement>(null)
    const angleRef = useRef(0)
    const requestRef = useRef<number>(0)
    const mouseRef = useRef({ x: -100, y: -100 }) // Start off-screen
    const lastCheckRef = useRef(0)

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY }
        }
        
        window.addEventListener('mousemove', moveCursor)
        
        // Hide default cursor
        document.body.style.cursor = 'none'
        const link = document.createElement('style')
        link.innerHTML = `
            html, body, * { cursor: none !important; }
            a, button, input, textarea, select, [role="button"], .admin-input, .xp-sidebar-btn { cursor: none !important; }
            *:hover { cursor: none !important; }
        `
        link.id = 'cursor-style'
        document.head.appendChild(link)

        return () => {
            window.removeEventListener('mousemove', moveCursor)
            document.body.style.cursor = 'auto'
            const existingStyle = document.getElementById('cursor-style')
            if(existingStyle) existingStyle.remove()
        }
    }, [])

    useEffect(() => {
        const update = () => {
            if (!cursorRef.current) return
            
            const { x, y } = mouseRef.current
            
            // Move and Rotate cursor
            cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${angleRef.current}deg)`

            // Find nearest interactive element (every few frames to save perf)
            const now = Date.now()
            if (now - lastCheckRef.current > 100) {
                lastCheckRef.current = now
                // We throttle this selector query or optimize? 
                // Querying DOM every frame is heavy. Query every 10 frames or use checking?
                // Actually, let's just query visible buttons.
                const elements = document.querySelectorAll('button, a, input, [role="button"]')
                let minDist = 300 // Max distance to react
                let targetX = x
                let targetY = y
                let found = false

                elements.forEach(el => {
                    const rect = el.getBoundingClientRect()
                    // Center of element
                    const elX = rect.left + rect.width / 2
                    const elY = rect.top + rect.height / 2
                    
                    const dist = Math.sqrt(Math.pow(elX - x, 2) + Math.pow(elY - y, 2))
                    
                    if (dist < minDist) {
                        minDist = dist
                        targetX = elX
                        targetY = elY
                        found = true
                    }
                })

                if (found) {
                    // Calculate angle to target
                    const dx = targetX - x
                    const dy = targetY - y
                    const rad = Math.atan2(dy, dx)
                    const deg = rad * (180 / Math.PI)
                    
                    // Adjust for image orientation. 
                    // Assuming tentacle image points UP or TOP-LEFT? 
                    // Standard cursor points Top-Left (-45deg?) or -90deg?
                    // Let's assume standard image is Up-Rightish.
                    // We'll tweak 'deg + offset'.
                    angleRef.current = deg + 90 // Tweak this offset based on visual
                } else {
                    angleRef.current = 0 // Reset to natural
                }
            }
            
            requestRef.current = requestAnimationFrame(update)
        }
        
        requestRef.current = requestAnimationFrame(update)
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current)
        }
    }, []) // Angle dep might cause re-loop? No, loop calls itself.

    return (
        <div 
            ref={cursorRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '32px',
                height: '32px',
                pointerEvents: 'none',
                zIndex: 9999999999,
                backgroundImage: 'url(/images/ui/cursor.webp)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                // transition removed to ensure perfect follow
                marginTop: '-16px', // Center or Tip?
                marginLeft: '-16px'
            }}
        />
    )
}
