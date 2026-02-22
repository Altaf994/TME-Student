// Sample login API usage:
// curl -X POST http://localhost:3000/api/v1/auth/login \
//   -H "Content-Type: application/json" \
//   -d '{
//     "username": "yourUsername",
//     "password": "YourPassword123!"
//   }'

// Parameters:
//   username: string (required)
//   password: string (required)
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import schoolImage from '../../assets/images/university.png';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async e => {
    e.preventDefault();
    setError('');
    const result = await login({ username, password });
    if (result.success) {
      toast.success('Login successful!');
      navigate('/dashboard');
    } else {
      const errorMessage = result.error || 'Invalid username or password';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-50 p-4">
      <div className="w-full max-w-4xl bg-amber-50 rounded-2xl border border-blue-200 shadow-xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - School Building Image */}
          <div className="lg:w-1/2 bg-amber-50 p-8 flex items-center justify-center border-r border-blue-200">
            <div className="text-center">
              <img
                src={schoolImage}
                alt="School Building"
                className="w-64 h-64 object-contain mx-auto"
              />
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="lg:w-1/2 bg-amber-50 p-8">
            <div className="max-w-md mx-auto">
              <h1 className="text-3xl font-bold text-black mb-8 text-center font-serif">
                Login
              </h1>
              <form onSubmit={handleLogin} className="space-y-6">
                {error && (
                  <div className="text-red-600 text-center font-semibold">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Username:
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white text-black placeholder-gray-400 italic focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-black">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-blue-600 underline hover:text-blue-800"
                    >
                      Forget password?
                    </Link>
                  </div>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white text-black placeholder-gray-400 italic focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your password here.."
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-black"
                  >
                    Remember me
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-coral-500 hover:bg-coral-600 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200 uppercase tracking-wide"
                >
                  LOGIN
                </button>

                <div className="text-center">
                  <span className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link
                      to="/register"
                      className="font-medium text-blue-600 hover:text-blue-500 underline"
                    >
                      Sign up
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

export default LoginForm;
