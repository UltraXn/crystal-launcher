import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import LazyWrapper from "@/components/Utils/LazyWrapper"

import Navbar from "@/components/Layout/Navbar"
import SocialSidebar from "@/components/Layout/SocialSidebar"
import ScrollToHash from "@/components/Utils/ScrollToHash"

import Home from "@/pages/Home"
import Blog from "@/pages/Blog"
import Rules from "@/pages/Rules"
import Donors from "@/pages/Donors"
import Contests from "@/pages/Contests"
import Suggestions from "@/pages/Suggestions"
import Account from "@/pages/Account"
import Login from "@/pages/Login"
import Register from "@/pages/Register"
import Map from "@/pages/Map"
import NewsPage from "@/pages/NewsPage"
import NotFound from "@/pages/NotFound"

import Stories from "@/pages/Stories"
import Forum from "@/pages/Forum"
import ForumCategory from "@/pages/ForumCategory"
import ForumThread from "@/pages/ForumThread"
import CreateThread from "@/pages/CreateThread"

import Footer from "@/components/Layout/Footer"
import AdminPanel from "@/pages/AdminPanel"



import { useEffect } from "react"

export default function App() {
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL
    fetch(`${API_URL}/settings`)
        .then(res => res.json())
        .then(data => {
            if(data.theme && data.theme !== 'default') {
                document.body.classList.add(`theme-${data.theme}`)
            }
            if(data.announcement) {
                // Podríamos inyectar una barra, pero simplifiquemos por ahora
                console.log("Anuncio activo:", data.announcement)
            }
        })
        .catch(console.error)
  }, [])

  return (
    <BrowserRouter>
      <ScrollToHash />
      <Navbar />
      <SocialSidebar />

      <Routes>
        <Route path="/" element={
          <main>
            <div id="home">
              <Home />
            </div>
            <div id="rules">
              <Rules />
            </div>
            <div id="donors">
              <LazyWrapper minHeight="60vh" rootMargin="600px 0px">
                <Donors />
              </LazyWrapper>
            </div>
            <div id="contests">
              <LazyWrapper minHeight="50vh">
                <Contests />
              </LazyWrapper>
            </div>
            <div id="news">
              <LazyWrapper minHeight="50vh">
                <Blog />
              </LazyWrapper>
            </div>

            <div id="stories">
              <LazyWrapper minHeight="80vh">
                <Stories />
              </LazyWrapper>
            </div>
            <div id="suggestions">
              <LazyWrapper minHeight="50vh">
                <Suggestions />
              </LazyWrapper>
            </div>
          </main>
        } />

        <Route path="/account" element={<Account />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/forum/create" element={<CreateThread />} />
        <Route path="/forum/:id" element={<ForumCategory />} />
        <Route path="/forum/thread/:type/:id" element={<ForumThread />} />
        <Route path="/map" element={<Map />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <FooterWrapper />
    </BrowserRouter>
  )
}

function FooterWrapper() {
  const location = useLocation()
  // No mostrar footer en rutas de admin
  if (location.pathname.startsWith('/admin')) return null
  return <Footer />
}
