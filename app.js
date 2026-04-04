const fields = {
  ipaArbeit: document.getElementById('ipaArbeit'),
  ipaDok: document.getElementById('ipaDok'),
  ipaFach: document.getElementById('ipaFach'),
  ikBfs: document.getElementById('ikBfs'),
  ikUek: document.getElementById('ikUek'),
  egkSchnitt: document.getElementById('egkSchnitt'),
  abuErfa: document.getElementById('abuErfa'),
  abuVa: document.getElementById('abuVa'),
  abuSchluss: document.getElementById('abuSchluss'),
};

const ui = {
  bmToggle: document.getElementById('bmToggle'),
  labelNoBm: document.getElementById('labelNoBm'),
  labelBm: document.getElementById('labelBm'),
  ipaWeight: document.getElementById('ipaWeight'),
  ikWeight: document.getElementById('ikWeight'),
  sectionEgk: document.getElementById('sectionEgk'),
  sectionAbu: document.getElementById('sectionAbu'),
  riskBadge: document.getElementById('riskBadge'),
  passBanner: document.getElementById('passBanner'),
  formulaText: document.getElementById('formulaText'),
  totalGrade: document.getElementById('totalGrade'),
  ipaGrade: document.getElementById('ipaGrade'),
  ikGrade: document.getElementById('ikGrade'),
  egkGrade: document.getElementById('egkGrade'),
  abuGrade: document.getElementById('abuGrade'),
  miniIpa: document.getElementById('miniIpa'),
  miniIk: document.getElementById('miniIk'),
  miniEgk: document.getElementById('miniEgk'),
  miniAbu: document.getElementById('miniAbu'),
  miniEgkCard: document.getElementById('miniEgkCard'),
  miniAbuCard: document.getElementById('miniAbuCard'),
  resetBtn: document.getElementById('resetBtn'),
};

function roundToTenth(value) {
  return Math.round(value * 10) / 10;
}

function roundToHalf(value) {
  return Math.round(value * 2) / 2;
}

function clampGrade(value) {
  return Math.min(6, Math.max(1, value));
}

function readGrade(inputEl) {
  const parsed = parseFloat(inputEl.value);
  const isValid = !Number.isNaN(parsed) && parsed >= 1 && parsed <= 6;
  inputEl.classList.toggle('invalid', inputEl.value !== '' && !isValid);

  if (!isValid) {
    return null;
  }

  return clampGrade(parsed);
}

function formatGrade(value) {
  return value === null ? '-' : value.toFixed(1);
}

function computeIpa() {
  const arbeitRaw = readGrade(fields.ipaArbeit);
  const dokRaw = readGrade(fields.ipaDok);
  const fachRaw = readGrade(fields.ipaFach);

  if (arbeitRaw === null || dokRaw === null || fachRaw === null) {
    return null;
  }

  const arbeit = roundToHalf(arbeitRaw);
  const dok = roundToHalf(dokRaw);
  const fach = roundToHalf(fachRaw);

  return roundToTenth(arbeit * 0.5 + dok * 0.25 + fach * 0.25);
}

function computeIk() {
  const bfsRaw = readGrade(fields.ikBfs);
  const uekRaw = readGrade(fields.ikUek);

  if (bfsRaw === null || uekRaw === null) {
    return null;
  }

  const bfs = roundToHalf(bfsRaw);
  const uek = roundToHalf(uekRaw);

  return roundToTenth(bfs * 0.8 + uek * 0.2);
}

function computeEgk() {
  const schnittRaw = readGrade(fields.egkSchnitt);
  if (schnittRaw === null) {
    return null;
  }
  return roundToHalf(schnittRaw);
}

function computeAbu() {
  const erfa = readGrade(fields.abuErfa);
  const va = readGrade(fields.abuVa);
  const schluss = readGrade(fields.abuSchluss);

  if (erfa === null || va === null || schluss === null) {
    return null;
  }

  return roundToTenth((erfa + va + schluss) / 3);
}

function computeTotal(isBmMode, ipa, ik, egk, abu) {
  if (isBmMode) {
    if (ipa === null || ik === null) {
      return null;
    }
    return roundToTenth(ipa * (4 / 7) + ik * (3 / 7));
  }

  if (ipa === null || ik === null || egk === null || abu === null) {
    return null;
  }

  return roundToTenth(ipa * 0.4 + ik * 0.3 + egk * 0.1 + abu * 0.2);
}

