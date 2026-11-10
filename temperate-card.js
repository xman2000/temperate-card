// Temperate standalone climate card. No blueprint, helpers, schedules, or automation writes.
const VERSION = '1.2.5-standalone.1';

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
const TEXT = { heating: 'var(--temperate-heat-text)', cooling: 'var(--temperate-cool-text)', idle: 'var(--temperate-ok-text)', off: 'var(--temperate-off-text)', waiting: 'var(--temperate-off-text)' };
const mix = (c, p) => `color-mix(in srgb, ${c} ${p}%, transparent)`;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const validNumber = (v) => v !== null && v !== undefined && v !== '' && Number.isFinite(Number(v));

// Dial geometry, in the SVG's own coordinates.
const DIAL = { w: 280, h: 230, cx: 140, cy: 130, r: 100, a0: 135, a1: 405 };

const STYLE = `
:host { --temperate-heat: #FF8A50; --temperate-cool: #4FA3F7; --temperate-ok: #7CB342; --temperate-off: #6B7078; --temperate-manual: #FFD54F; --temperate-marker: var(--primary-text-color);
  --temperate-surface: color-mix(in srgb, var(--primary-text-color) 6%, transparent);
  --temperate-surface-2: color-mix(in srgb, var(--primary-text-color) 12%, transparent);
  /* Text in the theme colours. Light themes darken them so they stay readable on white. */
  --temperate-heat-text: var(--temperate-heat); --temperate-cool-text: var(--temperate-cool); --temperate-ok-text: var(--temperate-ok);
  --temperate-off-text: color-mix(in srgb, var(--temperate-off) 50%, var(--primary-text-color));
  --temperate-muted: color-mix(in srgb, var(--secondary-text-color) 75%, var(--primary-text-color));
  --temperate-link: color-mix(in srgb, var(--primary-color) 55%, var(--primary-text-color));
  --temperate-error: color-mix(in srgb, var(--error-color) 75%, var(--primary-text-color));
  --temperate-border: color-mix(in srgb, var(--primary-text-color) 50%, transparent); }
ha-card.light { --temperate-heat-text: color-mix(in srgb, var(--temperate-heat) 50%, var(--primary-text-color));
  --temperate-cool-text: color-mix(in srgb, var(--temperate-cool) 50%, var(--primary-text-color));
  --temperate-ok-text: color-mix(in srgb, var(--temperate-ok) 50%, var(--primary-text-color)); }
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
.name { display: flex; align-items: center; gap: 8px; min-width: 0; font-size: 15px; font-weight: 500; }
.nm { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tag { flex-shrink: 0; font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 10px; background: var(--temperate-manual); color: #3A2E00; }
.status { display: block; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.temp { font-size: 30px; font-weight: 300; }
.chev { color: var(--secondary-text-color); transition: transform .25s; flex-shrink: 0; }
.zone.open .chev { transform: rotate(180deg); }
.body { padding: 0 16px 16px; display: flex; flex-direction: column; gap: 16px; }
.banner { display: flex; flex-direction: column; gap: 10px; padding: 12px; border-radius: 12px; background: ${mix('var(--temperate-manual)', 10)}; border: 1px solid ${mix('var(--temperate-manual)', 45)}; }
.banner p { margin: 0; display: flex; gap: 10px; font-size: 13px; line-height: 1.45; }
.banner svg { flex-shrink: 0; color: var(--temperate-manual); }
.resume { height: 40px; border-radius: 10px; border: 0; background: var(--temperate-manual); color: #3A2E00 !important; font-size: 14px; font-weight: 500; }
.toprow { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px; }
.nxt { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 9px 12px; border-radius: 10px; background: var(--temperate-surface); font-size: 13px; }
.nxt .then { color: var(--temperate-muted); font-size: 12px; white-space: nowrap; }
.nxt.held { background: ${mix('var(--temperate-ok)', 14)}; }
.nxt button { flex-shrink: 0; border: 0; background: none; padding: 8px 12px; margin: -8px -12px; color: var(--temperate-link); font-size: 13px; }
.ribbon svg { display: block; width: 100%; touch-action: none; border-radius: 6px; }
.saxis { position: relative; height: 16px; margin-top: 3px; font-size: 12px; }
.saxis span { position: absolute; top: 0; transform: translateX(-50%); white-space: nowrap; }
.saxis span:first-child { transform: none; }
.saxis span:last-child { transform: translateX(-100%); }
.slist { display: flex; flex-direction: column; }
.srow { display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 2px; background: none; border: 0; border-top: 1px solid ${mix('var(--primary-text-color)', 28)}; text-align: left; font-size: 14px; }
.srow:disabled { cursor: default; }
.srow .stime { width: 76px; flex-shrink: 0; font-size: 13px; }
.srow .sname { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.srow.now .sname { color: var(--temperate-ok-text); }
.sedit { display: flex; flex-direction: column; gap: 12px; padding: 4px 2px 14px; }
.sfields { display: flex; gap: 8px; }
.sfields label { flex: 1; min-width: 0; font-size: 11px; color: var(--secondary-text-color); }
.sfields input { display: block; width: 100%; box-sizing: border-box; height: 36px; margin-top: 3px; padding: 0 8px; border-radius: 8px; border: 1px solid var(--temperate-border); background: var(--temperate-surface); color: var(--primary-text-color); font: inherit; font-size: 14px; color-scheme: light dark; }
.follow { display: flex; align-items: center; gap: 10px; height: 36px; margin-left: auto; padding: 0 4px 0 8px; border: 0; border-radius: 10px; background: none; color: var(--temperate-muted); font-size: 12px; white-space: nowrap; }
.switchrow { display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; padding: 0; background: none; border: 0; text-align: left; font-size: 14px; }
.switchrow small { display: block; font-size: 12px; color: var(--secondary-text-color); }
.sw { position: relative; flex-shrink: 0; width: 36px; height: 20px; border-radius: 10px; background: var(--temperate-surface-2); transition: background .2s; }
.sw::after { content: ''; position: absolute; left: 2px; top: 2px; width: 16px; height: 16px; border-radius: 50%; background: var(--secondary-text-color); transition: left .2s; }
.sw.on { background: var(--temperate-ok); }
.sw.on::after { left: 18px; background: #fff; }
.sadd { height: 40px; border-radius: 10px; border: 0; background: var(--temperate-surface-2); color: var(--primary-text-color); font-size: 14px; font-weight: 500; }
.sremove { align-self: flex-start; padding: 8px 0; margin: -8px 0; border: 0; background: none; color: var(--temperate-error); font-size: 13px; }
.sempty { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 16px 8px; text-align: center; font-size: 13px; color: var(--secondary-text-color); }
.sempty b { font-size: 15px; font-weight: 500; color: var(--primary-text-color); }
.screate { margin-top: 8px; height: 40px; padding: 0 18px; border-radius: 10px; border: 0; background: color-mix(in srgb, var(--primary-color) 70%, #000); color: var(--text-primary-color, #fff); font-size: 14px; font-weight: 500; }
.screate:disabled { opacity: .6; cursor: default; }
.snote { font-size: 12px; color: var(--secondary-text-color); }
.serr { font-size: 12px; color: var(--temperate-error); }
.seg { display: flex; background: var(--temperate-surface); border-radius: 10px; padding: 3px; }
.seg button { flex: 1; height: 30px; padding: 0 12px; border-radius: 8px; border: 0; background: transparent; color: var(--temperate-muted); font-size: 12px; }
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
.dialwrap .steps { margin-top: -14px; }
/* Set by _fitSteps when the two don't fit side by side: one full-width row each. */
.steps.stack > div { width: 100%; justify-content: space-between; }
.steps > div { display: flex; align-items: center; gap: 6px; }
.steps .round { border: 0; background: var(--temperate-surface-2); font-size: 20px; }
.steps .mid { min-width: 64px; text-align: center; }
.steps .mid span { display: block; font-size: 11px; color: var(--secondary-text-color); white-space: nowrap; }
.steps .mid b { font-weight: 400; font-size: 20px; }
.allow { display: flex; gap: 10px; }
.allow button { flex: 1; height: 44px; border-radius: 12px; border: 1px solid var(--temperate-border); background: transparent; color: var(--secondary-text-color); font-size: 14px; }
.allow button.on.h { background: ${mix('var(--temperate-heat)', 15)}; color: var(--temperate-heat-text); border-color: var(--temperate-heat); }
.allow button.on.c { background: ${mix('var(--temperate-cool)', 15)}; color: var(--temperate-cool-text); border-color: var(--temperate-cool); }
.mlabel { font-size: 12px; color: var(--secondary-text-color); margin-bottom: 6px; }
.fan { display: flex; align-items: center; gap: 14px; width: 100%; padding: 12px; border-radius: 14px; border: 0; background: var(--temperate-surface); text-align: left; }
.fan .fi { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.fan .ft { flex: 1; }
.fan .ft span { display: block; font-size: 13px; color: var(--temperate-muted); }
.fan .hint { font-size: 12px; color: var(--temperate-muted); }
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
  .steps > div { width: 100%; justify-content: space-between; }
}
`;

