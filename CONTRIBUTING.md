# Contributing to custom hit error bar

Any contributions are welcome! but please follow these guidelines:

## Code Style

- Use [biome](https://biomejs.dev/) for formatting and linting.
- If you are going to add a new feature that implements any new methods, classes, functions, etc, please use verbose names for them.
- Add comments to code that you are not 100% sure about, or something that may not be immediately obvious.

## Development Environment

- Notes:
  - running a dev server (through both `npm run dev` and `npm run preview`)will break the overlay because it breaks the `COUNTER_PATH` environment variable
  - build options include a sourcemap, which is useful for debugging
  - vite options specify an output directory 2 levels up from the current directory, this is mostly for those working with mutliple branches.
    - otherwise, just set the `outDir` option in `vite.config.js` to the desired directory
- Use `npm run build` to build the overlay, then open the new overlay from the tosu dashboard

## Pull Requests

- Make sure your code is properly formatted and linted.s
- Make sure your code is properly tested.
- Make sure your code does not break anything.
- Summarize your changes in the description of your pull request.
- If you are adding a new feature, please add a description of how it works.
- Provide screenshots of new features if applicable.

## Issues

If you are reporting a bug, please follow these guidelines:

1. Provide the version of the following:
    - tosu
    - osu!
    - custom hit error bar
2. Provide the steps to reproduce the bug.
3. Provide a screenshot or video of the bug.
