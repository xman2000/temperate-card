// Temperate card: one comfort range per zone, heat/cool as permissions,
// sticky manual override. Pairs with the "Temperate changeover" blueprint.
const VERSION = '1.2.5';

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
.steps > div:last-child { margin-left: auto; }
.dialwrap .steps { margin-top: -14px; }
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
  commanded_mode: ['input_text', 'commanded_mode'],
};
const zonePrefix = (zone) => zone.entity.split('.')[1].replace(/_thermostat$/, '');
const helperIds = (zone) => {
  const prefix = zonePrefix(zone);
  const out = {};
  for (const [key, [domain, suffix]] of Object.entries(HELPERS)) out[key] = zone[key] || `${domain}.${prefix}_${suffix}`;
  return out;
};
const HELPER_ICONS = {
  heat_allowed: 'mdi:fire', cool_allowed: 'mdi:snowflake', manual_override: 'mdi:hand-back-right',
  heat_below: 'mdi:thermometer-chevron-down', cool_above: 'mdi:thermometer-chevron-up', commanded_mode: 'mdi:thermostat',
};
const zoneList = (config) => (config.entities || (config.entity ? [config.entity] : []))
  .map((z) => (typeof z === 'string' ? { entity: z } : { ...z }));

// The schedule is optional, so these two are not counted among the required helpers.
const scheduleIds = (zone) => {
  const prefix = zonePrefix(zone);
  return { schedule: zone.schedule || `schedule.${prefix}_schedule`, follow_schedule: zone.follow_schedule || `input_boolean.${prefix}_follow_schedule` };
};

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const MAX_PERIODS = 8;
const SNAP = 15;
const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const hhmm = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
const near = (a, b) => Math.abs(a - b) < 0.01;
const byStart = (a, b) => a.start - b.start;
const samePeriod = (a, b) => a.name === b.name && a.off === b.off && a.low === b.low && a.high === b.high;
const periodData = (p) => ({ period: p.name, ...(p.off ? { off: true } : p.low == null ? {} : { heat_below: p.low, cool_above: p.high }) });