const zoneList = (config) => (config.entities || (config.entity ? [config.entity] : []))
  .map(z => typeof z === 'string' ? { entity: z } : { ...z });
const num = (n) => validNumber(n) ? Number(n) : null;
const unavailable = (st) => !st || ['unknown', 'unavailable'].includes(st.state);
const cap = (m, name) => (m.a.hvac_modes || []).includes(name);

class TemperateCard extends HTMLElement {
  static getStubConfig(hass) {
    const entity = Object.keys(hass.states).find(e => e.startsWith('climate.'));
    return { layout: 'dial', entities: entity ? [{ entity }] : [] };
  }
  static getConfigElement() { return document.createElement('temperate-card-editor'); }
  setConfig(config) {
    const zones = zoneList(config).filter(z => z.entity);
    if (!zones.length) throw Error('Choose at least one climate entity');
    for (const z of zones) if (!/^climate\.[a-z0-9_]+$/.test(z.entity)) throw Error(`Invalid climate entity: ${z.entity}`);
    this._config = config;
    this._zones = zones;
    this._pending ||= {};
    this._busy ||= new Set();
    this._timers ||= {};
    this._uiCache ||= {};
    this._sig = null;
    if (this._root) this._render();
  }
  set hass(hass) {
    this._hass = hass;
    if (!this._root) this._build();
    const signature = JSON.stringify(this._zones.map(z => {
      const st = hass.states[z.entity];
      const sensor = z.temperature_sensor && hass.states[z.temperature_sensor];
      return [st?.state, st?.last_updated, sensor?.state, sensor?.last_updated];
    }));
    if (signature !== this._sig) { this._sig = signature; this._render(); }
  }
  disconnectedCallback() {
    Object.values(this._timers || {}).forEach(clearTimeout);
    this._timers = {};
    this._resize?.disconnect();
    if (this._onWindowUp) window.removeEventListener('pointerup', this._onWindowUp, true);
    this._onWindowUp = null;
    this._drag = null;
  }
  getCardSize() { return 1 + this._zones.length * 2; }
  getGridOptions() { return { columns: 12, min_columns: 6 }; }
  _build() {
    this._root = this.attachShadow({ mode: 'open' });
    this._root.innerHTML = `<style>${STYLE}</style><ha-card></ha-card>`;
    this._card = this._root.querySelector('ha-card');
    this._root.addEventListener('click', e => this._onClick(e));
    this._root.addEventListener('keydown', e => this._onKeyDown(e));
    this._root.addEventListener('pointerdown', e => this._onDown(e));
    this.addEventListener('pointermove', e => this._onMove(e));
    this.addEventListener('pointerup', e => this._onUp(e));
    this.addEventListener('pointercancel', e => this._onUp(e));
    if (typeof ResizeObserver !== 'undefined') {
      this._resize = new ResizeObserver(() => this._fitSteps());
      this._resize.observe(this);
    }
  }
  _ui(entity) {
    if (!this._uiCache[entity]) {
      let stored;
      try { stored = JSON.parse(localStorage.getItem(`temperate-standalone:${entity}`)); } catch (_) { /* ignore */ }
      this._uiCache[entity] = {
        open: typeof stored?.open === 'boolean' ? stored.open : this._config.collapsed !== true,
        view: stored?.view === 'bar' || stored?.view === 'dial' ? stored.view : (this._config.layout === 'bar' ? 'bar' : 'dial'),
      };
    }
    return this._uiCache[entity];
  }
  _setUi(entity, patch) {
    Object.assign(this._ui(entity), patch);
    try { localStorage.setItem(`temperate-standalone:${entity}`, JSON.stringify(this._ui(entity))); } catch (_) { /* ignore */ }
    this._render();
  }
  _model(z) {
    const st = this._hass.states[z.entity];
    if (!st) return null;
    const a = st.attributes || {};
    const modes = Array.isArray(a.hvac_modes) ? a.hvac_modes : [];
    const unit = this._hass.config?.unit_system?.temperature || '°F';
    const fahrenheit = unit.includes('F');
    const step = num(a.target_temp_step) || (fahrenheit ? 1 : 0.5);
    const gap = num(this._config.min_gap) ?? (fahrenheit ? 2 : 1);
    const min = num(a.min_temp) ?? (fahrenheit ? 45 : 7);
    const max = num(a.max_temp) ?? (fahrenheit ? 95 : 35);
    const dmin = Math.max(min, num(this._config.dial_min) ?? (fahrenheit ? 55 : 13));
    const dmax = Math.min(max, num(this._config.dial_max) ?? (fahrenheit ? 85 : 29));
    const sensor = z.temperature_sensor && this._hass.states[z.temperature_sensor];
    const cur = sensor ? num(sensor.state) : num(a.current_temperature);
    const mode = st.state;
    const supportsHeat = modes.includes('heat') || modes.includes('heat_cool');
    const supportsCool = modes.includes('cool') || modes.includes('heat_cool');
    const dual = mode === 'heat_cool';
    const pending = this._pending[z.entity];
    const reportedLow = num(a.target_temp_low);
    const reportedHigh = num(a.target_temp_high);
    const target = num(a.temperature);
    let low = dual ? reportedLow : mode === 'heat' ? target : null;
    let high = dual ? reportedHigh : mode === 'cool' ? target : null;
    if (pending && pending.mode === mode) { low = pending.low; high = pending.high; }
    // Single-setpoint modes don't provide an independent opposite-mode target.
    // Never manufacture one for control commands.
    const waiting = unavailable(st) || cur === null || (sensor && ['unknown', 'unavailable'].includes(sensor.state));
    const boundsOk = step > 0 && gap > 0 && min < max && dmin < dmax;
    const targetOk = mode === 'heat_cool' ? low !== null && high !== null && high - low >= gap - 0.001
      : mode === 'heat' ? low !== null : mode === 'cool' ? high !== null : true;
    const ready = !waiting && boundsOk && targetOk;
    const act = waiting ? 'waiting' : mode === 'off' ? 'off'
      : a.hvac_action === 'heating' ? 'heating' : a.hvac_action === 'cooling' ? 'cooling' : 'idle';
    return { z, st, a, unit, step, gap, min, max, dmin, dmax, mode, modes, cur,
      low, high, ready, act, dual, supportsHeat, supportsCool, ui: this._ui(z.entity),
      name: z.name || a.friendly_name || z.entity };
  }
  _fmt(v, m) {
    if (v === null || !Number.isFinite(Number(v))) return '–';
    return Number((Math.round(v / m.step) * m.step).toFixed(3)).toString();
  }
  _render() {
    if (!this._card || !this._hass) return;
    this._card.classList.toggle('light', this._hass.themes?.darkMode === false);
    const title = this._config.title ? `<div class="title">${esc(this._config.title)}</div>` : '';
    this._card.innerHTML = title + this._zones.map((z, i) => {
      const m = this._model(z);
      return m ? this._zoneHtml(m, i) : `<div class="err">Climate entity missing: ${esc(z.entity)}</div>`;
    }).join('');
    this._fitSteps();
  }
  _fitSteps() {
    this._card?.querySelectorAll('.steps').forEach(row => {
      row.classList.remove('stack');
      const [left, right] = row.children;
      if (left && right && right.offsetTop > left.offsetTop) row.classList.add('stack');
    });
  }
  _zoneHtml(m, i) {
    const f = v => this._fmt(v, m);
    const C = COLOR[m.act];
    const label = { heating: 'Heating', cooling: 'Cooling', idle: 'Idle', off: 'Off', waiting: 'Waiting' }[m.act];
    const summary = m.mode === 'heat_cool' ? `Heat ${f(m.low)}° · Cool ${f(m.high)}°`
      : m.mode === 'heat' ? `Heating target ${f(m.low)}°`
      : m.mode === 'cool' ? `Cooling target ${f(m.high)}°`
      : m.mode === 'off' ? 'Thermostat off' : esc(m.mode);
    const open = m.ui.open;
    const head = `<button class="head" data-act="toggle" data-z="${i}" aria-expanded="${open}" aria-label="${esc(m.name)}: ${esc(label)}, ${f(m.cur)} degrees">
      <span class="icon" style="background:${mix(C, 20)};color:${TEXT[m.act]}">${ICON[m.act]}</span>
      <span class="who"><span class="name"><span class="nm">${esc(m.name)}</span></span>
      <span class="status" style="color:${TEXT[m.act]}">${label} · ${summary}</span></span>
      <span class="temp">${f(m.cur)}°</span>${ICON.chevron}</button>`;
    if (!open) return `<div class="zone a-${m.act}">${head}</div>`;
    const modeButtons = m.modes.filter(mode => ['off','heat','cool','heat_cool','auto'].includes(mode)).map(mode => {
      const name = mode === 'heat_cool' ? 'Auto' : mode[0].toUpperCase() + mode.slice(1);
      return `<button class="${m.mode === mode ? 'on' : ''}" data-act="mode" data-mode="${esc(mode)}" data-z="${i}" aria-pressed="${m.mode === mode}">${name}</button>`;
    }).join('');
    const view = m.ui.view === 'bar' ? this._barHtml(m, i) : this._dialHtml(m, i);
    const fanModes = Array.isArray(m.a.fan_modes) ? m.a.fan_modes : [];
    const fanMode = m.a.fan_mode;
    const fan = fanModes.length > 1 ? `<button class="fan" data-act="fan" data-z="${i}" ${m.ready ? '' : 'disabled'}>
        <span class="fi">${ICON.fan}</span><span class="ft">Fan · ${esc(fanMode || 'Unknown')}<span>Tap to change fan setting</span></span>
        <span class="hint">Tap to switch</span></button>` : '';
    const warning = !m.ready ? '<div class="sempty" role="status">Thermostat temperature or target unavailable. Setpoint controls disabled.</div>' : '';
    return `<div class="zone open a-${m.act}">${head}<div class="body">
      <div class="toprow"><div class="seg" role="group" aria-label="Layout">
        <button class="${m.ui.view === 'bar' ? 'on' : ''}" data-act="view" data-view="bar" data-z="${i}">Bar</button>
        <button class="${m.ui.view === 'dial' ? 'on' : ''}" data-act="view" data-view="dial" data-z="${i}">Dial</button></div></div>
      ${warning}${view}<div><div class="mlabel">Thermostat mode</div><div class="seg big" role="group" aria-label="Thermostat mode">${modeButtons}</div></div>${fan}
      </div></div>`;
  }
  _stepsHtml(m, i) {
    const steps = (which, label, value, color) => `<div>
      <button class="round" style="color:${color}" data-act="step" data-which="${which}" data-d="-1" data-z="${i}" aria-label="Lower ${label}" ${m.ready && value !== null ? '' : 'disabled'}>−</button>
      <span class="mid"><span>${label}</span><b style="color:${color}">${this._fmt(value, m)}°</b></span>
      <button class="round" style="color:${color}" data-act="step" data-which="${which}" data-d="1" data-z="${i}" aria-label="Raise ${label}" ${m.ready && value !== null ? '' : 'disabled'}>+</button></div>`;
    const parts = [];
    if (m.mode === 'heat' || m.dual) parts.push(steps('low', 'Heat to', m.low, 'var(--temperate-heat-text)'));
    if (m.mode === 'cool' || m.dual) parts.push(steps('high', 'Cool to', m.high, 'var(--temperate-cool-text)'));
    if (!parts.length) return '';
    return `<div class="steps">${parts.join('')}</div>`;
  }
  _barHtml(m, i) {
    const pct = t => Math.max(0, Math.min(100, ((t - m.dmin) / (m.dmax - m.dmin)) * 100));
    const heat = m.low !== null ? pct(m.low) : 0, cool = m.high !== null ? pct(m.high) : 100;
    return `<div class="bar" aria-hidden="true">
      <div style="left:0;right:0;border-radius:4px;background:var(--temperate-surface-2)"></div>
      ${m.low !== null ? `<div style="left:0;width:${heat}%;background:var(--temperate-heat)"></div>` : ''}
      ${m.dual ? `<div style="left:${heat}%;width:${Math.max(0,cool-heat)}%;background:var(--temperate-ok)"></div>` : ''}
      ${m.high !== null ? `<div style="left:${cool}%;right:0;background:var(--temperate-cool)"></div>` : ''}
      ${m.cur !== null ? `<div class="marker" style="left:${pct(m.cur)}%"></div>` : ''}</div>${this._stepsHtml(m,i)}`;
  }
  _dialHtml(m, i) {
    const { cx, cy, r, a0, a1 } = DIAL;
    const angle = t => a0 + (Math.max(m.dmin, Math.min(m.dmax, t)) - m.dmin) / (m.dmax - m.dmin) * (a1-a0);
    const point = (t, radius = r) => { const a = angle(t)*Math.PI/180; return [cx+radius*Math.cos(a), cy+radius*Math.sin(a)]; };
    const arc = (start,end) => {
      if (start === null || end === null || end <= start) return '';
      const p=point(start), q=point(end), large=angle(end)-angle(start)>180?1:0;
      return `M${p[0].toFixed(1)},${p[1].toFixed(1)} A${r},${r} 0 ${large} 1 ${q[0].toFixed(1)},${q[1].toFixed(1)}`;
    };
    const handle = (which, target, color) => {
      if (target === null || !m.ready) return '';
      const p=point(target);
      return `<g class="handle" data-handle="${which}" data-z="${i}" role="slider" aria-label="${which === 'low' ? 'Heating' : 'Cooling'} target" aria-valuenow="${target}" tabindex="0">
        <circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="24" style="fill:#000;fill-opacity:0.001"/>
        <circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="13" style="fill:var(--ha-card-background,var(--card-background-color,#1c1c1e));stroke:${color};stroke-width:4"/></g>`;
    };
    const center = m.cur === null ? '–' : this._fmt(m.cur,m);
    let marker = '';
    if (m.cur !== null) {
      const p=point(m.cur,r-16), q=point(m.cur,r+16);
      marker=`<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" style="stroke:var(--temperate-marker);stroke-width:5;stroke-linecap:round;pointer-events:none"/>`;
    }
    const label = { heating:'Heating', cooling:'Cooling', idle:'Idle', off:'Off', waiting:'Waiting' }[m.act];
    const sub = m.dual ? `${this._fmt(m.low,m)}° – ${this._fmt(m.high,m)}°`
      : m.mode === 'heat' ? `Heat ${this._fmt(m.low,m)}°` : m.mode === 'cool' ? `Cool ${this._fmt(m.high,m)}°` : m.mode === 'off' ? 'Off' : esc(m.mode);
    return `<div class="dialwrap"><div class="dial" data-dial="${i}"><svg viewBox="0 0 ${DIAL.w} ${DIAL.h}" role="img" aria-label="Thermostat temperature dial">
      <path d="${arc(m.dmin,m.dmax)}" style="fill:none;stroke:var(--temperate-surface-2);stroke-width:16;stroke-linecap:round"/>
      ${m.low !== null ? `<path d="${arc(m.dmin,m.low)}" style="fill:none;stroke:var(--temperate-heat);stroke-width:16;stroke-linecap:round"/>` : ''}
      ${m.dual ? `<path d="${arc(m.low,m.high)}" style="fill:none;stroke:var(--temperate-ok);stroke-width:16"/>` : ''}
      ${m.high !== null ? `<path d="${arc(m.high,m.dmax)}" style="fill:none;stroke:var(--temperate-cool);stroke-width:16;stroke-linecap:round"/>` : ''}
      ${handle('low',m.low,'var(--temperate-heat)')}${handle('high',m.high,'var(--temperate-cool)')}${marker}
      </svg><div class="center"><div style="font-size:13px;color:${TEXT[m.act]}">${label}</div><div class="big">${center}°</div><div class="small">${sub}</div></div></div>${this._stepsHtml(m,i)}</div>`;
  }
  _error(message) {
    console.error('temperate-card:', message);
    this.dispatchEvent(new CustomEvent('hass-notification', {
      detail: { message: `Temperate: ${message}`, duration: 7000 }, bubbles: true, composed: true,
    }));
  }
  async _service(action, data) {
    try { await this._hass.callService('climate', action, data); return true; }
    catch (e) { this._error(`${action}: ${e?.message || e}`); return false; }
  }
  _setTarget(m, which, value, immediate = false) {
    if (!m.ready || !['heat','cool','heat_cool'].includes(m.mode) || !Number.isFinite(value)) return;
    if ((which === 'low' && m.low === null) || (which === 'high' && m.high === null)) return;
    const q = v => Number((Math.round(v/m.step)*m.step).toFixed(3));
    const bounded = q(Math.max(m.min, Math.min(m.max, value)));
    if (!Number.isFinite(bounded)) return;
    const low = which === 'low' ? bounded : m.low;
    const high = which === 'high' ? bounded : m.high;
    if (m.dual && (low === null || high === null || high-low < m.gap-0.001)) return;
    if ((which === 'low' && low === m.low) || (which === 'high' && high === m.high)) return;
    const entity=m.z.entity;
    this._pending[entity] = { mode:m.mode, low, high };
    clearTimeout(this._timers[entity]);
    if (immediate) void this._send(entity);
    else this._timers[entity] = setTimeout(() => void this._send(entity), 500);
    this._render();
  }
  async _send(entity) {
    if (this._busy.has(entity)) return;
    this._busy.add(entity);
    try {
      while (this._pending[entity]) {
        const p=this._pending[entity];
        const m=this._model(this._zones.find(z=>z.entity===entity));
        if (!m || !m.ready || p.mode!==m.mode || !['heat','cool','heat_cool'].includes(m.mode)) {
          this._error('Thermostat unavailable or its mode changed; temperature edit discarded.');
          if (this._pending[entity]===p) delete this._pending[entity];
          break;
        }
        let payload={entity_id:entity};
        if (p.mode==='heat') payload.temperature=p.low;
        else if (p.mode==='cool') payload.temperature=p.high;
        else payload={...payload,target_temp_low:p.low,target_temp_high:p.high};
        const ok=await this._service('set_temperature', payload);
        if (!ok) { delete this._pending[entity]; break; }
        if (this._pending[entity]===p) { delete this._pending[entity]; break; }
      }
    } finally { this._busy.delete(entity); this._sig=null; this._render(); }
  }
  _onClick(e) {
    const el=e.target.closest('[data-act]');
    if (!el) return;
    const m=this._model(this._zones[Number(el.dataset.z)]);
    if (!m) return;
    switch (el.dataset.act) {
      case 'toggle': this._setUi(m.z.entity,{open:!m.ui.open}); break;
      case 'view': this._setUi(m.z.entity,{view:el.dataset.view}); break;
      case 'step': {
        const which=el.dataset.which, value=which==='low'?m.low:m.high;
        if (value !== null) this._setTarget(m,which,value+Number(el.dataset.d)*m.step);
        break;
      }
      case 'mode': {
        if (unavailable(m.st) || this._busy.has(m.z.entity)) return;
        const mode=el.dataset.mode;
        if (!m.modes.includes(mode)) return this._error(`Mode ${mode} unsupported`);
        clearTimeout(this._timers[m.z.entity]);
        delete this._pending[m.z.entity];
        void this._service('set_hvac_mode',{entity_id:m.z.entity,hvac_mode:mode});
        break;
      }
      case 'fan': {
        if (unavailable(m.st)) return;
        const modes=Array.isArray(m.a.fan_modes)?m.a.fan_modes:[];
        const index=modes.indexOf(m.a.fan_mode);
        const next=modes[(index+1)%modes.length];
        if (next && modes.length>1) void this._service('set_fan_mode',{entity_id:m.z.entity,fan_mode:next});
        break;
      }
    }
  }
  _onKeyDown(e) {
    const handle=e.target.closest('[data-handle]');
    if (!handle || !['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) return;
    e.preventDefault();
    const m=this._model(this._zones[Number(handle.dataset.z)]);
    if (!m?.ready) return;
    const which=handle.dataset.handle;
    const value=which==='low'?m.low:m.high;
    if (value !== null) this._setTarget(m,which,value+(e.key==='ArrowUp'||e.key==='ArrowRight'?m.step:-m.step));
  }
  _onDown(e) {
    const g=e.target.closest('[data-handle]');
    if (!g) return;
    const m=this._model(this._zones[Number(g.dataset.z)]);
    if (!m?.ready) return;
    e.preventDefault();
    this._drag={ z:Number(g.dataset.z), which:g.dataset.handle, moved:false };
    try { this.setPointerCapture(e.pointerId); } catch (_) { /* window-up fallback */ }
    if (this._onWindowUp) window.removeEventListener('pointerup',this._onWindowUp,true);
    this._onWindowUp=()=>this._onUp();
    window.addEventListener('pointerup',this._onWindowUp,{once:true,capture:true});
  }
  _onMove(e) {
    if (!this._drag) return;
    const dial=this._root.querySelector(`[data-dial="${this._drag.z}"] svg`);
    const m=this._model(this._zones[this._drag.z]);
    if (!dial || !m?.ready) return;
    const b=dial.getBoundingClientRect();
    // The SVG uses preserveAspectRatio="xMidYMid meet" by default. Account
    // for letterboxing so drag maps exactly to the displayed viewBox.
    const scale=Math.min(b.width/DIAL.w,b.height/DIAL.h);
    if (!(scale>0)) return;
    const offsetX=(b.width-DIAL.w*scale)/2, offsetY=(b.height-DIAL.h*scale)/2;
    const x=(e.clientX-b.left-offsetX)/scale-DIAL.cx;
    const y=(e.clientY-b.top-offsetY)/scale-DIAL.cy;
    let angle=Math.atan2(y,x)*180/Math.PI;
    if (angle<0) angle+=360;
    if (angle<90) angle+=360;
    angle=Math.max(DIAL.a0,Math.min(DIAL.a1,angle));
    const value=m.dmin+(angle-DIAL.a0)/(DIAL.a1-DIAL.a0)*(m.dmax-m.dmin);
    this._setTarget(m,this._drag.which,value);
    this._drag.moved=true;
  }
  _onUp() {
    const d=this._drag;
    this._drag=null;
    if (this._onWindowUp) window.removeEventListener('pointerup',this._onWindowUp,true);
    this._onWindowUp=null;
    if (!d) return;
    const entity=this._zones[d.z]?.entity;
    if (entity && d.moved && this._pending[entity]) {
      clearTimeout(this._timers[entity]);
      void this._send(entity);
    }
  }
}

const LABELS={ title:'Title', layout:'Default layout', collapsed:'Start collapsed',
  min_gap:'Minimum heating/cooling gap',dial_min:'Dial minimum',dial_max:'Dial maximum',
  entity:'Thermostat',name:'Name',temperature_sensor:'Temperature sensor (optional)' };
const CARD_SCHEMA=[
  {name:'title',selector:{text:{}}},
  {name:'layout',selector:{select:{mode:'dropdown',options:[{value:'dial',label:'Dial'},{value:'bar',label:'Bar'}]}}},
  {name:'collapsed',selector:{boolean:{}}},
  {type:'expandable',title:'Advanced',flatten:true,schema:[
    {name:'min_gap',selector:{number:{min:0.5,max:10,step:0.5,mode:'box'}}},
    {name:'dial_min',selector:{number:{min:0,max:100,step:1,mode:'box'}}},
    {name:'dial_max',selector:{number:{min:0,max:100,step:1,mode:'box'}}},
  ]},
];
const ZONE_SCHEMA=[
  {name:'entity',required:true,selector:{entity:{filter:{domain:'climate'}}}},
  {name:'name',selector:{text:{}}},
  {name:'temperature_sensor',selector:{entity:{filter:{domain:'sensor',device_class:'temperature'}}}},
];
class TemperateCardEditor extends HTMLElement {
  setConfig(config) {
    this._config={...config,entities:zoneList(config)};
    this._build();
  }
  set hass(hass) { this._hass=hass; this._refresh(); }
  _build() {
    if (!this.shadowRoot) this.attachShadow({mode:'open'});
    const zones=this._config.entities;
    this.shadowRoot.innerHTML=`<style>
      .zone { margin: 12px 0; padding: 10px; border:1px solid var(--divider-color);border-radius:12px }
      .row{display:flex;justify-content:space-between;gap:8px;align-items:center}
      button{font:inherit;cursor:pointer;background:var(--secondary-background-color);color:var(--primary-text-color);padding:8px;border:0;border-radius:8px}
      .add{width:100%;margin-top:12px}
      </style><ha-form class="main"></ha-form>
      ${zones.map((z,i)=>`<div class="zone"><div class="row"><b>Thermostat ${i+1}</b><button data-remove="${i}">Remove</button></div><ha-form data-zone="${i}"></ha-form></div>`).join('')}
      <button class="add">Add thermostat</button>`;
    const main=this.shadowRoot.querySelector('ha-form.main');
    main.computeLabel=s=>LABELS[s.name]||s.name;
    main.addEventListener('value-changed',e=>this._update({...e.detail.value,entities:this._config.entities}));
    this.shadowRoot.querySelectorAll('ha-form[data-zone]').forEach(form=>{
      form.computeLabel=s=>LABELS[s.name]||s.name;
      form.addEventListener('value-changed',e=>{
        const entities=this._config.entities.map(x=>({...x}));
        entities[Number(form.dataset.zone)]=e.detail.value;
        this._update({...this._config,entities});
      });
    });
    this.shadowRoot.querySelector('.add').addEventListener('click',()=>this._update({...this._config,entities:[...this._config.entities,{entity:''}]},true));
    this.shadowRoot.querySelectorAll('[data-remove]').forEach(btn=>btn.addEventListener('click',()=>{
      this._update({...this._config,entities:this._config.entities.filter((_,i)=>i!==Number(btn.dataset.remove))},true);
    }));
    this._refresh();
  }
  _refresh() {
    if (!this.shadowRoot || !this._hass) return;
    const main=this.shadowRoot.querySelector('ha-form.main');
    if (!main) return;
    main.hass=this._hass;
    main.schema=CARD_SCHEMA;
    const {entities,...data}=this._config;
    main.data=data;
    this.shadowRoot.querySelectorAll('ha-form[data-zone]').forEach(form=>{
      form.hass=this._hass;
      form.schema=ZONE_SCHEMA;
      form.data=entities[Number(form.dataset.zone)]||{};
    });
  }
  _update(config,rebuild=false) {
    this._config={...config,entities:zoneList(config)};
    if (rebuild) this._build(); else this._refresh();
    this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:this._config},bubbles:true,composed:true}));
  }
}

customElements.define('temperate-card',TemperateCard);
customElements.define('temperate-card-editor',TemperateCardEditor);
window.customCards=window.customCards||[];
window.customCards.push({type:'temperate-card',name:'Temperate Standalone',description:'Direct native thermostat controls, without blueprints or helpers.',preview:true});
console.info(`%c TEMPERATE-CARD %c ${VERSION} `,'background:#4FA3F7;color:#111;font-weight:500','background:#2A2C31;color:#fff');
