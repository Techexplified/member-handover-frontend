import React, { useState, useEffect, useCallback } from 'react';
import { INITIAL_MEMBERS, INITIAL_CARDS } from './data/mockData';
import { MemberHandoverModal } from './components/MemberHandoverModal';
import { TrelloConfigModal } from './components/TrelloConfigModal';
import {
  isTrelloLiveConnected,
  getTrelloCredentialsAsync,
  fetchLiveWorkspaceMembers,
  fetchLiveMemberCards,
  executeLiveReassignment,
} from './services/trelloService';
import './App.css';

export default function App() {
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [cards, setCards] = useState(INITIAL_CARDS);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Load real Trello members and cards
  const loadLiveTrelloData = useCallback(async () => {
    const creds = await getTrelloCredentialsAsync();
    const hasCreds = Boolean(creds.apiKey && creds.token);
    setHasCredentials(hasCreds);

    if (!isTrelloLiveConnected()) {
      setIsLiveConnected(false);
      setMembers(INITIAL_MEMBERS);
      setCards(INITIAL_CARDS);
      return;
    }

    try {
      const liveMembers = await fetchLiveWorkspaceMembers();
      if (liveMembers && liveMembers.length > 0) {
        setMembers(liveMembers);
        setIsLiveConnected(true);

        try {
          const liveCards = await fetchLiveMemberCards(liveMembers[0].id, liveMembers);
          setCards(liveCards || []);
        } catch {
          setCards([]);
        }
      }
    } catch (err) {
      console.warn('Could not load live Trello members:', err);
      setIsLiveConnected(false);
      setMembers(INITIAL_MEMBERS);
      setCards(INITIAL_CARDS);
    }
  }, []);

  useEffect(() => {
    loadLiveTrelloData();
  }, [loadLiveTrelloData]);

  // When a departing member is selected in live mode, dynamically fetch their cards from Trello
  const handleSelectDepartingMember = async (memberId) => {
    if (!isLiveConnected) return;

    try {
      const liveCards = await fetchLiveMemberCards(memberId, members);
      setCards(liveCards || []);
    } catch (err) {
      console.error('Failed to fetch cards for member:', err);
    }
  };

  // Live Reassignment execution handler
  const handleCompleteHandover = async ({
    departingId,
    replacementId,
    cardIds,
    onProgress,
  }) => {
    // 1. Check if Trello API credentials are ready
    const creds = await getTrelloCredentialsAsync();
    if (!creds.apiKey || !creds.token) {
      return { authRequired: true };
    }

    // 2. Perform live mutation on Trello REST API
    const results = await executeLiveReassignment({
      departingMemberId: departingId,
      replacementMemberId: replacementId,
      cardIds,
      cards,
      members,
      onProgress,
    });

    // 3. Update local state only for successfully mutated cards
    const updatedIds = new Set((results.updated || []).map((c) => c.id));

    setCards((prevCards) =>
      prevCards.map((card) => {
        if (updatedIds.has(card.id)) {
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
            cardsCount: Math.max(0, (member.cardsCount || 0) - results.updated.length),
          };
        }
        if (member.id === replacementId) {
          return {
            ...member,
            cardsCount: (member.cardsCount || 0) + results.updated.length,
          };
        }
        return member;
      })
    );

    return results;
  };

  const handleCloseModal = () => {
    if (typeof window !== 'undefined' && window.TrelloPowerUp) {
      try {
        const t = window.TrelloPowerUp.iframe();
        t.closeModal();
      } catch (err) {
        console.warn('closeModal notice:', err);
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-white flex justify-center font-sans">
      <div className="w-full max-w-[480px] flex flex-col bg-white">
        <MemberHandoverModal
          isOpen={true}
          isInline={true}
          onClose={handleCloseModal}
          members={members}
          cards={cards}
          onCompleteHandover={handleCompleteHandover}
          onSelectDepartingMember={handleSelectDepartingMember}
          isLiveConnected={isLiveConnected}
          hasCredentials={hasCredentials}
          onOpenConfig={() => setIsConfigOpen(true)}
        />
      </div>

      <TrelloConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onConnected={loadLiveTrelloData}
      />
    </div>
  );
}
