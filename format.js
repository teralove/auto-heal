const entities = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
};

const reversedEscapeChars = {};
for (let k in entities) reversedEscapeChars[entities[k]] = k;

module.exports = {
  stripTags: s => s.replace(/<\/?[^<>]*>/gi, ''),

  escapeHTML: s => s.replace(/[&<>"']/g, m => `&${reversedEscapeChars[m]};`),

  decodeHTMLEntities: s => s
    .replace(/&#(\d+);?/g, (_, code) => String.fromCharCode(code))
    .replace(/&#[xX]([A-Fa-f0-9]+);?/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&([^;\W]+;?)/g, (m, e) => {
      const target = entities[e.replace(/;$/, '')];
      switch (typeof target) {
        case 'number':
          return String.fromCharCode(target);
        case 'string':
          return target;
        default:
          return m;
      }
    }),
};