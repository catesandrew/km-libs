/**
 * te-utils.js — Shared library for Keyboard Maestro macros
 * Migrated from TextExpander JS snippets.
 *
 * Usage in KM shell script actions:
 *   pbpaste | node -e "
 *     const te = require('$HOME/.km-libs/te-utils');
 *     const input = te.readStdin();
 *     // ... transform input ...
 *     process.stdout.write(result);
 *   "
 */

const _ = require(__dirname + '/node_modules/lodash');

// ──────────────────────────────────────────────
// Clipboard / stdin helpers (replaces TE's hereDoc(%clipboard%) pattern)
// ──────────────────────────────────────────────

function readStdin() {
  try {
    const fs = require('fs');
    return fs.readFileSync('/dev/stdin', 'utf8');
  } catch (e) {
    return '';
  }
}

function getClipboard() {
  try {
    return require('child_process')
      .execSync('pbpaste', { encoding: 'utf8' });
  } catch (e) {
    return '';
  }
}

// ──────────────────────────────────────────────
// From javascriptUtils
// ──────────────────────────────────────────────

function makeStringFn(object) {
  if (object == null) return '';
  return '' + object;
}

function capitalizeFn(str) {
  str = makeStringFn(str);
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function decapitalizeFn(str) {
  str = makeStringFn(str);
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function camelize(str, decapitalize) {
  str = str.trim().replace(/[-_\s]+(.)?/g, function(match, c) {
    return c ? c.toUpperCase() : '';
  });
  return decapitalize === true ? decapitalizeFn(str) : str;
}

function titlecase(str, capitalize) {
  str = str.trim().replace(/[-_\s]+(.)?/g, function(match, c) {
    return c ? ' ' + c.toUpperCase() : ' ';
  });
  return capitalize === true ? capitalizeFn(str) : str;
}

function dasherize(model) {
  return model
    .replace(/([A-Z])/g, '-$1')
    .replace(/^-/, '')
    .replace(/\-(.)\-/g, '$1')
    .replace(/\-(.)$/, '$1')
    .toLowerCase();
}

function underbarize(model) {
  return model
    .replace(/([A-Z])/g, '_$1')
    .replace(/^_/, '')
    .replace(/\_(.)\_/g, '$1')
    .replace(/\_(.)$/, '$1')
    .toUpperCase();
}

function unescapeHbs(input) {
  var escapes = [
    { '/': /&fslash;/g },
    { '*': /&star;/g },
    { '\\': /&bslash;/g }
  ];
  escapes.forEach(function(element) {
    for (var key in element) {
      if (element.hasOwnProperty(key)) {
        input = input.replace(element[key], key);
      }
    }
  });
  return input;
}

// ──────────────────────────────────────────────
// From javascriptDecamelize
// ──────────────────────────────────────────────

function decamelize(str, sep) {
  if (typeof str !== 'string') throw new TypeError('Expected a string');
  sep = typeof sep === 'undefined' ? '_' : sep;
  return str
    .replace(/([a-z\d])([A-Z])/g, '$1' + sep + '$2')
    .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + sep + '$2')
    .toLowerCase();
}

// ──────────────────────────────────────────────
// From javascriptHumanizeString
// ──────────────────────────────────────────────

function humanizeString(str) {
  if (typeof str !== 'string') throw new TypeError('Expected a string');
  str = str.toLowerCase().replace(/[_-]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ──────────────────────────────────────────────
// From javascriptTitleCase (full version with preposition handling)
// ──────────────────────────────────────────────

var articles = ['the', 'a', 'an', 'some'];
var conjunctions = ['as','because','for','and','nor','but','or','yet','so'];
var prepositions = [
  'a','abaft','aboard','about','above','absent','across','afore','after',
  'against','along','alongside','amid','amidst','among','amongst','an',
  'apropos','apud','around','as','aside','astride','at','athwart','atop',
  'barring','before','behind','below','beneath','beside','besides','between',
  'beyond','but','by','circa','concerning','despite','down','during','except',
  'excluding','failing','following','for','from','given','in','including',
  'inside','into','like','mid','midst','minus','modulo','near','next',
  'notwithstanding',"o'",'of','off','on','onto','opposite','out','outside',
  'over','pace','past','per','plus','pro','qua','regarding','round','sans',
  'save','since','than','through','throughout','thru','thruout','till','times',
  'to','toward','towards','under','underneath','unlike','until','unto','up',
  'upon','versus','via','vice','with','within','without','worth'
];

var smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;

function toTitleCase(str) {
  return _titleCase(str, smallWords);
}

var laxWords = articles.concat(prepositions).concat(conjunctions)
  .concat(smallWords.source.replace(/(^\^\(|\)\$$)/g, '').split('|'))
  .concat(['is']);
var laxWordsRe = new RegExp('^(' + laxWords.join('|') + ')$', 'i');

function toLaxTitleCase(str) {
  return _titleCase(str, laxWordsRe);
}

function _titleCase(str, smallWordsPattern) {
  if (!str) return str;
  return str.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, function(match, index, title) {
    if (index > 0 && index + match.length !== title.length &&
      match.search(smallWordsPattern) > -1 && title.charAt(index - 2) !== ':' &&
      (title.charAt(index + match.length) !== '-' || title.charAt(index - 1) === '-') &&
      title.charAt(index - 1).search(/[^\s-]/) < 0) {
      return match.toLowerCase();
    }
    if (match.substr(1).search(/[A-Z]|\../) > -1) return match;
    return match.charAt(0).toUpperCase() + match.substr(1);
  });
}

// ──────────────────────────────────────────────
// From javascriptPlur / javascriptIrregularPlurals
// ──────────────────────────────────────────────

function plur(str, count) {
  if (typeof str !== 'string') throw new TypeError('Expected a string');
  count = typeof count === 'number' ? count : 2;
  if (count === 1) return str;
  // Simple English pluralization
  if (str.match(/(s|x|z|ch|sh)$/i)) return str + 'es';
  if (str.match(/[^aeiou]y$/i)) return str.slice(0, -1) + 'ies';
  return str + 's';
}

// ──────────────────────────────────────────────
// From javascriptParseMSJS
// ──────────────────────────────────────────────

function parseMs(ms) {
  if (typeof ms !== 'number') throw new TypeError('Expected a number');
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor(ms / 3600000) % 24,
    minutes: Math.floor(ms / 60000) % 60,
    seconds: Math.floor(ms / 1000) % 60,
    milliseconds: Math.floor(ms) % 1000,
  };
}

// ──────────────────────────────────────────────
// From javascriptUID
// ──────────────────────────────────────────────

function uid(len) {
  len = len || 7;
  return Math.random().toString(35).substr(2, len);
}

// ──────────────────────────────────────────────
// From javascriptStrftime (Date.prototype extension)
// ──────────────────────────────────────────────

Date.ext = {};
Date.ext.util = {};
Date.ext.util.xPad = function(x, pad, r) {
  if (typeof r === 'undefined') r = 10;
  for (; parseInt(x, 10) < r && r > 1; r /= 10) x = pad.toString() + x;
  return x.toString();
};
Date.ext.locales = {};
Date.ext.locales.en = {
  a: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
  A: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
  b: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  B: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  c: '%a %d %b %Y %T %Z',
  p: ['AM','PM'],
  P: ['am','pm'],
  x: '%d/%m/%y',
  X: '%T'
};
Date.ext.locales['en-GB'] = Date.ext.locales.en;
Date.ext.locales['en-US'] = Date.ext.locales.en;
Date.ext.formats = {
  a: function(d) { return Date.ext.locales[d.locale].a[d.getDay()]; },
  A: function(d) { return Date.ext.locales[d.locale].A[d.getDay()]; },
  b: function(d) { return Date.ext.locales[d.locale].b[d.getMonth()]; },
  B: function(d) { return Date.ext.locales[d.locale].B[d.getMonth()]; },
  c: 'toLocaleString',
  C: function(d) { return Date.ext.util.xPad(parseInt(d.getFullYear()/100, 10), 0); },
  d: ['getDate', '0'],
  e: ['getDate', ' '],
  g: function(d) { return Date.ext.util.xPad(parseInt(Date.ext.formats.G(d)/100, 10), 0); },
  G: function(d) {
    var y = d.getFullYear();
    var V = parseInt(Date.ext.formats.V(d), 10);
    var W = parseInt(Date.ext.formats.W(d), 10);
    if (W > V) y++;
    else if (W === 0 && V >= 52) y--;
    return y;
  },
  H: ['getHours', '0'],
  I: function(d) { var I = d.getHours() % 12; return Date.ext.util.xPad(I === 0 ? 12 : I, 0); },
  j: function(d) {
    var ms = d - new Date('' + d.getFullYear() + '/1/1 GMT');
    ms += d.getTimezoneOffset() * 60000;
    var doy = parseInt(ms / 60000 / 60 / 24, 10) + 1;
    return Date.ext.util.xPad(doy, 0, 100);
  },
  m: function(d) { return Date.ext.util.xPad(d.getMonth() + 1, 0); },
  M: ['getMinutes', '0'],
  p: function(d) { return Date.ext.locales[d.locale].p[d.getHours() >= 12 ? 1 : 0]; },
  P: function(d) { return Date.ext.locales[d.locale].P[d.getHours() >= 12 ? 1 : 0]; },
  S: ['getSeconds', '0'],
  u: function(d) { var dow = d.getDay(); return dow === 0 ? 7 : dow; },
  U: function(d) {
    var doy = parseInt(Date.ext.formats.j(d), 10);
    var rdow = 6 - d.getDay();
    return Date.ext.util.xPad(parseInt((doy + rdow) / 7, 10), 0);
  },
  V: function(d) {
    var woy = parseInt(Date.ext.formats.W(d), 10);
    var dow1_1 = (new Date('' + d.getFullYear() + '/1/1')).getDay();
    var idow = woy + (dow1_1 > 4 || dow1_1 <= 1 ? 0 : 1);
    if (idow === 53 && (new Date('' + d.getFullYear() + '/12/31')).getDay() < 4) idow = 1;
    else if (idow === 0) idow = Date.ext.formats.V(new Date('' + (d.getFullYear() - 1) + '/12/31'));
    return Date.ext.util.xPad(idow, 0);
  },
  w: 'getDay',
  W: function(d) {
    var doy = parseInt(Date.ext.formats.j(d), 10);
    var rdow = 7 - Date.ext.formats.u(d);
    return Date.ext.util.xPad(parseInt((doy + rdow) / 7, 10), 0);
  },
  y: function(d) { return Date.ext.util.xPad(d.getFullYear() % 100, 0); },
  Y: 'getFullYear',
  z: function(d) {
    var o = d.getTimezoneOffset();
    var H = Date.ext.util.xPad(parseInt(Math.abs(o / 60), 10), 0);
    var M = Date.ext.util.xPad(o % 60, 0);
    return (o > 0 ? '-' : '+') + H + M;
  },
  Z: function(d) { return d.toString().replace(/^.*\(([^)]+)\)$/, '$1'); },
  '%': function(d) { return '%'; }
};
Date.prototype.locale = 'en-GB';
Date.prototype.strftime = function(fmt) {
  var d = this;
  if (!(Date.ext.locales[d.locale])) {
    if (Date.ext.locales[d.locale.substr(0, 2)]) d.locale = d.locale.substr(0, 2);
    else d.locale = 'en-GB';
  }
  while (fmt.match(/%[cDhrnRtTxXzZ]/)) {
    fmt = fmt.replace(/%c/, Date.ext.locales[d.locale].c)
      .replace(/%D/, '%m/%d/%y').replace(/%h/, '%b').replace(/%n/, '\n')
      .replace(/%r/, '%I:%M:%S %p').replace(/%R/, '%H:%M')
      .replace(/%t/, '\t').replace(/%T/, '%H:%M:%S')
      .replace(/%x/, Date.ext.locales[d.locale].x).replace(/%X/, Date.ext.locales[d.locale].X);
  }
  var re = /%([aAbBCdegGHIjmMpPSuUVwWyY%])/g;
  return fmt.replace(re, function(m0, m1) {
    var f = Date.ext.formats[m1];
    if (typeof f === 'string') return d[f]();
    else if (typeof f === 'function') return f(d);
    else if (typeof f === 'object' && typeof f[0] === 'string')
      return Date.ext.util.xPad(d[f[0]](), f[1]);
    else return m1;
  });
};

