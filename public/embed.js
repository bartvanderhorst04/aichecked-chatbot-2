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

  // Allow local testing: <script src="http://localhost:3000/embed.js">
  var currentScript = document.currentScript;
  if (currentScript && currentScript.src) {
    try {
      ORIGIN = new URL(currentScript.src).origin;
    } catch (e) {
      /* keep default */
    }
  }

  var isOpen = false;
  var iframe = document.createElement('iframe');
  iframe.src = ORIGIN + '/embed';
  iframe.title = 'AIChecked AI-assistent';
  iframe.setAttribute('aria-label', 'AIChecked AI-assistent');
  iframe.setAttribute('allowtransparency', 'true');

  var baseStyle = {
    position: 'fixed',
    bottom: '0',
    right: '0',
    border: 'none',
    background: 'transparent',
    colorScheme: 'normal',
    zIndex: '2147483646',
    maxWidth: '100vw',
    maxHeight: '100vh',
    transition: 'width 0.2s ease, height 0.2s ease',
  };
  for (var key in baseStyle) iframe.style[key] = baseStyle[key];

  function applySize() {
    var mobile = window.innerWidth < 768;
    if (isOpen) {
      if (mobile) {
        iframe.style.width = '100vw';
        iframe.style.height = '100vh';
      } else {
        // Panel (408px wide, ends 727px above the bottom) + margins.
        iframe.style.width = '450px';
        iframe.style.height = '760px';
      }
    } else {
      // Just the launcher pill (max 275x70 at 24px offsets) + hover shadow.
      iframe.style.width = mobile ? '262px' : '312px';
      iframe.style.height = mobile ? '88px' : '106px';
    }
  }

  window.addEventListener('message', function (event) {
    if (event.origin !== ORIGIN) return;
    var data = event.data;
    if (data && data.type === 'aichecked:widget') {
      isOpen = !!data.open;
      applySize();
    }
  });

  window.addEventListener('resize', applySize);

  function mount() {
    applySize();
    document.body.appendChild(iframe);
  }

  if (document.body) {
    mount();
  } else {
    document.addEventListener('DOMContentLoaded', mount);
  }
})();
