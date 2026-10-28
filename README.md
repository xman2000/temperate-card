# Temperate

One comfort range per thermostat. Home Assistant heats when the room drops below it, cools when it rises above it, and leaves you alone when you change something on the thermostat itself.

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="docs/images/hero-light.png">
    <img src="docs/images/hero-dark.png" width="420" alt="Temperate card in the dial layout, cooling downstairs to 75°, with upstairs collapsed and comfortable">
  </picture>
</p>

Temperate is two pieces that work together:

- **Temperate card**: a dashboard card for one or more thermostats.
- **Temperate changeover blueprint**: an automation that picks Heat or Cool from your range and keeps the thermostat in step with it.

## How it works

**One range, not two modes.** You set *heat below* and *cool above*. Below the range the thermostat heats, above it cools, and inside it nothing changes. Drag the handles on the dial or bar, or use the steppers.

**Heat and Cool are permissions.** The Heat and Cool buttons don't switch the mode; they allow or block it. Block cooling for the winter and Temperate will never pick it, however warm the afternoon gets.

**A change on the thermostat is respected.** If someone changes the mode or a setpoint on the thermostat itself, Temperate assumes it was on purpose. It turns on a manual override, stops touching that thermostat, and the card says so. **Back to auto** puts your range back and hands control over again.

<p align="center">
  <img src="docs/images/manual-dark.png" width="420" alt="Card in manual override: someone set heat to 73° on the thermostat, with a Back to auto button that restores 68–75°">
</p>

**Slow thermostats don't trip it.** A difference has to last for the settle time (20 seconds by default) before it counts as a change on the thermostat, so a Zigbee device that takes a few seconds to confirm a command isn't mistaken for someone at the wall.

## The card

**Bar or dial.** Each thermostat can show either layout, and every browser remembers its own choice.

<p align="center">
  <img src="docs/images/layouts-dark.png" width="840" alt="The bar layout and the dial layout side by side">
</p>

**The whole house at a glance.** Collapse a thermostat to one row with the room temperature and what it's doing, colored and animated: a flickering flame while heating, a turning snowflake while cooling.

<p align="center">
  <img src="docs/images/rows-dark.png" width="420" alt="Four thermostats collapsed to rows: heating, cooling, comfortable and off">
</p>

Also:

- **Fan:** tap to switch between the modes the thermostat offers (for example Auto and On).
- **Waiting state:** after a restart, the card shows *Waiting* until the thermostat reports in, rather than a blank or wrong temperature.
- **Visual editor:** for every option, including picking helpers that don't follow the naming pattern.
- **Narrow layouts:** fits narrow dashboard columns and phones.

## Requirements

- Home Assistant 2024.10 or newer.
- A `climate` entity with `heat` and `cool` modes that accepts a heat/cool range (`target_temp_low` / `target_temp_high`).

## Setup

### 1. Install the card

Add this repository to HACS (or the Home Assistant Marketplace) as a custom **Dashboard** repository and download **Temperate**.

Or by hand: copy `temperate-card.js` to `config/www/temperate-card/` and add it as a dashboard resource:

```yaml
url: /local/temperate-card/temperate-card.js
type: module
```

### 2. Create the helpers

Each thermostat needs six helpers. The card finds them by name: take the thermostat's entity id, drop `climate.` and a trailing `_thermostat`, and use what's left as the prefix. For `climate.downstairs_thermostat` the prefix is `downstairs`:

| Helper | Type | Purpose |
|---|---|---|
| `input_boolean.downstairs_heat_allowed` | Toggle | Heat may run |
| `input_boolean.downstairs_cool_allowed` | Toggle | Cool may run |
| `input_boolean.downstairs_manual_override` | Toggle | On while a change made on the thermostat is being held |
| `input_number.downstairs_heat_below` | Number | Bottom of the range |
| `input_number.downstairs_cool_above` | Number | Top of the range |
| `input_text.downstairs_commanded_mode` | Text | Lets the automation remember the mode it set |

Create them in **Settings → Devices & services → Helpers**, or paste a package like this one:

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

For °C, use a range such as 7–30 with step 0.5. Helpers with other names work too; pick them in the card editor under **Helpers**.

### 3. Add the automation

[![Import blueprint](https://my.home-assistant.io/badges/blueprint_import.svg)](https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=https%3A%2F%2Fgithub.com%2Fxman2000%2Ftemperate-card%2Fblob%2Fmain%2Fblueprints%2Ftemperate_changeover.yaml)

Or import `https://github.com/xman2000/temperate-card/blob/main/blueprints/temperate_changeover.yaml` from **Settings → Automations & scenes → Blueprints → Import blueprint**.

Create one automation per thermostat from **Temperate changeover** and point it at the thermostat and its helpers.

### 4. Add the card

Add **Temperate** from the card picker, or in YAML:

```yaml
type: custom:temperate-card
entities:
  - climate.downstairs_thermostat
  - climate.upstairs_thermostat
```

## Card options

```yaml
type: custom:temperate-card
title: Climate
layout: dial        # bar (default) or dial
collapsed: false    # start collapsed to one row
entities:
  - entity: climate.downstairs_thermostat
    name: Downstairs
  - entity: climate.upstairs_thermostat
    name: Upstairs
    temperature_sensor: sensor.bedroom_temperature
```

| Option | Default | Description |
|---|---|---|
| `entity` / `entities` | | One thermostat, or a list. Each entry is an entity id or an object with the options below. |
| `title` | | Card title. |
| `layout` | `bar` | Starting layout. Each browser then remembers the layout and open/closed state per thermostat. |
| `collapsed` | `false` | Start each thermostat collapsed. |
| `min_gap` | 2 °F / 1 °C | Smallest allowed gap between heat and cool. |
| `dial_min`, `dial_max` | 55–85 °F / 13–29 °C | Scale of the bar and dial, limited to what the thermostat supports. |

Per thermostat:

| Option | Description |
|---|---|
| `entity` | The `climate` entity. |
| `name` | Display name. Defaults to the thermostat's name. |
| `temperature_sensor` | Show this sensor's temperature instead of the thermostat's. |
| `heat_allowed`, `cool_allowed`, `manual_override`, `heat_below`, `cool_above` | Use this helper instead of the one found by name. |

## Theming

Colors come from CSS variables that you can set in a theme or with card-mod:

| Variable | Default | Used for |
|---|---|---|
| `--temperate-heat` | `#FF8A50` | Heating and the heat side of the range |
| `--temperate-cool` | `#4FA3F7` | Cooling and the cool side of the range |
| `--temperate-ok` | `#7CB342` | Comfortable, the range itself |
| `--temperate-off` | `#6B7078` | Off and waiting |
| `--temperate-manual` | `#FFD54F` | Manual override |
| `--temperate-marker` | `--primary-text-color` | Room temperature marker |

## License

MIT
