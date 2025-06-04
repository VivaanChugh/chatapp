"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useParams } from "react-router-dom"
import { MessageCircle, Send } from "lucide-react"

export default function DMs({ user }) {
  const [friends, setFriends] = useState([])
  const [messages, setMessages] = useState([])
  const [msg, setMsg] = useState("")
  const [currentFriend, setCurrentFriend] = useState(null)
  const [loading, setLoading] = useState(false)
  const { friendId } = useParams()

  const token = localStorage.getItem("token")

  useEffect(() => {
    fetchFriends()
  }, [])

  useEffect(() => {
    if (currentFriend) {
      fetchMessages()
      const interval = setInterval(fetchMessages, 3000)
      return () => clearInterval(interval)
    }
  }, [currentFriend])

  const fetchFriends = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/friends/list", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setFriends(res.data)
      if (!currentFriend && res.data.length > 0) {
        setCurrentFriend(res.data.find((f) => f.id === Number(friendId)) || res.data[0])
      }
    } catch (err) {
      console.error("Error fetching friends:", err)
    }
  }

  const fetchMessages = async () => {
    if (!currentFriend) return
    try {
      const res = await axios.get(`http://localhost:4000/api/dms/${currentFriend.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMessages(res.data)
    } catch (err) {
      console.error("Error fetching messages:", err)
    }
  }

  const sendMessage = async () => {
    if (!msg.trim() || !currentFriend) return
    setLoading(true)
    try {
      await axios.post(
        "http://localhost:4000/api/dms",
        {
          toId: currentFriend.id,
          content: msg,
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

  return (
    <div className="flex h-screen">
      {/* Friends Sidebar */}
      <div className="w-80 glass-effect border-r border-white/10 flex flex-col animate-slide-in-right">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-purple-400" />
            Direct Messages
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-2">
          {friends.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-400 text-sm">No friends to chat with</p>
            </div>
          ) : (
            friends.map((friend) => (
              <div
                key={friend.id}
                className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  currentFriend?.id === friend.id ? "bg-purple-500/20 border border-purple-500/30" : "hover:bg-white/5"
                }`}
                onClick={() => setCurrentFriend(friend)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">{friend.username.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{friend.username}</p>
                    <p className="text-green-400 text-xs">Online</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-900/50">
        {currentFriend ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-white/10 glass-effect">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-lg">
                    {currentFriend.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{currentFriend.username}</h3>
                  <p className="text-green-400 text-sm">Online</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-4">
              {messages.map((message, index) => {
                const isOwn = message.fromId === user.id
                return (
                  <div
                    key={index}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-slide-up`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div
                      className={`message-bubble ${
                        isOwn ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-white/10"
                      } rounded-2xl px-4 py-3`}
                    >
                      <p className="text-white">{message.content}</p>
                      <p className={`text-xs mt-1 ${isOwn ? "text-purple-100" : "text-gray-400"}`}>
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
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Message Input */}
            <div className="p-6 border-t border-white/10 glass-effect">
              <div className="flex gap-3">
                <input
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder={`Message ${currentFriend.username}`}
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
                <MessageCircle className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Select a Friend</h3>
              <p className="text-gray-400">Choose a friend to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
