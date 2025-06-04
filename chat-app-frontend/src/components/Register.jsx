// src/components/Register.jsx
import { useState } from 'react';
import axios from 'axios';

export default function Register() {
  const [form, setForm] = useState({ username: '', password: '' });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:4000/api/auth/register', form);
      alert('Registration successful! You can now login.');
    } catch (err) {
      alert(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="flex-1 p-8 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
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
        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
          Register
        </button>
      </form>
    </div>
  );
}
