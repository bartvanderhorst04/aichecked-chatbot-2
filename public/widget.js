(function () {
  'use strict';
  if (window.__wvbChatbotLoaded) return;
  window.__wvbChatbotLoaded = true;
  var script = document.currentScript;
  var origin = script && script.src ? new URL(script.src).origin : '';
  if (!origin) return;
  function mount() {
    if (document.getElementById('wvb-chatbot-embed')) return;
    var frame = document.createElement('iframe');
    frame.id = 'wvb-chatbot-embed';
    var context = new URLSearchParams({
      pageUrl: window.location.href,
      pageTitle: document.title || '',
      referrer: document.referrer || '',
      parentOrigin: window.location.origin
    });
    frame.src = origin + '/widget?' + context.toString();
    frame.title = 'Wim van Breda chatbot';
    frame.setAttribute('aria-label', 'Wim van Breda chatbot');
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:330px;height:104px;border:0;background:transparent;z-index:2147483646;pointer-events:auto;transition:width .2s ease,height .2s ease;';
    window.addEventListener('message', function (event) {
      if (event.origin !== origin || event.source !== frame.contentWindow) return;
      if (!event.data || event.data.type !== 'wvb-chatbot:widget') return;
      var open = event.data.open === true;
      frame.style.width = open ? '430px' : '330px';
      frame.style.height = open ? '720px' : '104px';
      frame.style.maxWidth = open ? '100vw' : '330px';
      frame.style.maxHeight = open ? '100vh' : '104px';
    });
    window.addEventListener('scroll', function () {
      frame.contentWindow.postMessage({ type: 'wvb-chatbot:page-scrolled' }, origin);
    }, { passive: true, once: true });
    document.body.appendChild(frame);
  }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
}());
