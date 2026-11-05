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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn text-[#172b4d]">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrelloIcon className="w-5 h-5" color="#0c66e4" />
            <h3 className="text-base font-bold text-[#172b4d]">
              Connect Trello for Live Reassignment
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          <p className="text-[#44546f] leading-normal">
            Trello board ke real cards se members ko add aur remove karne ke liye Trello 1-time authorization allow karta hai:
          </p>

          {/* API Key */}
          <div>
            <label className="block font-semibold text-[#172b4d] mb-1">
              1. Trello Power-Up API Key
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="e.g. 5d89f72b9a384..."
              className="w-full px-3 py-2 border border-slate-200 rounded-md font-mono text-xs focus:outline-none focus:border-[#0c66e4]"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              <a
                href="https://trello.com/power-ups/admin"
                target="_blank"
                rel="noreferrer"
                className="text-[#0c66e4] font-semibold hover:underline"
              >
                👉 trello.com/power-ups/admin
              </a>{' '}
              par jayein &gt; apne app par click karein &gt; <b>API key</b> copy karein.
            </span>
          </div>

          {/* User Token */}
          <div>
            <label className="block font-semibold text-[#172b4d] mb-1">
              2. Trello User Token
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ATTA... or your personal token"
              className="w-full px-3 py-2 border border-slate-200 rounded-md font-mono text-xs focus:outline-none focus:border-[#0c66e4]"
            />
            {apiKey ? (
              <span className="text-[11px] text-slate-500 mt-1 block">
                <a
                  href={`https://trello.com/1/authorize?expiration=never&name=Member+Handover&scope=read,write&response_type=token&key=${apiKey.trim()}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#0c66e4] font-semibold hover:underline"
                >
                  👉 Click here to generate 1-click Trello Token
                </a>
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 mt-1 block">
                (API Key enter karne ke baad Token generate karne ka direct link yahan aayega)
              </span>
            )}
          </div>

          {/* Success Notification */}
          {successUser && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-[11.5px] flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-emerald-600" />
              <span>
                Connected as <b>@{successUser.username}</b> ({successUser.fullName})!
              </span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-md text-[11.5px]">
              {errorMessage}
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={handleDisconnect}
              className="text-slate-500 hover:text-rose-600 text-[11.5px] cursor-pointer"
            >
              Disconnect
            </button>

            <button
              type="button"
              onClick={handleSaveAndConnect}
              disabled={isLoading || !apiKey.trim() || !token.trim()}
              className="px-4 py-2 bg-[#0c66e4] hover:bg-[#0055cc] text-white font-semibold rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
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
