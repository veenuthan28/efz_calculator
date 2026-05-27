const STORAGE_KEY = 'efz-calculator-state-v3';

const fields = {
  ipaArbeit: document.getElementById('ipaArbeit'),
  ipaDok: document.getElementById('ipaDok'),
  ipaFach: document.getElementById('ipaFach'),
  abuVa: document.getElementById('abuVa'),
  abuSchluss: document.getElementById('abuSchluss'),
};

const overrides = {
  bfs: document.getElementById('bfsOverride'),
  uek: document.getElementById('uekOverride'),
  egk: document.getElementById('egkOverride'),
  abuSoc: document.getElementById('abuSocOverride'),
  abuLang: document.getElementById('abuLangOverride'),
};

const allInputs = Array.from(document.querySelectorAll('.input-grade'));
const groupInputs = {
  bfs: Array.from(document.querySelectorAll('[data-group="bfs"]')),
  uek: Array.from(document.querySelectorAll('[data-group="uek"]')),
  abuSoc: Array.from(document.querySelectorAll('[data-group="abuSoc"]')),
  abuLang: Array.from(document.querySelectorAll('[data-group="abuLang"]')),
};

const egkSemesterConfig = [
  { semester: 1, engId: 'egkSem1Eng', mathId: null },
  { semester: 2, engId: 'egkSem2Eng', mathId: 'egkSem2Math' },
  { semester: 3, engId: 'egkSem3Eng', mathId: 'egkSem3Math' },
  { semester: 4, engId: 'egkSem4Eng', mathId: 'egkSem4Math' },
  { semester: 5, engId: 'egkSem5Eng', mathId: null },
  { semester: 6, engId: 'egkSem6Eng', mathId: null },
  { semester: 7, engId: 'egkSem7Eng', mathId: null },
].map((config) => ({
  ...config,
  engEl: document.getElementById(config.engId),
  mathEl: config.mathId ? document.getElementById(config.mathId) : null,
}));

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
  ikBfsAvg: document.getElementById('ikBfsAvg'),
  ikUekAvg: document.getElementById('ikUekAvg'),
  egkGrade: document.getElementById('egkGrade'),
  egkLiveAvg: document.getElementById('egkLiveAvg'),
  abuGrade: document.getElementById('abuGrade'),
  abuSocAvg: document.getElementById('abuSocAvg'),
  abuLangAvg: document.getElementById('abuLangAvg'),
  abuErfaAvg: document.getElementById('abuErfaAvg'),
  miniIpa: document.getElementById('miniIpa'),
  miniIk: document.getElementById('miniIk'),
  miniEgk: document.getElementById('miniEgk'),
  miniAbu: document.getElementById('miniAbu'),
  miniEgkCard: document.getElementById('miniEgkCard'),
  miniAbuCard: document.getElementById('miniAbuCard'),
  resetBtn: document.getElementById('resetBtn'),
  egkSemesterAvgEls: Array.from(
    document.querySelectorAll('[data-egk-sem-avg]'),
  ).reduce((acc, element) => {
    const semester = Number(element.dataset.egkSemAvg);
    if (!Number.isNaN(semester)) {
      acc[semester] = element;
    }
    return acc;
  }, {}),
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

function parseInput(inputEl) {
  return {
    value: readGrade(inputEl),
    filled: inputEl.value !== '',
  };
}

