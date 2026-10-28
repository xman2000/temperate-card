// Temperate card: one comfort range per zone, heat/cool as permissions,
// sticky manual override. Pairs with the "Temperate changeover" blueprint.
const VERSION = '1.0.1';

const ARM = '<path d="M12 12V2.5M9.6 4.4L12 6.6l2.4-2.2M10.2 7.6L12 9.2l1.8-1.6"/>';
const ICON = {
  heating: '<svg class="ic" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c1.2 3.2 5 5 5 10a5 5 0 0 1-10 0c0-2.2 1-3.6 2.2-4.6.2 2 1.2 3 2.3 3 0-3 .5-5.6.5-8.4z"/></svg>',
  cooling: '<svg class="ic" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
    [0, 60, 120, 180, 240, 300].map((a) => `<g transform="rotate(${a} 12 12)">${ARM}</g>`).join('') + '<circle cx="12" cy="12" r="1.3"/></svg>',
  idle: '<svg class="ic" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7.5"/><path d="M9 12.4l2.1 2.1 3.9-4.3"/></svg>',
  off: '<svg class="ic" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3v9M6.3 6.3a8 8 0 1 0 11.4 0"/></svg>',
  chevron: '<svg class="chev" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>',
  fan: '<svg class="fanic" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="1.6"/><path d="M12 10.4c0-3 1-6.4 3.6-6.4s2.4 3.4-1.4 5.6M13.6 12c3 0 6.4 1 6.4 3.6s-3.4 2.4-5.6-1.4M12 13.6c0 3-1 6.4-3.6 6.4s-2.4-3.4 1.4-5.6M10.4 12c-3 0-6.4-1-6.4-3.6s3.4-2.4 5.6 1.4"/></svg>',
  hand: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11V6.5a1.5 1.5 0 0 1 3 0V11M10 10V5a1.5 1.5 0 0 1 3 0v5M13 10V6a1.5 1.5 0 0 1 3 0v6M16 10.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1.5a6 6 0 0 1-5-2.7L4 14.6a1.5 1.5 0 0 1 2.4-1.8L7 14"/></svg>',
};

ICON.waiting = '<svg class="ic" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><circle cx="6" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="18" cy="12" r="1.8"/></svg>';
const COLOR = { heating: 'var(--temperate-heat)', cooling: 'var(--temperate-cool)', idle: 'var(--temperate-ok)', off: 'var(--temperate-off)', waiting: 'var(--temperate-off)' };
const mix = (c, p) => `color-mix(in srgb, ${c} ${p}%, transparent)`;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Dial geometry, in the SVG's own coordinates.
const DIAL = { w: 280, h: 230, cx: 140, cy: 130, r: 100, a0: 135, a1: 405 };

