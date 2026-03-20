import React, { useState } from 'react';
import { sileo } from 'sileo';
import { validatePassword, authenticateUser, registerUser, getPasswordStrength } from '../utils/auth.js';
import { LogIn, UserPlus, Check, X, Eye, EyeOff, Shield, Zap, Users } from 'lucide-react';

const LoginPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordValidations, setPasswordValidations] = useState([]);

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    
    if (!isLogin) {
      const validations = [
        { label: '8-12 caracteres', test: value.length >= 8 && value.length <= 12 },
        { label: 'Mayúscula', test: /[A-Z]/.test(value) },
        { label: 'Minúscula', test: /[a-z]/.test(value) },
        { label: 'Número', test: /[0-9]/.test(value) },
        { label: 'Carácter especial', test: /[!@#$%^&*(),.?":{}|<>]/.test(value) }
      ];
      setPasswordValidations(validations);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = 'El usuario es requerido';
    } else if (username.length < 3) {
      newErrors.username = 'Mínimo 3 caracteres';
    }

    if (isLogin) {
      if (!password) {
        newErrors.password = 'La contraseña es requerida';
      }

      if (Object.keys(newErrors).length === 0) {
        const result = authenticateUser(username, password);
        if (result.success) {
          sileo.success({
            title: '¡Bienvenido!',
            description: `Has iniciado sesión como ${result.user.username}`
          });
          onLogin(result.user);
        } else {
          sileo.error({
            title: 'Error de autenticación',
            description: 'Usuario o contraseña incorrectos'
          });
          setErrors({ general: result.error });
        }
      } else {
        setErrors(newErrors);
      }
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        newErrors.password = 'La contraseña no cumple los requisitos';
      }

      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }

      if (Object.keys(newErrors).length === 0) {
        const result = registerUser(username, password);
        if (result.success) {
          sileo.success({
            title: 'Registro exitoso',
            description: 'Ahora puedes iniciar sesión con tus credenciales'
          });
          setIsLogin(true);
          setPassword('');
          setConfirmPassword('');
          setPasswordValidations([]);
        } else {
          sileo.error({
            title: 'Error en registro',
            description: result.error
          });
          setErrors({ username: result.error });
        }
      } else {
        setErrors(newErrors);
      }
    }
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 rounded-2xl mb-4 shadow-lg shadow-orange-600/30">
            <span className="text-white font-bold text-2xl">M</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">MiniStore</h1>
          <p className="text-slate-400">
            {isLogin ? 'Inicia sesión para continuar' : 'Crea tu cuenta'}
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 shadow-2xl">
          <div className="flex space-x-2 mb-6">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setErrors({}); setPasswordValidations([]); }}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
                isLogin 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Ingresar</span>
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setErrors({}); setPasswordValidations([]); }}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
                !isLogin 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Registro</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setErrors({...errors, username: ''}); }}
                className={`w-full px-4 py-3 rounded-xl bg-slate-900/50 border ${
                  errors.username ? 'border-red-500' : 'border-slate-600'
                } text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none transition-colors`}
                placeholder="Nombre de usuario"
              />
              {errors.username && (
                <p className="text-red-400 text-sm mt-1 flex items-center">
                  <X className="w-4 h-4 mr-1" />
                  {errors.username}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  className={`w-full px-4 py-3 pr-12 rounded-xl bg-slate-900/50 border ${
                    errors.password ? 'border-red-500' : 'border-slate-600'
                  } text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none transition-colors`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1 flex items-center">
                  <X className="w-4 h-4 mr-1" />
                  {errors.password}
                </p>
              )}
            </div>

            {!isLogin && password && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Seguridad de contraseña</span>
                  <span className={strength.label === 'Fuerte' ? 'text-green-400' : strength.label === 'Media' ? 'text-yellow-400' : 'text-red-400'}>
                    {strength.label}
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${password.length > 0 ? Math.min((password.length / 12) * 100, 100) : 0}%` }}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {passwordValidations.map((validation, index) => (
                    <div 
                      key={index}
                      className={`flex items-center space-x-2 text-xs ${
                        validation.test ? 'text-green-400' : 'text-slate-500'
                      }`}
                    >
                      {validation.test ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <X className="w-3 h-3" />
                      )}
                      <span>{validation.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Confirmar Contraseña
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setErrors({...errors, confirmPassword: ''}); }}
                  className={`w-full px-4 py-3 rounded-xl bg-slate-900/50 border ${
                    errors.confirmPassword ? 'border-red-500' : 'border-slate-600'
                  } text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none transition-colors`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <X className="w-4 h-4 mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-orange-600/30 hover:shadow-orange-600/50 flex items-center justify-center space-x-2"
            >
              {isLogin ? (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Iniciar Sesión</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Crear Cuenta</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-4">
            <Shield className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Seguro</p>
          </div>
          <div className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-4">
            <Zap className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Rápido</p>
          </div>
          <div className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-4">
            <Users className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Fácil</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;