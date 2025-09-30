import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface LoginProps {
  onLogin: () => void;
}

const LOGO_LIGHT = 'https://i.imgur.com/GxFYJQt.png';
const LOGO_DARK = 'https://i.imgur.com/zVTjKN8.png';


const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { theme } = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    // Mock authentication check
    if (email === 'teste@email.com' && password === 'senha123') {
        setError('');
        onLogin();
    } else {
        setError('Email ou senha inválidos. (Use teste@email.com e senha123)');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <img src={theme === 'light' ? LOGO_LIGHT : LOGO_DARK} alt="FaceCourses Logo" className="h-10 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Acesse sua conta</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mt-2 mb-6">
          Bem-vindo de volta!
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@exemplo.com"
                    className="mt-1 w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                />
            </div>
            <div>
                <label htmlFor="password"className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1 w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                />
            </div>

            {error && <p className="text-red-500 text-xs text-center">{error}</p>}

            <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-300"
            >
                Entrar
            </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