const STYLE = `
:host { --temperate-heat: #FF8A50; --temperate-cool: #4FA3F7; --temperate-ok: #7CB342; --temperate-off: #6B7078; --temperate-manual: #FFD54F; --temperate-marker: var(--primary-text-color);
  --temperate-surface: color-mix(in srgb, var(--primary-text-color) 6%, transparent);
  --temperate-surface-2: color-mix(in srgb, var(--primary-text-color) 12%, transparent); }
ha-card { overflow: hidden; }
.title { padding: 16px 16px 0; font-size: 18px; font-weight: 500; }
.zone { container-type: inline-size; }
.zone + .zone { border-top: 1px solid var(--divider-color); }
.zone.manual { background: ${mix('var(--temperate-manual)', 5)}; }
button { font: inherit; color: inherit; cursor: pointer; }
button:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
.head { display: flex; align-items: center; gap: 14px; width: 100%; padding: 14px 16px; background: none; border: 0; text-align: left; }
.icon { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.who { flex: 1; min-width: 0; }
.name { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 500; }
.tag { font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 10px; background: var(--temperate-manual); color: #3A2E00; }
.status { display: block; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.temp { font-size: 30px; font-weight: 300; }
.chev { color: var(--secondary-text-color); transition: transform .25s; flex-shrink: 0; }
.zone.open .chev { transform: rotate(180deg); }
.body { padding: 0 16px 16px; display: flex; flex-direction: column; gap: 16px; }
.banner { display: flex; flex-direction: column; gap: 10px; padding: 12px; border-radius: 12px; background: ${mix('var(--temperate-manual)', 10)}; border: 1px solid ${mix('var(--temperate-manual)', 45)}; }
.banner p { margin: 0; display: flex; gap: 10px; font-size: 13px; line-height: 1.45; }
.banner svg { flex-shrink: 0; color: var(--temperate-manual); }
.resume { height: 40px; border-radius: 10px; border: 0; background: var(--temperate-manual); color: #3A2E00 !important; font-size: 14px; font-weight: 500; }
.toprow { display: flex; justify-content: flex-end; }
.seg { display: flex; background: var(--temperate-surface); border-radius: 10px; padding: 3px; }
.seg button { flex: 1; height: 30px; padding: 0 12px; border-radius: 8px; border: 0; background: transparent; color: var(--secondary-text-color); font-size: 12px; }
.seg button.on { background: var(--temperate-surface-2); color: var(--primary-text-color); }
.seg.big button { height: 40px; font-size: 14px; }
.bar { position: relative; height: 30px; margin-top: -6px; }
.bar div { position: absolute; top: 11px; height: 8px; transition: left .3s, width .3s; }
.bar .marker { top: 1px; width: 8px; height: 28px; margin-left: -4px; border-radius: 4px; background: var(--temperate-marker); border: 2px solid var(--ha-card-background, var(--card-background-color, #1c1c1e)); box-sizing: border-box; }
.round { width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--divider-color); background: transparent; font-size: 18px; line-height: 1; }
.dialwrap { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-top: -10px; }
.dial { position: relative; width: 280px; max-width: 100%; aspect-ratio: 280 / 230; }
.dial svg { position: absolute; inset: 0; width: 100%; height: 100%; touch-action: none; }
.dial .center { position: absolute; left: 0; right: 0; top: 34.8%; text-align: center; pointer-events: none; }
.dial .center .big { font-size: 52px; font-weight: 300; line-height: 1.1; }
.dial .center .small { font-size: 13px; color: var(--secondary-text-color); }
.handle { cursor: grab; }
.steps { display: flex; flex-wrap: wrap; gap: 8px 12px; width: 100%; justify-content: space-between; }
.steps > div:last-child { margin-left: auto; }
.dialwrap .steps { margin-top: -14px; }
.steps > div { display: flex; align-items: center; gap: 6px; }
.steps .round { border: 0; background: var(--temperate-surface-2); font-size: 20px; }
.steps .mid { min-width: 64px; text-align: center; }
.steps .mid span { display: block; font-size: 11px; color: var(--secondary-text-color); white-space: nowrap; }
.steps .mid b { font-weight: 400; font-size: 20px; }
.allow { display: flex; gap: 10px; }
.allow button { flex: 1; height: 44px; border-radius: 12px; border: 1px solid var(--divider-color); background: transparent; color: var(--secondary-text-color); font-size: 14px; }
.allow button.on.h { background: ${mix('var(--temperate-heat)', 15)}; color: var(--temperate-heat); border-color: var(--temperate-heat); }
.allow button.on.c { background: ${mix('var(--temperate-cool)', 15)}; color: var(--temperate-cool); border-color: var(--temperate-cool); }
.mlabel { font-size: 12px; color: var(--secondary-text-color); margin-bottom: 6px; }
.fan { display: flex; align-items: center; gap: 14px; width: 100%; padding: 12px; border-radius: 14px; border: 0; background: var(--temperate-surface); text-align: left; }
.fan .fi { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.fan .ft { flex: 1; }
.fan .ft span { display: block; font-size: 13px; color: var(--secondary-text-color); }
.fan .hint { font-size: 12px; color: var(--secondary-text-color); opacity: .7; }
.err { padding: 16px; color: var(--error-color); }
@keyframes temperate-spin { to { transform: rotate(360deg); } }
@keyframes temperate-flick { 0%,100% { transform: scale(1,1) rotate(0); } 30% { transform: scale(1.06,.94) rotate(-3deg); } 60% { transform: scale(.96,1.05) rotate(3deg); } }
.a-heating .icon .ic { animation: temperate-flick 1s ease-in-out infinite; transform-origin: 50% 90%; }
.a-cooling .icon .ic { animation: temperate-spin 8s linear infinite; }
.fan-run .fanic { animation: temperate-spin 3s linear infinite; }
.fan-on .fanic { animation: temperate-spin 1.2s linear infinite; }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
/* Narrow cards (masonry columns, small tablets): tighten, then stack the steppers. */
@container (max-width: 360px) {
  .head { gap: 10px; padding: 12px; }
  .body { padding: 0 12px 12px; }
  .temp { font-size: 26px; }
  .steps { column-gap: 8px; }
  .steps > div { gap: 4px; }
  .steps .round { width: 36px; height: 36px; font-size: 18px; }
  .steps .mid { min-width: 52px; }
  .steps .mid span { font-size: 10px; }
  .fan .hint { display: none; }
}
@container (max-width: 280px) {
  .steps > div { width: 100%; justify-content: space-between; margin-left: 0; }
}
`;

// Helper entity ids a zone uses unless its config names others:
// climate.downstairs_thermostat → input_boolean.downstairs_heat_allowed, etc.
const HELPERS = {
  heat_allowed: ['input_boolean', 'heat_allowed'],
  cool_allowed: ['input_boolean', 'cool_allowed'],
  manual_override: ['input_boolean', 'manual_override'],
  heat_below: ['input_number', 'heat_below'],
  cool_above: ['input_number', 'cool_above'],
};
const helperIds = (zone) => {
  const prefix = zone.entity.split('.')[1].replace(/_thermostat$/, '');
  const out = {};
  for (const [key, [domain, suffix]] of Object.entries(HELPERS)) out[key] = zone[key] || `${domain}.${prefix}_${suffix}`;
  return out;
};
const zoneList = (config) => (config.entities || (config.entity ? [config.entity] : []))
  .map((z) => (typeof z === 'string' ? { entity: z } : { ...z }));

