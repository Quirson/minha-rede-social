'use client';

import React, { useState, Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    User,
    ShoppingBag,
    MessageCircle,
    Users,
    Search,
    Bell,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronDown,
    Plus
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { STRAPI_URL } from '@/lib/api';
import { Transition, Dialog } from '@headlessui/react';

interface MenuItem {
    id: 'feed' | 'profile' | 'marketplace' | 'messages' | 'groups';
    label: string;
    icon: React.ElementType;
    href: string;
    badge?: number;
}

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const menuItems: MenuItem[] = [
        { id: 'feed', label: 'Feed', icon: Home, href: '/feed' },
        { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, href: '/marketplace', badge: 3 },
        { id: 'messages', label: 'Mensagens', icon: MessageCircle, href: '/messages', badge: 7 },
        { id: 'groups', label: 'Grupos', icon: Users, href: '/groups', badge: 2 },
        { id: 'profile', label: 'Meu Perfil', icon: User, href: `/profile/${user?.profile?.id || ''}` },
    ];

    const userName = user?.profile?.DisplayName || 'Usuário';
    const userAvatar = user?.profile?.avatar?.url
        ? `${STRAPI_URL}${user.profile.avatar.url}`
        : `https://placehold.co/40x40/8B5CF6/FFFFFF?text=${userName.charAt(0)}`;

    return (
        <div
            className="min-h-screen"
            style={{
                background: `
                    linear-gradient(135deg, 
                        #667eea 0%, 
                        #764ba2 100%
                    ),
                    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20v-40c11.046 0 20 8.954 20 20z'/%3E%3C/g%3E%3C/svg%3E")`
            }}
        >
            {/* Sidebar Mobile com Design Moderno */}
            <Transition.Root show={isMobileMenuOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50 lg:hidden" onClose={setIsMobileMenuOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="transition-opacity ease-linear duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-linear duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 flex">
                        <Transition.Child
                            as={Fragment}
                            enter="transition ease-in-out duration-300 transform"
                            enterFrom="-translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition ease-in-out duration-300 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="-translate-x-full"
                        >
                            <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                                <div className="flex flex-grow flex-col gap-y-5 overflow-y-auto bg-white/95 backdrop-blur-xl px-6 pb-4 shadow-2xl">
                                    {/* Logo com efeito glassmorphism */}
                                    <div className="flex h-16 shrink-0 items-center gap-x-3 border-b border-gray-200/50">
                                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                                            SD
                                        </div>
                                        <div>
                                            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                                Social Deal
                                            </span>
                                            <div className="text-xs text-gray-500 font-medium">Professional</div>
                                        </div>
                                    </div>

                                    {/* User Profile Card */}
                                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                                        <div className="flex items-center space-x-3">
                                            <div className="relative">
                                                <img
                                                    src={userAvatar}
                                                    alt={userName}
                                                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-white shadow-md"
                                                />
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 truncate">{userName}</h3>
                                                <p className="text-sm text-gray-500">Online agora</p>
                                            </div>
                                        </div>
                                    </div>

                                    <nav className="flex flex-1 flex-col">
                                        <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                            <li>
                                                <ul role="list" className="-mx-2 space-y-2">
                                                    {menuItems.map((item) => {
                                                        const isActive = pathname === item.href;
                                                        return (
                                                            <li key={item.id}>
                                                                <Link
                                                                    href={item.href}
                                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                                    className={`group flex items-center gap-x-3 rounded-xl p-3 text-sm leading-6 font-semibold transition-all duration-200 ${
                                                                        isActive
                                                                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                                                                            : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                                                                    }`}
                                                                >
                                                                    <item.icon className={`h-5 w-5 shrink-0 ${
                                                                        isActive ? 'text-white' : 'text-gray-400 group-hover:text-indigo-500'
                                                                    }`} />
                                                                    <span className="flex-1">{item.label}</span>
                                                                    {item.badge && (
                                                                        <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full ${
                                                                            isActive
                                                                                ? 'bg-white/20 text-white'
                                                                                : 'bg-red-500 text-white'
                                                                        }`}>
                                                                            {item.badge}
                                                                        </span>
                                                                    )}
                                                                </Link>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </li>

                                            {/* Quick Actions */}
                                            <li>
                                                <div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wider mb-2">
                                                    Ações Rápidas
                                                </div>
                                                <div className="space-y-2">
                                                    <button className="group flex w-full items-center gap-x-3 rounded-xl p-3 text-sm font-semibold text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200">
                                                        <Plus className="h-5 w-5 text-gray-400 group-hover:text-indigo-500" />
                                                        Criar Post
                                                    </button>
                                                    <button className="group flex w-full items-center gap-x-3 rounded-xl p-3 text-sm font-semibold text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200">
                                                        <Settings className="h-5 w-5 text-gray-400 group-hover:text-indigo-500" />
                                                        Configurações
                                                    </button>
                                                </div>
                                            </li>

                                            <li className="mt-auto">
                                                <button
                                                    onClick={logout}
                                                    className="group flex w-full items-center gap-x-3 rounded-xl p-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all duration-200"
                                                >
                                                    <LogOut className="h-5 w-5 text-red-500" />
                                                    Sair
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>

            <div className="lg:pl-72">
                {/* Top Navigation Bar com Glass Effect */}
                <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 bg-white/80 backdrop-blur-xl px-4 shadow-lg border-b border-white/20 sm:gap-x-6 sm:px-6 lg:px-8">
                    <button
                        type="button"
                        className="-m-2.5 p-2.5 text-gray-700 hover:text-indigo-600 lg:hidden transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    <div className="h-6 w-px bg-gray-300 lg:hidden" />

                    <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                        {/* Search Bar com Design Moderno */}
                        <form className="relative flex flex-1 max-w-md">
                            <div className="relative w-full">
                                <Search className="pointer-events-none absolute inset-y-0 left-3 h-full w-5 text-gray-400" />
                                <input
                                    className="block h-full w-full rounded-xl border-0 bg-gray-50 py-0 pl-10 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 sm:text-sm"
                                    placeholder="Pesquisar posts, pessoas..."
                                    type="search"
                                />
                            </div>
                        </form>

                        <div className="flex items-center gap-x-4 lg:gap-x-6">
                            {/* Notification Bell */}
                            <button className="relative -m-2.5 p-2.5 text-gray-400 hover:text-indigo-600 transition-colors duration-200">
                                <Bell className="h-6 w-6" />
                                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    3
                                </span>
                            </button>

                            <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-300" />

                            {/* User Menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-x-3 rounded-xl px-3 py-2 hover:bg-gray-50 transition-all duration-200"
                                >
                                    <img
                                        src={userAvatar}
                                        alt={userName}
                                        className="h-8 w-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                                    />
                                    <span className="hidden lg:block text-sm font-semibold text-gray-900">{userName}</span>
                                    <ChevronDown className="hidden lg:block h-4 w-4 text-gray-400" />
                                </button>

                                {showUserMenu && (
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                                        <Link href={`/profile/${user?.profile?.id}`} className="flex items-center gap-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                            <User className="h-4 w-4 text-gray-400" />
                                            Ver Perfil
                                        </Link>
                                        <Link href="/settings" className="flex items-center gap-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                            <Settings className="h-4 w-4 text-gray-400" />
                                            Configurações
                                        </Link>
                                        <hr className="my-2 border-gray-200" />
                                        <button onClick={logout} className="flex w-full items-center gap-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                            <LogOut className="h-4 w-4 text-red-500" />
                                            Sair
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <main className="py-8">
                    <div className="px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>

            {/* Desktop Sidebar com Design Premium */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white/95 backdrop-blur-xl px-6 pb-4 border-r border-gray-200/50 shadow-2xl">
                    {/* Logo Premium */}
                    <div className="flex h-16 shrink-0 items-center gap-x-3 border-b border-gray-200/50">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                            SD
                        </div>
                        <div>
                            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                Social Deal
                            </span>
                            <div className="text-xs text-gray-500 font-medium">Rede Social</div>
                        </div>
                    </div>

                    {/* User Profile Card */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <img
                                    src={userAvatar}
                                    alt={userName}
                                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-white shadow-md"
                                />
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate">{userName}</h3>
                                <p className="text-sm text-gray-500">Online agora</p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex flex-1 flex-col">
                        <ul role="list" className="flex flex-1 flex-col gap-y-7">
                            <li>
                                <ul role="list" className="-mx-2 space-y-2">
                                    {menuItems.map((item) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <li key={item.id}>
                                                <Link
                                                    href={item.href}
                                                    className={`group flex items-center gap-x-3 rounded-xl p-3 text-sm leading-6 font-semibold transition-all duration-200 ${
                                                        isActive
                                                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                                                            : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                                                    }`}
                                                >
                                                    <item.icon className={`h-5 w-5 shrink-0 ${
                                                        isActive ? 'text-white' : 'text-gray-400 group-hover:text-indigo-500'
                                                    }`} />
                                                    <span className="flex-1">{item.label}</span>
                                                    {item.badge && (
                                                        <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full ${
                                                            isActive
                                                                ? 'bg-white/20 text-white'
                                                                : 'bg-red-500 text-white'
                                                        }`}>
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </li>

                            {/* Quick Actions */}
                            <li>
                                <div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wider mb-2">
                                    Ações Rápidas
                                </div>
                                <div className="space-y-2">
                                    <button className="group flex w-full items-center gap-x-3 rounded-xl p-3 text-sm font-semibold text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200">
                                        <Plus className="h-5 w-5 text-gray-400 group-hover:text-indigo-500" />
                                        Criar Post
                                    </button>
                                    <button className="group flex w-full items-center gap-x-3 rounded-xl p-3 text-sm font-semibold text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200">
                                        <Settings className="h-5 w-5 text-gray-400 group-hover:text-indigo-500" />
                                        Configurações
                                    </button>
                                </div>
                            </li>

                            <li className="mt-auto">
                                <button
                                    onClick={logout}
                                    className="group flex w-full items-center gap-x-3 rounded-xl p-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all duration-200"
                                >
                                    <LogOut className="h-5 w-5 text-red-500" />
                                    Sair
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            {/* Click outside to close user menu */}
            {showUserMenu && (
                <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowUserMenu(false)}
                />
            )}
        </div>
    );
};

export default MainLayout;