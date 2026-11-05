import React, { useState, useEffect } from 'react';
import { CloseIcon, TrelloIcon, CheckIcon } from './Icons';
import {
  getTrelloCredentialsAsync,
  saveTrelloCredentials,
  clearTrelloCredentials,
  verifyTrelloCredentials,
} from '../services/trelloService';

export function TrelloConfigModal({ isOpen, onClose, onConnected }) {
  const [apiKey, setApiKey] = useState('');
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successUser, setSuccessUser] = useState(null);

  useEffect(() => {
    let isMounted = true;
    getTrelloCredentialsAsync().then((creds) => {
      if (isMounted) {
        setApiKey(creds.apiKey || '');
        setToken(creds.token || '');
      }
    });
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const handleSaveAndConnect = async () => {
    if (!apiKey.trim() || !token.trim()) {
      setErrorMessage('Please enter both Trello API Key and Token.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    try {
      const user = await verifyTrelloCredentials(apiKey, token);
      await saveTrelloCredentials(apiKey, token);
      setSuccessUser(user);
      setTimeout(() => {
        if (onConnected) onConnected();
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMessage(err.message || 'Could not verify credentials with Trello.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    await clearTrelloCredentials();
    setApiKey('');
    setToken('');
    setSuccessUser(null);
    if (onConnected) onConnected();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(9, 30, 66, 0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 20px 45px -10px rgba(9, 30, 66, 0.35), 0 0 1px 1px rgba(9, 30, 66, 0.15)',
          border: '1px solid #dfe1e6',
          overflow: 'hidden',
          color: '#172b4d',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #ebecf0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrelloIcon className="w-5 h-5" color="#0c66e4" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#172b4d' }}>
              Connect Trello for Live Reassignment
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '4px',
              color: '#626f86',
              borderRadius: '4px',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
            }}
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', backgroundColor: '#ffffff', fontSize: '12px' }}>
          <p style={{ color: '#44546f', lineHeight: 1.5, margin: '0 0 16px' }}>
            Trello board ke real cards se members ko add aur remove karne ke liye Trello 1-time authorization allow karta hai:
          </p>

          {/* API Key */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#172b4d', marginBottom: '6px' }}>
              1. Trello Power-Up API Key
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="e.g. 5d89f72b9a384..."
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #dfe1e6',
                borderRadius: '6px',
                fontFamily: 'monospace',
                fontSize: '12px',
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff',
                color: '#172b4d',
              }}
            />
            <span style={{ fontSize: '11px', color: '#626f86', marginTop: '6px', display: 'block', lineHeight: 1.4 }}>
              <a
                href="https://trello.com/power-ups/admin"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#0c66e4', fontWeight: 600, textDecoration: 'underline' }}
              >
                👉 trello.com/power-ups/admin
              </a>{' '}
              par jayein &gt; apne app par click karein &gt; <b>API key</b> copy karein.
            </span>
          </div>

          {/* User Token */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#172b4d', marginBottom: '6px' }}>
              2. Trello User Token
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ATTA... or your personal token"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #dfe1e6',
                borderRadius: '6px',
                fontFamily: 'monospace',
                fontSize: '12px',
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff',
                color: '#172b4d',
              }}
            />
            {apiKey ? (
              <span style={{ fontSize: '11px', color: '#626f86', marginTop: '6px', display: 'block' }}>
                <a
                  href={`https://trello.com/1/authorize?expiration=never&name=Member+Handover&scope=read,write&response_type=token&key=${apiKey.trim()}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#0c66e4', fontWeight: 600, textDecoration: 'underline' }}
                >
                  👉 Click here to generate 1-click Trello Token
                </a>
              </span>
            ) : (
              <span style={{ fontSize: '11px', color: '#8c9bab', marginTop: '6px', display: 'block' }}>
                (Pehle API Key dalein, fir Token generate karne ka 1-click link aa jayega)
              </span>
            )}
          </div>

          {/* Success Notification */}
          {successUser && (
            <div
              style={{
                padding: '10px 12px',
                backgroundColor: '#e3fcef',
                border: '1px solid #abf5d1',
                color: '#006644',
                borderRadius: '6px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '14px',
              }}
            >
              <CheckIcon className="w-4 h-4 text-emerald-600" />
              <span>
                Connected as <b>@{successUser.username}</b> ({successUser.fullName})!
              </span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div
              style={{
                padding: '10px 12px',
                backgroundColor: '#ffebe6',
                border: '1px solid #ffbdad',
                color: '#bf2600',
                borderRadius: '6px',
                fontSize: '12px',
                marginBottom: '14px',
              }}
            >
              {errorMessage}
            </div>
          )}

          {/* Action buttons */}
          <div
            style={{
              paddingTop: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid #ebecf0',
            }}
          >
            <button
              type="button"
              onClick={handleDisconnect}
              style={{
                color: '#626f86',
                fontSize: '12px',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
              }}
            >
              Disconnect
            </button>

            <button
              type="button"
              onClick={handleSaveAndConnect}
              disabled={isLoading || !apiKey.trim() || !token.trim()}
              style={{
                padding: '8px 16px',
                backgroundColor: isLoading || !apiKey.trim() || !token.trim() ? '#b3d4ff' : '#0c66e4',
                color: '#ffffff',
                fontWeight: 600,
                borderRadius: '6px',
                border: 'none',
                cursor: isLoading || !apiKey.trim() || !token.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {isLoading && (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              <span>{isLoading ? 'Verifying...' : 'Save & Connect'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
