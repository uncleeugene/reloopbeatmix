This repo contains Mixxx mapping for Reloop Beatmix gen. 1 DJ controller.

Functions implemented: all, except sampler controls.

Mostly mapping created with original front panel labels in mind yet there's several things to mention:

1. Scratch toggle buttons on the controller are confusing. There's no problem with buttons itself but its LEDs are controlled by the hardware.
   LEDs just toggle when corresponding button is pressed and i didn't find the way to control these lights from within scripts. So i just gave up on these buttons.
   Instead, scratch mode is toggled and indicated with Shift-Load buttons.
2. Second jog mode buttons (w search icon) have a function. Those make jogs four times more sensitive when enabled.
3. I have no idea what "Beat Mash" is (buttons right above the jog), so those buttons toggle quantize mode.
4. All though fader start isn't implemented in Mixxx, i managed to make it work with scripts. There is no fader stop function though.
5. Filter knobs control quick filter function. There is no buttons to toggle quick filter.
6. That same knobs adjust filer crossfade control when operated with Shift pressed.
7. FX Sel knobs scroll through FX presets.
8. Hotcues set and started with Hotcue buttons and deleted with Shift-Hotcue.
9. Load buttons are only lit if corresponding deck is stopped and is safe to load in.
