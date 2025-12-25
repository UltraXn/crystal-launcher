import { lazy, useEffect, useState, Suspense } from "react"
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom"
import LazyWrapper from "./components/Utils/LazyWrapper"
import { useAuth } from "./context/AuthContext"

import Navbar from "./components/Layout/Navbar"
import SocialSidebar from "./components/Layout/SocialSidebar"
import ScrollToHash from "./components/Utils/ScrollToHash"
import TypingBubbles from "./components/Effects/TypingBubbles"
import AmbientBubbles from "./components/Effects/AmbientBubbles"
import BroadcastAlert from "./components/UI/BroadcastAlert"
import TentacleCursor from "./components/Effects/TentacleCursor"
// Static Pages
import Home from "./pages/Home"

// Lazy Pages
const Login = lazy(() => import("./pages/Login"))
const Register = lazy(() => import("./pages/Register"))
const RegisterSuccess = lazy(() => import("./pages/RegisterSuccess"))
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"))
const Verify = lazy(() => import("./pages/Verify"))
const Maintenance = lazy(() => import("./pages/Maintenance"))
const NotFound = lazy(() => import("./pages/NotFound"))
const Tutorial = lazy(() => import("./components/UI/Tutorial"))
const CommandPalette = lazy(() => import("./components/UI/CommandPalette"))

// Lazy Pages
const Staff = lazy(() => import("./pages/Staff"))
const PublicProfile = lazy(() => import("./pages/PublicProfile"))
const Account = lazy(() => import("./pages/Account"))
const Gacha = lazy(() => import("./pages/Gacha"))
const AdminPanel = lazy(() => import("./pages/AdminPanel"))
const Map = lazy(() => import("./pages/Map"))
const Status = lazy(() => import("./pages/Status"))

// Forum Lazy
const Forum = lazy(() => import("./pages/Forum"))
const ForumCategory = lazy(() => import("./pages/ForumCategory"))
const ForumThread = lazy(() => import("./pages/ForumThread"))
const CreateThread = lazy(() => import("./pages/CreateThread"))

// Support Lazy
const Support = lazy(() => import("./pages/Support"))
const TicketDetail = lazy(() => import("./pages/TicketDetail"))

import Footer from "./components/Layout/Footer"

function StatusHandler({ maintenanceActive }: { maintenanceActive: boolean }) {
    const { user, loading } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    // Determine if user is authorized to bypass maintenance
    // For now, any logged in user bypasses, assuming only staff/admins login during maintenance
    // You can refine this to user?.user_metadata?.role === 'admin'
    const isAuthorized = !!user; 

    useEffect(() => {
        if (loading) return;

        if (maintenanceActive) {
             const path = location.pathname;
             // Allow access to login, maintenance page, and admin panel (and api of course)
             const isExempt = path === '/login' || path === '/maintenance' || path.startsWith('/admin');
             
             if (!isAuthorized && !isExempt) {
                 navigate('/maintenance');
             }
        } else {
            // If maintenance is OFF, but user is on /maintenance page, kick them to home
            if (location.pathname === '/maintenance') {
                navigate('/');
            }
        }
    }, [maintenanceActive, isAuthorized, location, navigate, loading]);

    return null;
}

