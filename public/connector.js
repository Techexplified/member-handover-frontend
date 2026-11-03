/* Trello Power-Up Connector Script */
/* global window, TrelloPowerUp */

if (typeof window !== 'undefined' && window.TrelloPowerUp) {
  window.TrelloPowerUp.initialize({
    // Adds the "Member Handover" button to the board header in Trello
    'board-buttons': function (t) {
      return [
        {
          icon: {
            dark: 'https://p.trellocdn.com/icons/light/member.svg',
            light: 'https://p.trellocdn.com/icons/dark/member.svg',
          },
          text: 'Member Handover',
          callback: function (t) {
            return t.modal({
              title: 'Member Handover',
              url: './index.html',
              accentColor: '#0c66e4',
              height: 640,
              fullscreen: false,
            });
          },
        },
      ];
    },

    // Capability to initialize authorization
    'authorization-status': function (t) {
      return t.get('member', 'private', 'token').then(function (token) {
        return { authorized: Boolean(token) };
      });
    },

    'show-authorization': function (t) {
      return t.popup({
        title: 'Authorize Member Handover',
        url: './index.html?auth=true',
        height: 300,
      });
    },
  });
}

