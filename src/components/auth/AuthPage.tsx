'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
    Eye, EyeOff, Mail, User, Lock, UserPlus, LogIn,
    Heart, MessageCircle, Share2, Users, Smartphone,
    CheckCircle, Sparkles, Shield, Zap, Globe
} from 'lucide-react';

const AuthPage = () => {
    const { login, sendVerificationCode, verifyEmail } = useAuth();
    const router = useRouter();

    const [isLogin, setIsLogin] = useState(true);
    const [step, setStep] = useState('auth');
    const [emailForVerification, setEmailForVerification] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    // Estados dos formulários
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [registerData, setRegisterData] = useState({
        username: '', email: '', password: '', confirmPassword: ''
    });
    const [verificationCode, setVerificationCode] = useState('');

    // Efeito de partículas no background (opcional)
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        const particlesArray = Array.from({ length: 20 }, (_, i) => ({
            id: i,
            size: Math.random() * 3 + 1,
            left: Math.random() * 100,
            animationDelay: Math.random() * 20,
            duration: Math.random() * 10 + 10
        }));
        setParticles(particlesArray);
    }, []);

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        try {
            await login(loginData);
            router.push('/feed');
        } catch (error: any) {
            setErrors({ general: error.message || 'Falha ao fazer login.' });
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        if (registerData.password !== registerData.confirmPassword) {
            setErrors({ confirmPassword: 'Senhas não conferem' });
            setLoading(false);
            return;
        }

        try {
            await sendVerificationCode(registerData.email);
            setEmailForVerification(registerData.email);
            setStep('verify');
        } catch (error: any) {
            setErrors({ general: error.message || 'Falha ao registrar. Verifique os dados.' });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        try {
            await verifyEmail(emailForVerification, verificationCode, registerData);
            router.push('/create-profile');
        } catch (error: any) {
            setErrors({ general: error.message || 'Código de verificação incorreto ou expirado.' });
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        setLoading(true);
        setErrors({});
        try {
            await sendVerificationCode(emailForVerification);
        } catch (error: any) {
            setErrors({ general: 'Falha ao reenviar o código.' });
        } finally {
            setLoading(false);
        }
    };

    // Componente de Input Moderno
    // Componente de Input Moderno (CORRIGIDO)
    const InputField = ({ icon: Icon, type = 'text', value, onChange, placeholder, error, ...props }) => (
        <div className="mb-4">
            <div className="relative group">
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-focus-within:text-purple-500" />
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    className={`w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border-2 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-300 ${
                        error ? 'border-red-400' : 'border-white/20 hover:border-white/30'
                    }`}
                    placeholder={placeholder}
                    {...props}
                />
                {error && (
                    <div className="absolute -bottom-6 left-0 text-red-400 text-sm flex items-center gap-1">
                        <div className="w-4 h-4 bg-red-400 rounded-full flex items-center justify-center text-white text-xs">!</div>
                        {error}
                    </div>
                )}
            </div>
        </div>
    );

    // Botão Moderno
    const Button = ({ children, onClick, disabled, variant = 'primary', ...props }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                variant === 'primary'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
                    : 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:border-white/30'
            }`}
            {...props}
        >
            {children}
        </button>
    );

    // Renderização do formulário de Auth
    const renderAuthForm = () => (
        <div className="space-y-6">
            {/* Toggle Login/Register */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-1 border border-white/20">
                <div className="flex">
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                            isLogin
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                                : 'text-gray-300 hover:text-white'
                        }`}
                    >
                        <LogIn className="w-5 h-5" />
                        <span className="font-semibold">Login</span>
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                            !isLogin
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                                : 'text-gray-300 hover:text-white'
                        }`}
                    >
                        <UserPlus className="w-5 h-5" />
                        <span className="font-semibold">Registrar</span>
                    </button>
                </div>
            </div>

            {/* Formulário */}
            <form onSubmit={isLogin ? handleLoginSubmit : handleRegisterSubmit}>
                <div className="space-y-4">
                    {!isLogin && (
                        <InputField
                            icon={User}
                            type="text"
                            value={registerData.username}
                            onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                            placeholder="Escolha um username"
                            error={errors.username}
                            required
                        />
                    )}

                    <InputField
                        icon={Mail}
                        type="email"
                        value={isLogin ? loginData.email : registerData.email}
                        onChange={(e) => isLogin
                            ? setLoginData({ ...loginData, email: e.target.value })
                            : setRegisterData({ ...registerData, email: e.target.value })
                        }
                        placeholder="Digite seu email"
                        error={errors.email}
                        required
                    />

                    <InputField
                        icon={Lock}
                        type={showPassword ? 'text' : 'password'}
                        value={isLogin ? loginData.password : registerData.password}
                        onChange={(e) => isLogin
                            ? setLoginData({ ...loginData, password: e.target.value })
                            : setRegisterData({ ...registerData, password: e.target.value })
                        }
                        placeholder={isLogin ? "Digite sua senha" : "Crie uma senha"}
                        error={errors.password}
                        required
                    />

                    {!isLogin && (
                        <>
                            <InputField
                                icon={Lock}
                                type={showPassword ? 'text' : 'password'}
                                value={registerData.confirmPassword}
                                onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                                placeholder="Confirme sua senha"
                                error={errors.confirmPassword}
                                required
                            />

                            {/* Toggle mostrar senha */}
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="flex items-center gap-2 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    {showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                </button>
                            </div>
                        </>
                    )}

                    {errors.general && (
                        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm backdrop-blur-md">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                {errors.general}
                            </div>
                        </div>
                    )}

                    <Button disabled={loading}>
                        {loading ? (
                            <>
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                {isLogin ? 'Entrando...' : 'Registrando...'}
                            </>
                        ) : (
                            <>
                                <Zap className="w-5 h-5" />
                                {isLogin ? 'Entrar na Conta' : 'Criar Conta'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );

    // Renderização do formulário de Verificação
    const renderVerifyForm = () => (
        <div className="space-y-6">
            <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Verifique seu Email</h2>
                <p className="text-gray-300">
                    Enviamos um código de 6 dígitos para
                </p>
                <p className="text-purple-300 font-semibold text-lg mt-1">{emailForVerification}</p>
            </div>

            <form onSubmit={handleVerifySubmit}>
                <InputField
                    icon={Smartphone}
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="_ _ _ _ _ _"
                    error={errors.general}
                    maxLength={6}
                    className="text-center text-2xl tracking-widest font-mono"
                    required
                />

                {errors.general && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm backdrop-blur-md">
                        {errors.general}
                    </div>
                )}

                <Button disabled={loading || verificationCode.length !== 6}>
                    {loading ? (
                        <>
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Verificando...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-5 h-5" />
                            Verificar Código
                        </>
                    )}
                </Button>
            </form>

            <div className="text-center">
                <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={loading}
                    className="text-gray-300 hover:text-white transition-colors text-sm disabled:opacity-50"
                >
                    Não recebeu o código? <span className="text-purple-300 font-semibold">Reenviar</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
            {/* Partículas animadas no background */}
            {particles.map(particle => (
                <div
                    key={particle.id}
                    className="absolute rounded-full bg-white/10 animate-float"
                    style={{
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        left: `${particle.left}%`,
                        top: '-10px',
                        animationDelay: `${particle.animationDelay}s`,
                        animationDuration: `${particle.duration}s`
                    }}
                />
            ))}

            <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
                {/* Lado Esquerdo - Hero Section */}
                <div className="lg:w-1/2 p-8 flex items-center justify-center">
                    <div className="max-w-2xl text-center lg:text-left">
                        <div className="flex items-center justify-center lg:justify-start gap-3 mb-8">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-2xl">
                                SD
                            </div>
                            <div>
                                <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                                    Social Deal
                                </h1>
                                <p className="text-purple-200 font-semibold">Rede Social Premium</p>
                            </div>
                        </div>

                        <p className="text-xl text-gray-200 mb-8 leading-relaxed">
                            Conecte-se com pessoas incríveis, compartilhe momentos especiais e descubra produtos exclusivos em nossa comunidade.
                        </p>

                        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
                            {[
                                { icon: Heart, label: 'Posts e Stories', color: 'text-pink-400' },
                                { icon: MessageCircle, label: 'Chat em Tempo Real', color: 'text-blue-400' },
                                { icon: Share2, label: 'Marketplace', color: 'text-green-400' },
                                { icon: Users, label: 'Grupos', color: 'text-purple-400' }
                            ].map((item, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                                    <item.icon className={`w-5 h-5 ${item.color}`} />
                                    <span className="text-white text-sm font-medium">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Lado Direito - Formulário */}
                <div className="lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
                    <div className="w-full max-w-md">
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-white/20 shadow-2xl">
                            {/* Header dinâmico */}
                            <div className="text-center mb-8">
                                {step === 'auth' ? (
                                    <>
                                        <h2 className="text-3xl font-bold text-white mb-2">
                                            {isLogin ? 'Bem-vindo de volta!' : 'Junte-se a nós!'}
                                        </h2>
                                        <p className="text-gray-300">
                                            {isLogin ? 'Faça login para continuar' : 'Crie sua conta gratuitamente'}
                                        </p>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center gap-2 text-emerald-400 mb-2">
                                        <Sparkles className="w-6 h-6" />
                                        <span className="font-semibold">Verificação Necessária</span>
                                    </div>
                                )}
                            </div>

                            {/* Conteúdo do formulário */}
                            {step === 'auth' && renderAuthForm()}
                            {step === 'verify' && renderVerifyForm()}

                            {/* Footer */}
                            <div className="mt-8 pt-6 border-t border-white/10">
                                <p className="text-center text-gray-400 text-sm">
                                    Ao continuar, você concorda com nossos{' '}
                                    <a href="#" className="text-purple-300 hover:text-purple-200 underline transition-colors">
                                        Termos
                                    </a>{' '}
                                    e{' '}
                                    <a href="#" className="text-purple-300 hover:text-purple-200 underline transition-colors">
                                        Privacidade
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS para animações */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(180deg); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-float {
                    animation: float infinite linear;
                }
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default AuthPage;