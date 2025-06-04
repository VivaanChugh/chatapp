// src/components/Chat.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Chat({ user }) {
  const [channels, setChannels] = useState([]);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState('');
  const [newChannel, setNewChannel] = useState('');
  const [friendId, setFriendId] = useState('');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/channels', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChannels(res.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching channels:', err);
        setError('Failed to fetch channels. Please try again soon.');
      }
    };
    fetchChannels();
  }, []);

  useEffect(() => {
    if (currentChannel) {
      const fetchMessages = async () => {
        try {
          const res = await axios.get(`http://localhost:4000/api/messages/${currentChannel.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('Received messages:', res.data);
          setMessages(res.data);
          setError(null);
        } catch (err) {
          console.error('Error fetching messages:', err);
          setError('Failed to fetch messages. Please try again.');
        }
      };

      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [currentChannel]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data.filter((u) => u.id !== user.id));
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to fetch users. Please try again.');
      }
    };
    fetchUsers();
  }, [user.id]);

  const sendMessage = async () => {
    if (!msg.trim()) return;
    try {
      await axios.post(
        'http://localhost:4000/api/messages',
        {
          content: msg,
          channelId: currentChannel.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMsg('');
      setError(null);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  };

  const createChannel = async () => {
    if (!newChannel.trim()) return;
    try {
      const res = await axios.post(
        'http://localhost:4000/api/channels/create',
        { name: newChannel },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChannels((prev) => [...prev, res.data]);
      setNewChannel('');
      setError(null);
    } catch (err) {
      console.error('Error creating channel:', err);
      setError(err.response?.data?.error || 'Failed to create channel');
    }
  };

  const joinChannel = (channelId) => {
    axios
      .post(
        'http://localhost:4000/api/channels/join',
        { channelId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => setCurrentChannel(channels.find((c) => c.id === channelId)));
  };

  const addFriend = () => {
    if (!friendId) return;
    axios
      .post(
        'http://localhost:4000/api/users/friend',
        { friendId: Number(friendId) },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => setFriendId(''));
  };

  return (
    <div className="grid grid-cols-4 h-screen">
      <div className="bg-gray-100 p-4 overflow-y-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <h2 className="text-xl font-bold mb-4">Channels</h2>
        {channels.map((c) => (
          <div
            key={c.id}
            onClick={() => setCurrentChannel(c)}
            className={`cursor-pointer p-2 rounded hover:bg-gray-200 ${
              currentChannel?.id === c.id ? 'bg-gray-300 font-semibold' : ''
            }`}
          >
            #{c.name}
            <button className="ml-2 text-xs text-blue-600 underline" onClick={(e) => { e.stopPropagation(); joinChannel(c.id); }}>Join</button>
          </div>
        ))}
        <div className="mt-4">
          <input
            value={newChannel}
            onChange={(e) => setNewChannel(e.target.value)}
            placeholder="New channel name"
            className="w-full p-2 border border-gray-300 rounded"
          />
          <button className="w-full mt-2 bg-blue-500 text-white py-1 rounded" onClick={createChannel}>
            Create Channel
          </button>
        </div>
        <div className="mt-8">
          <h3 className="font-bold mb-2">Add Friend</h3>
          <select
            className="w-full mb-2 p-2 border rounded"
            value={friendId}
            onChange={(e) => setFriendId(e.target.value)}
          >
            <option value="">Select user...</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.username}</option>
            ))}
          </select>
          <button
            className="w-full bg-green-500 text-white py-1 rounded"
            onClick={addFriend}
            disabled={!friendId}
          >
            Add Friend
          </button>
        </div>
      </div>
      <div className="col-span-3 flex flex-col bg-white">
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map((m, i) => {
            console.log('Rendering message:', m);
            return (
              <div key={i} className="text-sm flex justify-between items-center">
                <div>
                  <span className="font-bold">{m.user.username}</span>: {m.content}
                </div>
                <div className="text-gray-500 text-xs ml-4">
                  {m.createdAt ? new Date(m.createdAt).toLocaleString() : 'No date'}
                </div>
              </div>
            );
          })}
        </div>
        <div className="p-4 border-t flex">
          <input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 p-2 rounded"
          />
          <button
            onClick={sendMessage}
            className="ml-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
