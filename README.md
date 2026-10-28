# Temperate

Temperate is a thermostat card and automation for Home Assistant. You pick a temperature range, say 68° to 75°. If the room drops below 68°, the heat comes on. If it climbs above 75°, the AC comes on. You never have to switch between heating and cooling yourself.

If someone changes the thermostat on the wall, Temperate backs off and keeps their setting until you tell it to take over again.

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="docs/images/hero-light.png">
    <img src="docs/images/hero-dark.png" width="420" alt="Temperate card in the dial layout, cooling downstairs to 75°, with upstairs collapsed and comfortable">
  </picture>
</p>

There are two parts: a dashboard card, and a blueprint for the automation that does the switching. You'll want both.

## How it works

You set two numbers per thermostat: *heat below* and *cool above*. Drag the handles on the dial or bar, or tap the plus and minus buttons. Between the two numbers, nothing runs.

The Heat and Cool buttons don't change the thermostat's mode. They decide whether Temperate is allowed to use heat or cooling at all. Turn cooling off for the winter and it stays off, even on a warm afternoon.

If someone changes the mode or temperature on the thermostat itself, Temperate assumes they meant it. It stops sending commands to that thermostat and the card shows a yellow **Manual** banner. Press **Back to auto** when you want your range back.

<p align="center">
  <img src="docs/images/manual-dark.png" width="420" alt="Card in manual mode: someone set heat to 73° on the thermostat, with a Back to auto button that restores 68–75°">
</p>

Some thermostats, especially Zigbee ones, take several seconds to confirm a command. Temperate waits 20 seconds before deciding a change came from the wall, so a slow thermostat won't flip it into manual by mistake. You can change that wait in the automation.

## The card

### Bar or dial

Every thermostat can use either layout. Each browser remembers which one you picked, so the wall tablet and your phone can differ.

<p align="center">
  <img src="docs/images/layouts-dark.png" width="840" alt="The bar layout and the dial layout side by side">
</p>

### Collapsed rows

Tap a thermostat's header to fold it down to one line: the room temperature and what it's doing. The icon is colored and moves: the flame flickers while heating and the snowflake turns while cooling. With several thermostats folded, you can check the whole house at a glance.

<p align="center">
  <img src="docs/images/rows-dark.png" width="420" alt="Four thermostats collapsed to rows: heating, cooling, comfortable and off">
</p>

### Any screen size

The card fits whatever space the dashboard gives it, from a wide desktop column to a phone. In narrow columns the buttons get smaller and the dial shrinks to fit. On the narrowest screens the heat and cool controls stack instead of getting cut off.

<p align="center">
  <img src="docs/images/sizes-dark.png" width="840" alt="The same card at a wide column, a narrow column and phone width">
</p>

### Visual editor

You can set everything without touching YAML: the thermostats, names, layout, an optional room sensor, and which helpers to use. The editor checks that each thermostat's helpers exist. If they don't, one button creates them for you, filled in from the thermostat's current settings.

<p align="center">
  <img src="docs/images/editor-dark.png" width="420" alt="The card editor with two thermostats. The first has all its helpers; the second shows a Create all 6 button">
</p>

### Also

