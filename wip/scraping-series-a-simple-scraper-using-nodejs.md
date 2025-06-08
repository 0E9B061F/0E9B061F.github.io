---
title: "Scraping Series --- **A simple scraper using node.js with `axios` and `cheerio`**"
desc: "A guide to scraping simple static sites with JavaScript."
date: 2024-08-20T05:26:57.397225724-04:00
draft: true
tags:
  - scraping series
  - scraping
  - scripting
  - node.js
  - cheerio
  - axios
---

# Setup

This guide assumes some familiarity with node.js, but we'll start off simple.
Prepare the project:

```sh
mkdir simple-scraper
cd simple-scraper
npm init # Accept or change defaults as you wish
```

We'll be writing ES6 modules, so after running the above, edit `package.json`
and add `"type": "module"`. Depending on what you entered during `npm init`, you
should have something like this:

```json
{
  "name": "simple-scraper",
  "version": "0.1.0",
  "main": "index.mjs",
  "type": "module",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "0E9B061F",
  "license": "MIT",
  "description": "Simple web scraper"
}
```

## Dependencies

We'll be using two libraries to do our scraping. `rock-req` is an HTTP client
which we'll use to make requests and retrieve data. `cheerio` is an HTML library
which we'll use to parse the pages we scrape. We'll also be using `jasmine` to
do our testing. Run the following:

```sh
npm install --save rock-req cheerio
npm install --save-dev jasmine
```

Now edit `package.json` again and change the `test` script to use `jasmine`:

```json
  "scripts": {
    "test": "jasmine"
  },
```
