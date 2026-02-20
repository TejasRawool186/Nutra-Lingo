'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Loader2, Sparkles } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { sendChat } from '@/lib/api';

/**
 * Floating Chat Assistant for "Ask a Nutritionist"
 * 
 * Features:
 * - Multilingual support via Lingo.dev
 * - Context-aware answers based on scanned product
 */
export default function ChatAssistant({ contextData }) {
    const { t } = useLocale();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const toggleChat = () => setIsOpen(!isOpen);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMsg = { role: 'user', content: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        try {
            const result = await sendChat(userMsg.content, contextData);

            const aiMsg = {
                role: 'assistant',
                content: result.answer,
                originalLang: result.language
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: t('chat.error', 'Sorry, I could not connect to the nutritionist right now.')
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="chat-assistant fixed bottom-[100px] right-4 sm:right-6 z-[150]">
            {!isOpen && (
                <button
                    onClick={toggleChat}
                    className="chat-toggle-btn bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:bg-emerald-700 transition-all transform hover:scale-105 flex items-center justify-center min-w-[56px] min-h-[56px]"
                    aria-label={t('chat.open', 'Ask a Nutritionist')}
                >
                    <MessageCircle size={28} />
                </button>
            )}

            {isOpen && (
                <div className="chat-window bg-white dark:bg-slate-900 w-[calc(100vw-2rem)] sm:w-[380px] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-[500px] max-h-[70dvh] transition-all animate-in slide-in-from-bottom-5">
                    {/* Header */}
                    <div className="chat-header shrink-0 bg-gradient-to-r from-emerald-600 to-emerald-500 p-4 text-white flex justify-between items-center z-10">
                        <div className="flex items-center gap-2">
                            <Sparkles size={20} className="text-yellow-300 drop-shadow-sm" />
                            <h3 className="font-bold text-lg leading-tight">{t('chat.title', 'Nutritionist AI')}</h3>
                        </div>
                        <button onClick={toggleChat} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="chat-messages flex-1 p-4 overflow-y-auto overflow-x-hidden bg-slate-50 dark:bg-slate-950 flex flex-col gap-4 relative">
                        {messages.length === 0 && (
                            <div className="text-center text-slate-500 dark:text-slate-400 mt-8 mb-4 px-4">
                                <p className="mb-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">👋 {t('chat.welcome', 'Hi! I can answer questions about this product in your language.')}</p>
                                <p className="text-xs opacity-60 text-slate-500 dark:text-slate-400">{t('chat.poweredBy', 'Powered by Lingo.dev')}</p>
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`message p-3 rounded-2xl max-w-[85%] text-[14px] leading-relaxed shadow-sm break-words ${msg.role === 'user'
                                    ? 'bg-emerald-100 dark:bg-emerald-800 text-emerald-950 dark:text-emerald-50 self-end rounded-br-sm'
                                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700/50 border text-slate-800 dark:text-slate-100 self-start rounded-bl-sm'
                                    }`}
                            >
                                {msg.content}
                            </div>
                        ))}

                        {isLoading && (
                            <div className="self-start bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-bl-sm border border-slate-100 dark:border-slate-700/50 shadow-sm flex items-center justify-center min-w-[48px] min-h-[44px]">
                                <Loader2 size={18} className="animate-spin text-emerald-600 dark:text-emerald-400" />
                            </div>
                        )}
                        <div ref={messagesEndRef} className="h-4 w-full shrink-0" />
                    </div>

                    {/* Input Area */}
                    <div className="chat-input shrink-0 p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2 items-center z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] w-full">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder={t('chat.placeholder', 'Ask a question...')}
                            className="flex-1 bg-slate-100 dark:bg-slate-800/80 border border-transparent rounded-full px-4 py-2.5 text-[14px] text-slate-900 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-400 focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all shadow-inner w-full min-w-0"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isLoading}
                            className="p-2.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 flex items-center justify-center shrink-0 min-w-[38px] min-h-[38px]"
                            aria-label="Send message"
                        >
                            <Send size={18} className={isLoading ? "opacity-50" : ""} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
