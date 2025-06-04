"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Users, UserPlus, Check, X, Clock } from "lucide-react"

export default function Friends({ user }) {
  const [friends, setFriends] = useState([])
  const [pending, setPending] = useState({ sent: [], received: [] })
  const [users, setUsers] = useState([])
  const [toId, setToId] = useState("")
  const [loading, setLoading] = useState(false)

  const token = localStorage.getItem("token")

  useEffect(() => {
    fetchFriends()
    fetchPending()
    fetchUsers()
  }, [])

  const fetchFriends = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/friends/list", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setFriends(res.data)
    } catch (err) {
      console.error("Error fetching friends:", err)
    }
  }

  const fetchPending = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/friends/pending", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setPending(res.data)
    } catch (err) {
      console.error("Error fetching pending requests:", err)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUsers(res.data.filter((u) => u.id !== user.id))
    } catch (err) {
      console.error("Error fetching users:", err)
    }
  }

  const sendRequest = async () => {
    if (!toId) return
    setLoading(true)
    try {
      await axios.post(
        "http://localhost:4000/api/friends/request",
        { toId: Number(toId) },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setToId("")
      fetchPending()
    } catch (err) {
      console.error("Error sending friend request:", err)
    } finally {
      setLoading(false)
    }
  }

  const acceptRequest = async (requestId) => {
    try {
      await axios.post(
        "http://localhost:4000/api/friends/accept",
        { requestId },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      fetchFriends()
      fetchPending()
    } catch (err) {
      console.error("Error accepting request:", err)
    }
  }

  const declineRequest = async (requestId) => {
    try {
      await axios.post(
        "http://localhost:4000/api/friends/decline",
        { requestId },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      fetchPending()
    } catch (err) {
      console.error("Error declining request:", err)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Friends</h1>
          <p className="text-gray-400">Manage your connections</p>
        </div>

        {/* Add Friend */}
        <div className="glass-effect rounded-2xl p-6 animate-slide-up">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-green-400" />
            Add Friend
          </h2>
          <div className="flex gap-3">
            <select
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={toId}
              onChange={(e) => setToId(e.target.value)}
            >
              <option value="" className="bg-slate-800">
                Select user...
              </option>
              {users.map((u) => (
                <option key={u.id} value={u.id} className="bg-slate-800">
                  {u.username}
                </option>
              ))}
            </select>
            <button
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
              onClick={sendRequest}
              disabled={!toId || loading}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              Send Request
            </button>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Received Requests */}
          <div className="glass-effect rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              Received Requests
            </h3>
            <div className="space-y-3">
              {pending.received.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No pending requests</p>
              ) : (
                pending.received.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {req.from.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-white font-medium">{req.from.username}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                        onClick={() => acceptRequest(req.id)}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        onClick={() => declineRequest(req.id)}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sent Requests */}
          <div className="glass-effect rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              Sent Requests
            </h3>
            <div className="space-y-3">
              {pending.sent.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No sent requests</p>
              ) : (
                pending.sent.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {req.to.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-white font-medium">{req.to.username}</span>
                    </div>
                    <span className="text-yellow-400 text-sm font-medium">Pending</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Friends List */}
        <div className="glass-effect rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            Your Friends ({friends.length})
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {friends.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-400">No friends yet</p>
                <p className="text-gray-500 text-sm">Start by sending friend requests!</p>
              </div>
            ) : (
              friends.map((friend) => (
                <div key={friend.id} className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">{friend.username.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{friend.username}</p>
                      <p className="text-green-400 text-sm">Online</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