class TemperateCard extends HTMLElement {
  static getStubConfig(hass) {
    const climate = Object.keys(hass.states).find((e) => e.startsWith('climate.'));
    return { entities: climate ? [{ entity: climate }] : [] };
  }

  static getConfigElement() {
    return document.createElement('temperate-card-editor');
  }

  setConfig(config) {
    // Zones left blank in the editor are skipped rather than treated as errors.
    const list = zoneList(config).filter((c) => c.entity);
    if (!list.length) throw new Error('Pick at least one thermostat');
    this._config = config;
    this._zones = list.map((c) => {
      if (!c.entity.startsWith('climate.')) throw new Error(`"${c.entity}" is not a climate entity`);
      const h = helperIds(c);
      return {
        entity: c.entity,
        name: c.name,
        heat_allowed: h.heat_allowed,
        cool_allowed: h.cool_allowed,
        override: h.manual_override,
        heat_below: h.heat_below,
        cool_above: h.cool_above,
        sensor: c.temperature_sensor,
      };
    });
    this._pending = this._pending || {};
    this._timers = this._timers || {};
    this._sig = null;
    if (this._root) this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._root) this._build();
    const sig = this._signature();
    if (sig !== this._sig) { this._sig = sig; this._render(); }
  }

  getCardSize() { return 1 + this._zones.length * 2; }
  getGridOptions() { return { columns: 12, min_columns: 6 }; }

  _build() {
    this._root = this.attachShadow({ mode: 'open' });
    this._root.innerHTML = `<style>${STYLE}</style><ha-card></ha-card>`;
    this._card = this._root.querySelector('ha-card');
    this._root.addEventListener('click', (e) => this._onClick(e));
    this._root.addEventListener('pointerdown', (e) => this._onDown(e));
    this.addEventListener('pointermove', (e) => this._onMove(e));
    this.addEventListener('pointerup', () => this._onUp());
    this.addEventListener('pointercancel', () => this._onUp());
  }

  _signature() {
    const h = this._hass;
    return JSON.stringify(this._zones.map((z) => [z.entity, z.heat_allowed, z.cool_allowed, z.override, z.heat_below, z.cool_above, z.sensor]
      .map((e) => { const s = e && h.states[e]; return s ? [s.state, s.last_updated] : null; })));
  }

  // Per-card UI memory (open/closed, bar/dial), kept in this browser only.
  _ui(entity) {
    const key = `temperate:${entity}`;
    if (!this._uiCache) this._uiCache = {};
    if (!this._uiCache[key]) {
      let saved = null;
      try { saved = JSON.parse(localStorage.getItem(key)); } catch (e) { /* storage unavailable */ }
      this._uiCache[key] = saved || { open: this._config.collapsed !== true, view: this._config.layout === 'dial' ? 'dial' : 'bar' };
    }
    return this._uiCache[key];
  }

  _setUi(entity, patch) {
    const ui = Object.assign(this._ui(entity), patch);
    try { localStorage.setItem(`temperate:${entity}`, JSON.stringify(ui)); } catch (e) { /* storage unavailable */ }
    this._render();
  }

  _model(z) {
    const h = this._hass;
    const st = h.states[z.entity];
    if (!st) return null;
    const a = st.attributes;
    const unit = (h.config.unit_system && h.config.unit_system.temperature) || '°';
    const isF = unit.includes('F');
    const step = a.target_temp_step || (isF ? 1 : 0.5);
    const gap = this._config.min_gap ?? (isF ? 2 : 1);
    const dmin = Math.max(a.min_temp ?? -100, this._config.dial_min ?? (isF ? 55 : 13));
    const dmax = Math.min(a.max_temp ?? 200, this._config.dial_max ?? (isF ? 85 : 29));
    const sensor = z.sensor && h.states[z.sensor];
    const curRaw = sensor ? parseFloat(sensor.state) : a.current_temperature;
    const on = (e) => h.states[e] && h.states[e].state === 'on';
    const heatOk = on(z.heat_allowed), coolOk = on(z.cool_allowed), manual = on(z.override);
    const num = (e) => { const s = h.states[e]; const v = s ? parseFloat(s.state) : NaN; return isNaN(v) ? null : v; };
    // In auto the range lives in the helpers; in manual it's whatever the thermostat holds.
    const rangeLow = num(z.heat_below), rangeHigh = num(z.cool_above);
    const p = this._pending[z.entity];
    const low = p ? p.low : manual || rangeLow == null ? a.target_temp_low : rangeLow;
    const high = p ? p.high : manual || rangeHigh == null ? a.target_temp_high : rangeHigh;
    const mode = st.state;
    // Right after a restart the thermostat reads unknown until Zigbee2MQTT reports in.
    const waiting = mode === 'unknown' || mode === 'unavailable' || curRaw == null || isNaN(curRaw);
    let act = 'idle';
    if (waiting) act = 'waiting';
    else if (mode === 'off') act = 'off';
    else if (a.hvac_action === 'heating') act = 'heating';
    else if (a.hvac_action === 'cooling') act = 'cooling';
    else if (!manual && !heatOk && !coolOk) act = 'off';
    return {
      z, st, a, unit, step, gap, dmin, dmax, mode, act, manual, auto: !manual, heatOk, coolOk,
      cur: curRaw, low, high, savedLow: rangeLow, savedHigh: rangeHigh, useHelpers: !manual && rangeLow != null && rangeHigh != null,
      name: z.name || a.friendly_name || z.entity,
      ui: this._ui(z.entity),
    };
  }

  _fmt(v, m) {
    if (v == null || isNaN(v)) return '–';
    return m.step >= 1 ? String(Math.round(v)) : (Math.round(v * 2) / 2).toFixed(1).replace(/\.0$/, '');
  }

  _render() {
    if (!this._card || !this._hass) return;
    const title = this._config.title ? `<div class="title">${esc(this._config.title)}</div>` : '';
    this._card.innerHTML = title + this._zones.map((z, i) => {
      const m = this._model(z);
      return m ? this._zoneHtml(m, i) : `<div class="err">Entity not found: ${esc(z.entity)}</div>`;
    }).join('');
  }

  _zoneHtml(m, i) {
    const C = COLOR[m.act];
    const f = (v) => this._fmt(v, m);
    const deg = '°';
    const holding = m.mode === 'heat' ? m.low : m.high;
    const label = { heating: 'Heating', cooling: 'Cooling', idle: m.auto ? 'Comfortable' : 'Idle', off: 'Off', waiting: 'Waiting' }[m.act];
    let sub;
    if (m.act === 'waiting') sub = m.mode === 'unavailable' ? 'thermostat unavailable' : 'for the thermostat to report';
    else if (m.act === 'heating') sub = `to ${f(m.low)}${deg}`;
    else if (m.act === 'cooling') sub = `to ${f(m.high)}${deg}`;
    else if (m.act === 'off') sub = m.manual ? 'set on the thermostat' : (!m.heatOk && !m.coolOk ? 'heat and cool blocked' : 'off');
    else sub = m.auto ? `${f(m.low)}–${f(m.high)}${deg}` : `holding ${f(holding)}${deg}`;
    const ovDesc = m.mode === 'off' ? 'set to Off' : m.mode === 'heat' ? `Heat to ${f(m.low)}${deg}` : m.mode === 'cool' ? `Cool to ${f(m.high)}${deg}` : `set to ${m.mode.replace('_', ' ')}`;
    const restore = m.savedLow && m.savedHigh ? ` · restore ${f(m.savedLow)}–${f(m.savedHigh)}${deg}` : '';
    const open = m.ui.open;
    const head = `
      <button class="head" data-act="toggle" data-z="${i}" aria-expanded="${open}" aria-label="${esc(m.name)}: ${label}, ${f(m.cur)} degrees">
        <span class="icon" style="background:${mix(C, 20)};color:${C}">${ICON[m.act]}</span>
        <span class="who">
          <span class="name">${esc(m.name)}${m.manual ? '<span class="tag">Manual</span>' : ''}</span>
          <span class="status" style="color:${C}">${label} · ${sub}</span>
        </span>
        <span class="temp">${f(m.cur)}${deg}</span>
        ${ICON.chevron}
      </button>`;
    if (!open) return `<div class="zone a-${m.act}${m.manual ? ' manual' : ''}">${head}</div>`;

    const heatLit = m.auto ? m.heatOk : m.mode === 'heat';
    const coolLit = m.auto ? m.coolOk : m.mode === 'cool';
    const banner = m.manual ? `
      <div class="banner">
        <p>${ICON.hand}<span>Changed on the thermostat: ${ovDesc}. Automation is paused until you switch it back.</span></p>
        <button class="resume" data-act="resume" data-z="${i}">Back to auto${restore}</button>
      </div>` : '';
    const view = m.ui.view === 'dial' ? this._dialHtml(m, i, heatLit, coolLit, C, label) : this._barHtml(m, i, heatLit, coolLit);
    const controls = m.auto ? `
      <div class="allow">
        <button class="h${m.heatOk ? ' on' : ''}" data-act="allow-heat" data-z="${i}" aria-pressed="${m.heatOk}">Heat ${m.heatOk ? 'allowed' : 'blocked'}</button>
        <button class="c${m.coolOk ? ' on' : ''}" data-act="allow-cool" data-z="${i}" aria-pressed="${m.coolOk}">Cool ${m.coolOk ? 'allowed' : 'blocked'}</button>
      </div>` : `
      <div><div class="mlabel">Thermostat mode (manual)</div>
      <div class="seg big" role="group" aria-label="Thermostat mode">
        ${['off', 'heat', 'cool'].map((md) => `<button class="${m.mode === md ? 'on' : ''}" data-act="mode" data-mode="${md}" data-z="${i}">${md[0].toUpperCase() + md.slice(1)}</button>`).join('')}
      </div></div>`;
    const running = m.act === 'heating' || m.act === 'cooling';
    const fanOn = m.a.fan_mode === 'on';
    const fanLit = fanOn || running;
    const fanDesc = fanOn ? 'Running all the time' : running ? `Running with ${m.act}` : 'Off until heating or cooling starts';
    const fan = (m.a.fan_modes || []).length > 1 ? `
      <button class="fan ${fanOn ? 'fan-on' : running ? 'fan-run' : ''}" data-act="fan" data-z="${i}">
        <span class="fi" style="background:${fanLit ? 'var(--temperate-surface-2)' : 'var(--temperate-surface)'};color:${fanLit ? 'var(--primary-text-color)' : 'var(--secondary-text-color)'}">${ICON.fan}</span>
        <span class="ft">Fan${m.a.fan_mode ? ` · ${esc(m.a.fan_mode.replace(/^./, (c) => c.toUpperCase()))}` : ''}<span>${m.act === 'waiting' ? 'Waiting for the thermostat' : fanDesc}</span></span>
        <span class="hint">Tap to switch</span>
      </button>` : '';
    return `<div class="zone open a-${m.act}${m.manual ? ' manual' : ''}">${head}
      <div class="body">${banner}
        <div class="toprow"><div class="seg" role="group" aria-label="Layout">
          <button class="${m.ui.view !== 'dial' ? 'on' : ''}" data-act="view" data-view="bar" data-z="${i}">Bar</button>
          <button class="${m.ui.view === 'dial' ? 'on' : ''}" data-act="view" data-view="dial" data-z="${i}">Dial</button>
        </div></div>
        ${view}${controls}${fan}
      </div></div>`;
  }

  _barHtml(m, i, heatLit, coolLit) {
    const span = m.dmax - m.dmin;
    const pct = (t) => Math.max(0, Math.min(100, (t - m.dmin) / span * 100));
    return `
      <div class="bar" aria-hidden="true">
        <div style="left:0;right:0;border-radius:4px;background:var(--temperate-surface-2)"></div>
        <div style="left:0;width:${pct(m.low)}%;border-radius:4px 0 0 4px;background:${heatLit ? 'var(--temperate-heat)' : 'var(--temperate-surface-2)'}"></div>
        <div style="left:${pct(m.low)}%;width:${pct(m.high) - pct(m.low)}%;background:var(--temperate-ok)"></div>
        <div style="left:${pct(m.high)}%;right:0;border-radius:0 4px 4px 0;background:${coolLit ? 'var(--temperate-cool)' : 'var(--temperate-surface-2)'}"></div>
        ${m.act === 'waiting' ? '' : `<div class="marker" style="left:${pct(m.cur)}%"></div>`}
      </div>
      ${this._stepsHtml(m, i, heatLit, coolLit)}`;
  }

  // The heat and cool steppers, shared by the bar and dial layouts.
  _stepsHtml(m, i, heatLit, coolLit) {
    const f = (v) => this._fmt(v, m);
    const steps = (which, col, lbl, val, lit) => `
      <div style="opacity:${lit ? 1 : 0.4}">
        <button class="round" style="color:${col}" data-act="step" data-which="${which}" data-d="-1" data-z="${i}" aria-label="Lower ${lbl.toLowerCase()}">−</button>
        <span class="mid"><span>${lbl}</span><b style="color:${col}">${f(val)}°</b></span>
        <button class="round" style="color:${col}" data-act="step" data-which="${which}" data-d="1" data-z="${i}" aria-label="Raise ${lbl.toLowerCase()}">+</button>
      </div>`;
    return `
      <div class="steps">
        ${steps('low', 'var(--temperate-heat)', m.auto ? 'Heat below' : 'Heat to', m.low, heatLit)}
        ${steps('high', 'var(--temperate-cool)', m.auto ? 'Cool above' : 'Cool to', m.high, coolLit)}
      </div>`;
  }

  _dialHtml(m, i, heatLit, coolLit, C, label) {
    const { cx, cy, r, a0, a1 } = DIAL;
    const f = (v) => this._fmt(v, m);
    const ang = (t) => a0 + (Math.max(m.dmin, Math.min(m.dmax, t)) - m.dmin) / (m.dmax - m.dmin) * (a1 - a0);
    const pt = (t, rr = r) => { const a = ang(t) * Math.PI / 180; return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)]; };
    const arc = (t1, t2) => {
      if (!(t2 > t1)) return '';
      const p = pt(t1), q = pt(t2), large = ang(t2) - ang(t1) > 180 ? 1 : 0;
      return `M${p[0].toFixed(1)},${p[1].toFixed(1)} A${r},${r} 0 ${large} 1 ${q[0].toFixed(1)},${q[1].toFixed(1)}`;
    };
    const lp = pt(m.low), hp = pt(m.high), c1 = pt(m.cur, r - 16), c2 = pt(m.cur, r + 16);
    const bg = 'var(--ha-card-background, var(--card-background-color, #1c1c1e))';
    const line = (w, col) => `<line x1="${c1[0].toFixed(1)}" y1="${c1[1].toFixed(1)}" x2="${c2[0].toFixed(1)}" y2="${c2[1].toFixed(1)}" style="stroke:${col};stroke-width:${w};stroke-linecap:round;pointer-events:none"/>`;
    const handle = (which, p, col, lit) => `
      <g class="handle" data-handle="${which}" data-z="${i}" style="opacity:${lit ? 1 : 0.4}">
        <circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="24" style="fill:#000;fill-opacity:0.001"/>
        <circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="13" style="fill:${bg};stroke:${col};stroke-width:4"/>
      </g>`;
    const ovDesc = m.mode === 'heat' ? `Heat to ${f(m.low)}°` : m.mode === 'cool' ? `Cool to ${f(m.high)}°` : 'Off';
    return `
      <div class="dialwrap">
        <div class="dial" data-dial="${i}">
          <svg viewBox="0 0 ${DIAL.w} ${DIAL.h}" role="img" aria-label="Comfort range dial. Drag the orange or blue handle to change it.">
            <path d="${arc(m.dmin, m.dmax)}" style="fill:none;stroke:var(--temperate-surface-2);stroke-width:16;stroke-linecap:round"/>
            <path d="${arc(m.dmin, m.low)}" style="fill:none;stroke:${heatLit ? 'var(--temperate-heat)' : 'var(--temperate-surface-2)'};stroke-width:16;stroke-linecap:round"/>
            <path d="${arc(m.high, m.dmax)}" style="fill:none;stroke:${coolLit ? 'var(--temperate-cool)' : 'var(--temperate-surface-2)'};stroke-width:16;stroke-linecap:round"/>
            <path d="${arc(m.low, m.high)}" style="fill:none;stroke:var(--temperate-ok);stroke-width:16"/>
            ${handle('low', lp, 'var(--temperate-heat)', heatLit)}
            ${handle('high', hp, 'var(--temperate-cool)', coolLit)}
            ${m.act === 'waiting' ? '' : line(11, bg) + line(6, 'var(--temperate-marker)')}
          </svg>
          <div class="center">
            <div style="font-size:13px;color:${C}">${label}</div>
            <div class="big">${f(m.cur)}°</div>
            <div class="small">${m.auto ? `${f(m.low)}° – ${f(m.high)}°` : ovDesc}</div>
          </div>
        </div>
        ${this._stepsHtml(m, i, heatLit, coolLit)}
      </div>`;
  }

  // Keeps the two setpoints legal: inside the thermostat's limits, at least
  // `gap` apart, on the thermostat's step.
  _setRange(m, low, high, send) {
    const q = (v) => Math.round(v / m.step) * m.step;
    const min = m.a.min_temp ?? -100, max = m.a.max_temp ?? 200;
    low = Math.max(min, Math.min(q(low), max - m.gap));
    high = Math.min(max, Math.max(q(high), min + m.gap));
    if (high - low < m.gap) {
      if (this._which === 'low') low = high - m.gap; else high = low + m.gap;
    }
    this._pending[m.z.entity] = { low, high, helpers: m.useHelpers ? m.z : null };
    clearTimeout(this._timers[m.z.entity]);
    if (send === 'now') this._send(m.z.entity);
    else if (send !== 'later') this._timers[m.z.entity] = setTimeout(() => this._send(m.z.entity), 700);
    this._render();
  }

  _send(entity) {
    const p = this._pending[entity];
    if (!p) return;
    const fail = (e) => console.error('temperate-card', e);
    if (p.helpers) {
      // The automation copies the range to the thermostat.
      this._hass.callService('input_number', 'set_value', { entity_id: p.helpers.heat_below, value: p.low }).catch(fail);
      this._hass.callService('input_number', 'set_value', { entity_id: p.helpers.cool_above, value: p.high }).catch(fail);
    } else {
      this._hass.callService('climate', 'set_temperature', { entity_id: entity, target_temp_low: p.low, target_temp_high: p.high }).catch(fail);
    }
    // Drop the local values once HA has had time to report the new ones.
    setTimeout(() => {
      const cur = this._pending[entity];
      if (cur === p) { delete this._pending[entity]; this._sig = null; this.hass = this._hass; }
    }, 4000);
  }

  _onClick(e) {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const z = this._zones[+el.dataset.z];
    const m = this._model(z);
    if (!m) return;
    const h = this._hass;
    switch (el.dataset.act) {
      case 'toggle': this._setUi(z.entity, { open: !m.ui.open }); break;
      case 'view': this._setUi(z.entity, { view: el.dataset.view }); break;
      case 'step': {
        const d = +el.dataset.d * m.step;
        this._which = el.dataset.which;
        if (el.dataset.which === 'low') this._setRange(m, m.low + d, m.high); else this._setRange(m, m.low, m.high + d);
        break;
      }
      case 'allow-heat': h.callService('input_boolean', 'toggle', { entity_id: z.heat_allowed }); break;
      case 'allow-cool': h.callService('input_boolean', 'toggle', { entity_id: z.cool_allowed }); break;
      case 'mode': h.callService('climate', 'set_hvac_mode', { entity_id: z.entity, hvac_mode: el.dataset.mode }); break;
      case 'resume': h.callService('input_boolean', 'turn_off', { entity_id: z.override }); break;
      case 'fan': {
        const modes = m.a.fan_modes || [];
        const next = modes[(modes.indexOf(m.a.fan_mode) + 1) % modes.length];
        if (next) h.callService('climate', 'set_fan_mode', { entity_id: z.entity, fan_mode: next });
        break;
      }
    }
  }

  _onDown(e) {
    const g = e.target.closest('[data-handle]');
    if (!g) return;
    e.preventDefault();
    this._drag = { z: +g.dataset.z, which: g.dataset.handle };
    this._which = g.dataset.handle;
    this.setPointerCapture(e.pointerId);
  }

  _onMove(e) {
    if (!this._drag) return;
    const dial = this._root.querySelector(`[data-dial="${this._drag.z}"]`);
    const m = this._model(this._zones[this._drag.z]);
    if (!dial || !m) return;
    const b = dial.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width * DIAL.w - DIAL.cx;
    const y = (e.clientY - b.top) / b.height * DIAL.h - DIAL.cy;
    let a = Math.atan2(y, x) * 180 / Math.PI;
    if (a < 0) a += 360;
    if (a < 90) a += 360;
    a = Math.max(DIAL.a0, Math.min(DIAL.a1, a));
    const t = m.dmin + (a - DIAL.a0) / (DIAL.a1 - DIAL.a0) * (m.dmax - m.dmin);
    if (this._drag.which === 'low') this._setRange(m, t, m.high, 'later'); else this._setRange(m, m.low, t, 'later');
  }

  _onUp() {
    if (!this._drag) return;
    const z = this._zones[this._drag.z];
    this._drag = null;
    this._send(z.entity);
  }
}

