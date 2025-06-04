"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Hash, Plus, Send } from "lucide-react"

export default function Chat({ user }) {
  const [channels, setChannels] = useState([])
  const [currentChannel, setCurrentChannel] = useState(null)
  const [messages, setMessages] = useState([])
  const [msg, setMsg] = useState("")
  const [newChannel, setNewChannel] = useState("")
  const [showNewChannel, setShowNewChannel] = useState(false)
  const [loading, setLoading] = useState(false)

  const token = localStorage.getItem("token")

  useEffect(() => {
    fetchChannels()
  }, [])

  useEffect(() => {
    if (currentChannel) {
      fetchMessages()
      const interval = setInterval(fetchMessages, 3000)
      return () => clearInterval(interval)
    }
  }, [currentChannel])

  const fetchChannels = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/channels", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setChannels(res.data)
    } catch (err) {
      console.error("Error fetching channels:", err)
    }
  }

  const fetchMessages = async () => {
    if (!currentChannel) return
    try {
      const res = await axios.get(`http://localhost:4000/api/messages/${currentChannel.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMessages(res.data)
    } catch (err) {
      console.error("Error fetching messages:", err)
    }
  }

  const sendMessage = async () => {
    if (!msg.trim() || !currentChannel) return
    setLoading(true)
    try {
      await axios.post(
        "http://localhost:4000/api/messages",
        {
          content: msg,
          channelId: currentChannel.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      setMsg("")
      fetchMessages()
    } catch (err) {
      console.error("Error sending message:", err)
    } finally {
      setLoading(false)
    }
  }

  const createChannel = async () => {
    if (!newChannel.trim()) return
    try {
      const res = await axios.post(
        "http://localhost:4000/api/channels/create",
        { name: newChannel },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setChannels((prev) => [...prev, res.data])
      setNewChannel("")
      setShowNewChannel(false)
    } catch (err) {
      console.error("Error creating channel:", err)
    }
  }

  const joinChannel = async (channelId) => {
    try {
      await axios.post(
        "http://localhost:4000/api/channels/join",
        { channelId },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setCurrentChannel(channels.find((c) => c.id === channelId) || null)
    } catch (err) {
      console.error("Error joining channel:", err)
    }
  }

  return (
    <div className="flex h-screen">
      {/* Channels Sidebar */}
      <div className="w-80 glass-effect border-r border-white/10 flex flex-col animate-slide-in-right">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Hash className="w-5 h-5 text-purple-400" />
              Channels
            </h2>
            <button
              onClick={() => setShowNewChannel(!showNewChannel)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>

          {showNewChannel && (
            <div className="space-y-3 animate-slide-up">
              <input
                value={newChannel}
                onChange={(e) => setNewChannel(e.target.value)}
                placeholder="Channel name"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                onKeyPress={(e) => e.key === "Enter" && createChannel()}
              />
              <div className="flex gap-2">
                <button
                  onClick={createChannel}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowNewChannel(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-gray-300 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-2">
          {channels.map((channel) => (
            <div
              key={channel.id}
              className={`group p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                currentChannel?.id === channel.id ? "bg-purple-500/20 border border-purple-500/30" : "hover:bg-white/5"
              }`}
              onClick={() => setCurrentChannel(channel)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Hash className="w-4 h-4 text-gray-400" />
                  <span className="text-white font-medium">{channel.name}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    joinChannel(channel.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 text-xs bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded transition-all duration-200"
                >
                  Join
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-900/50">
        {currentChannel ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-white/10 glass-effect">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Hash className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{currentChannel.name}</h3>
                  <p className="text-gray-400 text-sm">Channel conversation</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-4">
              {messages.map((message, index) => (
                <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium text-sm">
                        {message.user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white">{message.user.username}</span>
                        <span className="text-xs text-gray-400">
                          {message.createdAt
  ? new Date(message.createdAt).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  : "Now"}
                        </span>
                      </div>
                      <div className="bg-white/5 rounded-xl px-4 py-3 text-gray-200">{message.content}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-6 border-t border-white/10 glass-effect">
              <div className="flex gap-3">
                <input
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder={`Message #${currentChannel.name}`}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  onKeyPress={(e) => e.key === "Enter" && !loading && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !msg.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Hash className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Select a Channel</h3>
              <p className="text-gray-400">Choose a channel to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
