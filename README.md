# Temperate

One comfort range per thermostat. Home Assistant heats when the room drops below it, cools when it rises above it, and leaves you alone when you change something on the wall.

Temperate is two pieces that work together:

- **Temperate card**: a dashboard card with a bar or dial layout, draggable heat and cool handles, and a row that collapses to the current temperature and what the system is doing.
- **Temperate changeover blueprint**: the automation that picks Heat or Cool from the range and keeps the thermostat's setpoints in step with it.

## How it works

- **One range.** You set "heat below" and "cool above". Below the range the thermostat heats, above it cools, inside it nothing changes.
- **Heat and Cool are permissions.** The Heat and Cool buttons don't switch the mode; they allow or block it. Block cooling in winter and Temperate will never pick it.
- **Changes on the thermostat stick.** If someone changes the mode or a setpoint on the thermostat itself, the automation turns on a manual override and stops touching that thermostat. The card shows a *Manual* banner with **Back to auto**, which restores your range and hands control back.
- **Slow thermostats are fine.** A difference has to last for the settle time (20 seconds by default) before it counts as a change on the wall, so slow confirmations from Zigbee devices don't trip the override.

## Requirements

- Home Assistant 2024.10 or newer.
- A `climate` entity with `heat` and `cool` modes that accepts a heat/cool range (`target_temp_low` / `target_temp_high`).

## Install

### Card

Add this repository to HACS (or the Home Assistant Marketplace) as a custom **Dashboard** repository, then download **Temperate**.

Manual install: copy `temperate-card.js` to `config/www/temperate-card/` and add it as a dashboard resource:

```yaml
url: /local/temperate-card/temperate-card.js
type: module
```

### Blueprint

[![Import blueprint](https://my.home-assistant.io/badges/blueprint_import.svg)](https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=https%3A%2F%2Fgithub.com%2Fxman2000%2Ftemperate-card%2Fblob%2Fmain%2Fblueprints%2Ftemperate_changeover.yaml)

Or import `https://github.com/xman2000/temperate-card/blob/main/blueprints/temperate_changeover.yaml` from **Settings → Automations & scenes → Blueprints → Import blueprint**.

### Helpers

Each thermostat needs six helpers. The card finds them by name: take the thermostat's entity id, drop `climate.` and a trailing `_thermostat`, and use that as the prefix. For `climate.downstairs_thermostat` the prefix is `downstairs`:

| Helper | Type | Purpose |
|---|---|---|
| `input_boolean.downstairs_heat_allowed` | Toggle | Heat may run |
| `input_boolean.downstairs_cool_allowed` | Toggle | Cool may run |
| `input_boolean.downstairs_manual_override` | Toggle | On while a change made on the thermostat is being held |
| `input_number.downstairs_heat_below` | Number | Bottom of the range |
| `input_number.downstairs_cool_above` | Number | Top of the range |
| `input_text.downstairs_commanded_mode` | Text | Used by the automation to remember the mode it set |

You can create them in **Settings → Devices & services → Helpers**, or with a package:

```yaml
# config/packages/temperate_downstairs.yaml
input_boolean:
  downstairs_heat_allowed:
    name: Downstairs heat allowed
  downstairs_cool_allowed:
    name: Downstairs cool allowed
  downstairs_manual_override:
    name: Downstairs manual override
input_number:
  downstairs_heat_below:
    name: Downstairs heat below
    min: 45
    max: 86
    step: 1
    unit_of_measurement: °F
  downstairs_cool_above:
    name: Downstairs cool above
    min: 45
    max: 86
    step: 1
    unit_of_measurement: °F
input_text:
  downstairs_commanded_mode:
    name: Downstairs commanded mode
```

Use a range such as 7–30 with step 0.5 if your system is in °C. Helpers with other names work too; pick them in the card editor under **Helpers**.

Then create one automation per thermostat from the **Temperate changeover** blueprint and point it at the thermostat and its helpers.

## Card configuration

The card has a visual editor. In YAML:

```yaml
type: custom:temperate-card
title: Climate
layout: dial        # bar (default) or dial
collapsed: false    # start collapsed to a single row
entities:
  - entity: climate.downstairs_thermostat
    name: Downstairs
  - entity: climate.upstairs_thermostat
    name: Upstairs
    temperature_sensor: sensor.bedroom_temperature
```

| Option | Default | Description |
|---|---|---|
| `entity` / `entities` | | One thermostat, or a list of them. Each entry can be an entity id or an object. |
| `title` | | Card title. |
| `layout` | `bar` | Starting layout. Each browser remembers the layout and open/closed state per thermostat. |
| `collapsed` | `false` | Start each thermostat collapsed. |
| `min_gap` | 2 °F / 1 °C | Smallest allowed gap between heat and cool. |
| `dial_min`, `dial_max` | 55–85 °F / 13–29 °C | Scale of the bar and dial. |

Per thermostat:

| Option | Description |
|---|---|
| `entity` | The `climate` entity. |
| `name` | Display name. |
| `temperature_sensor` | Show this sensor's temperature instead of the thermostat's. |
| `heat_allowed`, `cool_allowed`, `manual_override`, `heat_below`, `cool_above` | Override a helper the card would otherwise find by name. |

## License

MIT
