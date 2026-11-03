import React, { useState, useEffect, useCallback } from 'react';
import { INITIAL_MEMBERS, INITIAL_CARDS } from './data/mockData';
import { MemberHandoverModal } from './components/MemberHandoverModal';
import { TrelloConfigModal } from './components/TrelloConfigModal';
import { TrelloIcon } from './components/Icons';
import {
  isTrelloLiveConnected,
  fetchLiveWorkspaceMembers,
  fetchLiveMemberCards,
  executeLiveReassignment,
} from './services/trelloService';
import './App.css';

export default function App() {
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [cards, setCards] = useState(INITIAL_CARDS);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [liveError, setLiveError] = useState('');

  // Load real Trello members if credentials are present
  const loadLiveTrelloData = useCallback(async () => {
    if (!isTrelloLiveConnected()) {
      setIsLiveConnected(false);
      setMembers(INITIAL_MEMBERS);
      setCards(INITIAL_CARDS);
      return;
    }

    setIsLoadingLive(true);
    setLiveError('');
    try {
      const liveMembers = await fetchLiveWorkspaceMembers();
      if (liveMembers.length > 0) {
        setMembers(liveMembers);
        setIsLiveConnected(true);

        try {
          const liveCards = await fetchLiveMemberCards(liveMembers[0].id);
          setCards(liveCards);
        } catch {
          setCards([]);
        }
      }
    } catch (err) {
      console.warn('Could not load live Trello members:', err);
      setLiveError(err.message || 'Error connecting to Trello API');
      setIsLiveConnected(false);
      setMembers(INITIAL_MEMBERS);
      setCards(INITIAL_CARDS);
    } finally {
      setIsLoadingLive(false);
    }
  }, []);

  useEffect(() => {
    loadLiveTrelloData();
  }, [loadLiveTrelloData]);

  // When a departing member is selected in live mode, dynamically fetch their cards from Trello
  const handleSelectDepartingMember = async (memberId) => {
    if (!isLiveConnected) return;

    try {
      const liveCards = await fetchLiveMemberCards(memberId);
      setCards(liveCards);
    } catch (err) {
      console.error('Failed to fetch cards for member:', err);
    }
  };

  // Reassignment handler (Live Trello API or Local State)
  const handleCompleteHandover = async ({ departingId, replacementId, cardIds }) => {
    if (isLiveConnected) {
      try {
        await executeLiveReassignment({
          departingMemberId: departingId,
          replacementMemberId: replacementId,
          cardIds,
          cards,
        });
        await handleSelectDepartingMember(departingId);
      } catch (err) {
        console.error('Live reassignment error:', err);
      }
    } else {
      setCards((prevCards) =>
        prevCards.map((card) => {
          if (cardIds.includes(card.id)) {
            return {
              ...card,
              memberId: replacementId === 'unassigned' ? null : replacementId,
            };
          }
          return card;
        })
      );

      setMembers((prevMembers) =>
        prevMembers.map((member) => {
          if (member.id === departingId) {
            return {
              ...member,
              cardsCount: Math.max(0, (member.cardsCount || 0) - cardIds.length),
            };
          }
          if (member.id === replacementId) {
            return {
              ...member,
              cardsCount: (member.cardsCount || 0) + cardIds.length,
            };
          }
          return member;
        })
      );
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f5f7] flex flex-col font-sans">
      {/* Top Header / Mode Switcher */}
      <header className="h-11 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-xs z-30">
        <div className="flex items-center gap-2">
          <TrelloIcon className="w-4 h-4" color="#0c66e4" />
          <span className="font-bold text-xs tracking-tight text-[#172b4d]">
            Trello Power-Up
          </span>
          <span className="text-slate-300 text-xs">|</span>
          <span className="text-xs font-semibold text-[#0c66e4]">
            Member Handover
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isLiveConnected ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Trello Connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Preview Mode
            </span>
          )}

          {isLoadingLive && <span className="text-xs text-slate-400">Loading...</span>}

          <button
            onClick={() => setIsConfigOpen(true)}
            className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-200 hover:bg-slate-50 text-[#172b4d] transition-colors cursor-pointer"
          >
            {isLiveConnected ? '⚙️ Trello Settings' : '🔑 Connect Real Trello'}
          </button>
        </div>
      </header>

      {/* Main Content Area - Clean, Centered Member Handover Card */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6">
        <MemberHandoverModal
          isOpen={true}
          isInline={true}
          members={members}
          cards={cards}
          onCompleteHandover={handleCompleteHandover}
          onSelectDepartingMember={handleSelectDepartingMember}
          isLiveConnected={isLiveConnected}
        />
      </main>

      {/* Trello API Configuration Modal */}
      <TrelloConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onConnected={loadLiveTrelloData}
      />
    </div>
  );
}
