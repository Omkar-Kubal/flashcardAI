'use client';

import { useAuth } from '@/lib/auth';

interface HeaderProps {
    breadcrumb?: string;
}

export default function Header({ breadcrumb = 'Dashboard' }: HeaderProps) {
    const { user } = useAuth();

    return (
        <header className="flex items-center justify-between px-6 py-4 border-b border-[#233648] bg-[#111a22]/95 backdrop-blur-sm z-10">
            <div className="flex items-center gap-4">
                {/* Mobile menu button */}
                <button className="md:hidden text-[#92adc9] hover:text-white">
                    <span className="material-symbols-outlined">menu</span>
                </button>

                {/* Breadcrumb */}
                <div className="hidden md:flex items-center gap-2 text-[#92adc9] text-sm">
                    <span>Home</span>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    <span className="text-white font-medium">{breadcrumb}</span>
                </div>
            </div>

            <div className="flex items-center gap-6">
                {/* Search */}
                <div className="relative hidden sm:block">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#92adc9] material-symbols-outlined text-[20px]">
                        search
                    </span>
                    <input
                        type="text"
                        placeholder="Search decks..."
                        className="bg-[#233648] border-none text-white text-sm rounded-lg pl-10 pr-4 py-2 w-64 focus:ring-2 focus:ring-[#FACC15] placeholder:text-[#92adc9]/70"
                    />
                </div>

                <div className="flex items-center gap-3">
                    {/* Notifications */}
                    <button className="w-10 h-10 rounded-lg flex items-center justify-center text-[#92adc9] hover:bg-[#233648] hover:text-white transition-colors relative">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-[#111a22]"></span>
                    </button>

                    {/* Profile */}
                    {user && (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FACC15] to-[#F59E0B] flex items-center justify-center text-[#101922] font-bold cursor-pointer border-2 border-[#233648]">
                            {user.username[0].toUpperCase()}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
