/**
 * Replaces CSS light-dark(lightVal, darkVal) functions with their light-mode value.
 * draw.io injects these for dark-mode support, but they break SVG rendering when
 * CSS custom properties (--ge-dark-color) are unavailable outside draw.io's context.
 */
export function stripLightDark(svgText: string): string {
  const needle = 'light-dark(';
  let result = '';
  let i = 0;
  while (i < svgText.length) {
    const idx = svgText.indexOf(needle, i);
    if (idx === -1) { result += svgText.slice(i); break; }
    result += svgText.slice(i, idx);

    const argsStart = idx + needle.length;
    let depth = 1;
    let j = argsStart;
    let firstArg = '';
    let foundComma = false;
    while (j < svgText.length) {
      const ch = svgText[j];
      if (ch === '(') depth++;
      else if (ch === ')') {
        depth--;
        if (depth === 0) { j++; break; }
      }
      if (!foundComma) {
        if (ch === ',' && depth === 1) foundComma = true;
        else firstArg += ch;
      }
      j++;
    }
    result += firstArg.trim();
    i = j;
  }
  return result;
}
