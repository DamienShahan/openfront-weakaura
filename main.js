(() => {
  if (window.unitOverlayStop) {
    window.unitOverlayStop();
  }

  function isVisible(el) {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);

    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0"
    );
  }

  function looksLikeUnitNumber(text) {
    return /^\s*\d+(?:\.\d+)?\s*[KMBT]?\s*$/.test(text.trim());
  }

  function parseGameNumber(text) {
    const clean = text.trim().replace(/[,+]/g, "");
    const match = clean.match(/^([\d.]+)\s*([KMBT])?$/i);

    if (!match) return NaN;

    const value = parseFloat(match[1]);
    const suffix = match[2]?.toUpperCase();

    const multipliers = {
      K: 1_000,
      M: 1_000_000,
      B: 1_000_000_000,
      T: 1_000_000_000_000,
    };

    return value * (multipliers[suffix] || 1);
  }

  function formatGameNumber(value) {
    if (!Number.isFinite(value)) return "N/A";

    const abs = Math.abs(value);

    if (abs >= 1_000_000_000_000) return `${(value / 1_000_000_000_000).toFixed(1)}T`;
    if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
    if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}K`;

    return `${Math.round(value)}`;
  }

  function getPercentColor(percent) {
    if (percent < 9) return "#ff4d4d";
    if (percent < 20) return "#ffa500";
    if (percent < 60) return "#4ade80";
    if (percent < 80) return "#ffa500";
    return "#ff4d4d";
  }

  function getUnits() {
    const slashSpans = [...document.querySelectorAll("span")]
      .filter(span => span.textContent.trim() === "/")
      .filter(isVisible);

    for (const slash of slashSpans) {
      const parent = slash.parentElement;
      if (!parent) continue;

      const children = [...parent.children];
      const slashIndex = children.indexOf(slash);

      if (slashIndex <= 0 || slashIndex >= children.length - 1) continue;

      const currentWrapper = children[slashIndex - 1];
      const maxWrapper = children[slashIndex + 1];

      const currentSpan = [...currentWrapper.querySelectorAll("span")]
        .find(span => looksLikeUnitNumber(span.textContent));

      const maxSpan = [...maxWrapper.querySelectorAll("span")]
        .find(span => looksLikeUnitNumber(span.textContent));

      if (!currentSpan || !maxSpan) continue;

      return {
        currentText: currentSpan.textContent.trim(),
        maxText: maxSpan.textContent.trim(),
        currentValue: parseGameNumber(currentSpan.textContent),
        maxValue: parseGameNumber(maxSpan.textContent),
      };
    }

    return null;
  }

  function getAttackValue() {
    const swordImages = [...document.querySelectorAll("img")]
      .filter(img => isVisible(img))
      .filter(img => img.src.includes("SwordIcon"));

    for (const img of swordImages) {
      const container = img.parentElement;
      if (!container || !isVisible(container)) continue;

      const span = container.querySelector("span");
      if (!span) continue;

      const text = span.textContent.trim();
      const match = text.match(/\(([^)]+)\)/);

      if (match) {
        const attackText = match[1].trim();

        return {
          attackText,
          attackValue: parseGameNumber(attackText),
        };
      }
    }

    return null;
  }

  const overlay = document.createElement("div");
  overlay.id = "unit-overlay";
  overlay.style.cssText = `
    position: fixed;
    left: 12px;
    bottom: 12px;
    z-index: 999999;
    background: rgba(0, 0, 0, 0.85);
    color: white;
    padding: 10px 12px;
    border-radius: 8px;
    font-family: system-ui, sans-serif;
    pointer-events: auto;
    box-shadow: 0 2px 8px rgba(0,0,0,0.35);
    display: flex;
    align-items: flex-start;
    gap: 10px;
  `;

  const content = document.createElement("div");
  content.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 3px;
  `;

  const unitsRow = document.createElement("div");
  unitsRow.style.cssText = `
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    font-size: 16px;
    font-weight: 700;
  `;

  const unitsText = document.createElement("span");
  unitsText.textContent = "Units: loading...";

  const unitsEmojiText = document.createElement("span");
  unitsEmojiText.textContent = "🛡️";
  unitsEmojiText.style.display = "none";

  const unitsPercentText = document.createElement("span");
  unitsPercentText.style.display = "none";

  unitsRow.appendChild(unitsText);
  unitsRow.appendChild(unitsEmojiText);
  unitsRow.appendChild(unitsPercentText);

  const attackRow = document.createElement("div");
  attackRow.style.cssText = `
    white-space: nowrap;
    font-size: 16px;
    font-weight: 700;
  `;
  attackRow.textContent = "Attack: loading...";

  const afterRow = document.createElement("div");
  afterRow.style.cssText = `
    display: inline-flex;
    align-items: baseline;
    gap: 6px;
    white-space: nowrap;
    font-size: 16px;
    font-weight: 700;
  `;

  const afterText = document.createElement("span");
  afterText.textContent = "After: loading...";

  const afterEmojiText = document.createElement("span");
  afterEmojiText.textContent = "⚔️";
  afterEmojiText.style.display = "none";

  const afterPercentText = document.createElement("span");
  afterPercentText.style.cssText = `
    display: none;
    font-size: 24px;
    font-weight: 900;
    line-height: 1;
  `;

  afterRow.appendChild(afterText);
  afterRow.appendChild(afterEmojiText);
  afterRow.appendChild(afterPercentText);

  content.appendChild(unitsRow);
  content.appendChild(attackRow);
  content.appendChild(afterRow);

  const closeButton = document.createElement("button");
  closeButton.textContent = "✕";
  closeButton.title = "Stop unit overlay";
  closeButton.style.cssText = `
    border: none;
    background: rgba(255, 255, 255, 0.16);
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 700;
    line-height: 1;
    cursor: pointer;
    flex: 0 0 auto;
  `;

  overlay.appendChild(content);
  overlay.appendChild(closeButton);
  document.body.appendChild(overlay);

  function update() {
    const units = getUnits();
    const attack = getAttackValue();

    if (
      !units ||
      !Number.isFinite(units.currentValue) ||
      !Number.isFinite(units.maxValue) ||
      units.maxValue === 0
    ) {
      unitsText.textContent = "Units: not found";
      unitsEmojiText.style.display = "none";
      unitsPercentText.style.display = "none";

      attackRow.textContent = "Attack: not found";
      afterText.textContent = "After: not found";
      afterEmojiText.style.display = "none";
      afterPercentText.style.display = "none";
      return;
    }

    const unitsPercent = (units.currentValue / units.maxValue) * 100;

    unitsText.textContent = `Units: ${units.currentText} / ${units.maxText}`;
    unitsEmojiText.style.display = "";
    unitsPercentText.style.display = "";
    unitsPercentText.textContent = `${unitsPercent.toFixed(0)}%`;
    unitsPercentText.style.color = getPercentColor(unitsPercent);

    if (!attack || !Number.isFinite(attack.attackValue)) {
      attackRow.textContent = "Attack: not found";
      afterText.textContent = "After: not found";
      afterEmojiText.style.display = "none";
      afterPercentText.style.display = "none";
      return;
    }

    const afterValue = Math.max(0, units.currentValue - attack.attackValue);
    const afterPercent = (afterValue / units.maxValue) * 100;

    attackRow.textContent = `Attack: ${attack.attackText}`;
    afterText.textContent = `After: ${formatGameNumber(afterValue)}`;
    afterEmojiText.style.display = "";
    afterPercentText.style.display = "";
    afterPercentText.textContent = `${afterPercent.toFixed(0)}%`;
    afterPercentText.style.color = getPercentColor(afterPercent);
  }

  update();

  const intervalId = setInterval(update, 100);

  window.unitOverlayStop = () => {
    clearInterval(intervalId);
    overlay.remove();
    delete window.unitOverlayStop;
    console.log("Unit overlay stopped.");
  };

  closeButton.addEventListener("click", window.unitOverlayStop);

  console.log("Unit overlay started. Click ✕ or run unitOverlayStop() to stop it.");
})();
