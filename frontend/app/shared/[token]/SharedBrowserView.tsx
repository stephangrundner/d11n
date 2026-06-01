'use client';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import PublicIcon from '@mui/icons-material/Public';
import type { ShareInfo, TreeNode } from '@/lib/types';

interface Props {
  tree: TreeNode[];
  share: ShareInfo;
}

function TreeRows({ nodes, depth = 0 }: { nodes: TreeNode[]; depth?: number }) {
  return (
    <>
      {nodes.map(node => (
        <Box key={node.path}>
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            px: 1.5, py: 0.875,
            pl: 1.5 + depth * 2.5,
            '&:not(:last-child)': { borderBottom: '1px solid', borderColor: 'divider' },
          }}>
            {node.type === 'folder'
              ? <FolderOutlinedIcon sx={{ fontSize: 18, color: 'primary.main', flexShrink: 0 }} />
              : <InsertDriveFileOutlinedIcon sx={{ fontSize: 18, color: 'text.disabled', flexShrink: 0 }} />}
            <Typography variant="body2" sx={{ fontWeight: node.type === 'folder' ? 500 : 400 }}>
              {node.type === 'folder' ? node.name : (node.title || node.name)}
            </Typography>
          </Box>
          {node.type === 'folder' && node.children && node.children.length > 0 && (
            <TreeRows nodes={node.children} depth={depth + 1} />
          )}
        </Box>
      ))}
    </>
  );
}

export default function SharedBrowserView({ tree, share }: Props) {
  const title = share.resourceType === 'space'
    ? share.spaceId
    : (share.resourcePath?.split('/').pop() ?? share.spaceId);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Banner */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
        py: 0.75, px: 2,
        bgcolor: 'action.hover',
        borderBottom: '1px solid', borderColor: 'divider',
      }}>
        <PublicIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary">
          Shared {share.resourceType}{share.label ? ` · ${share.label}` : ''}
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 720, mx: 'auto', px: { xs: 3, sm: 5, md: 8 }, pt: 6, pb: 16 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          {title}
        </Typography>

        <Divider sx={{ mb: 0.5 }} />

        {tree.length === 0 && (
          <Typography variant="body2" color="text.disabled" sx={{ py: 4, textAlign: 'center' }}>
            This folder is empty.
          </Typography>
        )}

        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
          <TreeRows nodes={tree} />
        </Box>
      </Box>
    </Box>
  );
}
