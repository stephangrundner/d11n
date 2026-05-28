'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import { api } from '@/lib/api';
import type { Space, Document } from '@/lib/types';
import { CreateSpaceDialog } from './CreateSpaceDialog';
import { CreateDocumentDialog } from './CreateDocumentDialog';

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loadingSpaces, setLoadingSpaces] = useState(true);
  const [expandedSpaces, setExpandedSpaces] = useState<Set<string>>(new Set());
  const [spaceDocuments, setSpaceDocuments] = useState<Map<string, Document[]>>(new Map());
  const [loadingDocs, setLoadingDocs] = useState<Set<string>>(new Set());
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createDocTarget, setCreateDocTarget] = useState<string | null>(null);

  const loadSpaces = useCallback(async () => {
    setLoadingSpaces(true);
    try {
      const result = await api.spaces.list();
      setSpaces(result);
    } catch {
      setSpaces([]);
    } finally {
      setLoadingSpaces(false);
    }
  }, []);

  useEffect(() => {
    loadSpaces();
  }, [loadSpaces]);

  const toggleSpace = useCallback(async (spaceId: string) => {
    const next = new Set(expandedSpaces);
    if (next.has(spaceId)) {
      next.delete(spaceId);
    } else {
      next.add(spaceId);
      if (!spaceDocuments.has(spaceId)) {
        setLoadingDocs(prev => new Set(prev).add(spaceId));
        const docs = await api.documents.list(spaceId).catch(() => []);
        setSpaceDocuments(prev => new Map(prev).set(spaceId, docs));
        setLoadingDocs(prev => { const s = new Set(prev); s.delete(spaceId); return s; });
      }
    }
    setExpandedSpaces(next);
  }, [expandedSpaces, spaceDocuments]);

  const reloadSpaceDocs = useCallback(async (spaceId: string) => {
    setLoadingDocs(prev => new Set(prev).add(spaceId));
    const docs = await api.documents.list(spaceId).catch(() => []);
    setSpaceDocuments(prev => new Map(prev).set(spaceId, docs));
    setLoadingDocs(prev => { const s = new Set(prev); s.delete(spaceId); return s; });
  }, []);

  const isActive = (href: string) => pathname === href;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Logo */}
      <Box sx={{ px: 2, py: 2 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, letterSpacing: '-0.5px', color: 'primary.main', cursor: 'pointer' }}
          onClick={() => router.push('/')}
        >
          d11n
        </Typography>
      </Box>

      <Divider />

      {/* Main navigation */}
      <List dense disablePadding sx={{ px: 1, pt: 1 }}>
        <ListItemButton selected={isActive('/')} onClick={() => router.push('/')}>
          <ListItemIcon>
            <HomeOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItemButton>
      </List>

      <Divider sx={{ mx: 2, my: 1 }} />

      {/* Spaces section header */}
      <Box sx={{ px: 2, pb: 0.5, display: 'flex', alignItems: 'center' }}>
        <Typography
          variant="caption"
          sx={{ flex: 1, color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}
        >
          Spaces
        </Typography>
        <Tooltip title="Create Space">
          <IconButton size="small" onClick={() => setCreateDialogOpen(true)} sx={{ mr: -0.5 }}>
            <AddIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Spaces tree */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 1 }}>
        {loadingSpaces ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
            <CircularProgress size={20} />
          </Box>
        ) : spaces.length === 0 ? (
          <Typography variant="caption" sx={{ px: 1, color: 'text.secondary' }}>
            No spaces yet
          </Typography>
        ) : (
          <List dense disablePadding>
            {spaces.map(space => {
              const isExpanded = expandedSpaces.has(space.id);
              const docs = spaceDocuments.get(space.id) ?? [];
              const isDocsLoading = loadingDocs.has(space.id);
              const spaceHref = `/spaces/${space.id}`;

              return (
                <Box key={space.id}>
                  <ListItemButton
                    selected={pathname.startsWith(spaceHref) && pathname === spaceHref}
                    onClick={() => toggleSpace(space.id)}
                    sx={{ pr: 0.5 }}
                  >
                    <ListItemIcon>
                      <FolderOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={space.name}
                      slotProps={{ primary: { noWrap: true } }}
                    />
                    <Tooltip title="New Document">
                      <IconButton
                        size="small"
                        onClick={e => { e.stopPropagation(); setCreateDocTarget(space.id); }}
                        sx={{ mr: 0.25 }}
                      >
                        <AddIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                    {isExpanded ? (
                      <ExpandMoreIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    ) : (
                      <ChevronRightIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    )}
                  </ListItemButton>

                  <Collapse in={isExpanded} unmountOnExit>
                    {isDocsLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                        <CircularProgress size={16} />
                      </Box>
                    ) : docs.length === 0 ? (
                      <Typography variant="caption" sx={{ pl: 5, py: 0.5, display: 'block', color: 'text.secondary' }}>
                        No documents
                      </Typography>
                    ) : (
                      <List dense disablePadding>
                        {docs.map(doc => {
                          const docHref = `/spaces/${space.id}/${doc.slug}`;
                          return (
                            <ListItemButton
                              key={doc.slug}
                              selected={isActive(docHref)}
                              onClick={() => router.push(docHref)}
                              sx={{ pl: 4 }}
                            >
                              <ListItemIcon>
                                <InsertDriveFileOutlinedIcon sx={{ fontSize: 16 }} />
                              </ListItemIcon>
                              <ListItemText
                                primary={doc.title || doc.slug}
                                slotProps={{ primary: { noWrap: true, sx: { fontSize: '0.8125rem' } } }}
                              />
                            </ListItemButton>
                          );
                        })}
                      </List>
                    )}
                  </Collapse>
                </Box>
              );
            })}
          </List>
        )}
      </Box>

      <CreateSpaceDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreated={() => {
          setCreateDialogOpen(false);
          loadSpaces();
        }}
      />

      <CreateDocumentDialog
        open={!!createDocTarget}
        spaceId={createDocTarget ?? ''}
        onClose={() => setCreateDocTarget(null)}
        onCreated={(slug) => {
          const spaceId = createDocTarget!;
          setCreateDocTarget(null);
          setExpandedSpaces(prev => new Set(prev).add(spaceId));
          reloadSpaceDocs(spaceId);
          router.push(`/spaces/${spaceId}/${slug}`);
        }}
      />
    </Box>
  );
}