export default function App() {

  const [maintenanceMode, setMaintenanceMode] = useState(false)

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL
    
    // Function to apply settings
    const applySettings = (data: { theme?: string, maintenance_mode?: string }) => {
        // Theme
        document.body.className = document.body.className.replace(/theme-\w+/g, '').trim();
        if(data.theme && data.theme !== 'default') {
            document.body.classList.add(`theme-${data.theme}`)
        }
        // Maintenance
        setMaintenanceMode(data.maintenance_mode === 'true')
    }

    // Initial Load
    fetch(`${API_URL}/settings`)
        .then(res => res.json())
        .then(applySettings)
        .catch(console.error)

    // Listeners for updates from Admin Panel
    const handleTheme = (e: Event) => {
        const newTheme = (e as CustomEvent).detail;
        document.body.className = document.body.className.replace(/theme-\w+/g, '').trim();
        if(newTheme && newTheme !== 'default') {
            document.body.classList.add(`theme-${newTheme}`)
        }
    }

    const handleMaintenanceEvent = (e: Event) => {
        setMaintenanceMode((e as CustomEvent).detail === 'true');
    }
    
    window.addEventListener('themeChanged', handleTheme);
    window.addEventListener('maintenanceChanged', handleMaintenanceEvent);

    return () => {
        window.removeEventListener('themeChanged', handleTheme);
        window.removeEventListener('maintenanceChanged', handleMaintenanceEvent);
    }
  }, [])

  return (
    <BrowserRouter>
      <StatusHandler maintenanceActive={maintenanceMode} />
      <TentacleCursor />
      <ScrollToHash />
      <HeaderWrapper />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
        <Routes>
            <Route path="/" element={<Home />} />
            
            <Route path="/staff" element={<LazyWrapper minHeight="80vh"><Staff /></LazyWrapper>} />
            <Route path="/u/:username" element={<LazyWrapper><PublicProfile /></LazyWrapper>} />
            <Route path="/account" element={<LazyWrapper minHeight="80vh"><Account /></LazyWrapper>} />
            <Route path="/login" element={<LazyWrapper><Login /></LazyWrapper>} />
            <Route path="/forgot-password" element={<LazyWrapper><ForgotPassword /></LazyWrapper>} />
            <Route path="/register" element={<LazyWrapper><Register /></LazyWrapper>} />
            <Route path="/gacha" element={<LazyWrapper><Gacha /></LazyWrapper>} />
            <Route path="/admin" element={<LazyWrapper minHeight="80vh"><AdminPanel /></LazyWrapper>} />

            <Route path="/forum" element={<LazyWrapper><Forum /></LazyWrapper>} />
            <Route path="/forum/create" element={<LazyWrapper><CreateThread /></LazyWrapper>} />
            <Route path="/forum/:id" element={<LazyWrapper><ForumCategory /></LazyWrapper>} />
            <Route path="/forum/thread/:type/:id" element={<LazyWrapper><ForumThread /></LazyWrapper>} />
            <Route path="/map" element={<LazyWrapper><Map /></LazyWrapper>} />
            <Route path="/status" element={<LazyWrapper><Status /></LazyWrapper>} />
            
            <Route path="/support" element={<LazyWrapper><Support /></LazyWrapper>} />
            <Route path="/support/:id" element={<LazyWrapper><TicketDetail /></LazyWrapper>} />

            <Route path="/verify" element={<LazyWrapper><Verify /></LazyWrapper>} />
            <Route path="/register/success" element={<LazyWrapper><RegisterSuccess /></LazyWrapper>} />

            <Route path="/maintenance" element={<LazyWrapper><Maintenance /></LazyWrapper>} />
            <Route path="*" element={<LazyWrapper><NotFound /></LazyWrapper>} />
        </Routes>
      </main>

      <FooterWrapper />
      <EffectsWrapper />
      <Suspense fallback={null}>
        <CommandPalette />
        <Tutorial />
      </Suspense>
    </BrowserRouter>
  )
}

function EffectsWrapper() {
  const location = useLocation()
  // Disable bubbles on Account and Admin pages to keep it clean
  if (location.pathname.startsWith('/account') || location.pathname.startsWith('/admin')) return null
  return (
    <>
      <TypingBubbles />
      <AmbientBubbles />
    </>
  )
}

function HeaderWrapper() {
  const location = useLocation()
  // Hide header on maintenance page and admin panel
  if (location.pathname === '/maintenance' || location.pathname.startsWith('/admin')) return null
  
  return (
    <>
      <BroadcastAlert />
      <Navbar />
      {!location.pathname.startsWith('/admin') && !location.pathname.startsWith('/account') && !location.pathname.startsWith('/staff') && location.pathname !== '/status' && <SocialSidebar />}
    </>
  )
}

function FooterWrapper() {
  const location = useLocation()
  // No mostrar footer en rutas de admin, mantenimiento o cuenta
  if (location.pathname.startsWith('/admin') || location.pathname === '/maintenance' || location.pathname === '/account' || location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/verify') return null
  return <Footer />
}
