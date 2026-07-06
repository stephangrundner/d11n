import { useEffect, useRef, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { buildDrawioSvg } from "./svgUtils";

export interface DrawioSaveResult {
  /** The mxfile XML (source of truth for re-editing). */
  xml: string;
  /** The rendered .drawio.svg (XML embedded in its content attribute). */
  svg: string;
}

export interface DrawioDialogProps {
  /** mxfile XML to load, or empty for a new diagram. */
  initialXml?: string;
  /** Path to the embedded draw.io app (served from the app's /public). */
  drawioSrc?: string;
  onSave: (result: DrawioSaveResult) => void;
  onClose: () => void;
}

const EMPTY_XML = "<mxfile><diagram></diagram></mxfile>";

/**
 * Full-screen embedded draw.io editor (the self-hosted app under /public/drawio).
 * Communicates over the json/embed postMessage protocol. On save it exports an
 * SVG, embeds the XML into it, and hands both back to the caller — persistence is
 * the caller's concern (here: inline in the BlockNote document).
 */
export function DrawioDialog({ initialXml, drawioSrc = "/drawio/index.html?embed=1&proto=json", onSave, onClose }: DrawioDialogProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const onSaveRef = useRef(onSave);
  const onCloseRef = useRef(onClose);
  onSaveRef.current = onSave;
  onCloseRef.current = onClose;
  const initialXmlRef = useRef(initialXml);
  const pendingXmlRef = useRef<string | null>(null);

  const send = (msg: object) => iframeRef.current?.contentWindow?.postMessage(JSON.stringify(msg), "*");

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (typeof e.data !== "string") return;
      let msg: Record<string, unknown>;
      try {
        msg = JSON.parse(e.data);
      } catch {
        return;
      }
      if (typeof msg.event !== "string") return;

      if (msg.event === "init") {
        setLoading(false);
        send({ action: "load", autosave: 0, xml: initialXmlRef.current || EMPTY_XML });
      } else if (msg.event === "save") {
        pendingXmlRef.current = msg.xml as string;
        send({ action: "export", format: "svg", xml: msg.xml, scale: 1 });
      } else if (msg.event === "export") {
        const xml = pendingXmlRef.current ?? EMPTY_XML;
        pendingXmlRef.current = null;
        try {
          const svg = buildDrawioSvg(msg.data as string, xml);
          onSaveRef.current({ xml, svg });
        } catch (err) {
          setError("Diagramm konnte nicht gespeichert werden: " + (err instanceof Error ? err.message : String(err)));
        }
      } else if (msg.event === "exit") {
        onCloseRef.current();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    if (!iframeLoaded || !loading) return;
    const timer = setTimeout(() => {
      if (loading) {
        setError("draw.io hat nicht geantwortet. Prüfe die Browser-Konsole.");
        setLoading(false);
      }
    }, 20_000);
    return () => clearTimeout(timer);
  }, [iframeLoaded, loading]);

  return (
    <Dialog open fullScreen onClose={onClose}>
      <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column" }}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ m: 1 }}>
            {error}
          </Alert>
        )}
        {loading && (
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
            <CircularProgress />
            <Typography variant="caption" color="text.secondary">
              {iframeLoaded ? "draw.io wird initialisiert …" : "draw.io wird geladen …"}
            </Typography>
          </Box>
        )}
        <iframe
          ref={iframeRef}
          src={drawioSrc}
          style={{ flex: 1, border: "none", display: loading ? "none" : "block", height: "100%" }}
          title="draw.io Diagramm-Editor"
          allowFullScreen
          onLoad={() => setIframeLoaded(true)}
          onError={() => {
            setError("draw.io konnte nicht geladen werden. Existiert /drawio/index.html?");
            setLoading(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