- The fan button switches between the fan modes your thermostat offers, such as Auto and On.
- After a restart, the card says *Waiting* until the thermostat reports in, so you never see a blank or made-up temperature.
- The colors follow your theme, and you can change them (see [Theming](#theming)).

## Requirements

- Home Assistant 2024.10 or newer.
- A thermostat (`climate` entity) with heat and cool modes that accepts a low and a high setpoint (`target_temp_low` and `target_temp_high`).

## Setup

### 1. Install the card

Add this repository to HACS (or the Home Assistant Marketplace) as a custom **Dashboard** repository and download **Temperate**.

To install it by hand, copy `temperate-card.js` to `config/www/temperate-card/` and add it as a dashboard resource:

```yaml
url: /local/temperate-card/temperate-card.js
type: module
```

### 2. Add the card and create its helpers

Add **Temperate** to a dashboard from the card picker and choose your thermostats. Under each thermostat, the editor tells you whether its helpers exist. Press **Create all 6** and it makes them. The range comes from the thermostat's current setpoints, and heat and cool are allowed if the thermostat supports them.

Creating helpers needs an administrator account. If you'd rather make them yourself, see [Helpers](#helpers).

### 3. Add the automation

[![Import blueprint](https://my.home-assistant.io/badges/blueprint_import.svg)](https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=https%3A%2F%2Fgithub.com%2Fxman2000%2Ftemperate-card%2Fblob%2Fmain%2Fblueprints%2Ftemperate_changeover.yaml)

Or go to **Settings → Automations & scenes → Blueprints → Import blueprint** and paste `https://github.com/xman2000/temperate-card/blob/main/blueprints/temperate_changeover.yaml`.

Then create one automation per thermostat from **Temperate changeover** and pick the thermostat and its six helpers.

## Helpers

Each thermostat uses six helpers. The card finds them by name. It takes the thermostat's entity id, drops `climate.` and a trailing `_thermostat`, and uses what's left as the prefix. For `climate.downstairs_thermostat` the prefix is `downstairs`:

| Helper | Type | What it's for |
|---|---|---|
| `input_boolean.downstairs_heat_allowed` | Toggle | Heat may run |
| `input_boolean.downstairs_cool_allowed` | Toggle | Cooling may run |
| `input_boolean.downstairs_manual_override` | Toggle | On while a change made on the thermostat is being kept |
| `input_number.downstairs_heat_below` | Number | Bottom of the range |
| `input_number.downstairs_cool_above` | Number | Top of the range |
| `input_text.downstairs_commanded_mode` | Text | The automation's note of the mode it last set |

To make them yourself, use **Settings → Devices & services → Helpers**, or a package like this:

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

For Celsius, use something like 7 to 30 in steps of 0.5. Helpers with other names work too; choose them in the card editor under **Helpers**.

## Card options

Most people never need these, since the editor covers them. In YAML:

```yaml
type: custom:temperate-card
title: Climate
layout: dial        # bar (default) or dial
collapsed: false    # start folded to one row
entities:
  - entity: climate.downstairs_thermostat
    name: Downstairs
  - entity: climate.upstairs_thermostat
    name: Upstairs
    temperature_sensor: sensor.bedroom_temperature
```

| Option | Default | What it does |
|---|---|---|
| `entity` / `entities` | | One thermostat, or a list. Each entry is an entity id or an object with the options below. |
| `title` | | Card title. |
| `layout` | `bar` | Starting layout. After that, each browser remembers its own choice. |
| `collapsed` | `false` | Start each thermostat folded. |
| `min_gap` | 2 °F / 1 °C | Smallest allowed gap between the heat and cool numbers. |
| `dial_min`, `dial_max` | 55–85 °F / 13–29 °C | Ends of the bar and dial, kept within what the thermostat supports. |

Per thermostat:

| Option | What it does |
|---|---|
| `entity` | The thermostat. |
| `name` | Display name. Defaults to the thermostat's name. |
| `temperature_sensor` | Show this sensor's reading instead of the thermostat's. |
| `heat_allowed`, `cool_allowed`, `manual_override`, `heat_below`, `cool_above` | Use this helper instead of the one found by name. |

## Theming

Set any of these in your theme, or with card-mod:

| Variable | Default | Used for |
|---|---|---|
| `--temperate-heat` | `#FF8A50` | Heating, and the heat end of the range |
| `--temperate-cool` | `#4FA3F7` | Cooling, and the cool end of the range |
| `--temperate-ok` | `#7CB342` | Comfortable, and the range itself |
| `--temperate-off` | `#6B7078` | Off and waiting |
| `--temperate-manual` | `#FFD54F` | The manual banner |
| `--temperate-marker` | your theme's text color | The room temperature marker |

## License

MIT
