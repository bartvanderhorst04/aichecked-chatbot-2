/**
 * AIChecked.nl chatbot embed loader.
 *
 * Usage on any static HTML page (before </body>):
 *   <script src="https://chat.aichecked.nl/embed.js" defer></script>
 *
 * Injects an iframe pointing to https://chat.aichecked.nl/embed and resizes it
 * when the widget opens/closes, so the iframe never blocks clicks on the page.
 * No API keys are involved: all OpenAI/e-mail calls happen server-side on
 * chat.aichecked.nl.
 */
(function () {
  'use strict';

  if (window.__aicheckedChatbotLoaded) return;
  window.__aicheckedChatbotLoaded = true;

  var ORIGIN = 'https://chat.aichecked.nl';

  var currentScript = document.currentScript;
  if (currentScript && currentScript.src) {
    try {
      ORIGIN = new URL(currentScript.src).origin;
    } catch (e) {
      /* keep default */
    }
  }

  var isOpen = false;
  var isReady = false;
  var host = document.createElement('div');
  var iframe = document.createElement('iframe');

  iframe.src = ORIGIN + '/embed';
  iframe.title = 'AIChecked AI-assistent';
  iframe.setAttribute('aria-label', 'AIChecked AI-assistent');
  iframe.setAttribute('allowtransparency', 'true');
  iframe.setAttribute('scrolling', 'no');

  var hostStyle = {
    position: 'fixed',
    right: '0',
    bottom: '0',
    zIndex: '2147483646',
    pointerEvents: 'none',
    background: 'transparent',
    border: 'none',
    margin: '0',
    padding: '0',
    overflow: 'hidden',
    width: '0',
    height: '0',
    opacity: '0',
    visibility: 'hidden'
  };
  for (var hostKey in hostStyle) host.style[hostKey] = hostStyle[hostKey];

  var iframeStyle = {
    position: 'absolute',
    top: '0',
    left: '0',
    border: 'none',
    background: 'transparent',
    colorScheme: 'normal',
    display: 'block',
    margin: '0',
    padding: '0',
    pointerEvents: 'auto',
    width: '0',
    height: '0'
  };
  for (var iframeKey in iframeStyle) iframe.style[iframeKey] = iframeStyle[iframeKey];

  function px(value) {
    return Math.round(value) + 'px';
  }

  function revealHost() {
    if (isReady) return;
    isReady = true;
    host.style.opacity = '1';
    host.style.visibility = 'visible';
  }

  function applyLayout() {
    if (!isReady) {
      host.style.width = '0';
      host.style.height = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      return;
    }

    var mobile = window.innerWidth < 768;

    if (isOpen) {
      if (mobile) {
        var panelHeight = Math.min(Math.round(window.innerHeight * 0.7), 560);
        var panelTop = window.innerHeight - 89 - panelHeight;

        host.style.right = '12px';
        host.style.bottom = '12px';
        host.style.width = px(window.innerWidth - 24);
        host.style.height = px(panelHeight + 77);

        iframe.style.width = px(window.innerWidth);
        iframe.style.height = px(window.innerHeight);
        iframe.style.left = '-12px';
        iframe.style.top = '-' + px(panelTop);
      } else {
        host.style.right = '24px';
        host.style.bottom = '24px';
        host.style.width = '413px';
        host.style.height = '703px';

        iframe.style.width = '450px';
        iframe.style.height = '760px';
        iframe.style.left = '-13px';
        iframe.style.top = '-33px';
      }
    } else {
      if (mobile) {
        host.style.right = '12px';
        host.style.bottom = '12px';
        host.style.width = '238px';
        host.style.height = '65px';

        iframe.style.width = '262px';
        iframe.style.height = '88px';
        iframe.style.left = '-12px';
        iframe.style.top = '-11px';
      } else {
        host.style.right = '24px';
        host.style.bottom = '24px';
        host.style.width = '275px';
        host.style.height = '70px';

        iframe.style.width = '312px';
        iframe.style.height = '106px';
        iframe.style.left = '-13px';
        iframe.style.top = '-12px';
      }
    }
  }

  window.addEventListener('message', function (event) {
    if (event.origin !== ORIGIN) return;
    var data = event.data;
    if (data && data.type === 'aichecked:widget') {
      revealHost();
      isOpen = !!data.open;
      applyLayout();
    }
  });

  window.addEventListener('resize', applyLayout);

  function mount() {
    host.appendChild(iframe);
    document.body.appendChild(host);
  }

  if (document.body) {
    mount();
  } else {
    document.addEventListener('DOMContentLoaded', mount);
  }
})();
