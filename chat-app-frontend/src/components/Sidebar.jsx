"use client"

import { Link, useLocation } from "react-router-dom"
import { MessageCircle, Users, Send, LogOut, Hash } from "lucide-react"

export default function Sidebar({ onLogout }) {
  const location = useLocation()

  return (
    <aside className="w-72 glass-effect border-r border-white/10 flex flex-col animate-slide-in-right">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">ChatApp</h1>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <SidebarLink to="/chat" label="Channels" icon={Hash} active={location.pathname.startsWith("/chat")} />
        <SidebarLink to="/friends" label="Friends" icon={Users} active={location.pathname.startsWith("/friends")} />
        <SidebarLink to="/dms/0" label="Direct Messages" icon={Send} active={location.pathname.startsWith("/dms")} />
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 group"
          onClick={onLogout}
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}

function SidebarLink({ to, label, icon: Icon, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
        active
          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
          : "text-gray-300 hover:text-white hover:bg-white/5"
      }`}
    >
      <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${active ? "text-purple-400" : ""}`} />
      <span className="font-medium">{label}</span>
    </Link>
  )
}
