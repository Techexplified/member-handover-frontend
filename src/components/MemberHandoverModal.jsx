import React, { useState, useMemo } from 'react';
import {
  UsersIcon,
  CloseIcon,
  SearchIcon,
  CheckIcon,
  ArrowRightIcon,
  CardIcon,
  BoardsIcon,
  ListsIcon,
  WarningTriangleIcon,
  ClockPendingIcon,
  AlertCircleIcon,
  InfoCircleIcon,
  NoCardsIllustration,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CardOutlineIcon,
} from './Icons';
import { MemberAvatar } from './MemberAvatar';
import { UPDATED_CARDS_LIST, SKIPPED_CARDS_LIST, INITIAL_CARDS } from '../data/mockData';

export function MemberHandoverModal({
  isOpen = true,
  isInline = false,
  onClose,
  members,
  cards,
  onCompleteHandover,
  onSelectDepartingMember,
  isLiveConnected = false,
  hasCredentials = false,
  onOpenConfig,
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [replacementSearchQuery, setReplacementSearchQuery] = useState('');
  const [selectedDepartingId, setSelectedDepartingId] = useState(members[0]?.id || 'alex');
  const [selectedReplacementId, setSelectedReplacementId] = useState(members[1]?.id || 'priya');
  const [selectedCardIds, setSelectedCardIds] = useState([]);
  const [cardSearchQuery, setCardSearchQuery] = useState('');
  const [viewByBoardMode, setViewByBoardMode] = useState(false);
  const [simulateEmptyState, setSimulateEmptyState] = useState(false);
  const [useSampleCards, setUseSampleCards] = useState(false);
  const [progressInfo, setProgressInfo] = useState(null);
  const [executionResults, setExecutionResults] = useState(null);

  // Sync selection if members list changes (e.g., live Trello members loaded)
  React.useEffect(() => {
    if (members && members.length > 0) {
      if (!members.some((m) => m.id === selectedDepartingId)) {
        setSelectedDepartingId(members[0].id);
        if (onSelectDepartingMember) onSelectDepartingMember(members[0].id);
      }
      if (!members.some((m) => m.id === selectedReplacementId) && members.length > 1) {
        const other = members.find((m) => m.id !== selectedDepartingId) || members[1];
        setSelectedReplacementId(other.id);
      } else if (selectedReplacementId === selectedDepartingId) {
        const other = members.find((m) => m.id !== selectedDepartingId);
        if (other) setSelectedReplacementId(other.id);
      }
    }
  }, [members, selectedDepartingId, selectedReplacementId, onSelectDepartingMember]);

  // Completion view state: 'SUMMARY' | 'SKIPPED' | 'UPDATED'
  const [completionView, setCompletionView] = useState('SUMMARY');
  const [updatedCardsSearch, setUpdatedCardsSearch] = useState('');
  const [updatedBoardFilter, setUpdatedBoardFilter] = useState('ALL');
  const [updatedListFilter, setUpdatedListFilter] = useState('ALL');
  const [updatedCardsPage, setUpdatedCardsPage] = useState(1);

  // Execution state
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [retryStatus, setRetryStatus] = useState({});

  // Active departing & replacement members
  const departingMember = useMemo(
    () => members.find((m) => m.id === selectedDepartingId) || members[0],
    [members, selectedDepartingId]
  );

  const replacementMember = useMemo(
    () => members.find((m) => m.id === selectedReplacementId) || members[1],
    [members, selectedReplacementId]
  );

  // Cards assigned to departing member
  const departingCards = useMemo(() => {
    if (simulateEmptyState) {
      return [];
    }
    const pool = useSampleCards
      ? INITIAL_CARDS.map((c) => ({ ...c, memberId: selectedDepartingId }))
      : cards;
    const matching = pool.filter((c) => c.memberId === selectedDepartingId);
    if (matching.length > 0) return matching;
    if (departingMember?.cardsCount === 0 && !useSampleCards) {
      return [];
    }
    return matching;
  }, [cards, selectedDepartingId, simulateEmptyState, departingMember, useSampleCards]);

  // Synchronize selected cards with departingCards
  React.useEffect(() => {
    setSelectedCardIds(departingCards.map((c) => c.id));
  }, [departingCards]);

  // Filtered members for Step 1
  const filteredStep1Members = useMemo(() => {
    if (!searchQuery.trim()) return members.filter((m) => m.id !== 'taylor-empty');
    const q = searchQuery.toLowerCase();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
    );
  }, [members, searchQuery]);

  // Filtered members for Step 2
  const filteredStep2Members = useMemo(() => {
    const available = members.filter(
      (m) => m.id !== selectedDepartingId && m.id !== 'taylor-empty'
    );
    if (!replacementSearchQuery.trim()) return available;
    const q = replacementSearchQuery.toLowerCase();
    return available.filter(
      (m) =>
        m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
    );
  }, [members, selectedDepartingId, replacementSearchQuery]);

  // Unique boards & lists count
  const uniqueBoards = useMemo(() => {
    return Array.from(new Set(departingCards.map((c) => c.board)));
  }, [departingCards]);

  const uniqueLists = useMemo(() => {
    return Array.from(new Set(departingCards.map((c) => `${c.board}-${c.list}`)));
  }, [departingCards]);

  // Filtered cards for Step 3
  const filteredCards = useMemo(() => {
    if (!cardSearchQuery.trim()) return departingCards;
    const q = cardSearchQuery.toLowerCase();
    return departingCards.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.board.toLowerCase().includes(q) ||
        c.list.toLowerCase().includes(q)
    );
  }, [departingCards, cardSearchQuery]);

  // Updated cards source (use real reassigned cards if available)
  const updatedCardsSource = useMemo(() => {
    if (executionResults && executionResults.updated && executionResults.updated.length > 0) {
      return executionResults.updated.map((c) => ({
        id: c.id,
        title: c.title,
        board: c.board || 'Current Board',
        list: c.list || 'To Do',
        previousMember: departingMember?.name || 'Previous',
        previousAvatarBg: departingMember?.bg || '#dbeafe',
        previousAvatarColor: departingMember?.color || '#1e40af',
        previousAvatarInitials: departingMember?.initials || 'DM',
        newMember: replacementMember?.name || 'Replacement',
        newAvatarBg: replacementMember?.bg || '#dcfce7',
        newAvatarColor: replacementMember?.color || '#166534',
        newAvatarInitials: replacementMember?.initials || 'RM',
      }));
    }

    const reassigned = departingCards
      .filter((c) => selectedCardIds.includes(c.id))
      .map((c) => ({
        id: c.id,
        title: c.title,
        board: c.board || 'Current Board',
        list: c.list || 'To Do',
        previousMember: departingMember?.name || 'Previous',
        previousAvatarBg: departingMember?.bg || '#dbeafe',
        previousAvatarColor: departingMember?.color || '#1e40af',
        previousAvatarInitials: departingMember?.initials || 'DM',
        newMember: replacementMember?.name || 'Replacement',
        newAvatarBg: replacementMember?.bg || '#dcfce7',
        newAvatarColor: replacementMember?.color || '#166534',
        newAvatarInitials: replacementMember?.initials || 'RM',
      }));

    if (reassigned.length > 0) return reassigned;
    return [];
  }, [departingCards, selectedCardIds, departingMember, replacementMember, executionResults]);

  // Skipped cards source
  const skippedCardsSource = useMemo(() => {
    if (executionResults && executionResults.skipped && executionResults.skipped.length > 0) {
      return executionResults.skipped.map((c) => ({
        id: c.id,
        title: c.title,
        board: c.board || 'Current Board',
        list: c.list || 'To Do',
        reason: c.reason || "Permission denied: You don't have permission to edit this card.",
      }));
    }
    return [];
  }, [executionResults]);

  // Filtered updated cards for "Updated cards" screen
  const filteredUpdatedCards = useMemo(() => {
    return updatedCardsSource.filter((card) => {
      const matchesSearch =
        !updatedCardsSearch.trim() ||
        card.title.toLowerCase().includes(updatedCardsSearch.toLowerCase());
      const matchesBoard =
        updatedBoardFilter === 'ALL' || card.board === updatedBoardFilter;
      const matchesList =
        updatedListFilter === 'ALL' || card.list === updatedListFilter;
      return matchesSearch && matchesBoard && matchesList;
    });
  }, [updatedCardsSource, updatedCardsSearch, updatedBoardFilter, updatedListFilter]);

  // Paginated updated cards (10 per page)
  const pageSize = 10;
  const totalPages = Math.ceil(filteredUpdatedCards.length / pageSize) || 1;
  const paginatedUpdatedCards = useMemo(() => {
    const start = (updatedCardsPage - 1) * pageSize;
    return filteredUpdatedCards.slice(start, start + pageSize);
  }, [filteredUpdatedCards, updatedCardsPage]);

  // Unique boards & lists for filters in "Updated cards"
  const allUpdatedBoards = useMemo(
    () => Array.from(new Set(updatedCardsSource.map((c) => c.board))),
    [updatedCardsSource]
  );
  const allUpdatedLists = useMemo(
    () => Array.from(new Set(updatedCardsSource.map((c) => c.list))),
    [updatedCardsSource]
  );

  // Card selection handlers
  const handleToggleCard = (cardId) => {
    setSelectedCardIds((prev) =>
      prev.includes(cardId)
        ? prev.filter((id) => id !== cardId)
        : [...prev, cardId]
    );
  };

  const handleToggleAll = () => {
    if (selectedCardIds.length === departingCards.length) {
      setSelectedCardIds([]);
    } else {
      setSelectedCardIds(departingCards.map((c) => c.id));
    }
  };

  // Execution
  const handleConfirmHandover = async () => {
    if (!hasCredentials) {
      if (onOpenConfig) {
        onOpenConfig();
      }
      return;
    }

    setIsProcessing(true);
    setProgressInfo({
      current: 0,
      total: selectedCardIds.length,
      percent: 0,
      cardTitle: 'Connecting to Trello...',
    });

    try {
      if (onCompleteHandover) {
        const results = await onCompleteHandover({
          departingId: selectedDepartingId,
          replacementId: selectedReplacementId,
          cardIds: selectedCardIds,
          onProgress: (p) => setProgressInfo(p),
        });

        if (results && results.authRequired) {
          setIsProcessing(false);
          if (onOpenConfig) onOpenConfig();
          return;
        }

        setExecutionResults(results || null);
      }

      setIsProcessing(false);
      setIsCompleted(true);
      setCompletionView('SUMMARY');
    } catch (err) {
      setIsProcessing(false);
      if (err.message === 'AUTH_REQUIRED') {
        if (onOpenConfig) onOpenConfig();
      } else {
        alert('Trello reassignment notice: ' + err.message);
      }
    }
  };

  const handleRetryCard = (cardId) => {
    setRetryStatus((prev) => ({ ...prev, [cardId]: 'retrying' }));
    setTimeout(() => {
      setRetryStatus((prev) => ({ ...prev, [cardId]: 'success' }));
    }, 1000);
  };

  const handleCloseDialog = () => {
    if (typeof window !== 'undefined' && window.TrelloPowerUp) {
      try {
        const t = window.TrelloPowerUp.iframe();
        t.closeModal();
        return;
      } catch {
        // ignore
      }
    }
    if (onClose) onClose();
  };

  const handleResetToStart = () => {
    setCurrentStep(1);
    setIsCompleted(false);
    setCompletionView('SUMMARY');
    setIsProcessing(false);
    setSimulateEmptyState(false);
    setSearchQuery('');
    setCardSearchQuery('');
  };

  if (!isOpen) return null;

  const cardContent = (
    <div className="handover-modal-card transition-all">
      {/* ================= MODAL TOP BAR ================= */}
      <div className="flex items-center justify-between px-6 pt-4 pb-2 bg-white">
        <div className="flex items-center gap-2">
          <UsersIcon className="w-4 h-4" color="#0c66e4" />
          <span className="text-[15px] font-bold tracking-tight text-[#172b4d]">
            Member Handover
          </span>
        </div>
        <div className="flex items-center gap-2">
          {hasCredentials ? (
            <button
              type="button"
              onClick={onOpenConfig}
              title="Trello API connected. Click to edit."
              className="flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-full transition-colors cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Board Sync</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenConfig}
              title="Click to enter Trello API Key & Token for live updates"
              className="flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-full transition-colors cursor-pointer"
            >
              <span>🔑 Connect API Key</span>
            </button>
          )}
          <button
            onClick={handleCloseDialog}
            aria-label="Close dialog"
            className="p-1 rounded-md text-[#626f86] hover:text-[#172b4d] hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ================= STEPPER PROGRESS BAR ================= */}
      <div style={{ padding: '10px 24px 16px 24px', backgroundColor: '#ffffff', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Background Gray Connecting Line */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              left: '20px',
              right: '20px',
              height: '2px',
              backgroundColor: '#dfe1e6',
              zIndex: 0,
            }}
          >
            {/* Active Blue Progress Line */}
            <div
              style={{
                height: '100%',
                backgroundColor: '#0c66e4',
                transition: 'width 0.3s ease',
                width:
                  currentStep === 1
                    ? '0%'
                    : currentStep === 2
                    ? '33.3%'
                    : currentStep === 3
                    ? '66.6%'
                    : isCompleted
                    ? '100%'
                    : '85%',
              }}
            />
          </div>

          {/* Step 1: Select member */}
          <button
            type="button"
            onClick={() => !isProcessing && !isCompleted && setCurrentStep(1)}
            style={{
              zIndex: 1,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: currentStep >= 1 ? '#0c66e4' : '#dfe1e6',
                color: currentStep >= 1 ? '#ffffff' : '#626f86',
                boxShadow: '0 0 0 3px #ffffff',
                transition: 'all 0.2s ease',
              }}
            >
              {currentStep > 1 || isCompleted ? (
                <CheckIcon className="w-3.5 h-3.5" color="#ffffff" strokeWidth={3} />
              ) : (
                '1'
              )}
            </div>
            <span
              style={{
                marginTop: '6px',
                fontSize: '11.5px',
                lineHeight: '1.2',
                fontWeight: currentStep === 1 && !isCompleted ? 700 : 500,
                color: currentStep === 1 && !isCompleted ? '#172b4d' : '#626f86',
              }}
            >
              Select member
            </span>
          </button>

          {/* Step 2: Choose replacement */}
          <button
            type="button"
            onClick={() => !isProcessing && !isCompleted && currentStep > 2 && setCurrentStep(2)}
            style={{
              zIndex: 1,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              cursor: currentStep > 1 ? 'pointer' : 'default',
              padding: 0,
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: currentStep >= 2 ? '#0c66e4' : '#dfe1e6',
                color: currentStep >= 2 ? '#ffffff' : '#626f86',
                boxShadow: '0 0 0 3px #ffffff',
                transition: 'all 0.2s ease',
              }}
            >
              {currentStep > 2 || isCompleted ? (
                <CheckIcon className="w-3.5 h-3.5" color="#ffffff" strokeWidth={3} />
              ) : (
                '2'
              )}
            </div>
            <span
              style={{
                marginTop: '6px',
                fontSize: '11.5px',
                lineHeight: '1.2',
                fontWeight: currentStep === 2 && !isCompleted ? 700 : 500,
                color: currentStep === 2 && !isCompleted ? '#172b4d' : '#626f86',
              }}
            >
              Choose replacement
            </span>
          </button>

          {/* Step 3: Review cards */}
          <button
            type="button"
            onClick={() => !isProcessing && !isCompleted && currentStep > 3 && setCurrentStep(3)}
            style={{
              zIndex: 1,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              cursor: currentStep > 2 ? 'pointer' : 'default',
              padding: 0,
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: currentStep >= 3 ? '#0c66e4' : '#dfe1e6',
                color: currentStep >= 3 ? '#ffffff' : '#626f86',
                boxShadow: '0 0 0 3px #ffffff',
                transition: 'all 0.2s ease',
              }}
            >
              {currentStep > 3 || isCompleted ? (
                <CheckIcon className="w-3.5 h-3.5" color="#ffffff" strokeWidth={3} />
              ) : (
                '3'
              )}
            </div>
            <span
              style={{
                marginTop: '6px',
                fontSize: '11.5px',
                lineHeight: '1.2',
                fontWeight: currentStep === 3 && !isCompleted ? 700 : 500,
                color: currentStep === 3 && !isCompleted ? '#172b4d' : '#626f86',
              }}
            >
              Review cards
            </span>
          </button>

          {/* Step 4: Reassign */}
          <button
            type="button"
            style={{
              zIndex: 1,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              cursor: 'default',
              padding: 0,
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: currentStep >= 4 ? '#0c66e4' : '#dfe1e6',
                color: currentStep >= 4 ? '#ffffff' : '#626f86',
                boxShadow: '0 0 0 3px #ffffff',
                transition: 'all 0.2s ease',
              }}
            >
              {isCompleted ? (
                <CheckIcon className="w-3.5 h-3.5" color="#ffffff" strokeWidth={3} />
              ) : (
                '4'
              )}
            </div>
            <span
              style={{
                marginTop: '6px',
                fontSize: '11.5px',
                lineHeight: '1.2',
                fontWeight: currentStep === 4 && !isCompleted ? 700 : 500,
                color: currentStep === 4 && !isCompleted ? '#172b4d' : '#626f86',
              }}
            >
              Reassign
            </span>
          </button>
        </div>
      </div>

        {/* ================= MODAL BODY ================= */}
        <div className="px-6 sm:px-8 py-5 flex-1 overflow-y-auto max-h-[500px]">
          {/* ========================================================================= */}
          {/* SCREEN 1: SELECT DEPARTING MEMBER                                         */}
          {/* ========================================================================= */}
          {currentStep === 1 && !isCompleted && (
            <div>
              <div className="mb-4">
                <h3 className="text-[22px] font-bold text-[#172b4d] tracking-tight mb-1">
                  Select departing member
                </h3>
                <p className="text-[13.5px] text-[#44546f] leading-normal">
                  Choose the team member whose card assignments you want to
                  reassign across your boards.
                </p>
              </div>

              {/* Step 1 Departing Member Search Input */}
              <div className="search-input-wrapper">
                <div className="search-input-icon">
                  <SearchIcon style={{ width: '16px', height: '16px' }} color="#626f86" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a member..."
                  className="search-input-field"
                />
              </div>

              {/* Members List */}
              <div className="space-y-0.5 overflow-y-auto pr-1">
                {filteredStep1Members.map((member) => {
                  const isSelected = selectedDepartingId === member.id;
                  return (
                    <div
                      key={member.id}
                      onClick={() => {
                        setSelectedDepartingId(member.id);
                        if (onSelectDepartingMember) onSelectDepartingMember(member.id);
                      }}
                      className={`flex items-center gap-3.5 px-3.5 py-3 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#deebff]'
                          : 'bg-white hover:bg-[#f4f5f7]'
                      }`}
                    >
                      {/* Radio button */}
                      <div className="radio-button-container">
                        <div className={`custom-radio ${isSelected ? 'selected' : ''}`}>
                          {isSelected && <span className="custom-radio-dot" />}
                        </div>
                      </div>

                      {/* Avatar */}
                      <MemberAvatar member={member} size={38} />

                      {/* Name & Email */}
                      <div className="flex-1 min-w-0">
                        <span className="text-[14px] font-semibold text-[#172b4d] truncate block">
                          {member.name}
                        </span>
                        <div className="text-[12.5px] text-[#626f86] truncate">
                          {member.email}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SCREEN 2: CHOOSE REPLACEMENT MEMBER (Image 1)                             */}
          {/* ========================================================================= */}
          {currentStep === 2 && !isCompleted && (
            <div>
              <div className="mb-4">
                <h3 className="text-[22px] font-bold text-[#172b4d] tracking-tight mb-1">
                  Choose replacement member
                </h3>
                <p className="text-[13.5px] text-[#44546f] leading-normal">
                  Select the team member who will take ownership of the cards from{' '}
                  <span className="font-semibold text-[#172b4d]">
                    {departingMember?.name}
                  </span>
                  .
                </p>
              </div>

              {/* Step 2 Search input */}
              <div className="search-input-wrapper">
                <div className="search-input-icon">
                  <SearchIcon style={{ width: '16px', height: '16px' }} color="#626f86" />
                </div>
                <input
                  type="text"
                  value={replacementSearchQuery}
                  onChange={(e) => setReplacementSearchQuery(e.target.value)}
                  placeholder="Search for a member..."
                  className="search-input-field"
                />
              </div>

              {/* Members List */}
              <div className="space-y-0.5 overflow-y-auto pr-1">
                {filteredStep2Members.map((member) => {
                  const isSelected = selectedReplacementId === member.id;
                  return (
                    <div
                      key={member.id}
                      onClick={() => setSelectedReplacementId(member.id)}
                      className={`flex items-center gap-3.5 px-3.5 py-3 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#deebff]'
                          : 'bg-white hover:bg-[#f4f5f7]'
                      }`}
                    >
                      {/* Radio button */}
                      <div className="radio-button-container">
                        <div className={`custom-radio ${isSelected ? 'selected' : ''}`}>
                          {isSelected && <span className="custom-radio-dot" />}
                        </div>
                      </div>

                      {/* Avatar */}
                      <MemberAvatar member={member} size={38} />

                      {/* Name & Email */}
                      <div className="flex-1 min-w-0">
                        <span className="text-[14px] font-semibold text-[#172b4d] truncate block">
                          {member.name}
                        </span>
                        <div className="text-[12.5px] text-[#626f86] truncate">
                          {member.email}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SCREEN 3: REVIEW CARDS TO REASSIGN                                        */}
          {/* ========================================================================= */}
          {currentStep === 3 && !isCompleted && (
            <div>
              {departingCards.length === 0 ? (
                /* Empty state */
                <div className="py-4 text-center">
                  <NoCardsIllustration className="w-40 h-32 mb-2" />
                  <h3 className="text-[23px] font-bold text-[#172b4d] tracking-tight mb-2">
                    No cards found
                  </h3>
                  <p className="text-[13.5px] text-[#44546f] max-w-sm mx-auto mb-6 leading-normal">
                    {departingMember?.name} doesn't have any cards assigned across the accessible boards.
                  </p>
                  <div className="p-3.5 bg-[#edf5ff] border border-blue-100 rounded-lg text-left flex items-start gap-3">
                    <InfoCircleIcon className="w-5 h-5 flex-shrink-0 text-[#0c66e4] mt-0.5" />
                    <div className="text-[12.5px] text-[#172b4d] leading-relaxed">
                      <p className="font-medium text-[#172b4d]">
                        There are no cards to reassign for the selected member.
                      </p>
                      <p className="text-[#44546f] mt-0.5">
                        You can choose another member or close this window.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Review table */
                <div>
                  <div className="mb-3">
                    <h3 className="text-[22px] font-bold text-[#172b4d] tracking-tight mb-1">
                      Review cards to reassign
                    </h3>
                    <p className="text-[13.5px] text-[#44546f] leading-normal">
                      We found {departingCards.length} cards assigned to{' '}
                      {departingMember?.name} across {uniqueBoards.length} boards. Review
                      the list below before making changes.
                    </p>
                  </div>

                  {/* Mini From -> To Bar */}
                  <div className="p-3 bg-[#edf5ff] border border-blue-100/80 rounded-xl mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-[11.5px] text-[#626f86] font-medium">From</span>
                      <MemberAvatar member={departingMember} size={30} />
                      <div className="min-w-0">
                        <div className="text-[13px] font-bold text-[#172b4d] truncate">
                          {departingMember?.name}
                        </div>
                        <div className="text-[11px] text-[#626f86] truncate">
                          {departingMember?.email}
                        </div>
                      </div>
                    </div>
                    <div className="px-2 text-slate-400">
                      <ArrowRightIcon className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-[11.5px] text-[#626f86] font-medium">To</span>
                      <MemberAvatar member={replacementMember} size={30} />
                      <div className="min-w-0">
                        <div className="text-[13px] font-bold text-[#172b4d] truncate">
                          {replacementMember?.name}
                        </div>
                        <div className="text-[11px] text-[#626f86] truncate">
                          {replacementMember?.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Search bar */}
                  <div className="search-input-wrapper" style={{ marginBottom: '10px' }}>
                    <div className="search-input-icon">
                      <SearchIcon style={{ width: '15px', height: '15px' }} color="#626f86" />
                    </div>
                    <input
                      type="text"
                      value={cardSearchQuery}
                      onChange={(e) => setCardSearchQuery(e.target.value)}
                      placeholder="Search cards or boards..."
                      className="search-input-field"
                      style={{ height: '34px', fontSize: '13px' }}
                    />
                  </div>

                  {/* Table */}
                  <div className="border border-[#dfe1e6] rounded-lg overflow-hidden bg-white mb-2">
                    <div className="card-table-grid card-table-header">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={
                            selectedCardIds.length === departingCards.length &&
                            departingCards.length > 0
                          }
                          onChange={handleToggleAll}
                          className="custom-checkbox"
                        />
                      </div>
                      <div>Card</div>
                      <div>Board</div>
                      <div>List</div>
                      <div>Current assignee</div>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto">
                      {filteredCards.map((card) => {
                        const isChecked = selectedCardIds.includes(card.id);
                        return (
                          <div
                            key={card.id}
                            onClick={() => handleToggleCard(card.id)}
                            className={`card-table-grid card-table-row ${
                              !isChecked ? 'unselected' : ''
                            }`}
                          >
                            <div className="flex items-center justify-center">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleCard(card.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="custom-checkbox"
                              />
                            </div>
                            <div className="font-semibold text-[#172b4d] truncate pr-2">
                              {card.title}
                            </div>
                            <div className="text-[#626f86] truncate">{card.board}</div>
                            <div className="text-[#626f86] truncate">{card.list}</div>
                            <div className="flex items-center gap-2 min-w-0">
                              <MemberAvatar member={departingMember} size={20} />
                              <span className="text-[#172b4d] truncate text-[12px] font-medium">
                                {departingMember?.name}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary Bar */}
                  <div className="flex items-center justify-between text-xs py-1">
                    <div>
                      <div className="font-bold text-[#172b4d]">
                        {selectedCardIds.length} cards selected
                      </div>
                      <div className="text-[#626f86] text-[11.5px]">
                        Across {uniqueBoards.length} boards
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setViewByBoardMode(!viewByBoardMode)}
                      className="text-[#0c66e4] hover:underline font-semibold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <span>
                        {viewByBoardMode ? 'View flat list' : 'View cards by board'}
                      </span>
                      <span>›</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SCREEN 4: CONFIRM HANDOVER                                                */}
          {/* ========================================================================= */}
          {currentStep === 4 && !isCompleted && (
            <div>
              <div className="mb-4">
                <h3 className="text-[22px] font-bold text-[#172b4d] tracking-tight mb-1">
                  Confirm handover
                </h3>
                <p className="text-[13.5px] text-[#44546f] leading-normal">
                  Please review the details below before reassigning the cards.
                </p>
              </div>

              {/* From -> To Bar */}
              <div className="p-3 bg-[#edf5ff] border border-blue-100/80 rounded-xl mb-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-[11.5px] text-[#626f86] font-medium">From</span>
                  <MemberAvatar member={departingMember} size={32} />
                  <div className="min-w-0">
                    <div className="text-[13px] font-bold text-[#172b4d] truncate">
                      {departingMember?.name}
                    </div>
                    <div className="text-[11px] text-[#626f86] truncate">
                      {departingMember?.email}
                    </div>
                  </div>
                </div>
                <div className="px-2 text-slate-400">
                  <ArrowRightIcon className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-[11.5px] text-[#626f86] font-medium">To</span>
                  <MemberAvatar member={replacementMember} size={32} />
                  <div className="min-w-0">
                    <div className="text-[13px] font-bold text-[#172b4d] truncate">
                      {replacementMember?.name}
                    </div>
                    <div className="text-[11px] text-[#626f86] truncate">
                      {replacementMember?.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cards to be reassigned stats box */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #dfe1e6', borderRadius: '10px', padding: '12px 14px', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#172b4d', marginBottom: '10px' }}>
                  Cards to be reassigned
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#44546f' }}>
                      <CardIcon style={{ width: '16px', height: '16px', flexShrink: 0 }} color="#626f86" />
                      <span>Total cards</span>
                    </div>
                    <span style={{ fontWeight: 700, color: '#172b4d' }}>{selectedCardIds.length}</span>
                  </div>
                  <div style={{ height: '1px', backgroundColor: '#e2e8f0' }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#44546f' }}>
                      <BoardsIcon style={{ width: '16px', height: '16px', flexShrink: 0 }} color="#626f86" />
                      <span>Boards</span>
                    </div>
                    <span style={{ fontWeight: 700, color: '#172b4d' }}>{Math.max(1, uniqueBoards.length)}</span>
                  </div>
                  <div style={{ height: '1px', backgroundColor: '#e2e8f0' }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#44546f' }}>
                      <ListsIcon style={{ width: '16px', height: '16px', flexShrink: 0 }} color="#626f86" />
                      <span>Lists</span>
                    </div>
                    <span style={{ fontWeight: 700, color: '#172b4d' }}>{Math.max(1, uniqueLists.length)}</span>
                  </div>
                </div>
              </div>

              {/* Warning Callout Box */}
              <div style={{ backgroundColor: '#fff8e6', border: '1px solid #ffecb5', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <WarningTriangleIcon style={{ width: '18px', height: '18px', flexShrink: 0, marginTop: '2px' }} color="#d97706" />
                <div style={{ fontSize: '12px', lineHeight: '1.45' }}>
                  <div style={{ fontWeight: 700, color: '#172b4d', marginBottom: '2px' }}>
                    This will reassign card members
                  </div>
                  <div style={{ color: '#44546f' }}>
                    The selected cards will be updated to remove {departingMember?.name}{' '}
                    and assign {replacementMember?.name} as a member. This action cannot be undone.
                  </div>
                </div>
              </div>

              {!hasCredentials && (
                <div className="mt-3.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-left flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <AlertCircleIcon className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                    <div className="text-[12px] text-amber-900 leading-snug">
                      <span className="font-semibold block mb-0.5">Trello Board Sync Setup Required</span>
                      To update real cards on this board, Trello requires an API Key & Token.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenConfig}
                    className="px-3 py-1.5 text-[11.5px] font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-md transition-colors cursor-pointer flex-shrink-0"
                  >
                    Connect API
                  </button>
                </div>
              )}

              {isProcessing && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex flex-col items-center justify-center gap-2 text-xs font-semibold text-[#0c66e4]">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#0c66e4]/30 border-t-[#0c66e4] rounded-full animate-spin" />
                    <span>
                      {progressInfo
                        ? `Updating Trello board (${progressInfo.current} of ${progressInfo.total})...`
                        : 'Connecting to Trello REST API...'}
                    </span>
                  </div>
                  {progressInfo?.cardTitle && (
                    <div className="text-[11px] text-[#44546f] truncate max-w-xs font-normal">
                      Card: {progressInfo.cardTitle}
                    </div>
                  )}
                  {progressInfo?.percent !== undefined && (
                    <div className="w-full max-w-xs bg-blue-100 rounded-full h-1.5 overflow-hidden mt-1">
                      <div
                        className="bg-[#0c66e4] h-full transition-all duration-300"
                        style={{ width: `${progressInfo.percent}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* COMPLETION SUB-SCREEN 1: HANDOVER COMPLETE SUMMARY (Image 1)               */}
          {/* ========================================================================= */}
          {isCompleted && completionView === 'SUMMARY' && (
            <div className="py-2 animate-fadeIn text-center">
              {/* Green Checkmark */}
              <div className="w-14 h-14 mx-auto rounded-full bg-[#00875a] text-white flex items-center justify-center mb-3 shadow-sm">
                <CheckIcon className="w-7 h-7" color="#ffffff" strokeWidth={3.5} />
              </div>

              <h3 className="text-[23px] font-bold text-[#172b4d] tracking-tight mb-1">
                Handover complete
              </h3>
              {(() => {
                const updatedCount = executionResults ? executionResults.updated.length : selectedCardIds.length;
                const skippedCount = executionResults ? executionResults.skipped.length : 0;
                const failedCount = executionResults ? executionResults.failed.length : 0;

                return (
                  <>
                    <p className="text-[13.5px] text-[#44546f] max-w-sm mx-auto mb-4 leading-normal">
                      {updatedCount} {updatedCount === 1 ? 'card was' : 'cards were'} successfully reassigned from {departingMember?.name} to{' '}
                      {replacementMember?.name}.
                    </p>

                    {/* From -> To Bar (Image 1) */}
                    <div className="p-3 bg-[#edf5ff] border border-blue-100/80 rounded-xl mb-3 flex items-center justify-between text-left">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-[11.5px] text-[#626f86] font-medium">From</span>
                        <MemberAvatar member={departingMember} size={30} />
                        <div className="min-w-0">
                          <div className="text-[13px] font-bold text-[#172b4d] truncate">
                            {departingMember?.name}
                          </div>
                          <div className="text-[11px] text-[#626f86] truncate">
                            {departingMember?.email}
                          </div>
                        </div>
                      </div>
                      <div className="px-2 text-slate-400">
                        <ArrowRightIcon className="w-4 h-4" />
                      </div>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-[11.5px] text-[#626f86] font-medium">To</span>
                        <MemberAvatar member={replacementMember} size={30} />
                        <div className="min-w-0">
                          <div className="text-[13px] font-bold text-[#172b4d] truncate">
                            {replacementMember?.name}
                          </div>
                          <div className="text-[11px] text-[#626f86] truncate">
                            {replacementMember?.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Results Breakdown Box with "View details" button (Image 1) */}
                    <div className="p-3.5 bg-[#f8fafc] border border-slate-200/80 rounded-xl mb-3.5 text-left">
                      <div className="space-y-2 text-[13px]">
                        {/* Updated successfully */}
                        <div className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-2.5">
                            <div className="w-4 h-4 rounded-full bg-[#00875a] text-white flex items-center justify-center flex-shrink-0">
                              <CheckIcon className="w-2.5 h-2.5" color="#ffffff" strokeWidth={3.5} />
                            </div>
                            <div>
                              <div className="font-semibold text-[#172b4d]">Updated successfully</div>
                              <div className="text-[11px] text-[#626f86]">
                                Cards reassigned to {replacementMember?.name}
                              </div>
                            </div>
                          </div>
                          <span className="font-bold text-[#172b4d] text-sm">{updatedCount}</span>
                        </div>

                        <div className="h-px bg-slate-200/70" />

                        {/* Skipped (no permission) with [View details] */}
                        <div className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-2.5">
                            <ClockPendingIcon className="w-4 h-4 text-[#626f86] flex-shrink-0" />
                            <div>
                              <div className="font-semibold text-[#172b4d]">Skipped (no permission)</div>
                              <div className="text-[11px] text-[#626f86]">
                                You don't have permission to edit these cards.
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-[#172b4d] text-sm">{skippedCount}</span>
                            {skippedCount > 0 && (
                              <button
                                type="button"
                                onClick={() => setCompletionView('SKIPPED')}
                                className="px-2.5 py-1 text-xs font-semibold text-[#0c66e4] bg-[#edf5ff] hover:bg-[#dbeafe] rounded transition-colors cursor-pointer"
                              >
                                View details
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="h-px bg-slate-200/70" />

                        {/* Failed */}
                        <div className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-2.5">
                            <AlertCircleIcon className="w-4 h-4 text-[#626f86] flex-shrink-0" />
                            <div>
                              <div className="font-semibold text-[#172b4d]">Failed</div>
                              <div className="text-[11px] text-[#626f86]">
                                Could not update these cards.
                              </div>
                            </div>
                          </div>
                          <span className="font-bold text-[#172b4d] text-sm">{failedCount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Callout Box */}
                    {skippedCount === 0 && failedCount === 0 ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl mb-5 text-left flex items-start gap-2.5">
                        <CheckIcon className="w-4 h-4 flex-shrink-0 text-[#00875a] mt-0.5" />
                        <p className="text-[12px] text-[#172b4d] leading-relaxed">
                          All {updatedCount} {updatedCount === 1 ? 'card was' : 'cards were'} successfully reassigned to {replacementMember?.name}.
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-[#fff8e6] border border-[#ffecb5] rounded-xl mb-5 text-left flex items-start gap-2.5">
                        <WarningTriangleIcon className="w-4 h-4 flex-shrink-0 text-amber-700 mt-0.5" />
                        <p className="text-[12px] text-[#172b4d] leading-relaxed">
                          {skippedCount} {skippedCount === 1 ? 'card was' : 'cards were'} skipped because you don't have permission to edit them.
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}

              {/* Primary Buttons */}
              <div className="flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCompletionView('UPDATED')}
                  className="w-full py-2.5 px-4 text-[14px] font-semibold text-white bg-[#0c66e4] hover:bg-[#0055cc] rounded-md shadow-sm transition-colors cursor-pointer"
                >
                  View updated cards
                </button>
                <button
                  type="button"
                  onClick={handleCloseDialog}
                  className="text-[13.5px] font-semibold text-[#0c66e4] hover:underline cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* COMPLETION SUB-SCREEN 2: SKIPPED CARDS (3) (Image 2)                      */}
          {/* ========================================================================= */}
          {isCompleted && completionView === 'SKIPPED' && (
            <div className="animate-fadeIn">
              <div className="mb-3.5">
                <h3 className="text-[22px] font-bold text-[#172b4d] tracking-tight mb-1">
                  Skipped cards ({skippedCardsSource.length || (executionResults ? 0 : 3)})
                </h3>
                <p className="text-[13.5px] text-[#44546f] leading-normal">
                  These cards could not be reassigned. You can try again after
                  updating permissions or skip them for now.
                </p>
              </div>

              {/* Info Callout Box (Image 2) */}
              <div className="p-3 bg-[#edf5ff] border border-blue-100 rounded-xl mb-4 text-left flex items-start gap-2.5">
                <InfoCircleIcon className="w-4 h-4 flex-shrink-0 text-[#0c66e4] mt-0.5" />
                <p className="text-[12px] text-[#172b4d] leading-relaxed">
                  These cards could not be updated because you don't have permission to
                  edit them or the replacement member is not a member of the board.
                </p>
              </div>

              {/* Skipped Table (Image 2) */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white mb-2">
                <div className="grid grid-cols-[1.5fr_1fr_1.8fr_1fr] items-center px-3 py-2 bg-slate-50 border-b border-slate-200 text-[11.5px] font-bold text-[#626f86]">
                  <div>Card</div>
                  <div>Board</div>
                  <div>Reason</div>
                  <div className="text-right">Action</div>
                </div>

                <div className="divide-y divide-slate-100 text-[12px]">
                  {((skippedCardsSource.length > 0 || executionResults) ? skippedCardsSource : SKIPPED_CARDS_LIST).map((item) => {
                    const status = retryStatus[item.id];
                    return (
                      <div
                        key={item.id}
                        className="grid grid-cols-[1.5fr_1fr_1.8fr_1fr] items-center px-3 py-2.5 gap-2"
                      >
                        {/* Card Name + List */}
                        <div>
                          <div className="font-semibold text-[#172b4d]">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-[#626f86] flex items-center gap-1 mt-0.5">
                            <CardOutlineIcon className="w-3 h-3 text-slate-400" />
                            <span>List: {item.list}</span>
                          </div>
                        </div>

                        {/* Board */}
                        <div className="text-[#626f86] text-[12px]">
                          {item.board}
                        </div>

                        {/* Reason */}
                        <div className="text-[#626f86] text-[11.5px] leading-snug">
                          {item.reason}
                        </div>

                        {/* Action Dropdown */}
                        <div className="text-right">
                          <button
                            type="button"
                            onClick={() => handleRetryCard(item.id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#172b4d] bg-white border border-[#dfe1e6] hover:bg-slate-50 rounded-md transition-colors cursor-pointer"
                          >
                            <span>
                              {status === 'retrying'
                                ? 'Retrying...'
                                : status === 'success'
                                ? 'Resolved ✓'
                                : 'Try again'}
                            </span>
                            <ChevronDownIcon className="w-3 h-3 text-[#626f86]" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* COMPLETION SUB-SCREEN 3: UPDATED CARDS (21) (Image 4)                     */}
          {/* ========================================================================= */}
          {isCompleted && completionView === 'UPDATED' && (
            <div className="animate-fadeIn">
              <div className="mb-3">
                <h3 className="text-[22px] font-bold text-[#172b4d] tracking-tight mb-1">
                  Updated cards ({filteredUpdatedCards.length})
                </h3>
                <p className="text-[13px] text-[#44546f] leading-normal">
                  These cards were successfully reassigned from {departingMember?.name} to{' '}
                  {replacementMember?.name}.
                </p>
              </div>

              {/* Filters Bar: Search, Board, List (Image 4) */}
              <div className="flex items-center gap-2 mb-3">
                {/* Search input */}
                <div className="search-input-wrapper" style={{ flex: 1, marginBottom: 0 }}>
                  <div className="search-input-icon" style={{ left: '10px' }}>
                    <SearchIcon style={{ width: '14px', height: '14px' }} color="#626f86" />
                  </div>
                  <input
                    type="text"
                    value={updatedCardsSearch}
                    onChange={(e) => {
                      setUpdatedCardsSearch(e.target.value);
                      setUpdatedCardsPage(1);
                    }}
                    placeholder="Search cards by name..."
                    className="search-input-field"
                    style={{ height: '32px', fontSize: '12.5px', paddingLeft: '30px' }}
                  />
                </div>

                {/* All boards dropdown */}
                <div className="relative">
                  <select
                    value={updatedBoardFilter}
                    onChange={(e) => {
                      setUpdatedBoardFilter(e.target.value);
                      setUpdatedCardsPage(1);
                    }}
                    className="appearance-none pl-2.5 pr-7 py-1.5 text-[12.5px] bg-white border border-[#dfe1e6] rounded-md text-[#172b4d] font-medium focus:outline-none focus:border-[#0c66e4] cursor-pointer"
                  >
                    <option value="ALL">All boards</option>
                    {allUpdatedBoards.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="w-3.5 h-3.5 text-[#626f86] absolute right-2 top-2.5 pointer-events-none" />
                </div>

                {/* All lists dropdown */}
                <div className="relative">
                  <select
                    value={updatedListFilter}
                    onChange={(e) => {
                      setUpdatedListFilter(e.target.value);
                      setUpdatedCardsPage(1);
                    }}
                    className="appearance-none pl-2.5 pr-7 py-1.5 text-[12.5px] bg-white border border-[#dfe1e6] rounded-md text-[#172b4d] font-medium focus:outline-none focus:border-[#0c66e4] cursor-pointer"
                  >
                    <option value="ALL">All lists</option>
                    {allUpdatedLists.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="w-3.5 h-3.5 text-[#626f86] absolute right-2 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Updated Cards Table (Image 4) */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white mb-2.5">
                <div className="grid grid-cols-[1.6fr_1.1fr_1.1fr_1.4fr_1.4fr] items-center px-3 py-2 bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-[#626f86]">
                  <div>Card name</div>
                  <div>Board</div>
                  <div>List</div>
                  <div>Previous member</div>
                  <div>New member</div>
                </div>

                <div className="divide-y divide-slate-100 text-[12px] max-h-[220px] overflow-y-auto">
                  {paginatedUpdatedCards.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[1.6fr_1.1fr_1.1fr_1.4fr_1.4fr] items-center px-3 py-2 gap-1.5 hover:bg-slate-50 transition-colors"
                    >
                      {/* Card name with card outline icon */}
                      <div className="flex items-center gap-1.5 min-w-0 pr-1">
                        <CardOutlineIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="font-semibold text-[#172b4d] truncate">
                          {item.title}
                        </span>
                      </div>

                      {/* Board */}
                      <div className="text-[#626f86] text-[11.5px] truncate">
                        {item.board}
                      </div>

                      {/* List */}
                      <div className="text-[#626f86] text-[11.5px] truncate">
                        {item.list}
                      </div>

                      {/* Previous member */}
                      <div className="flex items-center gap-1.5 min-w-0">
                        <MemberAvatar member={departingMember} size={18} />
                        <span className="text-[#172b4d] truncate text-[11.5px]">
                          {departingMember?.name}
                        </span>
                      </div>

                      {/* New member */}
                      <div className="flex items-center gap-1.5 min-w-0">
                        <MemberAvatar member={replacementMember} size={18} />
                        <span className="text-[#172b4d] truncate text-[11.5px]">
                          {replacementMember?.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination Row (Image 4) */}
              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-[#626f86]">
                  Showing {(updatedCardsPage - 1) * pageSize + 1}–
                  {Math.min(updatedCardsPage * pageSize, filteredUpdatedCards.length)} of{' '}
                  {filteredUpdatedCards.length} cards
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={updatedCardsPage === 1}
                    onClick={() => setUpdatedCardsPage((p) => Math.max(1, p - 1))}
                    className="w-7 h-7 flex items-center justify-center border border-slate-200 rounded text-[#626f86] hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeftIcon className="w-3.5 h-3.5" />
                  </button>

                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    const isActive = updatedCardsPage === pageNum;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setUpdatedCardsPage(pageNum)}
                        className={`w-7 h-7 flex items-center justify-center rounded text-xs font-semibold cursor-pointer ${
                          isActive
                            ? 'bg-[#0c66e4] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-[#172b4d] hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={updatedCardsPage === totalPages}
                    onClick={() =>
                      setUpdatedCardsPage((p) => Math.min(totalPages, p + 1))
                    }
                    className="w-7 h-7 flex items-center justify-center border border-slate-200 rounded text-[#626f86] hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRightIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= FOOTER CONTROLS ================= */}
        <div className="px-6 py-4 bg-white flex items-center justify-between">
          {!isCompleted ? (
            <>
              {/* Left button: Back or Cancel */}
              <div>
                {currentStep === 1 ? null : currentStep === 4 ? (
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => setCurrentStep(3)}
                    className="px-4 py-2 text-[14px] font-semibold text-[#172b4d] bg-[#f4f5f7] hover:bg-[#ebecf0] rounded-md transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => setCurrentStep((s) => s - 1)}
                    className="px-4 py-2 text-[14px] font-semibold text-[#172b4d] bg-[#f4f5f7] hover:bg-[#ebecf0] rounded-md transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                )}
              </div>

              {/* Right button: Next or Confirm handover */}
              <div className="flex items-center gap-2">
                {currentStep < 4 ? (
                  <button
                    type="button"
                    disabled={
                      (currentStep === 1 && !selectedDepartingId) ||
                      (currentStep === 2 && !selectedReplacementId) ||
                      (currentStep === 3 && departingCards.length === 0)
                    }
                    onClick={() => setCurrentStep((s) => s + 1)}
                    className="px-6 py-2 text-[14px] font-semibold text-white bg-[#0c66e4] hover:bg-[#0055cc] active:bg-[#09326c] rounded-md shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleConfirmHandover}
                    className="px-6 py-2 text-[14px] font-semibold text-white bg-[#0c66e4] hover:bg-[#0055cc] active:bg-[#09326c] rounded-md shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isProcessing ? 'Processing...' : 'Confirm handover'}
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Footers for Completion Screens */
            <>
              {completionView === 'SUMMARY' ? (
                <div className="w-full flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleResetToStart}
                    className="text-xs font-semibold text-[#626f86] hover:text-[#172b4d] cursor-pointer"
                  >
                    Start New Handover
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseDialog}
                    className="px-5 py-2 text-[13.5px] font-semibold text-white bg-[#0c66e4] hover:bg-[#0055cc] rounded-md transition-colors cursor-pointer shadow-sm"
                  >
                    Done
                  </button>
                </div>
              ) : completionView === 'SKIPPED' ? (
                /* Footer for Skipped cards (Image 2): Back on left, Close on right */
                <div className="w-full flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCompletionView('SUMMARY')}
                    className="px-4 py-2 text-[14px] font-semibold text-[#172b4d] bg-[#f4f5f7] hover:bg-[#ebecf0] rounded-md transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseDialog}
                    className="px-6 py-2 text-[14px] font-semibold text-white bg-[#0c66e4] hover:bg-[#0055cc] rounded-md transition-colors cursor-pointer shadow-sm"
                  >
                    Close
                  </button>
                </div>
              ) : (
                /* Footer for Updated cards (Image 4): Back on left, Close on right */
                <div className="w-full flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCompletionView('SUMMARY')}
                    className="px-4 py-2 text-[14px] font-semibold text-[#172b4d] bg-[#f4f5f7] hover:bg-[#ebecf0] rounded-md transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseDialog}
                    className="px-6 py-2 text-[14px] font-semibold text-white bg-[#0c66e4] hover:bg-[#0055cc] rounded-md transition-colors cursor-pointer shadow-sm"
                  >
                    Close
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );

    if (isInline) {
      return cardContent;
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
        {cardContent}
      </div>
    );
}
