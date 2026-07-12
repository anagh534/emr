import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * Floating portal component to render slide-in alert notifications
 */
export function ToastPortal({ toasts, removeToast }) {
  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '1.5rem', 
      right: '1.5rem', 
      zIndex: 9999, 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '0.75rem', 
      maxWidth: '360px', 
      width: '100%' 
    }}>
      {toasts.map(t => (
        <div 
          key={t.id} 
          className={`toast-alert toast-${t.type}`}
          style={{
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            animation: 'slideIn 0.3s ease forwards',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            borderLeft: t.type === 'success' ? '4px solid var(--success)' : '4px solid var(--error)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
            {t.type === 'success' ? (
              <CheckCircle2 size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />
            ) : (
              <AlertCircle size={18} style={{ color: 'var(--error)', flexShrink: 0 }} />
            )}
            <span style={{ color: 'var(--text-main)' }}>{t.text}</span>
          </div>
          <button 
            onClick={() => removeToast(t.id)} 
            style={{ 
              border: 'none', 
              background: 'transparent', 
              color: 'var(--text-muted)', 
              cursor: 'pointer', 
              fontSize: '1rem', 
              padding: 0 
            }}
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
