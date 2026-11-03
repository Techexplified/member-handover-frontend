import React, { useState, useEffect } from 'react';
import { CloseIcon, TrelloIcon, CheckIcon } from './Icons';
import {
  getTrelloCredentials,
  saveTrelloCredentials,
  clearTrelloCredentials,
  fetchLiveWorkspaces,
} from '../services/trelloService';

export function TrelloConfigModal({ isOpen, onClose, onConnected }) {
  const [apiKey, setApiKey] = useState('');
  const [token, setToken] = useState('');
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const creds = getTrelloCredentials();
    setApiKey(creds.apiKey);
    setToken(creds.token);
    setSelectedWorkspace(creds.workspaceId);
  }, [isOpen]);

  const handleFetchWorkspaces = async () => {
    if (!apiKey || !token) {
      setErrorMessage('Please enter both Trello API Key and Token.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    try {
      saveTrelloCredentials(apiKey, token);
      const orgs = await fetchLiveWorkspaces();
      setWorkspaces(orgs);
      if (orgs.length > 0) {
        setSelectedWorkspace(orgs[0].id);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Could not verify credentials with Trello.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAndConnect = () => {
    if (!apiKey || !token) {
      setErrorMessage('Please enter your API Key and Token.');
      return;
    }
    saveTrelloCredentials(apiKey, token, selectedWorkspace);
    if (onConnected) onConnected();
    onClose();
  };

  const handleDisconnect = () => {
    clearTrelloCredentials();
    setApiKey('');
    setToken('');
    setWorkspaces([]);
    setSelectedWorkspace('');
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
              Connect Live Trello Workspace
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer">
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          <p className="text-[#44546f] leading-normal">
            Live mode me deploy karne ke baad yeh aapke real Trello Workspace ke employees aur cards ko live fetch karta hai.
          </p>

          {/* API Key */}
          <div>
            <label className="block font-semibold text-[#172b4d] mb-1">
              1. Trello API Key
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="e.g. 5d89f72b9a..."
              className="w-full px-3 py-2 border border-slate-200 rounded-md font-mono text-xs focus:outline-none focus:border-[#0c66e4]"
            />
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              <a
                href="https://trello.com/power-ups/admin"
                target="_blank"
                rel="noreferrer"
                className="text-[#0c66e4] hover:underline"
              >
                Trello Developer Portal
              </a>{' '}
              se apni API key generate karein.
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
            {apiKey && (
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                <a
                  href={`https://trello.com/1/authorize?expiration=never&name=Member+Handover&scope=read,write,account&response_type=token&key=${apiKey}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#0c66e4] font-semibold hover:underline"
                >
                  👉 Click here to generate 1-click Trello Token
                </a>
              </span>
            )}
          </div>

          {/* Workspaces Selector */}
          {workspaces.length > 0 && (
            <div>
              <label className="block font-semibold text-[#172b4d] mb-1">
                3. Choose Target Workspace
              </label>
              <select
                value={selectedWorkspace}
                onChange={(e) => setSelectedWorkspace(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-[#0c66e4]"
              >
                {workspaces.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.displayName} ({org.name})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-md text-[11.5px]">
              {errorMessage}
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleDisconnect}
              className="text-slate-500 hover:text-rose-600 text-[11.5px] cursor-pointer"
            >
              Reset / Disconnect
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleFetchWorkspaces}
                disabled={isLoading || !apiKey || !token}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#172b4d] font-semibold rounded-md transition-colors cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify & Find Workspaces'}
              </button>

              <button
                type="button"
                onClick={handleSaveAndConnect}
                disabled={!apiKey || !token}
                className="px-4 py-1.5 bg-[#0c66e4] hover:bg-[#0055cc] text-white font-semibold rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                Connect Live
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