function getRiskState(total, ipa, ik) {
  if (total === null || ipa === null || ik === null) {
    return { label: 'Pending', cls: 'risk-pending' };
  }

  if (ipa < 4 || ik < 4 || total < 4) {
    if (ipa < 3.8 || ik < 3.8 || total < 3.8) {
      return { label: 'Failing', cls: 'risk-failing' };
    }
    return { label: 'Risky', cls: 'risk-risky' };
  }

  if (total >= 4.8) {
    return { label: 'Safe', cls: 'risk-safe' };
  }

  return { label: 'Risky', cls: 'risk-risky' };
}

function updateModeUi(isBmMode) {
  ui.labelNoBm.classList.toggle('active', !isBmMode);
  ui.labelBm.classList.toggle('active', isBmMode);
  ui.sectionEgk.classList.toggle('hidden', isBmMode);
  ui.sectionAbu.classList.toggle('hidden', isBmMode);
  ui.miniEgkCard.classList.toggle('hidden', isBmMode);
  ui.miniAbuCard.classList.toggle('hidden', isBmMode);
  ui.ipaWeight.textContent = isBmMode ? '57.14%' : '40%';
  ui.ikWeight.textContent = isBmMode ? '42.86%' : '30%';
  ui.formulaText.textContent = isBmMode
    ? 'Formel: IPA×(4/7) + IK×(3/7)'
    : 'Formel: IPA×0.4 + IK×0.3 + eGK×0.1 + ABU×0.2';
}

function updateResultUi(total, ipa, ik, egk, abu) {
  ui.totalGrade.textContent = formatGrade(total);
  ui.ipaGrade.textContent = formatGrade(ipa);
  ui.ikGrade.textContent = formatGrade(ik);
  ui.egkGrade.textContent = formatGrade(egk);
  ui.abuGrade.textContent = formatGrade(abu);
  ui.miniIpa.textContent = formatGrade(ipa);
  ui.miniIk.textContent = formatGrade(ik);
  ui.miniEgk.textContent = formatGrade(egk);
  ui.miniAbu.textContent = formatGrade(abu);

  const risk = getRiskState(total, ipa, ik);
  ui.riskBadge.className = 'risk-chip ' + risk.cls;
  ui.riskBadge.textContent = risk.label;

  const hasPass =
    total !== null &&
    ipa !== null &&
    ik !== null &&
    total >= 4 &&
    ipa >= 4 &&
    ik >= 4;

  if (total === null || ipa === null || ik === null) {
    ui.passBanner.className = 'pass-banner pass-no';
    ui.passBanner.textContent = 'Eingaben fehlen';
    return;
  }

  ui.passBanner.className = hasPass
    ? 'pass-banner pass-ok'
    : 'pass-banner pass-no';

  if (hasPass) {
    ui.passBanner.textContent =
      'Bestanden (IPA >= 4.0, IK >= 4.0, Total >= 4.0)';
    return;
  }

  const reasons = [];
  if (ipa < 4) {
    reasons.push('IPA unter 4.0');
  }
  if (ik < 4) {
    reasons.push('IK unter 4.0');
  }

  ui.passBanner.textContent = reasons.length
    ? 'Nicht bestanden: ' + reasons.join(' / ')
    : 'Nicht bestanden';
}

function recalculate() {
  const isBmMode = ui.bmToggle.checked;
  updateModeUi(isBmMode);

  const ipa = computeIpa();
  const ik = computeIk();
  const egk = isBmMode ? null : computeEgk();
  const abu = isBmMode ? null : computeAbu();
  const total = computeTotal(isBmMode, ipa, ik, egk, abu);

  updateResultUi(total, ipa, ik, egk, abu);
}

function resetAll() {
  Object.values(fields).forEach((inputEl) => {
    inputEl.value = '';
    inputEl.classList.remove('invalid');
  });
  ui.bmToggle.checked = false;
  recalculate();
}

Object.values(fields).forEach((inputEl) => {
  inputEl.addEventListener('input', recalculate);
});

ui.bmToggle.addEventListener('change', recalculate);
ui.resetBtn.addEventListener('click', resetAll);

recalculate();
