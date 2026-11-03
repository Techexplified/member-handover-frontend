// Trello Live API & Power-Up Integration Service

const TRELLO_API_BASE = 'https://api.trello.com/1';

// Read API credentials from environment or localStorage or URL parameters
export function getTrelloCredentials() {
  const urlParams = new URLSearchParams(window.location.search);
  const queryKey = urlParams.get('key');
  const queryToken = urlParams.get('token');

  const apiKey =
    queryKey ||
    import.meta.env.VITE_TRELLO_API_KEY ||
    localStorage.getItem('trello_api_key') ||
    '';

  const token =
    queryToken ||
    import.meta.env.VITE_TRELLO_TOKEN ||
    localStorage.getItem('trello_token') ||
    '';

  const workspaceId =
    urlParams.get('workspace') ||
    localStorage.getItem('trello_workspace_id') ||
    '';

  return { apiKey, token, workspaceId };
}

export function saveTrelloCredentials(apiKey, token, workspaceId = '') {
  if (apiKey) localStorage.setItem('trello_api_key', apiKey.trim());
  if (token) localStorage.setItem('trello_token', token.trim());
  if (workspaceId) localStorage.setItem('trello_workspace_id', workspaceId.trim());
}

export function clearTrelloCredentials() {
  localStorage.removeItem('trello_api_key');
  localStorage.removeItem('trello_token');
  localStorage.removeItem('trello_workspace_id');
}

export function isTrelloLiveConnected() {
  // If running inside actual Trello iframe modal
  if (typeof window !== 'undefined' && window.self !== window.top && window.TrelloPowerUp) {
    return true;
  }
  const { apiKey, token } = getTrelloCredentials();
  return Boolean(apiKey && token);
}

// Generate 1-click Authorization URL for users
export function getTrelloAuthorizeUrl(apiKey) {
  const key = apiKey || getTrelloCredentials().apiKey;
  const returnUrl = encodeURIComponent(window.location.origin + window.location.pathname);
  return `https://trello.com/1/authorize?expiration=never&name=Member+Handover+PowerUp&scope=read,write,account&response_type=token&key=${key}&return_url=${returnUrl}`;
}

