# Custom Hit Error Bar

My finalized version of the hit error bar. rewrote most of the code from scratch.

> [!NOTE]
> should have compatibility with standard and taiko gamemodes, but main priority for this is osu!mania.  
> pull requests to fix compatibility are always welcome  
> the current main development branch is `typescript` 

## Preview

![preview](https://github.com/user-attachments/assets/c7d348e1-7984-4e7e-b20e-cfa61737b4f3)

## Features

- Customizable settings accessible from the tosu dashboard
  - change colors
  - change sizes
  - change opacities
  - change rounded corners
  - and more!
- Tick lifetimes are now adjustable via settings, no longer determined by tick count.
- standard deviation display (toggled in settings).

## How to download

1. Open Tosu Dashboard
2. open `Avaiable` tab
3. find `Custom Hit Error Bar`
4. click `Download`

### OBS instructions

1. Open tosu dashboard
2. click on URL button to copy URL
3. Open OBS
4. create new browser source
5. paste URL
6. paste Resolution width and height (940 x 150)

### Ingame Overlay instructions

1. Open tosu dashboard
2. open settings tab
3. set `ENABLE_INGAME_OVERLAY` to `enabled`
4. restart both osu! and tosu
5. press `Ctrl + Shift + Space` to open ingame overlay manager
6. right click anywhere and select `Custom Hit Error Bar` in the dropdown menu
