# Standalone conversion

- Removed blueprint and schedule-management implementation, helper creation and writes, and entity/automation registry mutations.
- Wired temperature controls directly to `climate.set_temperature` according to HVAC mode.
- Dynamically restrict mode buttons to reported thermostat capabilities; supports heat-only thermostats.
- Validated target values, sensor availability, temperature bounds and minimum range gap; error handling for failed service calls.
- Preserved circular dial, colors, fan button, collapse behavior, and bar layout.
- Added keyboard-accessible thermostat handles, pointer cleanup, and 12 mocked climate-control tests.
- Kept custom element name and HACS manifest for existing card configuration compatibility.

Remaining consideration: this build has only static and mocked checks; test on real Home Assistant before using it as a primary HVAC control UI.
