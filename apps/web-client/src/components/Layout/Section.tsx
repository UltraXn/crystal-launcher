import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface SectionProps {
    title?: React.ReactNode;
    children: React.ReactNode;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right';
    className?: string;
    id?: string;
    style?: React.CSSProperties;
}

export default function Section({
    title,
    children,
    delay = 0,
    direction = 'up',
    className = '',
    id,
    style = {}
}: SectionProps) {
    const [ref, isVisible] = useIntersectionObserver<HTMLElement>({ triggerOnce: true, threshold: 0.1 });
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (isVisible && !hasAnimated.current && ref.current) {
            hasAnimated.current = true;

            const startY = direction === 'up' ? 50 : (direction === 'down' ? -50 : 0);
            const startX = direction === 'left' ? -50 : (direction === 'right' ? 50 : 0);

            gsap.fromTo(ref.current,
                { 
                    opacity: 0, 
                    y: startY, 
                    x: startX 
                },
                {
                    opacity: 1,
                    y: 0,
                    x: 0,
                    duration: 1,
                    ease: 'power3.out',
                    delay: delay / 1000 // gsap uses seconds
                }
            );
        }
    }, [isVisible, delay, direction, ref]);

    if (title) {
        return (
            <section
                ref={ref}
                id={id}
                className={`section ${className}`.trim()}
                style={{ opacity: 0, ...style }}
            >
                <h2>{title}</h2>
                <div>{children}</div>
            </section>
        )
    }

    return (
        <div
            ref={ref as React.RefObject<HTMLDivElement>}
            id={id}
            className={className}
            style={{ opacity: 0, ...style }}
        >
            {children}
        </div>
    )
}
