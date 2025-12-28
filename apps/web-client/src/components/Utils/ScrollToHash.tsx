import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToHash() {
    const { pathname, hash, key } = useLocation();

    // 1. Handle Navigation & Initial Load
    useEffect(() => {
        if (hash) {
            const element = document.getElementById(hash.replace("#", ""));
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: "smooth" });
                }, 100);
            }
        } else {
            window.scrollTo(0, 0);
        }
    }, [pathname, hash, key]);

    // 2. Handle "Same Hash" Clicks (e.g. User at #foo, scrolls up, clicks #foo again)
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = (e.target as HTMLElement).closest('a');
            if (!target) return;

            // Use the browser's native property to get the full absolute URL for reliable comparison
            const linkUrl = new URL(target.href, window.location.href);
            const currentUrl = new URL(window.location.href);

            // Check if we are on the same page structure (Path + Search + Hash)
            if (
                linkUrl.pathname === currentUrl.pathname &&
                linkUrl.search === currentUrl.search &&
                linkUrl.hash === currentUrl.hash &&
                linkUrl.hash !== "" // Only apply to hash links
            ) {
                const element = document.getElementById(linkUrl.hash.replace("#", ""));
                if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                }
            }
        };

        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    return null;
}