const LABELS = {
  title: 'Title',
  layout: 'Default layout',
  collapsed: 'Start collapsed',
  min_gap: 'Minimum gap between heat and cool',
  dial_min: 'Dial and bar start',
  dial_max: 'Dial and bar end',
  entity: 'Thermostat',
  name: 'Name',
  temperature_sensor: 'Temperature sensor (optional)',
  heat_allowed: 'Heat allowed',
  cool_allowed: 'Cool allowed',
  manual_override: 'Manual override',
  heat_below: 'Heat below',
  cool_above: 'Cool above',
};

const CARD_SCHEMA = [
  { name: 'title', selector: { text: {} } },
  {
    type: 'grid', name: '', schema: [
      { name: 'layout', selector: { select: { mode: 'dropdown', options: [{ value: 'bar', label: 'Bar' }, { value: 'dial', label: 'Dial' }] } } },
      { name: 'collapsed', selector: { boolean: {} } },
    ],
  },
  {
    type: 'expandable', title: 'Advanced', flatten: true, schema: [
      { name: 'min_gap', selector: { number: { min: 1, max: 10, step: 0.5, mode: 'box' } } },
      {
        type: 'grid', name: '', schema: [
          { name: 'dial_min', selector: { number: { min: 0, max: 100, step: 1, mode: 'box' } } },
          { name: 'dial_max', selector: { number: { min: 0, max: 100, step: 1, mode: 'box' } } },
        ],
      },
    ],
  },
];

