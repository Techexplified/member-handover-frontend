import React, { useState, useEffect, useCallback } from 'react';
import { INITIAL_MEMBERS, INITIAL_CARDS } from './data/mockData';
import { MemberHandoverModal } from './components/MemberHandoverModal';
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
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // Load real Trello members
  const loadLiveTrelloData = useCallback(async () => {
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
          const liveCards = await fetchLiveMemberCards(liveMembers[0].id);
          setCards(liveCards);
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
    <div className="min-h-screen w-full bg-[#f4f5f7] flex items-center justify-center p-2 sm:p-4 font-sans">
      <MemberHandoverModal
        isOpen={true}
        isInline={true}
        members={members}
        cards={cards}
        onCompleteHandover={handleCompleteHandover}
        onSelectDepartingMember={handleSelectDepartingMember}
        isLiveConnected={isLiveConnected}
      />
    </div>
  );
}