// Fetch Workspaces (Organizations) the authenticated user belongs to
export async function fetchLiveWorkspaces() {
  const { apiKey, token } = getTrelloCredentials();
  if (!apiKey || !token) throw new Error('Trello API key and token are required');

  const res = await fetch(
    `${TRELLO_API_BASE}/members/me/organizations?key=${apiKey}&token=${token}&fields=id,name,displayName,desc,url`
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch workspaces: ${res.status} - ${errorText}`);
  }

  const data = await res.json();
  return data.map((org) => ({
    id: org.id,
    name: org.name,
    displayName: org.displayName,
    url: org.url,
  }));
}

// Fetch Live Members of a Workspace
export async function fetchLiveWorkspaceMembers(targetWorkspaceId = null) {
  // If running inside Trello Power-Up iframe, automatically fetch real board/workspace members
  if (typeof window !== 'undefined' && window.self !== window.top && window.TrelloPowerUp) {
    try {
      const t = window.TrelloPowerUp.iframe();
      const [board, cards] = await Promise.all([
        t.board('id', 'name', 'members'),
        t.cards('id', 'idMembers').catch(() => []),
      ]);
      if (board && board.members && board.members.length > 0) {
        return board.members.map((m) => {
          const colors = [
            { bg: '#dbeafe', color: '#1e40af' },
            { bg: '#dcfce7', color: '#166534' },
            { bg: '#fee2e2', color: '#991b1b' },
            { bg: '#fef3c7', color: '#92400e' },
            { bg: '#f3e8ff', color: '#6b21a8' },
          ];
          const colorIdx = Math.abs((m.id || '').charCodeAt(0)) % colors.length;
          const assignedCards = (cards || []).filter(
            (c) => c.idMembers && c.idMembers.includes(m.id)
          );
          return {
            id: m.id,
            name: m.fullName || m.username,
            username: m.username,
            email: `${m.username}@company.com`,
            avatarType: m.avatarUrl ? 'photo' : 'initials',
            avatarUrl: m.avatarUrl ? `${m.avatarUrl}/170.png` : null,
            initials: m.initials || (m.fullName || m.username || 'TM').substring(0, 2).toUpperCase(),
            bg: colors[colorIdx].bg,
            color: colors[colorIdx].color,
            role: 'Team Member',
            cardsCount: assignedCards.length,
          };
        });
      }
    } catch (err) {
      console.warn('Trello iframe context fetch fallback:', err);
    }
  }

  const { apiKey, token, workspaceId: savedWorkspaceId } = getTrelloCredentials();
  if (!apiKey || !token) throw new Error('Trello credentials missing');

  let workspaceId = targetWorkspaceId || savedWorkspaceId;

  // If no workspaceId provided, get the user's first workspace
  if (!workspaceId) {
    const workspaces = await fetchLiveWorkspaces();
    if (workspaces.length === 0) {
      throw new Error('No workspaces found for your Trello account');
    }
    workspaceId = workspaces[0].id;
    saveTrelloCredentials(apiKey, token, workspaceId);
  }

  const res = await fetch(
    `${TRELLO_API_BASE}/organizations/${workspaceId}/members?key=${apiKey}&token=${token}&fields=id,fullName,username,avatarUrl,initials,activityBlocked`
  );

  if (!res.ok) {
    throw new Error(`Trello API error: ${res.statusText}`);
  }

  const rawMembers = await res.json();

  return rawMembers.map((m) => {
    // Generate distinct color from initials for fallback
    const colors = [
      { bg: '#dbeafe', color: '#1e40af' },
      { bg: '#dcfce7', color: '#166534' },
      { bg: '#fee2e2', color: '#991b1b' },
      { bg: '#fef3c7', color: '#92400e' },
      { bg: '#f3e8ff', color: '#6b21a8' },
    ];
    const colorIdx = Math.abs(m.id.charCodeAt(0) + m.id.charCodeAt(m.id.length - 1)) % colors.length;

    return {
      id: m.id,
      name: m.fullName || m.username,
      username: m.username,
      email: `${m.username}@company.com`, // Trello API protects emails by default unless authorized
      avatarType: m.avatarUrl ? 'photo' : 'initials',
      avatarUrl: m.avatarUrl ? `${m.avatarUrl}/170.png` : null,
      initials: m.initials || m.fullName?.substring(0, 2).toUpperCase() || 'TM',
      bg: colors[colorIdx].bg,
      color: colors[colorIdx].color,
      role: 'Team Member',
      cardsCount: 0, // Will be populated dynamically
    };
  });
}

// Fetch all live cards assigned to a member across boards
export async function fetchLiveMemberCards(memberId) {
  // If running inside Trello Power-Up iframe, fetch cards from the current board directly
  if (typeof window !== 'undefined' && window.self !== window.top && window.TrelloPowerUp) {
    try {
      const t = window.TrelloPowerUp.iframe();
      const [board, boardCards, boardLists] = await Promise.all([
        t.board('id', 'name'),
        t.cards('id', 'name', 'idMembers', 'idList', 'due'),
        t.lists('id', 'name').catch(() => []),
      ]);

      const listMap = (boardLists || []).reduce((acc, l) => {
        acc[l.id] = l.name;
        return acc;
      }, {});

      const memberCards = (boardCards || []).filter(
        (c) => c.idMembers && c.idMembers.includes(memberId)
      );

      return memberCards.map((c) => ({
        id: c.id,
        title: c.name,
        board: board?.name || 'Current Board',
        boardId: board?.id,
        boardColor: '#0079bf',
        list: listMap[c.idList] || 'In Progress',
        listId: c.idList,
        memberId: memberId,
        dueDate: c.due ? new Date(c.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null,
        canEdit: true,
      }));
    } catch (err) {
      console.warn('Trello iframe cards fetch fallback:', err);
    }
  }

  const { apiKey, token } = getTrelloCredentials();
  if (!apiKey || !token) throw new Error('Trello credentials missing');

  const res = await fetch(
    `${TRELLO_API_BASE}/members/${memberId}/cards?key=${apiKey}&token=${token}&fields=id,name,idBoard,idList,due,dueComplete,url,labels&board=true&board_fields=name,prefs&list=true&list_fields=name`
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch cards for member ${memberId}: ${res.statusText}`);
  }

  const rawCards = await res.json();

  return rawCards.map((c) => ({
    id: c.id,
    title: c.name,
    board: c.board?.name || 'Untitled Board',
    boardId: c.idBoard,
    boardColor: c.board?.prefs?.backgroundColor || '#0079bf',
    list: c.list?.name || 'To Do',
    listId: c.idList,
    memberId: memberId,
    dueDate: c.due ? new Date(c.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null,
    canEdit: true,
  }));
}

