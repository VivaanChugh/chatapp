"use client"

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Chat from "./pages/Chat"
import Friends from "./pages/Friends"
import DMs from "./pages/DMs"
import Sidebar from "./components/Sidebar"

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-pulse-soft">
          <div className="w-12 h-12 bg-purple-500 rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex min-h-screen">
          {user && <Sidebar onLogout={handleLogout} />}
          <div className="flex-1">
            <Routes>
              <Route path="/login" element={<Login onLogin={setUser} />} />
              <Route path="/register" element={<Register />} />
              <Route path="/chat" element={user ? <Chat user={user} /> : <Navigate to="/login" />} />
              <Route path="/friends" element={user ? <Friends user={user} /> : <Navigate to="/login" />} />
              <Route path="/dms/:friendId" element={user ? <DMs user={user} /> : <Navigate to="/login" />} />
              <Route path="/" element={<Navigate to={user ? "/chat" : "/login"} />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  )
}
