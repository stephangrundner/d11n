import { useState } from "react";
import { createReactBlockSpec } from "@blocknote/react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { d11nTokens } from "../../theme";
import { DiagramIcon, CloseIcon, ZoomInIcon, ZoomOutIcon } from "../../icons";
import { DrawioDialog } from "./DrawioDialog";
import { extractXmlFromDrawioSvg, svgToDataUri } from "./svgUtils";

/**
 * A BlockNote custom block embedding a draw.io diagram. The diagram is stored
 * inline in the block props: `xml` (mxfile, source of truth) and `svg` (rendered,
 * with the XML embedded in its content attribute). No backend/asset storage is
 * required — the document carries the diagram.
 *
 * Read mode: SVG with a click-to-zoom lightbox. Editor mode: click opens the
 * embedded draw.io editor. See docs/ui/diagram-interaction.md.
 */
export const DiagramBlock = createReactBlockSpec(
  {
    type: "diagram" as const,
    propSchema: {
      xml: { default: "" },
      svg: { default: "" },
    },
    content: "none",
  },
  {
    render: ({ block, editor }) => {
      /* eslint-disable react-hooks/rules-of-hooks */
      const [editing, setEditing] = useState(false);
      const [lightbox, setLightbox] = useState(false);
      const [scale, setScale] = useState(1);
      /* eslint-enable react-hooks/rules-of-hooks */

      const xml = block.props.xml as string;
      const svg = block.props.svg as string;
      const editable = editor.isEditable;
      const dataUri = svg ? svgToDataUri(svg) : null;

      const handleClick = () => {
        if (editable) setEditing(true);
        else if (dataUri) {
          setScale(1);
          setLightbox(true);
        }
      };

      return (
        <Box contentEditable={false} sx={{ width: "100%" }}>
          <Box
            onClick={handleClick}
            sx={{
              width: "100%",
              boxSizing: "border-box",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "12px",
              overflow: "hidden",
              bgcolor: "#fbfbfc",
              my: 1,
              cursor: editable ? "pointer" : dataUri ? "zoom-in" : "default",
              transition: "border-color 120ms",
              "&:hover": { borderColor: editable || dataUri ? d11nTokens.primary : "divider" },
            }}
          >
            {dataUri ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={dataUri}
                alt="Diagramm"
                style={{ display: "block", width: "100%", height: "auto", backgroundColor: "#fff", padding: 16, boxSizing: "border-box" }}
                draggable={false}
              />
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, p: 4, color: "text.disabled", userSelect: "none" }}>
                <DiagramIcon sx={{ fontSize: 40, opacity: 0.5, color: d11nTokens.primary }} />
                <Typography variant="body2">{editable ? "Klicken, um ein draw.io-Diagramm zu erstellen" : "Leeres Diagramm"}</Typography>
              </Box>
            )}
            <Box sx={{ display: "flex", alignItems: "center", gap: "7px", px: "14px", py: "9px", borderTop: "1px solid rgba(0,0,0,0.06)", bgcolor: "#fff", fontSize: 12, color: "rgba(0,0,0,0.5)" }}>
              <DiagramIcon sx={{ fontSize: 16, color: d11nTokens.primary }} />
              draw.io-Diagramm
              {editable && (
                <Box component="span" sx={{ ml: "auto", color: "rgba(0,0,0,0.4)" }}>
                  Klicken zum Bearbeiten
                </Box>
              )}
            </Box>
          </Box>

          {/* Editor mode: embedded draw.io */}
          {editing && (
            <DrawioDialog
              initialXml={xml || (svg ? extractXmlFromDrawioSvg(svg) ?? undefined : undefined)}
              onSave={({ xml: newXml, svg: newSvg }) => {
                editor.updateBlock(block, { props: { xml: newXml, svg: newSvg } });
                setEditing(false);
              }}
              onClose={() => setEditing(false)}
            />
          )}

          {/* Read mode: zoom lightbox */}
          {lightbox && dataUri && (
            <Dialog open fullScreen onClose={() => setLightbox(false)} slotProps={{ paper: { sx: { bgcolor: "#fff" } } }}>
              <IconButton onClick={() => setLightbox(false)} sx={{ position: "absolute", top: 12, right: 12, zIndex: 10, bgcolor: "rgba(0,0,0,0.06)", "&:hover": { bgcolor: "rgba(0,0,0,0.12)" } }}>
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "auto", p: 6 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={dataUri} alt="Diagramm" style={{ transform: `scale(${scale})`, transformOrigin: "center", transition: "transform 120ms", maxWidth: "100%" }} draggable={false} />
              </Box>
              <Box sx={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 0.5, bgcolor: "rgba(255,255,255,0.92)", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.09)", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", px: 0.5, py: 0.25 }}>
                <IconButton size="small" onClick={() => setScale((s) => Math.max(0.2, s - 0.2))}>
                  <ZoomOutIcon sx={{ fontSize: 18 }} />
                </IconButton>
                <Box component="button" type="button" onClick={() => setScale(1)} sx={{ border: "none", bgcolor: "transparent", cursor: "pointer", font: "inherit", fontSize: 13, color: "rgba(0,0,0,0.6)", px: 1 }}>
                  {Math.round(scale * 100)}%
                </Box>
                <IconButton size="small" onClick={() => setScale((s) => Math.min(5, s + 0.2))}>
                  <ZoomInIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </Dialog>
          )}
        </Box>
      );
    },
  }
);
