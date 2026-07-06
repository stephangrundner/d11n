/**
 * Replaces CSS light-dark(lightVal, darkVal) functions with their light-mode value.
 * draw.io injects these for dark-mode support, but they break SVG rendering when
 * CSS custom properties (--ge-dark-color) are unavailable outside draw.io's context.
 */
export function stripLightDark(svgText: string): string {
  const needle = "light-dark(";
  let result = "";
  let i = 0;
  while (i < svgText.length) {
    const idx = svgText.indexOf(needle, i);
    if (idx === -1) {
      result += svgText.slice(i);
      break;
    }
    result += svgText.slice(i, idx);
    const argsStart = idx + needle.length;
    let depth = 1;
    let j = argsStart;
    let firstArg = "";
    let foundComma = false;
    while (j < svgText.length) {
      const ch = svgText[j];
      if (ch === "(") depth++;
      else if (ch === ")") {
        depth--;
        if (depth === 0) {
          j++;
          break;
        }
      }
      if (!foundComma) {
        if (ch === "," && depth === 1) foundComma = true;
        else firstArg += ch;
      }
      j++;
    }
    result += firstArg.trim();
    i = j;
  }
  return result;
}

function svgFromDataUri(dataUri: string): string {
  const commaIdx = dataUri.indexOf(",");
  const meta = dataUri.slice(0, commaIdx);
  const body = dataUri.slice(commaIdx + 1);
  if (meta.includes("base64")) {
    const binary = atob(body);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder("utf-8").decode(bytes);
  }
  return decodeURIComponent(body);
}

/**
 * Turns a draw.io SVG export data-URI into a self-contained .drawio.svg string with
 * the mxfile XML embedded in the `content` attribute (URL-encoded), so the diagram
 * can be re-opened and edited later.
 */
export function buildDrawioSvg(dataUri: string, xml: string): string {
  const svgText = stripLightDark(svgFromDataUri(dataUri));
  const encoded = encodeURIComponent(xml);
  return svgText.includes('content="')
    ? svgText.replace(/\bcontent="[^"]*"/, `content="${encoded}"`)
    : svgText.replace(/(<svg\b)/, `$1 content="${encoded}"`);
}

/** Extracts the mxfile XML from a .drawio.svg string's `content` attribute. */
export function extractXmlFromDrawioSvg(svgText: string): string | null {
  const m = svgText.match(/\bcontent="([^"]*)"/);
  if (!m) return null;
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return null;
  }
}

/** Encodes an SVG string as a data URI suitable for an <img src>. */
export function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
