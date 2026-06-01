'use client';
import { useEffect, useRef, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { api } from '@/lib/api';
import { stripLightDark } from './svgUtils';

interface Props {
  spaceId: string;
  filename: string;
  src: string | null;
  onSave: (newSrc: string) => void;
  onClose: () => void;
}

export function DiagramDialog({ spaceId, filename, src, onSave, onClose }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  // Always write to a new unique file so the original is preserved for discard scenarios.
  // Reading (on init) still uses the original filename passed via prop.
  const targetFilename = useRef(`diagram-${Date.now()}.drawio.svg`);

  const onSaveRef = useRef(onSave);
  const onCloseRef = useRef(onClose);
  onSaveRef.current = onSave;
  onCloseRef.current = onClose;

  const sendRef = useRef((msg: object) => {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify(msg), '*');
  });
  const pendingXmlRef = useRef<string | null>(null);

  useEffect(() => {
    const handleMessage = async (e: MessageEvent) => {
      if (typeof e.data !== 'string') return;
      let msg: Record<string, unknown>;
      try { msg = JSON.parse(e.data); } catch { return; }
      if (typeof msg.event !== 'string') return;

      if (msg.event === 'init') {
        setLoading(false);
        let xml = '<mxfile><diagram></diagram></mxfile>';
        if (src && filename) {
          try {
            const svgContent = await api.assets.fetchContent(spaceId, filename);
            const extracted = extractXmlFromDrawioSvg(svgContent);
            if (extracted) xml = extracted;
          } catch { /* new diagram */ }
        }
        sendRef.current({ action: 'load', autosave: 0, xml });
      } else if (msg.event === 'save') {
        pendingXmlRef.current = msg.xml as string;
        sendRef.current({ action: 'export', format: 'svg', xml: msg.xml, scale: 1 });
      } else if (msg.event === 'export') {
        try {
          // draw.io's canvas-based SVG export doesn't embed the XML in the SVG file.
          // We inject it ourselves as a URL-encoded "content" attribute so the file
          // is a valid .drawio.svg that can be re-edited (draw.io reads content="%3Cmxfile..." on load).
          const xml = pendingXmlRef.current;
          pendingXmlRef.current = null;
          const svgBlob = xml
            ? injectXmlIntoSvg(msg.data as string, xml)
            : dataUriToBlob(msg.data as string);
          await api.assets.upload(spaceId, targetFilename.current, svgBlob);
          onSaveRef.current(api.assets.url(spaceId, targetFilename.current));
        } catch (err) {
          setError('Could not save: ' + (err instanceof Error ? err.message : String(err)));
        }
      } else if (msg.event === 'exit') {
        onCloseRef.current();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!iframeLoaded || !loading) return;
    const timer = setTimeout(() => {
      if (loading) {
        setError('draw.io did not respond. Check the browser console for errors.');
        setLoading(false);
      }
    }, 20_000);
    return () => clearTimeout(timer);
  }, [iframeLoaded, loading]);

  return (
    <Dialog open fullScreen onClose={onClose}>
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ m: 1 }}>
            {error}
          </Alert>
        )}
        {loading && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <CircularProgress />
            <Typography variant="caption" color="text.secondary">
              {iframeLoaded ? 'Initializing draw.io…' : 'Loading draw.io…'}
            </Typography>
          </Box>
        )}
        <iframe
          ref={iframeRef}
          src="/drawio/index.html?embed=1&proto=json"
          style={{ flex: 1, border: 'none', display: loading ? 'none' : 'block', height: '100%' }}
          title="draw.io diagram editor"
          allowFullScreen
          onLoad={() => setIframeLoaded(true)}
          onError={() => {
            setError('Failed to load draw.io. Check that /drawio/index.html exists.');
            setLoading(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

/**
 * Injects mxfile XML into the SVG's "content" attribute as a URL-encoded string.
 * draw.io's extractGraphModel reads this attribute and URL-decodes it to get the XML.
 */
function injectXmlIntoSvg(dataUri: string, xml: string): Blob {
  const svgText = stripLightDark(svgFromDataUri(dataUri));
  const encoded = encodeURIComponent(xml);
  const modified = svgText.includes('content="')
    ? svgText.replace(/\bcontent="[^"]*"/, `content="${encoded}"`)
    : svgText.replace(/(<svg\b)/, `$1 content="${encoded}"`);
  return new Blob([modified], { type: 'image/svg+xml' });
}

/**
 * Extracts the mxfile XML from a .drawio.svg file's "content" attribute.
 */
function extractXmlFromDrawioSvg(svgText: string): string | null {
  const m = svgText.match(/\bcontent="([^"]*)"/);
  if (!m) return null;
  try { return decodeURIComponent(m[1]); } catch { return null; }
}

function svgFromDataUri(dataUri: string): string {
  const commaIdx = dataUri.indexOf(',');
  const meta = dataUri.slice(0, commaIdx);
  const body = dataUri.slice(commaIdx + 1);
  if (meta.includes('base64')) {
    const binary = atob(body);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder('utf-8').decode(bytes);
  }
  return decodeURIComponent(body);
}

function dataUriToBlob(dataUri: string): Blob {
  const commaIdx = dataUri.indexOf(',');
  const meta = dataUri.slice(0, commaIdx);
  const body = dataUri.slice(commaIdx + 1);
  if (meta.includes('base64')) {
    const binary = atob(body);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: 'image/svg+xml' });
  }
  return new Blob([decodeURIComponent(body)], { type: 'image/svg+xml' });
}