function averageFromValues(values) {
  if (!values.length) {
    return null;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
}

function computeGroupAverage(inputList) {
  const parsed = inputList.map((inputEl) => parseInput(inputEl));
  const validValues = parsed
    .map((item) => item.value)
    .filter((value) => value !== null);
  const enteredCount = parsed.filter((item) => item.filled).length;

  return {
    value: averageFromValues(validValues),
    totalCount: inputList.length,
    enteredCount,
    complete:
      inputList.length > 0 &&
      parsed.every((item) => item.filled && item.value !== null),
  };
}

function weightedAverage(entries) {
  const available = entries.filter((entry) => entry.value !== null);
  if (!available.length) {
    return { value: null, complete: false };
  }

  const weightTotal = available.reduce((sum, entry) => sum + entry.weight, 0);
  const weightedSum = available.reduce(
    (sum, entry) => sum + entry.value * entry.weight,
    0,
  );

  return {
    value: weightedSum / weightTotal,
    complete: entries.every((entry) => entry.value !== null && entry.complete),
  };
}

function computeIpa() {
  const arbeitRaw = readGrade(fields.ipaArbeit);
  const dokRaw = readGrade(fields.ipaDok);
  const fachRaw = readGrade(fields.ipaFach);

  const result = weightedAverage([
    {
      value: arbeitRaw === null ? null : roundToHalf(arbeitRaw),
      weight: 0.5,
      complete: arbeitRaw !== null,
    },
    {
      value: dokRaw === null ? null : roundToHalf(dokRaw),
      weight: 0.2,
      complete: dokRaw !== null,
    },
    {
      value: fachRaw === null ? null : roundToHalf(fachRaw),
      weight: 0.3,
      complete: fachRaw !== null,
    },
  ]);

  return {
    value: result.value === null ? null : roundToTenth(result.value),
    complete: arbeitRaw !== null && dokRaw !== null && fachRaw !== null,
  };
}

function computeIk() {
  let bfs;
  let bfsComplete;
  if (getGroupMode('bfs') === 'direct') {
    const bfsOverride = readGrade(overrides.bfs);
    bfs = bfsOverride === null ? null : roundToHalf(bfsOverride);
    bfsComplete = bfsOverride !== null;
  } else {
    const bfsGroup = computeGroupAverage(groupInputs.bfs);
    bfs = bfsGroup.value === null ? null : roundToHalf(bfsGroup.value);
    bfsComplete = bfsGroup.complete;
  }

  let uek;
  let uekComplete;
  if (getGroupMode('uek') === 'direct') {
    const uekOverride = readGrade(overrides.uek);
    uek = uekOverride === null ? null : roundToHalf(uekOverride);
    uekComplete = uekOverride !== null;
  } else {
    const uekGroup = computeGroupAverage(groupInputs.uek);
    uek = uekGroup.value === null ? null : roundToHalf(uekGroup.value);
    uekComplete = uekGroup.complete;
  }

  const result = weightedAverage([
    { value: bfs, weight: 0.8, complete: bfsComplete },
    { value: uek, weight: 0.2, complete: uekComplete },
  ]);

  return {
    value: result.value === null ? null : roundToTenth(result.value),
    complete: bfsComplete && uekComplete,
    bfs,
    uek,
  };
}

function computeEgk() {
  if (getGroupMode('egk') === 'direct') {
    const egkOverride = readGrade(overrides.egk);
    return {
      value: egkOverride === null ? null : roundToHalf(egkOverride),
      complete: egkOverride !== null,
      semesters: [],
    };
  }

  const semesters = egkSemesterConfig.map((config) => {
    const engRaw = readGrade(config.engEl);
    const engRounded = engRaw === null ? null : roundToHalf(engRaw);
    const mathRaw = config.mathEl ? readGrade(config.mathEl) : null;
    const mathRounded = mathRaw === null ? null : roundToHalf(mathRaw);

    const semesterRaw = averageFromValues(
      [engRounded, mathRounded].filter((value) => value !== null),
    );
    const semesterRounded =
      semesterRaw === null ? null : roundToHalf(semesterRaw);
    const complete = config.mathEl
      ? engRaw !== null && mathRaw !== null
      : engRaw !== null;

    return {
      semester: config.semester,
      value: semesterRounded,
      complete,
    };
  });

  const availableSemesters = semesters
    .map((semester) => semester.value)
    .filter((value) => value !== null);
  const totalRaw = averageFromValues(availableSemesters);

  return {
    value: totalRaw === null ? null : roundToHalf(totalRaw),
    complete: semesters.every((semester) => semester.complete),
    semesters,
  };
}

function computeAbu() {
  let soc;
  let socComplete;
  if (getGroupMode('abuSoc') === 'direct') {
    const socOverride = readGrade(overrides.abuSoc);
    soc = socOverride === null ? null : roundToHalf(socOverride);
    socComplete = socOverride !== null;
  } else {
    const socGroup = computeGroupAverage(groupInputs.abuSoc);
    soc = socGroup.value === null ? null : roundToHalf(socGroup.value);
    socComplete = socGroup.complete;
  }

  let lang;
  let langComplete;
  if (getGroupMode('abuLang') === 'direct') {
    const langOverride = readGrade(overrides.abuLang);
    lang = langOverride === null ? null : roundToHalf(langOverride);
    langComplete = langOverride !== null;
  } else {
    const langGroup = computeGroupAverage(groupInputs.abuLang);
    lang = langGroup.value === null ? null : roundToHalf(langGroup.value);
    langComplete = langGroup.complete;
  }

  const erfaRaw = averageFromValues([soc, lang].filter((value) => value !== null));
  const erfa = erfaRaw === null ? null : roundToHalf(erfaRaw);
  const vaRaw = readGrade(fields.abuVa);
  const schlussRaw = readGrade(fields.abuSchluss);
  const va = vaRaw === null ? null : roundToHalf(vaRaw);
  const schluss = schlussRaw === null ? null : roundToHalf(schlussRaw);

  const totalResult = weightedAverage([
    {
      value: erfa,
      weight: 1,
      complete: socComplete && langComplete,
    },
    { value: va, weight: 1, complete: va !== null },
    { value: schluss, weight: 1, complete: schluss !== null },
  ]);

  return {
    value: totalResult.value === null ? null : roundToTenth(totalResult.value),
    complete:
      socComplete &&
      langComplete &&
      vaRaw !== null &&
      schlussRaw !== null,
    erfa,
    soc,
    lang,
  };
}

function computeTotal(isBmMode, ipa, ik, egk, abu) {
  if (isBmMode) {
    const result = weightedAverage([
      { value: ipa.value, weight: 4 / 7, complete: ipa.complete },
      { value: ik.value, weight: 3 / 7, complete: ik.complete },
    ]);

    return {
      value: result.value === null ? null : roundToTenth(result.value),
      complete: ipa.complete && ik.complete,
    };
  }

  const result = weightedAverage([
    { value: ipa.value, weight: 0.4, complete: ipa.complete },
    { value: ik.value, weight: 0.3, complete: ik.complete },
    { value: egk.value, weight: 0.1, complete: egk.complete },
    { value: abu.value, weight: 0.2, complete: abu.complete },
  ]);

  return {
    value: result.value === null ? null : roundToTenth(result.value),
    complete: ipa.complete && ik.complete && egk.complete && abu.complete,
  };
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

function updateResultUi(isBmMode, total, ipa, ik, egk, abu) {
  ui.totalGrade.textContent = formatGrade(total.value);
  ui.ipaGrade.textContent = formatGrade(ipa.value);
  ui.ikGrade.textContent = formatGrade(ik.value);
  ui.egkGrade.textContent = formatGrade(egk.value);
  ui.abuGrade.textContent = formatGrade(abu.value);
  ui.miniIpa.textContent = formatGrade(ipa.value);
  ui.miniIk.textContent = formatGrade(ik.value);
  ui.miniEgk.textContent = formatGrade(egk.value);
  ui.miniAbu.textContent = formatGrade(abu.value);

  ui.ikBfsAvg.textContent = formatGrade(ik.bfs);
  ui.ikUekAvg.textContent = formatGrade(ik.uek);
  ui.egkLiveAvg.textContent = formatGrade(egk.value);
  egk.semesters.forEach((semester) => {
    const outputEl = ui.egkSemesterAvgEls[semester.semester];
    if (outputEl) {
      outputEl.textContent = formatGrade(semester.value);
    }
  });
  ui.abuSocAvg.textContent = formatGrade(abu.soc);
  ui.abuLangAvg.textContent = formatGrade(abu.lang);
  ui.abuErfaAvg.textContent = formatGrade(abu.erfa);

  const risk = getRiskState(total.value, ipa.value, ik.value);
  ui.riskBadge.className = 'risk-chip ' + risk.cls;
  ui.riskBadge.textContent = risk.label;

  const hasPass =
    total.value !== null &&
    ipa.value !== null &&
    ik.value !== null &&
    total.value >= 4 &&
    ipa.value >= 4 &&
    ik.value >= 4;

  if (total.value === null || ipa.value === null || ik.value === null) {
    ui.passBanner.className = 'pass-banner pass-no';
    ui.passBanner.textContent = 'Eingaben fehlen';
    return;
  }

  if (!total.complete) {
    ui.passBanner.className = 'pass-banner pass-no';
    ui.passBanner.textContent = isBmMode
      ? 'Zwischenstand (BM): es fehlen noch Eingaben'
      : 'Zwischenstand: es fehlen noch Eingaben';
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
  if (ipa.value < 4) {
    reasons.push('IPA unter 4.0');
  }
  if (ik.value < 4) {
    reasons.push('IK unter 4.0');
  }
  if (total.value < 4) {
    reasons.push('Total unter 4.0');
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
  const egk = isBmMode
    ? { value: null, complete: false, semesters: [] }
    : computeEgk();
  const abu = isBmMode
    ? {
        value: null,
        complete: false,
        erfa: null,
        soc: null,
        lang: null,
      }
    : computeAbu();
  const total = computeTotal(isBmMode, ipa, ik, egk, abu);

  updateResultUi(isBmMode, total, ipa, ik, egk, abu);
  saveState();
}

function resetAll() {
  allInputs.forEach((inputEl) => {
    inputEl.value = '';
    inputEl.classList.remove('invalid');
  });

  ui.bmToggle.checked = false;
  TOGGLE_GROUPS.forEach((group) => setGroupMode(group, 'detail'));
  localStorage.removeItem(STORAGE_KEY);
  recalculate();
}

const TOGGLE_GROUPS = ['bfs', 'uek', 'egk', 'abuSoc', 'abuLang'];

function setGroupMode(group, mode) {
  const directPanel = document.querySelector(
    `[data-mode-panel="${group}-direct"]`,
  );
  const detailPanel = document.querySelector(
    `[data-mode-panel="${group}-detail"]`,
  );
  const toggleBtn = document.querySelector(
    `[data-toggle-group="${group}"]`,
  );

  if (!directPanel || !detailPanel || !toggleBtn) return;

  const isDirect = mode === 'direct';
  directPanel.classList.toggle('hidden', !isDirect);
  detailPanel.classList.toggle('hidden', isDirect);
  toggleBtn.querySelector('.mode-toggle-label').textContent = isDirect
    ? 'Schnitt direkt'
    : 'Einzelnoten';
  toggleBtn.dataset.currentMode = mode;
}

function getGroupMode(group) {
  const toggleBtn = document.querySelector(
    `[data-toggle-group="${group}"]`,
  );
  return toggleBtn?.dataset.currentMode || 'detail';
}

document.querySelectorAll('.mode-toggle').forEach((btn) => {
  btn.addEventListener('click', () => {
    const group = btn.dataset.toggleGroup;
    const current = btn.dataset.currentMode || 'detail';
    const next = current === 'detail' ? 'direct' : 'detail';
    setGroupMode(group, next);
    recalculate();
  });
});

TOGGLE_GROUPS.forEach((group) => setGroupMode(group, 'detail'));

function saveState() {
  const modes = {};
  TOGGLE_GROUPS.forEach((group) => {
    modes[group] = getGroupMode(group);
  });

  const state = {
    bmMode: ui.bmToggle.checked,
    modes,
    inputs: allInputs.reduce((acc, inputEl) => {
      if (inputEl.id) {
        acc[inputEl.id] = inputEl.value;
      }
      return acc;
    }, {}),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function restoreState() {
  const rawState = localStorage.getItem(STORAGE_KEY);
  if (!rawState) {
    return;
  }

  try {
    const state = JSON.parse(rawState);
    ui.bmToggle.checked = Boolean(state.bmMode);

    if (state.modes) {
      TOGGLE_GROUPS.forEach((group) => {
        if (state.modes[group]) {
          setGroupMode(group, state.modes[group]);
        }
      });
    }

    allInputs.forEach((inputEl) => {
      if (!inputEl.id) {
        return;
      }

      const storedValue = state.inputs?.[inputEl.id];
      if (typeof storedValue === 'string') {
        inputEl.value = storedValue;
      }
    });
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

allInputs.forEach((inputEl) => {
  inputEl.addEventListener('input', recalculate);
});

ui.bmToggle.addEventListener('change', recalculate);
ui.resetBtn.addEventListener('click', resetAll);

restoreState();
recalculate();
