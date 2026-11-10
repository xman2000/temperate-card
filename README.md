# Temperate Standalone (Ecobee-compatible)

An independent **Home Assistant Lovelace card** for native `climate` entities. Derived from [xman2000/temperate-card](https://github.com/xman2000/temperate-card), with the original MIT license retained.

This edition preserves the circular thermostat styling and optional bar layout, but deliberately removes the Temperate changeover blueprint, helper entities, separate scheduling system, and automation-management features.

## What works

- Shows live temperature and HVAC activity for multiple thermostats.
- **Heat**: orange handle and +/- buttons send `climate.set_temperature` with `temperature`.
- **Cool**: blue handle and +/- buttons send `climate.set_temperature` with `temperature`.
- **Auto (`heat_cool`)**: both handles and +/- buttons send `target_temp_low` and `target_temp_high` together in one call.
- HVAC mode buttons are generated from the entity's reported `hvac_modes`. A heat-only thermostat will not show Cool.
- Fan button cycles through the entity's reported `fan_modes`.
- Handles can be dragged or adjusted with arrow keys. Setpoints are quantized to the reported `target_temp_step` and constrained by `min_temp`, `max_temp`, and `min_gap`.
- Unknown or unavailable readings disable setpoint controls; failed service calls are reported.

**Not included:** native Ecobee schedule editing, management of Ecobee holds, external temperature-automation logic, custom helper entities, heat-allowed / cool-allowed independent permission toggles, or automated changeover. Auto uses the thermostat's native `heat_cool` mode if that mode is supported.

## Install using HACS

1. Fork this repository and commit the new standalone files to your fork's **main** branch.
2. In Home Assistant, open **HACS > ⋮ > Custom repositories**, enter your fork URL and select **Dashboard**.
3. Download the card, then reload the browser. If prompted, confirm the JavaScript resource is registered as a module.
4. Add a manual Lovelace card (replace the example climate entity IDs):

```yaml
type: custom:temperate-card
title: Climate
layout: dial
collapsed: false
entities:
  - entity: climate.living_room
    name: Living Room
  - entity: climate.garage
    name: Garage
```

No automation blueprint, scheduler, input number, input boolean, or other helper is needed.

## Modes and temperatures

This card **does not** implement automatic HVAC switching. Select **Auto** only when the thermostat advertises `heat_cool`. For single-setpoint modes, the non-active target is intentionally not editable; the card never invents a second setpoint.

Mode changes, fan commands, and dial edits issue real calls to Home Assistant. **Begin by using the display only** and then test manual mode/setpoint operations with your equipment. HA frontend state updates and cloud delays can cause temporarily stale readings. The underlying thermostat handles equipment protection.

Setpoint changes in Ecobee may create or modify a hold depending on integration configuration. Use Ecobee's own app/integration to manage scheduling and resume programs.

## Configuration

| Key | Type | Notes |
| --- | --- | --- |
| `entities` | list | Required list of `climate.*` entities, optionally with a `name` and `temperature_sensor` |
| `title` | string | Card title |
| `layout` | `dial` or `bar` | Defaults to `dial` |
| `collapsed` | boolean | Start collapsed, per-browser UI state can override |
| `min_gap` | number | Min delta between heat/cool setpoints; default 2°F / 1°C |
| `dial_min`, `dial_max` | number | Optional display bounds, clamped to thermostat limits |

## Verify before installing

```sh
node --check temperate-card.js
node tests/test_card.cjs
```

The included tests simulate Home Assistant API calls, and **do not** establish compatibility with every climate integration or real HVAC equipment.

## Important upgrade note

This fork keeps the custom element name `temperate-card`, but the older Temperate blueprint and all six helper configurations are unused. Remove any previously installed Temperate automation separately in Home Assistant; removing the blueprint file from the repository does not remove an already installed automation.

## License

MIT. Original copyright and attribution remain in `LICENSE`.
