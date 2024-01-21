# vimGPT.js

A TypeScript port of [vimGPT](https://github.com/ishan0102/vimGPT).

## Getting Started

1. Clone this Repo
2. Run `npm i`
3. Run `./setup.sh`
4. Run `npx tsx index.ts`

## How it works

This tool utilizes [Vimium](https://vimium.github.io/) and [Playwright](https://playwright.dev/) to provide a visual browsing interface for [GPT-4V](https://platform.openai.com/docs/guides/vision) (`gpt-4-vision-preview`) to act on.

By sending screenshots of the browser (with the Vimium overlay) to GPT, we can skip all the DOM parsing normally required when building web automations.

You start by specifying a task (e.g. "find a 30 watt lightbulb on Amazon") and then a series of prompts, each with an updated view of the browser, get passed along to GPT-4V for determining the best next task (or "action").

## Next Steps

The initial setup works OK, but it's easy for GPT-4V to get stuck in a loop. This is certainly far from a production-ready implementation.

With that said, try it out and tweak it to your heart's content!

## Recognition

Huge props to [Ishan Shah](https://github.com/ishan0102) for building the Python version of this utility 🙏

