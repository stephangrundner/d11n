import type { ComponentType } from "react";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import { d11nTokens } from "../../theme";
import { SpaceIcon, MoreVertIcon } from "../../icons";
import { IconTile, TagChip, VisibilityChip, AvatarStack, type Visibility, type Member } from "../primitives";

export interface SpaceCardProps {
  name: string;
  documentCount: number;
  directoryCount: number;
  /** Icon for the colored tile. Defaults to the space (workspaces) icon. */
  icon?: ComponentType<SvgIconProps>;
  /** Tile icon color. */
  color?: string;
  /** Tile background color. */
  containerColor?: string;
  tags?: string[];
  visibility?: Visibility;
  members?: Member[];
  onOpen?: () => void;
  onMenu?: () => void;
}

/**
 * A rich Space card in the Spaces overview grid: colored icon tile, name and
 * counts, tag chips, divider, and a visibility + members footer.
 * See docs/ui/content-view.md (Spaces-Übersicht).
 */
export function SpaceCard({
  name,
  documentCount,
  directoryCount,
  icon = SpaceIcon,
  color,
  containerColor,
  tags,
  visibility = "private",
  members,
  onOpen,
  onMenu,
}: SpaceCardProps) {
  return (
    <Card sx={{ boxShadow: d11nTokens.cardShadow }}>
      <CardActionArea onClick={onOpen} component="div">
        <Box sx={{ p: "20px" }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
            <IconTile icon={icon} color={color} containerColor={containerColor} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 500, fontSize: 16, color: "rgba(0,0,0,0.87)" }} noWrap>
                {name}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.6)", mt: "2px" }}>
                {documentCount} Dokumente · {directoryCount} Ordner
              </Typography>
            </Box>
            {onMenu && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onMenu();
                }}
                sx={{ color: "rgba(0,0,0,0.38)", mt: "-4px", mr: "-4px" }}
              >
                <MoreVertIcon sx={{ fontSize: 20 }} />
              </IconButton>
            )}
          </Box>

          {tags && tags.length > 0 && (
            <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" sx={{ mt: 2 }}>
              {tags.map((t) => (
                <TagChip key={t} label={t} />
              ))}
            </Stack>
          )}

          <Divider sx={{ my: "16px" }} />

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <VisibilityChip visibility={visibility} />
            {members && members.length > 0 && <AvatarStack members={members} />}
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  );
}
