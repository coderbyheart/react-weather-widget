# react-weather-widget

[![npm version](https://img.shields.io/npm/v/@coderbyheart/react-weather-widget.svg)](https://www.npmjs.com/package/@coderbyheart/react-weather-widget)
[![Build Status](https://travis-ci.org/coderbyheart/react-weather-widget.svg?branch=master)](https://travis-ci.org/coderbyheart/react-weather-widget)
[![monitored by greenkeeper.io](https://img.shields.io/badge/greenkeeper.io-monitored-brightgreen.svg)](http://greenkeeper.io/) 
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

Unstyled weather widget build with React.

## Usage

Add this widget to your site:

```html
<div id="weather-widget" data-url-yr="…" data-url-met="…" data-images="https://coderbyheart.github.io/react-weather-widget/icon/"></div>
<script type="text/javascript" defer src="https://coderbyheart.github.io/react-weather-widget/main.min.js"></script>
```

`data-url-yr` is the location of the weather JSON file, generated from a yr.no XML feed.

```bash
curl -s \
    http://www.yr.no/sted/Norge/S%C3%B8r-Tr%C3%B8ndelag/Trondheim/Trondheim_sentrum/varsel.xml \
    | ./node_modules/.bin/babel-node src/xml2json.js
```

`data-url-met` is the location of a www.met.no feed, e.g. [for Trondheim](https://www.met.no/_/service/no.met.metno/yr?id=52bde27b-996a-a27d-93cd-8df75889c112&language=no&mode=forecast)

Here is a live example: <https://coderbyheart.github.io/react-weather-widget/>

## Acknowledgments

Icons are from [@yr/weather-symbols](https://github.com/yr/weather-symbols).
