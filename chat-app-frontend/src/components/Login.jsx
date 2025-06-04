// src/components/Login.jsx
import { useState } from 'react';
import axios from 'axios';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:4000/api/auth/login', form);
      localStorage.setItem('token', res.data.token);
      onLogin(res.data.user);
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="flex-1 p-8 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="username"
          placeholder="Username"
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
        <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
          Login
        </button>
      </form>
    </div>
  );
}
