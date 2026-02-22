import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import schoolImage from '../../assets/images/university.png';

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [section, setSection] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async e => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }

    try {
      const base =
        process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:3000/api';
      await axios.post(`${base}/v1/auth/register`, {
        username,
        email,
        firstName,
        lastName,
        password,
        confirmPassword,
        role,
        studentId,
        section,
      });

      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (apiError) {
      const msg = apiError.response?.data?.message || 'Registration failed';
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-50 p-4">
      <div className="w-full max-w-4xl bg-amber-50 rounded-2xl border border-blue-200 shadow-xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-1/2 bg-amber-50 p-8 flex items-center justify-center border-r border-blue-200">
            <div className="text-center">
              <img
                src={schoolImage}
                alt="School Building"
                className="w-64 h-64 object-contain mx-auto"
              />
            </div>
          </div>

          <div className="lg:w-1/2 bg-amber-50 p-8">
            <div className="max-w-md mx-auto">
              <h1 className="text-3xl font-bold text-black mb-8 text-center font-serif">
                Sign up
              </h1>
              <form onSubmit={handleRegister} className="space-y-6">
                {error && (
                  <div className="text-red-600 text-center font-semibold">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white text-black placeholder-gray-400 italic focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white text-black placeholder-gray-400 italic focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-black mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white text-black placeholder-gray-400 italic focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your first name"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-black mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white text-black placeholder-gray-400 italic focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your last name"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Student ID
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white text-black placeholder-gray-400 italic focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your student ID"
                    value={studentId}
                    onChange={e => setStudentId(e.target.value)}
                    required
                  />
                </div>

                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-black mb-2">
                      Role
                    </label>
                    <select
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white text-black focus:outline-none"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-black mb-2">
                      Section
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white text-black placeholder-gray-400 italic focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Section (e.g. A1)"
                      value={section}
                      onChange={e => setSection(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white text-black placeholder-gray-400 italic focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Choose a password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white text-black placeholder-gray-400 italic focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-coral-500 hover:bg-coral-600 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200 uppercase tracking-wide"
                >
                  REGISTER
                </button>

                <div className="text-center">
                  <span className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="font-medium text-blue-600 hover:text-blue-500 underline"
                    >
                      Login
                    </Link>
                  </span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
