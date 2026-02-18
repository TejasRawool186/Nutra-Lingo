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
        <div className="chat-assistant fixed bottom-6 right-6 z-50">
            {!isOpen && (
                <button
                    onClick={toggleChat}
                    className="chat-toggle-btn bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:bg-emerald-700 transition-all transform hover:scale-105"
                    aria-label={t('chat.open', 'Ask a Nutritionist')}
                >
                    <MessageCircle size={28} />
                </button>
            )}

            {isOpen && (
                <div className="chat-window bg-white dark:bg-slate-900 w-80 sm:w-96 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-[500px] transition-all animate-in slide-in-from-bottom-5">
                    {/* Header */}
                    <div className="chat-header bg-emerald-600 p-4 text-white flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Sparkles size={20} className="text-yellow-300" />
                            <h3 className="font-bold text-lg">{t('chat.title', 'Nutritionist AI')}</h3>
                        </div>
                        <button onClick={toggleChat} className="text-white/80 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="chat-messages flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-950 flex flex-col gap-3">
                        {messages.length === 0 && (
                            <div className="text-center text-slate-500 mt-10">
                                <p className="mb-2">👋 {t('chat.welcome', 'Hi! I can answer questions about this product in your language.')}</p>
                                <p className="text-xs">{t('chat.poweredBy', 'Powered by Lingo.dev')}</p>
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`message p-3 rounded-lg max-w-[85%] text-sm ${msg.role === 'user'
                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-100 self-end rounded-tr-none'
                                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 self-start rounded-tl-none shadow-sm'
                                    }`}
                            >
                                {msg.content}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="self-start bg-white dark:bg-slate-800 p-3 rounded-lg rounded-tl-none border border-slate-200 dark:border-slate-700 shadow-sm">
                                <Loader2 size={16} className="animate-spin text-emerald-600" />
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="chat-input p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder={t('chat.placeholder', 'Ask a question...')}
                            className="flex-1 bg-slate-100 dark:bg-slate-800 border-0 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isLoading}
                            className="p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
