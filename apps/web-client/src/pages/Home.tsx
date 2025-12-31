import { lazy } from 'react'
import Hero from "../components/Hero"
import Section from "../components/Layout/Section"
import SectionDivider from "../components/Layout/SectionDivider"
import ServerFeatures from "../components/Home/ServerFeatures"
import LazyWrapper from "../components/Utils/LazyWrapper"

// Lazy load below-the-fold sections to reduce initial bundle size
const Rules = lazy(() => import("./Rules"))
const Donors = lazy(() => import("./Donors"))
const Contests = lazy(() => import("./Contests"))
const Blog = lazy(() => import("./Blog"))
const Stories = lazy(() => import("./Stories"))
const Suggestions = lazy(() => import("./Suggestions"))
import StaffShowcase from "../components/Home/StaffShowcase"

import { useTranslation } from 'react-i18next'
import DiscordButton from "../components/UI/DiscordButton"
import TwitchButton from "../components/UI/TwitchButton"
import TwitterButton from "../components/UI/TwitterButton"
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Home() {
    const { t } = useTranslation()
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Animate each section container
            const sections = containerRef.current?.querySelectorAll('section, .SectionDivider, #rules, #donors, #staff, #contests, #news, #stories, #suggestions');
            
            sections?.forEach((section) => {
                gsap.fromTo(section, 
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: section,
                            start: "top 85%",
                            toggleActions: "play none none none"
                        }
                    }
                );
            });
        });

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef}>
            <Hero />
            
            <Section title={t('home.title')}>
                <Section>
                    <div className="crystal-card">
                        <p>{t('home.description')}</p>
                    </div>

                    <ServerFeatures />
                </Section>
            </Section>

            <SectionDivider />

            <Section title={t('footer.community')} id="community">
                <div className="crystal-card" style={{ maxWidth: '800px' }}>
                    <p style={{ marginBottom: "1.5rem" }}>{t('home.join_us_twitch')}</p>
                    <p>{t('home.join_us_discord')}</p>
                </div>
                <div className="flex flex-wrap justify-center gap-8 px-4 items-center">
                    <DiscordButton />
                    <TwitchButton />
                    <TwitterButton />
                </div>
            </Section>

            <SectionDivider />

            <div id="rules">
                <LazyWrapper>
                    <Rules />
                </LazyWrapper>
            </div>

            <SectionDivider />

            <div id="donors">
                <LazyWrapper>
                    <Donors />
                </LazyWrapper>
            </div>

            <SectionDivider />

            <div id="staff">
                <StaffShowcase />
            </div>

            <SectionDivider />

            <div id="contests">
                <LazyWrapper>
                    <Contests />
                </LazyWrapper>
            </div>

            <SectionDivider />

            <div id="news">
                <LazyWrapper>
                    <Blog />
                </LazyWrapper>
            </div>

            <SectionDivider />

            <div id="stories">
                <LazyWrapper>
                    <Stories />
                </LazyWrapper>
            </div>

            <SectionDivider />

            <div id="suggestions">
                <LazyWrapper>
                    <Suggestions />
                </LazyWrapper>
            </div>
        </div>
    )
}

