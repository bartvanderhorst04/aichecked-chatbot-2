(function () {
  "use strict";

  if (window.__AIC_CHATBOT_EMBED_LOADED__) {
    return;
  }

  window.__AIC_CHATBOT_EMBED_LOADED__ = true;

  var AIC_ACCENT = "#2EF2C0";
  var AIC_BACKGROUND = "#050505";
  var AIC_API_BASE = String(window.CHATBOT_URL || "").replace(/\/$/, "");
  var aicHasInteracted = false;
  var aicIsOpen = false;
  var aicMessages = [];

  function aicReady(aicCallback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", aicCallback, { once: true });
      return;
    }

    aicCallback();
  }

  function aicCreateElement(aicTag, aicClassName, aicText) {
    var aicElement = document.createElement(aicTag);

    if (aicClassName) {
      aicElement.className = aicClassName;
    }

    if (typeof aicText === "string") {
      aicElement.textContent = aicText;
    }

    return aicElement;
  }

  function aicPost(aicPath, aicPayload) {
    return fetch(AIC_API_BASE + aicPath, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(aicPayload)
    }).then(function (aicResponse) {
      if (!aicResponse.ok) {
        throw new Error("Request failed with status " + aicResponse.status);
      }

      return aicResponse.json();
    });
  }

  function aicExtractReply(aicData) {
    if (!aicData || typeof aicData !== "object") {
      return "Ik kon geen antwoord ophalen. Probeer het zo nog eens.";
    }

    return (
      aicData.reply ||
      aicData.answer ||
      aicData.message ||
      aicData.content ||
      "Ik kon geen antwoord ophalen. Probeer het zo nog eens."
    );
  }

  function aicNotifyChatEmail(aicMessagesForEmail) {
    aicPost("/api/send-chat-email", {
      pageUrl: document.referrer || window.location.href,
      timestamp: new Date().toISOString(),
      messages: aicMessagesForEmail.map(function (aicMessage) {
        return {
          role: aicMessage.role,
          content: aicMessage.content
        };
      })
    }).catch(function () {
      // Email delivery should never block the chatbot experience.
    });
  }

  aicReady(function () {
    var aicStyle = aicCreateElement("style");
    aicStyle.textContent = [
      ".aic-widget{position:fixed;right:20px;bottom:24px;z-index:2147483647;font-family:Inter,-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif;color:#fff;transform-origin:bottom right;}",
      ".aic-widget *{box-sizing:border-box;}",
      ".aic-launcher{width:275px;height:70px;border:1px solid rgba(46,242,192,.55);border-radius:999px;background:" + AIC_BACKGROUND + ";color:#fff;box-shadow:0 18px 50px rgba(0,0,0,.38);display:flex;align-items:center;gap:14px;padding:10px 18px;cursor:pointer;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease;}",
      ".aic-launcher:hover{transform:translateY(-2px);border-color:" + AIC_ACCENT + ";box-shadow:0 20px 60px rgba(46,242,192,.18);}",
      ".aic-launcher-icon{width:46px;height:46px;border-radius:50%;background:" + AIC_ACCENT + ";color:#03100c;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:17px;flex:0 0 auto;}",
      ".aic-launcher-copy{display:flex;flex-direction:column;line-height:1.18;text-align:left;}",
      ".aic-launcher-title{font-size:15px;font-weight:800;letter-spacing:.01em;}",
      ".aic-launcher-subtitle{font-size:12px;color:rgba(255,255,255,.72);margin-top:4px;}",
      ".aic-panel{width:340px;height:520px;border:1px solid rgba(46,242,192,.42);border-radius:24px;background:" + AIC_BACKGROUND + ";box-shadow:0 24px 70px rgba(0,0,0,.48);overflow:hidden;display:none;flex-direction:column;}",
      ".aic-panel.aic-open{display:flex;}",
      ".aic-header{padding:18px 18px 14px;border-bottom:1px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:space-between;gap:12px;}",
      ".aic-heading{display:flex;align-items:center;gap:12px;min-width:0;}",
      ".aic-avatar{width:38px;height:38px;border-radius:50%;background:" + AIC_ACCENT + ";color:#03100c;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px;flex:0 0 auto;}",
      ".aic-title{font-size:15px;font-weight:850;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
      ".aic-status{font-size:12px;color:rgba(255,255,255,.66);margin-top:2px;}",
      ".aic-close{width:34px;height:34px;border:0;border-radius:50%;background:rgba(255,255,255,.08);color:#fff;cursor:pointer;font-size:20px;line-height:1;display:flex;align-items:center;justify-content:center;}",
      ".aic-close:hover{background:rgba(255,255,255,.14);}",
      ".aic-messages{flex:1;overflow-y:auto;padding:18px;display:flex;flex-direction:column;gap:10px;scrollbar-width:thin;scrollbar-color:rgba(46,242,192,.6) rgba(255,255,255,.08);}",
      ".aic-message{max-width:86%;border-radius:18px;padding:11px 13px;font-size:14px;line-height:1.42;white-space:pre-wrap;word-break:break-word;}",
      ".aic-message-bot{align-self:flex-start;background:rgba(255,255,255,.09);color:#fff;border-top-left-radius:6px;}",
      ".aic-message-user{align-self:flex-end;background:" + AIC_ACCENT + ";color:#03100c;border-top-right-radius:6px;font-weight:650;}",
      ".aic-lead{border-top:1px solid rgba(255,255,255,.08);padding:12px 14px;display:flex;flex-direction:column;gap:8px;background:rgba(255,255,255,.03);}",
      ".aic-lead-label{font-size:12px;color:rgba(255,255,255,.72);}",
      ".aic-lead-row{display:flex;gap:8px;}",
      ".aic-lead-input{min-width:0;flex:1;height:38px;border:1px solid rgba(255,255,255,.13);border-radius:999px;background:rgba(255,255,255,.08);color:#fff;padding:0 12px;outline:none;font-size:13px;}",
      ".aic-lead-input:focus{border-color:" + AIC_ACCENT + ";}",
      ".aic-lead-button{height:38px;border:0;border-radius:999px;background:" + AIC_ACCENT + ";color:#03100c;font-weight:800;padding:0 13px;cursor:pointer;}",
      ".aic-composer{border-top:1px solid rgba(255,255,255,.08);padding:14px;display:flex;align-items:flex-end;gap:9px;}",
      ".aic-input{flex:1;min-height:42px;max-height:92px;border:1px solid rgba(255,255,255,.13);border-radius:18px;background:rgba(255,255,255,.08);color:#fff;resize:none;outline:none;padding:11px 12px;font-family:inherit;font-size:14px;line-height:1.35;}",
      ".aic-input:focus{border-color:" + AIC_ACCENT + ";}",
      ".aic-input::placeholder,.aic-lead-input::placeholder{color:rgba(255,255,255,.44);}",
      ".aic-send{width:42px;height:42px;border:0;border-radius:50%;background:" + AIC_ACCENT + ";color:#03100c;font-weight:900;cursor:pointer;flex:0 0 auto;}",
      ".aic-send:disabled,.aic-lead-button:disabled{opacity:.58;cursor:not-allowed;}",
      ".aic-hidden{display:none!important;}",
      "@media (max-width:768px){.aic-widget{right:14px;bottom:14px;transform:scale(.75);}.aic-panel{height:min(520px,calc(100vh - 28px));}}"
    ].join("");
    document.head.appendChild(aicStyle);

    var aicWidget = aicCreateElement("div", "aic-widget");
    var aicLauncher = aicCreateElement("button", "aic-launcher");
    var aicLauncherIcon = aicCreateElement("span", "aic-launcher-icon", "AI");
    var aicLauncherCopy = aicCreateElement("span", "aic-launcher-copy");
    var aicLauncherTitle = aicCreateElement("span", "aic-launcher-title", "Chat met AI Checked");
    var aicLauncherSubtitle = aicCreateElement("span", "aic-launcher-subtitle", "Stel je vraag, we helpen direct");
    var aicPanel = aicCreateElement("section", "aic-panel");
    var aicHeader = aicCreateElement("div", "aic-header");
    var aicHeading = aicCreateElement("div", "aic-heading");
    var aicAvatar = aicCreateElement("div", "aic-avatar", "AI");
    var aicHeadingText = aicCreateElement("div");
    var aicTitle = aicCreateElement("p", "aic-title", "AI Checked assistent");
    var aicStatus = aicCreateElement("div", "aic-status", "Online");
    var aicClose = aicCreateElement("button", "aic-close", "×");
    var aicMessagesList = aicCreateElement("div", "aic-messages");
    var aicLead = aicCreateElement("form", "aic-lead");
    var aicLeadLabel = aicCreateElement("div", "aic-lead-label", "Wil je dat we meekijken? Laat je e-mail achter.");
    var aicLeadRow = aicCreateElement("div", "aic-lead-row");
    var aicLeadInput = aicCreateElement("input", "aic-lead-input");
    var aicLeadButton = aicCreateElement("button", "aic-lead-button", "Verstuur");
    var aicComposer = aicCreateElement("form", "aic-composer");
    var aicInput = aicCreateElement("textarea", "aic-input");
    var aicSend = aicCreateElement("button", "aic-send", "➜");

    aicLauncher.type = "button";
    aicLauncher.setAttribute("aria-label", "Open chatbot");
    aicClose.type = "button";
    aicClose.setAttribute("aria-label", "Sluit chatbot");
    aicInput.rows = 1;
    aicInput.placeholder = "Typ je bericht...";
    aicLeadInput.type = "email";
    aicLeadInput.name = "email";
    aicLeadInput.placeholder = "naam@bedrijf.nl";
    aicLeadInput.autocomplete = "email";
    aicLeadButton.type = "submit";
    aicSend.type = "submit";

    aicLauncherCopy.appendChild(aicLauncherTitle);
    aicLauncherCopy.appendChild(aicLauncherSubtitle);
    aicLauncher.appendChild(aicLauncherIcon);
    aicLauncher.appendChild(aicLauncherCopy);
    aicHeadingText.appendChild(aicTitle);
    aicHeadingText.appendChild(aicStatus);
    aicHeading.appendChild(aicAvatar);
    aicHeading.appendChild(aicHeadingText);
    aicHeader.appendChild(aicHeading);
    aicHeader.appendChild(aicClose);
    aicLeadRow.appendChild(aicLeadInput);
    aicLeadRow.appendChild(aicLeadButton);
    aicLead.appendChild(aicLeadLabel);
    aicLead.appendChild(aicLeadRow);
    aicComposer.appendChild(aicInput);
    aicComposer.appendChild(aicSend);
    aicPanel.appendChild(aicHeader);
    aicPanel.appendChild(aicMessagesList);
    aicPanel.appendChild(aicLead);
    aicPanel.appendChild(aicComposer);
    aicWidget.appendChild(aicPanel);
    aicWidget.appendChild(aicLauncher);
    document.body.appendChild(aicWidget);

    function aicMarkInteraction() {
      aicHasInteracted = true;
    }

    function aicScrollToBottom() {
      aicMessagesList.scrollTop = aicMessagesList.scrollHeight;
    }

    function aicAddMessage(aicRole, aicText) {
      var aicMessage = aicCreateElement(
        "div",
        "aic-message " + (aicRole === "user" ? "aic-message-user" : "aic-message-bot"),
        aicText
      );

      aicMessagesList.appendChild(aicMessage);
      aicMessages.push({ role: aicRole, content: aicText });
      aicScrollToBottom();
      return aicMessage;
    }

    function aicOpen() {
      aicIsOpen = true;
      aicPanel.classList.add("aic-open");
      aicLauncher.classList.add("aic-hidden");
      window.setTimeout(function () {
        aicInput.focus();
      }, 50);
    }

    function aicClosePanel() {
      aicIsOpen = false;
      aicPanel.classList.remove("aic-open");
      aicLauncher.classList.remove("aic-hidden");
    }

    function aicSetBusy(aicBusy) {
      aicSend.disabled = aicBusy;
      aicInput.disabled = aicBusy;
      aicStatus.textContent = aicBusy ? "Aan het typen..." : "Online";
    }

    aicAddMessage(
      "assistant",
      "Hoi! Ik ben de AI Checked assistent. Waar kan ik je vandaag mee helpen?"
    );

    aicLauncher.addEventListener("click", function () {
      aicMarkInteraction();
      aicOpen();
    });

    aicClose.addEventListener("click", function () {
      aicMarkInteraction();
      aicClosePanel();
    });

    aicInput.addEventListener("input", function () {
      aicMarkInteraction();
      aicInput.style.height = "auto";
      aicInput.style.height = Math.min(aicInput.scrollHeight, 92) + "px";
    });

    aicInput.addEventListener("keydown", function (aicEvent) {
      if (aicEvent.key === "Enter" && !aicEvent.shiftKey) {
        aicEvent.preventDefault();
        aicComposer.requestSubmit();
      }
    });

    aicComposer.addEventListener("submit", function (aicEvent) {
      var aicText = aicInput.value.trim();

      aicEvent.preventDefault();
      aicMarkInteraction();

      if (!aicText) {
        return;
      }

      aicInput.value = "";
      aicInput.style.height = "auto";
      aicAddMessage("user", aicText);
      aicNotifyChatEmail(aicMessages.slice());
      aicSetBusy(true);

      aicPost("/api/chat", {
        message: aicText,
        messages: aicMessages.slice()
      })
        .then(function (aicData) {
          aicAddMessage("assistant", aicExtractReply(aicData));
        })
        .catch(function () {
          aicAddMessage(
            "assistant",
            "Sorry, er ging iets mis. Probeer het zo meteen opnieuw."
          );
        })
        .finally(function () {
          aicSetBusy(false);
        });
    });

    aicLead.addEventListener("submit", function (aicEvent) {
      var aicEmail = aicLeadInput.value.trim();

      aicEvent.preventDefault();
      aicMarkInteraction();

      if (!aicEmail) {
        return;
      }

      aicLeadButton.disabled = true;
      aicNotifyChatEmail(
        aicMessages.concat([
          {
            role: "user",
            content: "Leadformulier verzonden: " + aicEmail
          }
        ])
      );
      aicLeadLabel.textContent = "Dank je, we nemen contact met je op.";
      aicLeadRow.classList.add("aic-hidden");
      aicLeadButton.disabled = false;
    });

    window.setTimeout(function () {
      if (!aicHasInteracted && !aicIsOpen) {
        aicOpen();
      }
    }, 10000);
  });
})();
