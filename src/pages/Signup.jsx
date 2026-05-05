import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('MEMBER'); // Default role
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Hit your backend register route
      await axios.post('https://task-manager-backend-production-38f6.up.railway.app/api/auth/register', { 
        name, email, password, role 
      });
      // On success, send them to login
      alert("Account created successfully! Please log in.");
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form onSubmit={handleSignup} className="p-8 bg-white shadow-lg rounded-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
          <p className="text-gray-500 mt-2">Join the team task manager</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
          <input 
            type="text" placeholder="John Doe" required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            onChange={(e) => setName(e.target.value)} 
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
          <input 
            type="email" placeholder="john@example.com" required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
          <input 
            type="password" placeholder="••••••••" required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">Role</label>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
          >
            <option value="MEMBER">Team Member</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition duration-200">
          Sign Up
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/" className="text-blue-600 hover:text-blue-800 font-semibold transition">
              Log in here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}