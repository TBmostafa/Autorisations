import { useEffect, useRef, useState } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { chatbotService } from '../../services/api.js';

const SUGGESTIONS_BY_ROLE = {
  employe: [
    'Mes demandes en attente',
    'Créer une demande',
    'Quels sont les types de demandes ?',
    'Qui est mon manager ?',
    'Qui est le RH ?',
    'Mon profil',
    'Ma dernière demande',
    'Total de mes demandes',
  ],
  manager: [
    'Demandes en attente de mon équipe',
    'Comment valider une demande ?',
    'Comment refuser une demande ?',
    'Statistiques de mon équipe',
    'Ma dernière demande équipe',
    'Mon profil',
  ],
  rh: [
    'Demandes à valider',
    'Comment valider définitivement ?',
    'Comment refuser une demande ?',
    'Liste des membres RH',
    'Total des demandes',
    'Mon profil',
  ],
  admin: [
    'Gérer les utilisateurs',
    'Total des demandes',
    'Demandes en attente',
    'Ma dernière demande',
    'Mon profil',
  ],
};

const WELCOME_BY_ROLE = {
  employe: (prenom) => `Bonjour ${prenom} 👋 Je suis votre assistant. Vous pouvez me demander l'état de vos demandes, créer une nouvelle demande ou contacter votre manager.`,
  manager: (prenom) => `Bonjour ${prenom} 👋 Je suis votre assistant. Je peux vous informer sur les demandes en attente de votre équipe ou vous guider pour les valider.`,
  rh:      (prenom) => `Bonjour ${prenom} 👋 Je suis votre assistant RH. Je peux vous indiquer les demandes en attente de validation finale ou vous aider à les traiter.`,
  admin:   (prenom) => `Bonjour ${prenom} 👋 Je suis votre assistant administrateur. Je peux vous aider à gérer les utilisateurs, les départements et suivre les demandes.`,
};

