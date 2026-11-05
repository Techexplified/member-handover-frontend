// Trello Live API & Power-Up Integration Service

const TRELLO_API_BASE = 'https://api.trello.com/1';

// Read API credentials from environment or localStorage or URL parameters synchronously
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

// Read API credentials asynchronously, falling back to Trello's private plugin storage
export async function getTrelloCredentialsAsync() {
  const creds = getTrelloCredentials();
  let apiKey = creds.apiKey;
  let token = creds.token;
  let workspaceId = creds.workspaceId;

  if ((!apiKey || !token) && typeof window !== 'undefined' && window.TrelloPowerUp) {
    try {
      const t = window.TrelloPowerUp.iframe();
      const [storedKey, storedToken] = await Promise.all([
        t.get('member', 'private', 'trello_api_key').catch(() => null),
        t.get('member', 'private', 'trello_token').catch(() => null),
      ]);
      if (storedKey && !apiKey) apiKey = storedKey;
      if (storedToken && !token) token = storedToken;
    } catch {
      // ignore
    }
  }

  return { apiKey, token, workspaceId };
}

export async function saveTrelloCredentials(apiKey, token, workspaceId = '') {
  if (apiKey) localStorage.setItem('trello_api_key', apiKey.trim());
  if (token) localStorage.setItem('trello_token', token.trim());
  if (workspaceId) localStorage.setItem('trello_workspace_id', workspaceId.trim());

  if (typeof window !== 'undefined' && window.TrelloPowerUp) {
    try {
      const t = window.TrelloPowerUp.iframe();
      if (apiKey) await t.set('member', 'private', 'trello_api_key', apiKey.trim());
      if (token) await t.set('member', 'private', 'trello_token', token.trim());
    } catch {
      // ignore
    }
  }
}

export async function clearTrelloCredentials() {
  localStorage.removeItem('trello_api_key');
  localStorage.removeItem('trello_token');
  localStorage.removeItem('trello_workspace_id');

  if (typeof window !== 'undefined' && window.TrelloPowerUp) {
    try {
      const t = window.TrelloPowerUp.iframe();
      await t.remove('member', 'private', 'trello_api_key');
      await t.remove('member', 'private', 'trello_token');
    } catch {
      // ignore
    }
  }
}

export function isTrelloLiveConnected() {
  // If running inside actual Trello iframe modal
  if (typeof window !== 'undefined' && window.self !== window.top && window.TrelloPowerUp) {
    return true;
  }
  const { apiKey, token } = getTrelloCredentials();
  return Boolean(apiKey && token);
}

export function hasTrelloApiCredentials() {
  const { apiKey, token } = getTrelloCredentials();
  return Boolean(apiKey && token);
}

// Verify credentials against Trello REST API
export async function verifyTrelloCredentials(apiKey, token) {
  if (!apiKey || !token) throw new Error('API Key and Token are required.');
  const res = await fetch(`${TRELLO_API_BASE}/members/me?key=${apiKey.trim()}&token=${token.trim()}&fields=id,username,fullName`);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Authentication failed (${res.status}): ${errorText}`);
  }
  return await res.json();
}

// Generate 1-click Authorization URL for users
export function getTrelloAuthorizeUrl(apiKey) {
  const key = apiKey || getTrelloCredentials().apiKey;
  const returnUrl = encodeURIComponent(window.location.origin + '/auth-callback.html');
  return `https://trello.com/1/authorize?expiration=never&name=Member+Handover&scope=read,write,account&response_type=token&key=${key}&return_url=${returnUrl}`;
}

