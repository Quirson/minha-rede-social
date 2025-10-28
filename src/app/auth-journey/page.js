// src/app/auth-journey/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, User, Lock, UserPlus, LogIn, Heart, MessageCircle, Share2, Users, ArrowRight, ArrowLeft, Check, Upload, Camera, MapPin, Calendar, Briefcase, Star, Shield, Zap, Globe, Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';

const AuthJourneyPage = () => {
    const [currentStep, setCurrentStep] = useState('welcome');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const router = useRouter();

    // Estado para todos os formulários
    const [loginData, setLoginData] = useState({ identifier: '', password: '' });
    const [registerData, setRegisterData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
    const [verificationCode, setVerificationCode] = useState(new Array(6).fill(''));
    const [profileData, setProfileData] = useState({ displayName: '', bio: '', location: '', dateOfBirth: '' });

    // Lógicas de submissão
    const handleLogin = async (e) => {
        e.preventDefault(); setLoading(true); setErrors({});
        const result = await signIn('credentials', { redirect: false, ...loginData });
        setLoading(false);
        if (result.error) setErrors({ general: "Credenciais inválidas." });
        else router.push('/');
    };

    const handleRegister = async (e) => {
        e.preventDefault(); setLoading(true); setErrors({});
        if (registerData.password !== registerData.confirmPassword) {
            setErrors({ confirmPassword: 'Senhas não conferem' });
            setLoading(false); return;
        }
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/custom-auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registerData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Erro ao registrar.');
            setCurrentStep('verify');
        } catch (err) { setErrors({ general: err.message }); }
        finally { setLoading(false); }
    };

    const handleVerifyAndProfile = async (e) => {
        e.preventDefault(); setLoading(true); setErrors({});
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/custom-auth/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: registerData.email,
                    verificationCode: verificationCode.join(''),
                    profileData: profileData
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Erro na verificação.');

            // Com o JWT retornado, podemos fazer o login para estabelecer a sessão do NextAuth
            const loginResult = await signIn('credentials', { redirect: false, identifier: registerData.email, password: registerData.password });
            if (loginResult.error) throw new Error("Falha no login automático.");

            router.push('/');

        } catch (err) { setErrors({ profile: err.message }); }
        finally { setLoading(false); }
    };

    // Renderização condicional baseada na sua UI magnífica
    if (currentStep === 'welcome') return <div /* SEU JSX DE WELCOME AQUI */ onClick={() => setCurrentStep('auth')} ></div>;
    if (currentStep === 'verify') return <div /* SEU JSX DE VERIFY AQUI */ ></div>;
    if (currentStep === 'profile') return <form onSubmit={handleVerifyAndProfile} /* SEU JSX DE PROFILE AQUI */ ></form>;

    // Auth Step
    return <div /* SEU JSX DE AUTH AQUI */ >{isLogin ? <form onSubmit={handleLogin}></form> : <form onSubmit={handleRegister}></form>}</div>;
};

export default AuthJourneyPage;