export default function ChatWidget() {
  const { messages, isOpen, isLoading, setIsLoading, addMessage, toggleChat, clearMessages } = useChat();
  const { user } = useAuth();
  const [input, setInput]       = useState('');
  const [welcomed, setWelcomed] = useState(false);
  const messagesEndRef          = useRef(null);

  const suggestions = SUGGESTIONS_BY_ROLE[user?.role] ?? SUGGESTIONS_BY_ROLE.employe;

  // Message de bienvenue personnalisé selon le rôle
  useEffect(() => {
    if (isOpen && !welcomed && user) {
      const prenom = user.name?.split(' ')[0] ?? user.name;
      const welcomeFn = WELCOME_BY_ROLE[user.role] ?? WELCOME_BY_ROLE.employe;
      addMessage('bot', welcomeFn(prenom));
      setWelcomed(true);
    }
  }, [isOpen, welcomed, user, addMessage]);

  // Défilement automatique
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setInput('');
    addMessage('user', trimmed);
    setIsLoading(true);
    try {
      const res = await chatbotService.sendMessage(trimmed);
      addMessage('bot', res.data.reply);
    } catch (err) {
      const msg = err.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.';
      addMessage('bot', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Afficher les suggestions uniquement avant toute question (message de bienvenue seul)
  const showSuggestions = messages.length <= 1 && !isLoading;

  const handleClearHistory = () => {
    clearMessages();
    setWelcomed(false);
    // Le useEffect [isOpen, welcomed] détecte welcomed=false et ajoute le message de bienvenue
  };

  return (
    <>
      <style>{`
        .chat-widget-btn {
          position: fixed; bottom: 24px; right: 24px; z-index: 1000;
          width: 56px; height: 56px; border-radius: 50%; border: none;
          background: linear-gradient(135deg, #1e4080, #3b82f6);
          color: #fff; font-size: 24px; cursor: pointer;
          box-shadow: 0 6px 24px rgba(30,64,128,0.4);
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .chat-widget-btn:hover { transform: scale(1.1); box-shadow: 0 10px 32px rgba(30,64,128,0.5); }
        .chat-window {
          position: fixed; bottom: 92px; right: 24px; z-index: 1000;
          width: 360px; max-height: 520px;
          background: #fff; border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.18);
          display: flex; flex-direction: column; overflow: hidden;
          animation: chatSlideUp 0.25s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .chat-header {
          background: linear-gradient(135deg, #1e4080, #3b82f6);
          padding: 16px 18px; display: flex; align-items: center;
          justify-content: space-between; color: #fff;
        }
        .chat-header-info { display: flex; align-items: center; gap: 10px; }
        .chat-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center; font-size: 18px;
        }
        .chat-close-btn {
          background: rgba(255,255,255,0.15); border: none; color: #fff;
          width: 28px; height: 28px; border-radius: 50%; cursor: pointer;
          font-size: 16px; display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
        }
        .chat-close-btn:hover { background: rgba(255,255,255,0.3); }
        .chat-messages {
          flex: 1; overflow-y: auto; padding: 16px;
          display: flex; flex-direction: column; gap: 10px;
          background: #f8fafc;
        }
        .chat-messages::-webkit-scrollbar { width: 4px; }
        .chat-messages::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
        .msg-row { display: flex; }
        .msg-row.user { justify-content: flex-end; }
        .msg-row.bot  { justify-content: flex-start; }
        .msg-bubble {
          max-width: 78%; padding: 10px 14px; border-radius: 16px;
          font-size: 13.5px; line-height: 1.55; white-space: pre-wrap; word-break: break-word;
        }
        .msg-bubble.user {
          background: linear-gradient(135deg, #1e4080, #3b82f6);
          color: #fff; border-bottom-right-radius: 4px;
        }
        .msg-bubble.bot {
          background: #fff; color: #1e293b;
          border: 1px solid #e2e8f0; border-bottom-left-radius: 4px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .typing-indicator {
          display: flex; gap: 4px; align-items: center; padding: 10px 14px;
          background: #fff; border: 1px solid #e2e8f0; border-radius: 16px;
          border-bottom-left-radius: 4px; width: fit-content;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .typing-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #94a3b8;
          animation: typingBounce 1.2s infinite ease-in-out;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingBounce {
          0%,80%,100% { transform: translateY(0); }
          40%          { transform: translateY(-6px); }
        }
        .chat-suggestions {
          padding: 8px 12px 4px; display: flex; flex-wrap: wrap; gap: 6px;
          background: #f8fafc; border-top: 1px solid #f1f5f9;
        }
        .suggestion-chip {
          padding: 5px 12px; border-radius: 99px; border: 1.5px solid #e2e8f0;
          background: #fff; color: #475569; font-size: 12px; cursor: pointer;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
          white-space: nowrap;
        }
        .suggestion-chip:hover { border-color: #3b82f6; color: #1e4080; background: #eff6ff; }
        .chat-input-area {
          padding: 12px 14px; border-top: 1px solid #f1f5f9;
          display: flex; gap: 8px; align-items: center; background: #fff;
        }
        .chat-input {
          flex: 1; padding: 10px 14px; border: 1.5px solid #e2e8f0;
          border-radius: 12px; font-size: 13.5px; outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          font-family: inherit; resize: none;
        }
        .chat-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
        .chat-send-btn {
          width: 38px; height: 38px; border-radius: 10px; border: none;
          background: linear-gradient(135deg, #1e4080, #3b82f6);
          color: #fff; font-size: 16px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.15s, transform 0.15s;
          flex-shrink: 0;
        }
        .chat-send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .chat-send-btn:not(:disabled):hover { transform: scale(1.08); }
        .notif-badge {
          position: absolute; top: -4px; right: -4px;
          width: 18px; height: 18px; border-radius: 50%;
          background: #ef4444; color: #fff; font-size: 10px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid #fff;
        }
      `}</style>

      {/* Bouton flottant */}
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <button className="chat-widget-btn" onClick={toggleChat} aria-label="Ouvrir le chat">
          {isOpen ? '✕' : '💬'}
        </button>
      </div>

      {/* Fenêtre de chat */}
      {isOpen && (
        <div className="chat-window" role="dialog" aria-label="Assistant chatbot">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">🤖</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Assistant</div>
                <div style={{ fontSize: 11, opacity: 0.75 }}>Toujours disponible</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {messages.length > 1 && (
                <button
                  className="chat-close-btn"
                  onClick={handleClearHistory}
                  aria-label="Effacer la conversation"
                  title="Effacer la conversation"
                  style={{ fontSize: 13, width: 'auto', padding: '0 8px', borderRadius: 8, gap: 4, display: 'flex', alignItems: 'center' }}
                >
                  🗑 Effacer
                </button>
              )}
              <button className="chat-close-btn" onClick={toggleChat} aria-label="Fermer">✕</button>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`msg-row ${msg.role}`}>
                <div className={`msg-bubble ${msg.role}`}>{msg.text}</div>
              </div>
            ))}
            {isLoading && (
              <div className="msg-row bot">
                <div className="typing-indicator">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {showSuggestions && (
            <div className="chat-suggestions">
              {suggestions.map((s) => (
                <button
                  key={s}
                  className="suggestion-chip"
                  onClick={() => sendMessage(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="chat-input-area">
            <input
              className="chat-input"
              type="text"
              placeholder="Posez votre question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              aria-label="Message"
            />
            <button
              className="chat-send-btn"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              aria-label="Envoyer"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
