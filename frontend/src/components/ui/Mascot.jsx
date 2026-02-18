'use client';

import { useState, useEffect } from 'react';
import { useLocale } from '@/context/LocaleContext';
import { Quote } from 'lucide-react';
import Image from 'next/image';

/**
 * Friendly Mascot Component
 * Displays a character on the right side of the screen that cycles through
 * health tips in the current language.
 */
export default function Mascot() {
    const { t, locale } = useLocale();
    const [tipIndex, setTipIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Get tips from translation file or use defaults
    const tips = t('mascot.tips', [
        "Drink plenty of water!",
        "Eat more colorful vegetables!",
        "Limit sugar intake.",
        "Get enough sleep!"
    ]);

    // Cycle tips every 8 seconds
    useEffect(() => {
        if (!isMounted) return;

        // Show bubble
        const showTimeout = setTimeout(() => setIsVisible(true), 1000);

        const interval = setInterval(() => {
            setIsVisible(false); // Hide first
            setTimeout(() => {
                setTipIndex((prev) => (prev + 1) % tips.length);
                setIsVisible(true); // Show new tip
            }, 500); // Wait for fade out
        }, 8000);

        return () => {
            clearTimeout(showTimeout);
            clearInterval(interval);
        };
    }, [tips.length, isMounted]);

    // Current tip
    const currentTip = tips[tipIndex];

    if (!isMounted) return null; // Avoid hydration mismatch

    return (
        <div className="mascot-container fixed bottom-32 right-8 z-40 flex flex-col items-end pointer-events-none">
            {/* Speech Bubble */}
            <div
                className={`mascot-bubble relative mr-12 bg-emerald-600 dark:bg-emerald-700 p-6 rounded-3xl rounded-br-sm shadow-2xl mb-4 w-auto max-w-[320px] transition-all duration-500 transform ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
            >
                {/* Tail */}
                <div className="absolute -bottom-3 right-8 w-8 h-8 bg-emerald-600 dark:bg-emerald-700 transform rotate-45 rounded-sm"></div>

                <div className="flex gap-4 relative z-10 items-start">
                    <Quote size={24} className="text-emerald-200 shrink-0 transform rotate-180 mt-1" />
                    <p className="text-lg font-medium text-white leading-relaxed">
                        {currentTip}
                    </p>
                </div>
            </div>

            {/* Mascot Image */}
            <div className="mascot-image relative w-56 h-56 sm:w-72 sm:h-72 filter drop-shadow-2xl transition-transform hover:scale-105 pointer-events-auto cursor-pointer" onClick={() => setIsVisible(true)}>
                {/* 
                    Using a simple bounce animation 
                    If no image exists, this will show alt text, but we'll try to use a placeholder or the provided one if available.
                    For now, assuming 'mascot.png' is in public folder.
                 */}
                <img
                    src="/nutra.png"
                    alt="NutraLingo Mascot"
                    className="w-full h-full object-contain animate-bounce-slow"
                    onError={(e) => {
                        e.target.style.display = 'none'; // Hide if missing
                        e.target.parentNode.innerHTML = '<span class="text-8xl">🥑</span>'; // Fallback emoji
                    }}
                />
            </div>

            <style jsx>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
}