// Fetch Workspaces (Organizations) the authenticated user belongs to
export async function fetchLiveWorkspaces() {
  const { apiKey, token } = await getTrelloCredentialsAsync();
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

// Helper to check if a card is assigned to a member (handles SDK 'members', 'idMembers', username & ID)
export function isCardAssignedToMember(card, memberId, membersList = []) {
  if (!card || !memberId) return false;
  const target = String(memberId).toLowerCase().trim();

  // Find member in known members list to match both 24-hex ID, username, and fullName
  const knownMember = membersList.find(
    (m) =>
      String(m.id).toLowerCase().trim() === target ||
      String(m.username || '').toLowerCase().trim() === target ||
      String(m.name || '').toLowerCase().trim() === target
  );

  const targets = new Set([target]);
  if (knownMember) {
    if (knownMember.id) targets.add(String(knownMember.id).toLowerCase().trim());
    if (knownMember.username) targets.add(String(knownMember.username).toLowerCase().trim());
    if (knownMember.fullName) targets.add(String(knownMember.fullName).toLowerCase().trim());
  }

  // 1. Check card.idMembers (array of member ID strings)
  if (Array.isArray(card.idMembers)) {
    if (card.idMembers.some((id) => targets.has(String(id).toLowerCase().trim()))) {
      return true;
    }
  }

  // 2. Check card.members (array of member objects or string IDs)
  if (Array.isArray(card.members)) {
    if (
      card.members.some((m) => {
        if (!m) return false;
        if (typeof m === 'string') return targets.has(m.toLowerCase().trim());
        return (
          (m.id && targets.has(String(m.id).toLowerCase().trim())) ||
          (m.username && targets.has(String(m.username).toLowerCase().trim())) ||
          (m.fullName && targets.has(String(m.fullName).toLowerCase().trim()))
        );
      })
    ) {
      return true;
    }
  }

  return false;
}

// Fetch Live Members of a Board or Workspace
export async function fetchLiveWorkspaceMembers(targetWorkspaceId = null) {
  // If running inside Trello Power-Up iframe, automatically fetch real board members
  if (typeof window !== 'undefined' && window.self !== window.top && window.TrelloPowerUp) {
    try {
      const t = window.TrelloPowerUp.iframe();
      let boardCards = [];
      try {
        boardCards = await t.cards('id', 'name', 'idList', 'idMembers', 'members', 'due');
      } catch {
        boardCards = await t.cards('all').catch(() => []);
      }
      if (!boardCards || boardCards.length === 0) {
        boardCards = await t.cards('all').catch(() => []);
      }

      const board = await t.board('id', 'name', 'members').catch(() => null);

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
          const assignedCards = (boardCards || []).filter(
            (c) => isCardAssignedToMember(c, m.id, board.members) || isCardAssignedToMember(c, m.username, board.members)
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

  const { apiKey, token, workspaceId: savedWorkspaceId } = await getTrelloCredentialsAsync();
  if (!apiKey || !token) throw new Error('Trello credentials missing');

  let workspaceId = targetWorkspaceId || savedWorkspaceId;

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
      email: `${m.username}@company.com`,
      avatarType: m.avatarUrl ? 'photo' : 'initials',
      avatarUrl: m.avatarUrl ? `${m.avatarUrl}/170.png` : null,
      initials: m.initials || m.fullName?.substring(0, 2).toUpperCase() || 'TM',
      bg: colors[colorIdx].bg,
      color: colors[colorIdx].color,
      role: 'Team Member',
      cardsCount: 0,
    };
  });
}

// Fetch all live cards assigned to a member across boards
export async function fetchLiveMemberCards(memberId, allMembers = []) {
  // If running inside Trello Power-Up iframe, fetch cards from current board directly
  if (typeof window !== 'undefined' && window.self !== window.top && window.TrelloPowerUp) {
    try {
      const t = window.TrelloPowerUp.iframe();
      let boardCards = [];
      try {
        boardCards = await t.cards('id', 'name', 'idList', 'idMembers', 'members', 'due');
      } catch {
        boardCards = await t.cards('all').catch(() => []);
      }
      if (!boardCards || boardCards.length === 0) {
        boardCards = await t.cards('all').catch(() => []);
      }

      const [board, boardLists] = await Promise.all([
        t.board('id', 'name').catch(() => null),
        t.lists('id', 'name').catch(() => []),
      ]);

      const listMap = (boardLists || []).reduce((acc, l) => {
        acc[l.id] = l.name;
        return acc;
      }, {});

      const memberCards = (boardCards || []).filter((c) =>
        isCardAssignedToMember(c, memberId, allMembers)
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

  const { apiKey, token } = await getTrelloCredentialsAsync();
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
  cards = [],
  members = [],
  onProgress,
}) {
  const { apiKey, token } = await getTrelloCredentialsAsync();
  if (!apiKey || !token) {
    throw new Error('AUTH_REQUIRED');
  }

  const departingObj = members.find((m) => m.id === departingMemberId || m.username === departingMemberId);
  const replacementObj = members.find((m) => m.id === replacementMemberId || m.username === replacementMemberId);

  const depIdOrUser = departingObj?.id || departingMemberId;
  const repIdOrUser = replacementObj?.id || replacementMemberId;

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
      if (repIdOrUser && repIdOrUser !== 'unassigned') {
        const addRes = await fetch(
          `${TRELLO_API_BASE}/cards/${cardId}/idMembers?value=${encodeURIComponent(repIdOrUser)}&key=${apiKey}&token=${token}`,
          { method: 'POST' }
        );

        if (!addRes.ok) {
          const errText = await addRes.text();
          // If member is already assigned, Trello might respond with 400 'member already added'
          if (!errText.toLowerCase().includes('already')) {
            if (addRes.status === 401 || addRes.status === 403) {
              results.skipped.push({
                id: cardId,
                title: cardObj.title,
                board: cardObj.board,
                list: cardObj.list,
                reason: "Permission denied: You or the replacement member don't have permission on this card.",
              });
              continue;
            }
            throw new Error(`Failed to assign member: HTTP ${addRes.status} (${errText})`);
          }
        }
      }

      // 2. Remove departing member
      if (depIdOrUser) {
        const removeRes = await fetch(
          `${TRELLO_API_BASE}/cards/${cardId}/idMembers/${encodeURIComponent(depIdOrUser)}?key=${apiKey}&token=${token}`,
          { method: 'DELETE' }
        );

        if (!removeRes.ok && (removeRes.status === 401 || removeRes.status === 403)) {
          results.skipped.push({
            id: cardId,
            title: cardObj.title,
            board: cardObj.board,
            list: cardObj.list,
            reason: "Permission denied: You don't have permission to remove members from this card.",
          });
          continue;
        }
      }

      // 3. Add audit handover comment to card
      try {
        await fetch(
          `${TRELLO_API_BASE}/cards/${cardId}/actions/comments?text=${encodeURIComponent(
            `🔄 Card handed over from ${departingObj?.name || 'previous member'} to ${replacementObj?.name || 'new member'} via Member Handover Power-Up.`
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