// ──────────────────────────────────────────────
// From javascriptStrftime (getNextDay helper)
// ──────────────────────────────────────────────

function getNextDay(day, resetTime) {
  day = day.slice(0, 3).toLowerCase();
  var days = {
    sun: 0, mon: 1, tue: 2,
    wed: 3, thu: 4, fri: 5, sat: 6
  };
  var dayIndex = days[day];
  if (dayIndex === undefined) {
    throw new Error('"' + day + '" is not a valid input.');
  }
  var returnDate = new Date();
  var returnDay = returnDate.getDay();
  if (dayIndex !== returnDay) {
    returnDate.setDate(returnDate.getDate() + (dayIndex + (7 - returnDay)) % 7);
  } else {
    returnDate.setDate(returnDate.getDate() + 7);
  }
  if (resetTime) {
    returnDate.setHours(0);
    returnDate.setMinutes(0);
    returnDate.setSeconds(0);
    returnDate.setMilliseconds(0);
  }
  return returnDate;
}

// ──────────────────────────────────────────────
// Exports
// ──────────────────────────────────────────────

module.exports = {
  // lodash
  _,

  // stdin/clipboard
  readStdin,
  getClipboard,

  // string utils (from javascriptUtils)
  capitalizeFn,
  decapitalizeFn,
  makeStringFn,
  camelize,
  titlecase,
  dasherize,
  underbarize,
  unescapeHbs,

  // case conversion
  decamelize,
  humanizeString,
  toTitleCase,
  toLaxTitleCase,

  // misc
  plur,
  parseMs,
  uid,
  getNextDay,
};
