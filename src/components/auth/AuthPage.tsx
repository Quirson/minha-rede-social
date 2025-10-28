'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, User, Lock, UserPlus, LogIn, Heart, MessageCircle, Share2, Users, CheckCircle, Smartphone } from 'lucide-react';

const AuthPage = () => {
    const { login, sendVerificationCode, verifyEmail } = useAuth();
    const router = useRouter();

    const [isLogin, setIsLogin] = useState(true);
    const [step, setStep] = useState('auth');
    const [emailForVerification, setEmailForVerification] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [registerData, setRegisterData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
    const [verificationCode, setVerificationCode] = useState('');

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

    const renderAuthForm = () => (
        <>
            <div className="flex bg-white/5 rounded-xl p-1 mb-8">
                <button onClick={() => setIsLogin(true)} className={`flex-1 py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${isLogin ? 'bg-white/20 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}><LogIn className="w-4 h-4" /><span>Login</span></button>
                <button onClick={() => setIsLogin(false)} className={`flex-1 py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${!isLogin ? 'bg-white/20 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}><UserPlus className="w-4 h-4" /><span>Registrar</span></button>
            </div>
            <form onSubmit={isLogin ? handleLoginSubmit : handleRegisterSubmit}>
                {isLogin ? (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-200 mb-2">Email ou Username</label>
                            <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="text" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm" placeholder="Digite seu email ou username" required /></div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-200 mb-2">Senha</label>
                            <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input type={'password'} value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm" placeholder="Digite sua senha" required /></div>
                        </div>
                        {errors.general && <div className="text-red-400 text-sm text-center bg-red-500/10 py-2 px-4 rounded-lg border border-red-500/20">{errors.general}</div>}
                        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">{loading ? <div className="flex items-center justify-center"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>Entrando...</div> : 'Entrar'}</button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div><label className="block text-sm font-medium text-gray-200 mb-2">Username</label><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="text" value={registerData.username} onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm" placeholder="Escolha um username" required /></div></div>
                        <div><label className="block text-sm font-medium text-gray-200 mb-2">Email</label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="email" value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm" placeholder="Digite seu email" required /></div></div>
                        <div><label className="block text-sm font-medium text-gray-200 mb-2">Senha</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input type={'password'} value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm" placeholder="Crie uma senha" required /></div></div>
                        <div><label className="block text-sm font-medium text-gray-200 mb-2">Confirmar Senha</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input type={'password'} value={registerData.confirmPassword} onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })} className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm" placeholder="Confirme sua senha" required /></div>{errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}</div>
                        {errors.general && <div className="text-red-400 text-sm text-center bg-red-500/10 py-2 px-4 rounded-lg border border-red-500/20">{errors.general}</div>}
                        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">{loading ? <div className="flex items-center justify-center"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>Registrando...</div> : 'Criar Conta'}</button>
                    </div>
                )}
            </form>
        </>
    );

    const renderVerifyForm = () => (
        <form onSubmit={handleVerifySubmit} className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Verifique seu Email</h2>
                <p className="text-gray-300">Enviamos um código de 6 dígitos para <span className="text-purple-300 font-bold">{emailForVerification}</span>. Insira-o abaixo para continuar.</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Código de Verificação</label>
                <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm tracking-widest text-center text-lg"
                        placeholder="_ _ _ _ _ _"
                        maxLength={6}
                        required
                    />
                </div>
            </div>
            {errors.general && <div className="text-red-400 text-sm text-center bg-red-500/10 py-2 px-4 rounded-lg border border-red-500/20">{errors.general}</div>}
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? <div className="flex items-center justify-center"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>Verificando...</div> : 'Verificar'}
            </button>
            <div className="text-center mt-4">
                <button type="button" onClick={handleResendCode} className="text-sm text-gray-400 hover:text-white transition-colors duration-200">Não recebeu o código? Reenviar</button>
            </div>
        </form>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex">
            {/* Lado Esquerdo */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm"></div>
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>
                <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
                    <div className="w-40 h-40  backdrop-blur-md rounded-2xl flex items-center justify-center /40">
                        <img src="/images/logo.png" alt="Social Deal LOGO"/>
                    </div>
                    <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Social Deal</h1>
                    <p className="text-xl text-gray-300 mb-12 text-center max-w-md">Compartilhe momentos, descubra produtos incríveis e conecte-se com pessoas do mundo todo.</p>
                    <div className="grid grid-cols-2 gap-6 max-w-lg">
                        <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10"><Heart className="text-pink-400 w-6 h-6" /><span>Posts e Stories</span></div>
                        <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10"><MessageCircle className="text-blue-400 w-6 h-6" /><span>Chat em Tempo Real</span></div>
                        <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10"><Share2 className="text-green-400 w-6 h-6" /><span>Marketplace</span></div>
                        <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10"><Users className="text-purple-400 w-6 h-6" /><span>Grupos</span></div>
                    </div>
                </div>
            </div>

            {/* Lado Direito */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
                        {step === 'auth' && (
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-white mb-2">{isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta'}</h2>
                                <p className="text-gray-300">{isLogin ? 'Faça login para continuar' : 'Junte-se à nossa comunidade'}</p>
                            </div>
                        )}
                        {step === 'auth' && renderAuthForm()}
                        {step === 'verify' && renderVerifyForm()}
                        <div className="mt-8 text-center">
                            <p className="text-gray-400 text-sm">Ao continuar, você concorda com nossos <a href="#" className="text-purple-400 hover:text-purple-300 underline">Termos de Serviço</a> e <a href="#" className="text-purple-400 hover:text-purple-300 underline">Política de Privacidade</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