const zoneSchema = (zone) => {
  const auto = zone.entity ? helperIds({ entity: zone.entity }) : {};
  return [
    { name: 'entity', required: true, selector: { entity: { filter: { domain: 'climate' } } } },
    {
      type: 'grid', name: '', schema: [
        { name: 'name', selector: { text: {} } },
        { name: 'temperature_sensor', selector: { entity: { filter: { domain: 'sensor', device_class: 'temperature' } } } },
      ],
    },
    {
      type: 'expandable', title: 'Helpers (found automatically)', flatten: true,
      schema: Object.entries(HELPERS).map(([key, [domain]]) => ({
        name: key,
        selector: { entity: { filter: { domain } } },
        helper: auto[key] ? `Default: ${auto[key]}` : undefined,
      })),
    },
  ];
};

// Visual editor. Card-wide options in one form, then one form per zone.
class TemperateCardEditor extends HTMLElement {
  setConfig(config) {
    const zones = zoneList(config);
    const { entity, ...rest } = config;
    this._config = { ...rest, entities: zones };
    if (!this._built || this._formCount !== zones.length) this._build();
    else this._refresh();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._built) this._refresh();
  }

  _build() {
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    const zones = this._config.entities;
    this._formCount = zones.length;
    this.shadowRoot.innerHTML = `
      <style>
        .zone { border: 1px solid var(--divider-color); border-radius: 12px; padding: 12px; margin-top: 16px; }
        .zhead { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; font-weight: 500; }
        .zhead .btns { display: flex; gap: 4px; }
        .zhead button, .add { font: inherit; cursor: pointer; border-radius: 8px; border: 1px solid var(--divider-color); background: transparent; color: var(--primary-text-color); padding: 4px 10px; }
        .zhead button.remove { color: var(--error-color); }
        .add { margin-top: 16px; width: 100%; height: 40px; color: var(--primary-color); }
        .status { font-size: 12px; margin-top: 8px; line-height: 1.5; }
        .status.ok { color: var(--success-color, #43a047); }
        .status.missing { color: var(--warning-color, #ffa600); }
        code { font-size: 11px; }
      </style>
      <ha-form class="card"></ha-form>
      ${zones.map((z, i) => `
        <div class="zone">
          <div class="zhead"><span>Zone ${i + 1}</span><span class="btns">
            ${i > 0 ? `<button data-move="${i}" data-dir="-1" aria-label="Move zone ${i + 1} up">↑</button>` : ''}
            ${i < zones.length - 1 ? `<button data-move="${i}" data-dir="1" aria-label="Move zone ${i + 1} down">↓</button>` : ''}
            ${zones.length > 1 ? `<button class="remove" data-remove="${i}">Remove</button>` : ''}
          </span></div>
          <ha-form class="zoneform" data-i="${i}"></ha-form>
          <div class="status" data-status="${i}"></div>
        </div>`).join('')}
      <button class="add">Add thermostat</button>`;
    const label = (s) => LABELS[s.name] || s.name;
    const helper = (s) => s.helper;
    const card = this.shadowRoot.querySelector('ha-form.card');
    card.computeLabel = label;
    card.addEventListener('value-changed', (e) => {
      e.stopPropagation();
      this._update({ ...e.detail.value, entities: this._config.entities });
    });
    this.shadowRoot.querySelectorAll('ha-form.zoneform').forEach((f) => {
      f.computeLabel = label;
      f.computeHelper = helper;
      f.addEventListener('value-changed', (e) => {
        e.stopPropagation();
        const entities = this._config.entities.slice();
        entities[+f.dataset.i] = e.detail.value;
        this._update({ ...this._config, entities });
      });
    });
    this.shadowRoot.querySelector('.add').addEventListener('click', () =>
      this._update({ ...this._config, entities: [...this._config.entities, { entity: '' }] }, true));
    this.shadowRoot.querySelectorAll('[data-remove]').forEach((b) => b.addEventListener('click', () => {
      const entities = this._config.entities.filter((_, i) => i !== +b.dataset.remove);
      this._update({ ...this._config, entities }, true);
    }));
    this.shadowRoot.querySelectorAll('[data-move]').forEach((b) => b.addEventListener('click', () => {
      const i = +b.dataset.move, j = i + +b.dataset.dir;
      const entities = this._config.entities.slice();
      [entities[i], entities[j]] = [entities[j], entities[i]];
      this._update({ ...this._config, entities }, true);
    }));
    this._built = true;
    this._refresh();
  }

  _refresh() {
    if (!this.shadowRoot) return;
    const { entities, ...cardData } = this._config;
    const card = this.shadowRoot.querySelector('ha-form.card');
    card.hass = this._hass;
    card.data = cardData;
    card.schema = CARD_SCHEMA;
    this.shadowRoot.querySelectorAll('ha-form.zoneform').forEach((f) => {
      const zone = entities[+f.dataset.i] || {};
      f.hass = this._hass;
      f.data = zone;
      f.schema = zoneSchema(zone);
    });
    // Tell the user whether each zone's helpers actually exist.
    this.shadowRoot.querySelectorAll('[data-status]').forEach((el) => {
      const zone = entities[+el.dataset.status] || {};
      if (!zone.entity || !this._hass) { el.textContent = ''; el.className = 'status'; return; }
      const ids = helperIds(zone);
      const missing = Object.values(ids).filter((id) => !this._hass.states[id]);
      el.className = `status ${missing.length ? 'missing' : 'ok'}`;
      el.innerHTML = missing.length
        ? `Missing helpers: ${missing.map((id) => `<code>${esc(id)}</code>`).join(', ')}. Create them or pick others under Helpers.`
        : 'All five helpers found.';
    });
  }

  // Drops empty values so the saved YAML stays tidy, then tells HA.
  _update(config, rebuild) {
    const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== '' && v !== undefined && v !== null));
    const next = clean({ ...config, entities: config.entities.map((z) => ({ entity: z.entity || '', ...clean(z) })) });
    this._config = next;
    if (rebuild) this._build(); else this._refresh();
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: next }, bubbles: true, composed: true }));
  }
}

customElements.define('temperate-card', TemperateCard);
customElements.define('temperate-card-editor', TemperateCardEditor);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'temperate-card',
  name: 'Temperate',
  description: 'One comfort range per zone, heat and cool as permissions, sticky manual override.',
  preview: true,
});
console.info(`%c TEMPERATE-CARD %c ${VERSION} `, 'background:#4FA3F7;color:#111;font-weight:500', 'background:#2A2C31;color:#fff');