// Live Reassignment Execution on Trello Server
export async function executeLiveReassignment({
  departingMemberId,
  replacementMemberId,
  cardIds,
  cards,
  onProgress,
}) {
  const { apiKey, token } = getTrelloCredentials();
  if (!apiKey || !token) throw new Error('Trello credentials missing');

  const results = {
    updated: [],
    skipped: [],
    failed: [],
  };

  const total = cardIds.length;
  let processed = 0;

  for (const cardId of cardIds) {
    const cardObj = cards.find((c) => c.id === cardId) || { id: cardId, title: 'Card', board: 'Board' };
    processed += 1;

    if (onProgress) {
      onProgress({
        current: processed,
        total,
        percent: Math.round((processed / total) * 100),
        cardTitle: cardObj.title,
      });
    }

    try {
      // 1. Add replacement member (if not 'unassigned')
      if (replacementMemberId && replacementMemberId !== 'unassigned') {
        const addRes = await fetch(
          `${TRELLO_API_BASE}/cards/${cardId}/idMembers?value=${replacementMemberId}&key=${apiKey}&token=${token}`,
          { method: 'POST' }
        );

        if (!addRes.ok) {
          if (addRes.status === 401 || addRes.status === 403) {
            results.skipped.push({
              id: cardId,
              title: cardObj.title,
              board: cardObj.board,
              list: cardObj.list,
              reason: "Replacement member is not a member of this board, or you don't have permission.",
            });
            continue;
          }
          throw new Error(`HTTP ${addRes.status}`);
        }
      }

      // 2. Remove departing member
      if (departingMemberId) {
        const removeRes = await fetch(
          `${TRELLO_API_BASE}/cards/${cardId}/idMembers/${departingMemberId}?key=${apiKey}&token=${token}`,
          { method: 'DELETE' }
        );

        if (!removeRes.ok && (removeRes.status === 401 || removeRes.status === 403)) {
          results.skipped.push({
            id: cardId,
            title: cardObj.title,
            board: cardObj.board,
            list: cardObj.list,
            reason: "You don't have permission to edit this card.",
          });
          continue;
        }
      }

      // 3. Add audit handover comment to card
      try {
        await fetch(
          `${TRELLO_API_BASE}/cards/${cardId}/actions/comments?text=${encodeURIComponent(
            '🔄 Card handed over via Member Handover Power-Up.'
          )}&key=${apiKey}&token=${token}`,
          { method: 'POST' }
        );
      } catch {
        // Comment failure is non-blocking
      }

      results.updated.push({
        id: cardId,
        title: cardObj.title,
        board: cardObj.board,
        list: cardObj.list,
      });
    } catch (err) {
      results.failed.push({
        id: cardId,
        title: cardObj.title,
        board: cardObj.board,
        error: err.message,
      });
    }
  }

  return results;
}