// A schedule block can't cross midnight, so a period that does is stored as two.
const blocksToPeriods = (blocks) => {
  const list = blocks.map((b) => {
    const d = b.data || {};
    // A block from a schedule made elsewhere has no range. The automation ignores those.
    const range = Number.isFinite(d.heat_below) && Number.isFinite(d.cool_above);
    return { start: toMin(b.from), name: d.period || 'Period', off: d.off === true, low: range ? d.heat_below : null, high: range ? d.cool_above : null };
  }).sort(byStart);
  if (list.length > 1 && list[0].start === 0 && samePeriod(list[0], list[list.length - 1])) list.shift();
  return list;
};
const periodsToBlocks = (periods) => {
  const blocks = periods.map((p, i) => ({
    from: `${hhmm(p.start)}:00`,
    to: i + 1 < periods.length ? `${hhmm(periods[i + 1].start)}:00` : '24:00:00',
    data: periodData(p),
  }));
  if (periods[0].start > 0) blocks.unshift({ from: '00:00:00', to: `${hhmm(periods[0].start)}:00`, data: periodData(periods[periods.length - 1]) });
  return blocks;
};
const periodAt = (periods, min) => {
  let i = periods.length - 1;
  periods.forEach((p, k) => { if (p.start <= min) i = k; });
  return { cur: periods[i], next: periods[(i + 1) % periods.length] };
};

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
      const s = scheduleIds(c);
      return {
        entity: c.entity,
        name: c.name,
        heat_allowed: h.heat_allowed,
        cool_allowed: h.cool_allowed,
        override: h.manual_override,
        heat_below: h.heat_below,
        cool_above: h.cool_above,
        sensor: c.temperature_sensor,
        schedule: s.schedule,
        follow: s.follow_schedule,
      };
    });
    this._pending = this._pending || {};
    this._timers = this._timers || {};
    this._uiCache = {};
    this._sig = null;
    if (this._root) this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._root) this._build();
    const sig = this._signature();
    // Redrawing would take the cursor out of a schedule field mid-edit.
    if (sig === this._sig) return;
    if (this._typing()) this._dirty = true;
    else { this._sig = sig; this._render(); }
  }

  _typing() {
    const a = this._root && this._root.activeElement;
    return !!a && a.tagName === 'INPUT';
  }

  _schedRender() {
    if (this._typing()) this._dirty = true;
    else this._render();
  }

  // Runs what was held back while a field had focus. Waits for a press to finish,
  // because redrawing under the pointer would lose the click.
  _flush() {
    setTimeout(() => {
      if (!this._dirty || this._typing() || this._pressed) return;
      this._dirty = false;
      for (const z of this._zones) {
        const s = this._schedState(z);
        if (!s.periods) continue;
        const open = s.edit != null ? s.periods[s.edit] : null;
        s.periods = [...s.periods].sort(byStart);
        if (open) s.edit = s.periods.indexOf(open);
      }
      this._sig = this._signature();
      this._render();
    }, 0);
  }

  getCardSize() { return 1 + this._zones.length * 2; }
  getGridOptions() { return { columns: 12, min_columns: 6 }; }

  _build() {
    this._root = this.attachShadow({ mode: 'open' });
    this._root.innerHTML = `<style>${STYLE}</style><ha-card></ha-card>`;
    this._card = this._root.querySelector('ha-card');
    this._root.addEventListener('click', (e) => this._onClick(e));
    this._root.addEventListener('change', (e) => this._onChange(e));
    this._root.addEventListener('focusout', () => this._flush());
    this._root.addEventListener('pointerdown', (e) => this._onDown(e));
    this.addEventListener('pointermove', (e) => this._onMove(e));
    this.addEventListener('pointerup', () => this._onUp());
    this.addEventListener('pointercancel', () => this._onUp());
  }

  _signature() {
    const h = this._hass;
    return JSON.stringify(this._zones.map((z) => [z.entity, z.heat_allowed, z.cool_allowed, z.override, z.heat_below, z.cool_above, z.sensor, z.schedule, z.follow]
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
    const sched = this._schedModel(z, manual, rangeLow, rangeHigh);
    return {
      z, st, a, unit, step, gap, dmin, dmax, mode, act, manual, auto: !manual, heatOk, coolOk,
      cur: curRaw, low, high, savedLow: rangeLow, savedHigh: rangeHigh, useHelpers: !manual && rangeLow != null && rangeHigh != null,
      name: z.name || a.friendly_name || z.entity,
      ui: this._ui(z.entity),
      sched,
    };
  }

  _schedState(z) {
    if (!this._scheds) this._scheds = {};
    if (!this._scheds[z.entity]) this._scheds[z.entity] = { periods: null, edit: null };
    return this._scheds[z.entity];
  }

  _schedModel(z, manual, rangeLow, rangeHigh) {
    const h = this._hass;
    const entity = h.states[z.schedule];
    const s = this._schedState(z);
    const periods = entity && s.periods && s.periods.length ? s.periods : null;
    const following = !!entity && (!h.states[z.follow] || h.states[z.follow].state === 'on');
    const at = periods ? periodAt(periods, this._now().min) : {};
    // The period changes the helpers only at its start, so a difference is a hand-set hold.
    const unlinked = ['unlinked', 'none', 'outdated'].includes(s.link);
    const held = following && !unlinked && !!at.cur && !at.cur.off && at.cur.low != null && !manual && rangeLow != null && rangeHigh != null && !(near(rangeLow, at.cur.low) && near(rangeHigh, at.cur.high));
    return {
      entity, s, periods, following, held, ...at,
      editable: !!entity && entity.attributes.editable !== false && (!h.user || h.user.is_admin),
    };
  }

  // Wall-clock time where Home Assistant is, which may not be where this browser is.
  _now() {
    const zone = this._hass.config.time_zone;
    if (this._nowZone !== zone || !this._nowFormat) {
      this._nowZone = zone;
      this._nowFormat = new Intl.DateTimeFormat('en-GB', { timeZone: zone, weekday: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
    }
    const parts = this._nowFormat.formatToParts(new Date());
    const get = (type) => parts.find((p) => p.type === type).value;
    return { day: get('weekday').toLowerCase(), min: +get('hour') * 60 + +get('minute') };
  }

  _clock(min, opts = { minute: '2-digit' }) {
    const l = this._hass.locale || {};
    const h12 = l.time_format === '12' ? { hour12: true } : l.time_format === '24' ? { hour12: false } : {};
    return new Date(2000, 0, 1, Math.floor(min / 60), min % 60).toLocaleTimeString(l.language, { hour: 'numeric', ...opts, ...h12 });
  }

  // Re-reads the schedule when its entity changes. The entity only carries the
  // current block, so the whole day has to come from the action.
  async _loadSchedule(z) {
    const h = this._hass;
    const entity = h.states[z.schedule];
    const s = this._schedState(z);
    if (!entity) { s.periods = null; s.key = null; s.link = null; s.linkChecked = false; return; }
    if (!s.linkChecked && h.callApi && (!h.user || h.user.is_admin)) { s.linkChecked = true; this._checkLink(z); }
    if (s.key === entity.last_updated || s.saving || this._drag || !h.callWS) return;
    s.key = entity.last_updated;
    try {
      const r = await h.callWS({ type: 'call_service', domain: 'schedule', service: 'get_schedule', target: { entity_id: z.schedule }, return_response: true });
      if (s.saving) return;
      const week = r.response[z.schedule];
      const blocks = week[this._now().day] || [];
      s.periods = blocksToPeriods(blocks);
      s.varies = DAYS.some((d) => JSON.stringify(week[d] || []) !== JSON.stringify(blocks));
      s.error = null;
    } catch (e) {
      s.error = `Couldn't read the schedule: ${(e && e.message) || e}`;
    }
    this._schedRender();
  }

  // The thermostat's Temperate automation, if it has one.
  async _findAutomation(z) {
    const h = this._hass;
    const related = await h.callWS({ type: 'search/related', item_type: 'entity', item_id: z.entity });
    for (const id of related.automation || []) {
      const key = h.states[id] && h.states[id].attributes.id;
      if (!key) continue;
      // A YAML automation has no config to read, and can't be a linked one anyway.
      let config;
      try { config = await h.callApi('GET', `config/automation/config/${key}`); } catch (e) { continue; }
      const bp = config.use_blueprint;
      if (bp && bp.path.endsWith('temperate_changeover.yaml') && bp.input.thermostat === z.entity) return { key, config };
    }
    return null;
  }

  async _checkLink(z) {
    const s = this._schedState(z);
    try {
      const found = await this._findAutomation(z);
      if (!found) s.link = 'none';
      else {
        const { path, input } = found.config.use_blueprint;
        const blueprints = await this._hass.callWS({ type: 'blueprint/list', domain: 'automation' });
        const inputs = blueprints[path] && blueprints[path].metadata && blueprints[path].metadata.input;
        if (inputs && !('schedule' in inputs)) s.link = 'outdated';
        else s.link = input.schedule === z.schedule ? 'linked' : 'unlinked';
      }
    } catch (e) {
      s.link = null;
    }
    this._schedRender();
  }

  // A follow helper created a moment ago may not be in the states yet.
  async _linkAutomation(z, withFollow = !!this._hass.states[z.follow]) {
    const h = this._hass;
    const s = this._schedState(z);
    try {
      const found = await this._findAutomation(z);
      if (!found) { s.link = 'none'; this._render(); return; }
      const bp = found.config.use_blueprint;
      bp.input = { ...bp.input, schedule: z.schedule, ...(withFollow ? { follow_schedule: z.follow } : {}) };
      await h.callApi('POST', `config/automation/config/${found.key}`, found.config);
      s.link = 'linked';
      s.error = null;
    } catch (e) {
      s.error = `Couldn't link the automation: ${(e && (e.body && e.body.message || e.message)) || e}`;
    }
    this._render();
  }

  // Applies an edit straight away and saves it once the changes stop.
  _schedEdit(z, k, mutate, fromField = false) {
    const s = this._schedState(z);
    const periods = s.periods.map((p) => ({ ...p }));
    const target = periods[k];
    mutate(target, periods);
    if (fromField) {
      // Left unsorted until the field loses focus, so its index stays right.
      s.periods = periods;
      this._queueSave(z);
      this._dirty = true;
      this._flush();
      return;
    }
    periods.sort(byStart);
    if (s.edit === k) s.edit = periods.indexOf(target);
    s.periods = periods;
    this._queueSave(z);
    this._render();
  }

  _queueSave(z) {
    const s = this._schedState(z);
    s.saving = true;
    clearTimeout(s.timer);
    s.timer = setTimeout(() => this._saveSchedule(z), 700);
  }

  async _saveSchedule(z) {
    const h = this._hass;
    const s = this._schedState(z);
    s.timer = null;
    try {
      if (!s.item) {
        const [reg, list] = await Promise.all([
          h.callWS({ type: 'config/entity_registry/get', entity_id: z.schedule }),
          h.callWS({ type: 'schedule/list' }),
        ]);
        s.item = list.find((i) => i.id === reg.unique_id);
      }
      const blocks = periodsToBlocks([...s.periods].sort(byStart));
      await h.callWS({ type: 'schedule/update', schedule_id: s.item.id, name: s.item.name, ...(s.item.icon ? { icon: s.item.icon } : {}), ...Object.fromEntries(DAYS.map((d) => [d, blocks])) });
      s.error = null;
      s.varies = false;
    } catch (e) {
      s.error = `Couldn't save the schedule: ${(e && e.message) || e}`;
    }
    s.saving = !!s.timer;
    this._schedRender();
  }

  async _createSchedule(z, m) {
    const h = this._hass;
    const s = this._schedState(z);
    if (s.creating) return;
    s.creating = true;
    s.error = null;
    this._render();
    const isF = m.unit.includes('F');
    const q = (v) => +(Math.round(v / m.step) * m.step).toFixed(2);
    const low = q(m.low ?? (isF ? 68 : 20)), high = q(m.high ?? (isF ? 75 : 24));
    const min = m.a.min_temp ?? -100, max = m.a.max_temp ?? 200;
    const periods = [
      { start: 390, name: 'Day', off: false, low, high },
      { start: 1320, name: 'Night', off: false, low: Math.max(min, low - (isF ? 4 : 2)), high: Math.min(max, high + (isF ? 3 : 2)) },
    ];
    const label = (id) => { const w = id.split('.')[1].replace(/_/g, ' '); return w[0].toUpperCase() + w.slice(1); };
    // Home Assistant adds a suffix when the name is already taken, and the card finds helpers by id.
    const claim = async (platform, id, wanted) => {
      const entries = await h.callWS({ type: 'config/entity_registry/list' });
      const entry = entries.find((e) => e.platform === platform && e.unique_id === id);
      if (entry && entry.entity_id !== wanted) await h.callWS({ type: 'config/entity_registry/update', entity_id: entry.entity_id, new_entity_id: wanted });
    };
    const made = [];
    try {
      const blocks = periodsToBlocks(periods);
      const item = await h.callWS({ type: 'schedule/create', name: label(z.schedule), icon: 'mdi:calendar-clock', ...Object.fromEntries(DAYS.map((d) => [d, blocks])) });
      made.push({ type: 'schedule/delete', schedule_id: item.id });
      await claim('schedule', item.id, z.schedule);
      if (!h.states[z.follow]) {
        const follow = await h.callWS({ type: 'input_boolean/create', name: label(z.follow), icon: 'mdi:calendar-check' });
        made.push({ type: 'input_boolean/delete', input_boolean_id: follow.id });
        await claim('input_boolean', follow.id, z.follow);
        await h.callService('input_boolean', 'turn_on', { entity_id: z.follow });
      }
      s.linkChecked = true;
      await this._checkLink(z);
      if (s.link === 'unlinked') await this._linkAutomation(z, true);
    } catch (e) {
      // Take back what was made, so that Create schedule can be tried again.
      for (const m2 of made) await h.callWS(m2).catch(() => {});
      s.error = `Couldn't create the schedule: ${(e && e.message) || e}`;
    }
    s.creating = false;
    this._render();
  }

  _rangeText(p, m) {
    if (p.off) return 'Off';
    return p.low == null ? 'No range' : `${this._fmt(p.low, m)}–${this._fmt(p.high, m)}°`;
  }

  _fmt(v, m) {
    if (v == null || isNaN(v)) return '–';
    return m.step >= 1 ? String(Math.round(v)) : (Math.round(v / m.step) * m.step).toFixed(2).replace(/\.?0+$/, '');
  }

  _render() {
    if (!this._card || !this._hass) return;
    this._zones.forEach((z) => this._loadSchedule(z));
    const title = this._config.title ? `<div class="title">${esc(this._config.title)}</div>` : '';
    this._card.classList.toggle('light', !!(this._hass.themes && this._hass.themes.darkMode === false));
    // Redrawing replaces every element, so put keyboard focus back on the matching one.
    const a = this._root.activeElement;
    const focus = a && a.dataset && Object.keys(a.dataset).length
      ? Object.entries(a.dataset).map(([k, v]) => `[data-${k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}="${String(v).replace(/["\\]/g, '\\$&')}"]`).join('') : null;
    this._card.innerHTML = title + this._zones.map((z, i) => {
      const m = this._model(z);
      return m ? this._zoneHtml(m, i) : `<div class="err">Entity not found: ${esc(z.entity)}</div>`;
    }).join('');
    if (focus) { const el = this._card.querySelector(focus); if (el && el.focus) el.focus({ preventScroll: true }); }
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
    else if (m.act === 'off' && !m.manual && m.sched.following && m.sched.cur && m.sched.cur.off) sub = `until ${this._clock(m.sched.next.start)}`;
    else if (m.act === 'off') sub = m.manual ? 'set on the thermostat' : (!m.heatOk && !m.coolOk ? 'heat and cool blocked' : 'off');
    else sub = m.auto ? `${f(m.low)}–${f(m.high)}${deg}` : `holding ${f(holding)}${deg}`;
    const ovDesc = m.mode === 'off' ? 'set to Off' : m.mode === 'heat' ? `Heat to ${f(m.low)}${deg}` : m.mode === 'cool' ? `Cool to ${f(m.high)}${deg}` : `set to ${esc(m.mode.replace('_', ' '))}`;
    const period = m.sched.following && m.sched.cur && !m.sched.cur.off && m.sched.cur.low != null && near(m.sched.cur.low, m.savedLow) && near(m.sched.cur.high, m.savedHigh) ? `${esc(m.sched.cur.name)} ` : '';
    const restore = m.savedLow && m.savedHigh ? ` · restore ${period}${f(m.savedLow)}–${f(m.savedHigh)}${deg}` : '';
    const open = m.ui.open;
    const head = `
      <button class="head" data-act="toggle" data-z="${i}" aria-expanded="${open}" aria-label="${esc(m.name)}: ${label}, ${f(m.cur)} degrees">
        <span class="icon" style="background:${mix(C, 20)};color:${TEXT[m.act]}">${ICON[m.act]}</span>
        <span class="who">
          <span class="name"><span class="nm">${esc(m.name)}</span>${m.manual ? '<span class="tag">Manual</span>' : ''}</span>
          <span class="status" style="color:${TEXT[m.act]}">${label} · ${sub}</span>
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
    const onSchedule = m.ui.tab === 'schedule';
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
        <div class="toprow"><div class="seg" role="group" aria-label="Section">
          <button class="${onSchedule ? '' : 'on'}" data-act="tab" data-tab="control" data-z="${i}">Control</button>
          <button class="${onSchedule ? 'on' : ''}" data-act="tab" data-tab="schedule" data-z="${i}">Schedule</button>
        </div>${onSchedule ? this._followHtml(m, i) : `<div class="seg" role="group" aria-label="Layout">
          <button class="${m.ui.view !== 'dial' ? 'on' : ''}" data-act="view" data-view="bar" data-z="${i}">Bar</button>
          <button class="${m.ui.view === 'dial' ? 'on' : ''}" data-act="view" data-view="dial" data-z="${i}">Dial</button>
        </div>`}</div>
        ${onSchedule ? this._schedHtml(m, i) : `${m.manual ? '' : this._nextHtml(m, i)}${view}${controls}${fan}`}
      </div></div>`;
  }

  // What the schedule is doing now and what it does next.
  _nextHtml(m, i) {
    const { periods, following, held, cur, next } = m.sched;
    if (!periods) return '';
    if (!following) return '<div class="nxt"><span>Schedule paused</span></div>';
    const f = (v) => this._fmt(v, m);
    const until = this._clock(next.start);
    // One period all day never changes, so nothing ends the hold but Resume.
    if (held) return `<div class="nxt held"><span>Held at ${f(m.savedLow)}–${f(m.savedHigh)}°${cur === next ? '' : ` until ${until}`}</span><button data-act="sched-resume" data-z="${i}">Resume</button></div>`;
    if (cur === next) return `<div class="nxt"><span>${esc(cur.name)} all day</span></div>`;
    const then = this._rangeText(next, m);
    return `<div class="nxt"><span>${esc(cur.name)} until ${until}</span><span class="then">then ${esc(next.name)} ${then}</span></div>`;
  }

  _followHtml(m, i) {
    if (!m.sched.entity || !this._hass.states[m.z.follow]) return '';
    // Sits in the tab row, where the Bar/Dial switch is on the Control tab.
    return `<button class="follow" data-act="sched-follow" data-z="${i}" role="switch" aria-checked="${m.sched.following}" title="Off keeps the range you set">
        <span>Follow schedule</span><span class="sw${m.sched.following ? ' on' : ''}"></span>
      </button>`;
  }

  _schedHtml(m, i) {
    const { entity, s, periods, editable, cur } = m.sched;
    const error = s.error ? `<div class="serr">${esc(s.error)}</div>` : '';
    if (!entity) {
      const admin = !this._hass.user || this._hass.user.is_admin;
      return `<div class="sempty"><b>Set a schedule</b><span>Give each part of the day its own range, or turn the thermostat off.</span>
        ${admin ? `<button class="screate" data-act="sched-create" data-z="${i}"${s.creating ? ' disabled' : ''}>${s.creating ? 'Creating…' : 'Create schedule'}</button>` : '<span>Ask an administrator to create one.</span>'}</div>${error}`;
    }
    if (!periods && s.periods) {
      const week = s.varies ? ' Saving applies to the whole week.' : '';
      return `<div class="sempty"><span>Nothing is scheduled for today.${week}</span>${editable ? `<button class="screate" data-act="sched-first" data-z="${i}">Add period</button>` : ''}</div>${error}`;
    }
    if (!periods) return `${error || '<div class="sempty"><span>Loading schedule…</span></div>'}`;
    const f = (v) => this._fmt(v, m);
    const rows = periods.map((p, k) => `
      <button class="srow${p === cur ? ' now' : ''}" data-act="sched-open" data-k="${k}" data-z="${i}"${editable ? '' : ' disabled'} aria-expanded="${s.edit === k}">
        <span class="stime">${this._clock(p.start)}</span><span class="sname">${esc(p.name)}</span><span class="srange">${this._rangeText(p, m)}</span>
      </button>${s.edit === k && editable ? this._periodHtml(m, i, p, k) : ''}`).join('');
    const others = editable ? this._zones.map((z, j) => (j !== i && this._hass.states[z.schedule] ? `<button class="sadd" data-act="sched-copy" data-to="${j}" data-z="${i}">Copy to ${esc(z.name || this._hass.states[z.entity]?.attributes.friendly_name || z.entity)}</button>` : '')).join('') : '';
    return `${this._nextHtml(m, i)}${this._ribbonHtml(m, i)}
      ${this._linkHtml(s, i)}
      ${s.varies ? '<div class="snote">Showing today. Saving applies this day to the whole week.</div>' : ''}${error}
      <div class="slist">${rows}</div>
      ${editable && periods.length < MAX_PERIODS ? `<button class="sadd" data-act="sched-add" data-z="${i}">Add period</button>` : ''}${others}`;
  }

  _linkHtml(s, i) {
    if (s.link === 'unlinked') return `<div class="nxt"><span>The automation isn't following this schedule</span><button data-act="sched-link" data-z="${i}">Link</button></div>`;
    if (s.link === 'none') return '<div class="snote">This thermostat has no Temperate automation, so the schedule won\'t run. Create one from the Temperate changeover blueprint.</div>';
    if (s.link === 'outdated') return '<div class="snote">Re-import the Temperate changeover blueprint to use the schedule.</div>';
    return '';
  }

  _ribbonHtml(m, i) {
    const { periods, editable } = m.sched;
    const W = 300, H = 96;
    const x = (min) => min / 1440 * W;
    const y = (t) => Math.max(0, Math.min(H, (m.dmax - t) / (m.dmax - m.dmin) * H));
    const segs = periods.map((p, k) => ({ p, a: p.start, b: k + 1 < periods.length ? periods[k + 1].start : 1440 }));
    if (periods[0].start > 0) segs.unshift({ p: periods[periods.length - 1], a: 0, b: periods[0].start });
    const rect = (x0, w, top, h, fill, op) => `<rect x="${x0.toFixed(1)}" y="${top.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" style="fill:${fill};fill-opacity:${op}"/>`;
    const bands = segs.map(({ p, a, b }) => {
      const x0 = x(a) + 0.5, w = Math.max(0, x(b) - x(a) - 1);
      if (p.off) return rect(x0, w, 0, H, `url(#temperate-off-${i})`, 1) + (w > 34 ? `<text x="${(x0 + w / 2).toFixed(1)}" y="${H / 2 + 4}" text-anchor="middle" style="font-size:12px;fill:var(--primary-text-color)">Off</text>` : '');
      if (p.low == null) return rect(x0, w, 0, H, 'var(--temperate-off)', 0.3);
      const lo = y(p.low), hi = y(p.high);
      // Same colors as the bar, including gray for a blocked mode.
      return rect(x0, w, 0, hi, m.coolOk ? 'var(--temperate-cool)' : 'var(--temperate-surface-2)', 1)
        + rect(x0, w, hi, lo - hi, 'var(--temperate-ok)', 1)
        + rect(x0, w, lo, H - lo, m.heatOk ? 'var(--temperate-heat)' : 'var(--temperate-surface-2)', 1);
    }).join('');
    const handles = editable ? periods.map((p, k) => `
      <g class="handle" data-shandle="${k}" data-z="${i}">
        <circle cx="${x(p.start).toFixed(1)}" cy="${H / 2}" r="20" style="fill:#000;fill-opacity:0.001"/>
        <circle cx="${x(p.start).toFixed(1)}" cy="${H / 2}" r="5.5" style="fill:var(--ha-card-background, var(--card-background-color, #1c1c1e));stroke:var(--primary-text-color);stroke-width:1.5"/>
      </g>`).join('') : '';
    const now = x(this._now().min);
    const labels = [0, 360, 720, 1080, 1440].map((t) => `<span style="left:${t / 14.4}%">${this._clock(t % 1440, {})}</span>`).join('');
    return `<div class="ribbon" data-ribbon="${i}">
        <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Comfort range across the day">
          <defs><pattern id="temperate-off-${i}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" style="fill:var(--temperate-off);fill-opacity:0.22"/><rect width="2" height="6" style="fill:var(--temperate-off);fill-opacity:0.45"/></pattern></defs>${bands}
          <rect x="${(now - 1.5).toFixed(1)}" y="0" width="3" height="${H}" rx="1.5" style="fill:var(--temperate-marker);pointer-events:none"/>${handles}</svg>
        <div class="saxis">${labels}</div>
      </div>`;
  }

  _periodHtml(m, i, p, k) {
    const f = (v) => this._fmt(v, m);
    const step = (which, col, lbl, val) => `
      <div>
        <button class="round" style="color:${col}" data-act="sched-step" data-which="${which}" data-d="-1" data-k="${k}" data-z="${i}" aria-label="Lower ${lbl.toLowerCase()}">−</button>
        <span class="mid"><span>${lbl}</span><b style="color:${col}">${f(val)}°</b></span>
        <button class="round" style="color:${col}" data-act="sched-step" data-which="${which}" data-d="1" data-k="${k}" data-z="${i}" aria-label="Raise ${lbl.toLowerCase()}">+</button>
      </div>`;
    return `<div class="sedit">
        <div class="sfields">
          <label>Starts<input type="time" step="900" value="${hhmm(p.start)}" data-sfield="start" data-k="${k}" data-z="${i}"></label>
          <label>Name<input type="text" maxlength="20" value="${esc(p.name)}" data-sfield="name" data-k="${k}" data-z="${i}"></label>
        </div>
        ${p.off ? '' : `<div class="steps">${step('low', 'var(--temperate-heat-text)', 'Heat below', p.low)}${step('high', 'var(--temperate-cool-text)', 'Cool above', p.high)}</div>`}
        <button class="switchrow" data-act="sched-off" data-k="${k}" data-z="${i}" role="switch" aria-checked="${p.off}">
          <span>Turn the thermostat off<small>No heating or cooling in this period</small></span><span class="sw${p.off ? ' on' : ''}"></span>
        </button>
        ${m.sched.periods.length > 1 ? `<button class="sremove" data-act="sched-remove" data-k="${k}" data-z="${i}">Remove period</button>` : ''}
      </div>`;
  }

  _barHtml(m, i, heatLit, coolLit) {
    const span = m.dmax - m.dmin;
    const pct = (t) => Math.max(0, Math.min(100, (t - m.dmin) / span * 100));
    return `
      <div class="bar" aria-hidden="true">
        <div style="left:0;right:0;border-radius:4px;background:var(--temperate-surface-2)"></div>
        <div style="left:0;width:${pct(m.low)}%;border-radius:4px 0 0 4px;background:${heatLit ? 'var(--temperate-heat)' : 'transparent'}"></div>
        <div style="left:${pct(m.low)}%;width:${pct(m.high) - pct(m.low)}%;background:var(--temperate-ok)"></div>
        <div style="left:${pct(m.high)}%;right:0;border-radius:0 4px 4px 0;background:${coolLit ? 'var(--temperate-cool)' : 'transparent'}"></div>
        ${m.act === 'waiting' ? '' : `<div class="marker" style="left:${pct(m.cur)}%"></div>`}
      </div>
      ${this._stepsHtml(m, i, heatLit, coolLit)}`;
  }

  // The heat and cool steppers, shared by the bar and dial layouts.
  _stepsHtml(m, i, heatLit, coolLit) {
    const f = (v) => this._fmt(v, m);
    // A blocked mode shows grey, the same as the bar. The range can still be changed.
    const steps = (which, on, lbl, val, lit) => { const col = lit ? on : 'var(--temperate-muted)'; return `
      <div>
        <button class="round" style="color:${col}" data-act="step" data-which="${which}" data-d="-1" data-z="${i}" aria-label="Lower ${lbl.toLowerCase()}">−</button>
        <span class="mid"><span>${lbl}</span><b style="color:${col}">${f(val)}°</b></span>
        <button class="round" style="color:${col}" data-act="step" data-which="${which}" data-d="1" data-z="${i}" aria-label="Raise ${lbl.toLowerCase()}">+</button>
      </div>`; };
    return `
      <div class="steps">
        ${steps('low', 'var(--temperate-heat-text)', m.auto ? 'Heat below' : 'Heat to', m.low, heatLit)}
        ${steps('high', 'var(--temperate-cool-text)', m.auto ? 'Cool above' : 'Cool to', m.high, coolLit)}
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
      <g class="handle" data-handle="${which}" data-z="${i}">
        <circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="24" style="fill:#000;fill-opacity:0.001"/>
        <circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="13" style="fill:${bg};stroke:${lit ? col : 'var(--temperate-muted)'};stroke-width:4"/>
      </g>`;
    const ovDesc = m.mode === 'heat' ? `Heat to ${f(m.low)}°` : m.mode === 'cool' ? `Cool to ${f(m.high)}°` : m.mode === 'off' ? 'Off' : esc(m.mode.replace('_', ' '));
    return `
      <div class="dialwrap">
        <div class="dial" data-dial="${i}">
          <svg viewBox="0 0 ${DIAL.w} ${DIAL.h}" role="img" aria-label="Comfort range dial. Drag the orange or blue handle to change it.">
            <path d="${arc(m.dmin, m.dmax)}" style="fill:none;stroke:var(--temperate-surface-2);stroke-width:16;stroke-linecap:round"/>
            <path d="${arc(m.dmin, m.low)}" style="fill:none;stroke:${heatLit ? 'var(--temperate-heat)' : 'transparent'};stroke-width:16;stroke-linecap:round"/>
            <path d="${arc(m.high, m.dmax)}" style="fill:none;stroke:${coolLit ? 'var(--temperate-cool)' : 'transparent'};stroke-width:16;stroke-linecap:round"/>
            <path d="${arc(m.low, m.high)}" style="fill:none;stroke:var(--temperate-ok);stroke-width:16"/>
            ${handle('low', lp, 'var(--temperate-heat)', heatLit)}
            ${handle('high', hp, 'var(--temperate-cool)', coolLit)}
            ${m.act === 'waiting' ? '' : line(11, bg) + line(6, 'var(--temperate-marker)')}
          </svg>
          <div class="center">
            <div style="font-size:13px;color:${TEXT[m.act]}">${label}</div>
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
      case 'tab': this._setUi(z.entity, { tab: el.dataset.tab }); break;
      case 'sched-create': this._createSchedule(z, m); break;
      case 'sched-link': this._linkAutomation(z); break;
      case 'sched-follow': h.callService('input_boolean', 'toggle', { entity_id: z.follow }); break;
      case 'sched-resume':
        h.callService('input_number', 'set_value', { entity_id: z.heat_below, value: m.sched.cur.low });
        h.callService('input_number', 'set_value', { entity_id: z.cool_above, value: m.sched.cur.high });
        break;
      case 'sched-open': {
        const s = this._schedState(z), k = +el.dataset.k;
        s.edit = s.edit === k ? null : k;
        this._render();
        break;
      }
      case 'sched-step': {
        const d = +el.dataset.d * m.step, min = m.a.min_temp ?? -100, max = m.a.max_temp ?? 200;
        const q = (v) => +(Math.round(v / m.step) * m.step).toFixed(2);
        this._schedEdit(z, +el.dataset.k, (p) => {
          if (p.low == null) { p.low = q(m.low); p.high = q(m.high); }
          if (el.dataset.which === 'low') p.low = q(Math.min(p.high - m.gap, Math.max(min, p.low + d)));
          else p.high = q(Math.max(p.low + m.gap, Math.min(max, p.high + d)));
        });
        break;
      }
      case 'sched-off':
        this._schedEdit(z, +el.dataset.k, (p) => {
          p.off = !p.off;
          if (p.low == null) { p.low = m.low; p.high = m.high; }
        });
        break;
      case 'sched-remove': {
        const k = +el.dataset.k, s = this._schedState(z);
        s.edit = null;
        this._schedEdit(z, k, (p, all) => all.splice(k, 1));
        break;
      }
      case 'sched-add': this._addPeriod(z, m); break;
      case 'sched-first': {
        const s = this._schedState(z);
        s.periods = [{ start: 390, name: 'Day', off: false, low: m.low ?? null, high: m.high ?? null }];
        s.edit = 0;
        this._queueSave(z);
        this._render();
        break;
      }
      case 'sched-copy': {
        const to = this._zones[+el.dataset.to], s = this._schedState(to);
        s.periods = m.sched.periods.map((p) => ({ ...p }));
        this._queueSave(to);
        this._render();
        break;
      }
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

  // Splits the longest period in two, so a new one always has room.
  _addPeriod(z, m) {
    const { periods } = m.sched;
    const spans = periods.map((p, k) => ((k + 1 < periods.length ? periods[k + 1].start : 1440 + periods[0].start) - p.start));
    const k = spans.indexOf(Math.max(...spans));
    const start = Math.round((periods[k].start + spans[k] / 2) / SNAP) * SNAP % 1440;
    if (periods.some((p) => p.start === start)) return;
    const s = this._schedState(z);
    const source = periods[k];
    const added = { ...source, start, name: `Period ${periods.length + 1}` };
    s.periods = [...periods.map((p) => ({ ...p })), added].sort((a, b) => a.start - b.start);
    s.edit = s.periods.indexOf(added);
    this._queueSave(z);
    this._render();
  }

  _onChange(e) {
    const field = e.target.dataset.sfield;
    if (!field) return;
    const z = this._zones[+e.target.dataset.z], k = +e.target.dataset.k;
    const s = this._schedState(z);
    if (field === 'name') {
      const name = e.target.value.trim();
      if (name) this._schedEdit(z, k, (p) => { p.name = name; }, true);
      else { this._dirty = true; this._flush(); }
    } else {
      const start = e.target.value ? toMin(e.target.value) : -1;
      if (start < 0 || s.periods.some((p, j) => j !== k && p.start === start)) { this._dirty = true; this._flush(); }
      else this._schedEdit(z, k, (p) => { p.start = start; }, true);
    }
  }

  _onDown(e) {
    this._pressed = true;
    window.addEventListener('pointerup', () => { this._pressed = false; this._flush(); }, { once: true, capture: true });
    const sh = e.target.closest('[data-shandle]');
    if (sh) {
      e.preventDefault();
      this._drag = { z: +sh.dataset.z, period: +sh.dataset.shandle };
      this.setPointerCapture(e.pointerId);
      return;
    }
    const g = e.target.closest('[data-handle]');
    if (!g) return;
    e.preventDefault();
    this._drag = { z: +g.dataset.z, which: g.dataset.handle };
    this._which = g.dataset.handle;
    this.setPointerCapture(e.pointerId);
  }

  _onMove(e) {
    if (!this._drag) return;
    if (this._drag.period != null) { this._movePeriod(e); return; }
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

  _movePeriod(e) {
    const { z: i, period: k } = this._drag;
    const ribbon = this._root.querySelector(`[data-ribbon="${i}"] svg`);
    if (!ribbon) return;
    const s = this._schedState(this._zones[i]);
    const b = ribbon.getBoundingClientRect();
    const lo = k > 0 ? s.periods[k - 1].start + SNAP : 0;
    const hi = k + 1 < s.periods.length ? s.periods[k + 1].start - SNAP : 1440 - SNAP;
    if (hi < lo) return;
    const start = Math.max(lo, Math.min(hi, Math.round((e.clientX - b.left) / b.width * 1440 / SNAP) * SNAP));
    if (start === s.periods[k].start) return;
    s.periods = s.periods.map((p, j) => (j === k ? { ...p, start } : p));
    this._drag.moved = true;
    this._render();
  }

  _onUp() {
    if (!this._drag) return;
    const z = this._zones[this._drag.z];
    if (this._drag.period != null) {
      if (this._drag.moved) this._queueSave(z);
      this._drag = null;
      return;
    }
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
  commanded_mode: 'Commanded mode',
  schedule: 'Schedule',
  follow_schedule: 'Follow schedule',
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
  const auto = zone.entity ? { ...helperIds({ entity: zone.entity }), ...scheduleIds({ entity: zone.entity }) } : {};
  const optional = { schedule: 'schedule', follow_schedule: 'input_boolean' };
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
      schema: [...Object.entries(HELPERS).map(([key, [domain]]) => [key, domain]), ...Object.entries(optional)].map(([key, domain]) => ({
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
        .status.error { color: var(--error-color); }
        .status .create { display: block; margin-top: 8px; height: 36px; padding: 0 14px; border-radius: 8px; border: 0; font: inherit; font-weight: 500; cursor: pointer; background: var(--primary-color); color: var(--text-primary-color, #fff); }
        .status .create:disabled { opacity: .6; cursor: default; }
        .status .next { color: var(--secondary-text-color); }
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
    // The status lines are redrawn on every state change, so listen once on the root.
    if (!this._delegated) {
      this._delegated = true;
      this.shadowRoot.addEventListener('click', (e) => {
        const b = e.target.closest('[data-create]');
        if (b) this._createHelpers(+b.dataset.create);
      });
    }
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
    // Tell the user whether each zone's helpers exist, and offer to create the missing ones.
    this.shadowRoot.querySelectorAll('[data-status]').forEach((el) => {
      const i = +el.dataset.status;
      const zone = entities[i] || {};
      let cls = 'status', html = '';
      if (zone.entity && this._hass && zone.entity.startsWith('climate.')) {
        const job = (this._jobs || {})[i];
        const missing = Object.values(helperIds(zone)).filter((id) => !this._hass.states[id]);
        if (missing.length) {
          const busy = job && job.busy, error = job && job.error;
          cls = `status ${error ? 'error' : 'missing'}`;
          const admin = !this._hass.user || this._hass.user.is_admin;
          html = (error ? `Couldn't create the helpers: ${esc(error)}. ` : '')
            + (missing.length === 6
              ? 'This thermostat has no helpers yet.'
              : `Missing helpers: ${missing.map((id) => `<code>${esc(id)}</code>`).join(', ')}.`)
            + (admin
              ? `<button class="create" data-create="${i}"${busy ? ' disabled' : ''}>${busy ? 'Creating…' : error ? 'Try again' : `Create ${missing.length === 1 ? 'it' : `all ${missing.length}`}`}</button>`
              : ' Ask an administrator to create them, or pick others under Helpers.');
        } else {
          cls = 'status ok';
          html = 'All six helpers found.'
            + (job && job.done ? ' <span class="next">Next: create an automation from the Temperate changeover blueprint for this thermostat.</span>' : '');
        }
      }
      if (el.className !== cls) el.className = cls;
      if (el.innerHTML !== html) el.innerHTML = html;
    });
  }

  // Creates the zone's missing helpers as UI helpers, then seeds them from the thermostat:
  // the range from its current setpoints, and Heat/Cool allowed for the modes it supports.
  async _createHelpers(i) {
    const hass = this._hass;
    const zone = this._config.entities[i];
    if (!hass || !zone || !zone.entity || (this._jobs && this._jobs[i] && this._jobs[i].busy)) return;
    this._jobs = { ...this._jobs, [i]: { busy: true } };
    this._refresh();
    const st = hass.states[zone.entity];
    const a = (st && st.attributes) || {};
    const unit = (hass.config.unit_system && hass.config.unit_system.temperature) || '°F';
    const isF = unit.includes('F');
    const min = a.min_temp ?? (isF ? 45 : 7), max = a.max_temp ?? (isF ? 90 : 32);
    const step = a.target_temp_step || (isF ? 1 : 0.5);
    const clamp = (v) => Math.min(max, Math.max(min, Math.round(v / step) * step));
    const modes = a.hvac_modes || [];
    const seed = {
      heat_allowed: modes.includes('heat'),
      cool_allowed: modes.includes('cool'),
      heat_below: clamp(a.target_temp_low ?? (isF ? 68 : 20)),
      cool_above: clamp(a.target_temp_high ?? (isF ? 75 : 24)),
    };
    const renamed = {};
    try {
      const created = [];
      let failed;
      for (const [key, id] of Object.entries(helperIds(zone))) {
        if (hass.states[id]) continue;
        const [domain, objectId] = id.split('.');
        // HA builds the entity id from the name, so name it after the id we want.
        const words = objectId.replace(/_/g, ' ');
        const msg = { type: `${domain}/create`, name: words[0].toUpperCase() + words.slice(1), icon: HELPER_ICONS[key] };
        if (domain === 'input_number') Object.assign(msg, { min, max, step, mode: 'box', unit_of_measurement: unit });
        // Keep what was made so far: a retry skips existing helpers, so they must be seeded now.
        try {
          const item = await hass.callWS(msg);
          created.push({ key, id, domain, uid: item.id });
        } catch (e) { failed = e; break; }
      }
      // The entity id can still differ from the one asked for (an old registry entry
      // may hold it), so look up what HA actually registered.
      const registry = await hass.callWS({ type: 'config/entity_registry/list' });
      for (const c of created) {
        const entry = registry.find((r) => r.platform === c.domain && r.unique_id === c.uid);
        const made = entry ? entry.entity_id : c.id;
        if (made !== c.id) renamed[c.key] = made;
        if (c.domain === 'input_number') await hass.callService('input_number', 'set_value', { entity_id: made, value: seed[c.key] });
        else if (seed[c.key]) await hass.callService('input_boolean', 'turn_on', { entity_id: made });
      }
      if (failed) throw failed;
      this._jobs = { ...this._jobs, [i]: { done: true } };
    } catch (e) {
      this._jobs = { ...this._jobs, [i]: { error: (e && e.message) || String(e) } };
    }
    // If HA picked a different id (one was taken), point the zone at what it made.
    if (Object.keys(renamed).length) {
      const entities = this._config.entities.slice();
      entities[i] = { ...entities[i], ...renamed };
      this._update({ ...this._config, entities });
    } else this._refresh();
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
