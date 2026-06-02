'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { api, ForbiddenError, NetworkError } from '@/lib/api';
import type { RoleInfo } from '@/lib/types';
import { useNotify } from '@/contexts/NotificationContext';

// ── Permission catalogue ──────────────────────────────────────────────────────

interface PermissionDef { key: string; label: string }
interface PermissionGroup { label: string; permissions: PermissionDef[] }

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    label: 'Spaces',
    permissions: [
      { key: 'SPACE_CREATE', label: 'Create spaces' },
      { key: 'SPACE_WRITE',  label: 'Edit space settings' },
      { key: 'SPACE_DELETE', label: 'Delete spaces' },
    ],
  },
  {
    label: 'Documents',
    permissions: [
      { key: 'DOCUMENT_CREATE', label: 'Create documents' },
      { key: 'DOCUMENT_WRITE',  label: 'Edit documents' },
      { key: 'DOCUMENT_DELETE', label: 'Delete documents' },
    ],
  },
  {
    label: 'Folders',
    permissions: [
      { key: 'FOLDER_WRITE',  label: 'Create & rename folders' },
      { key: 'FOLDER_DELETE', label: 'Delete folders' },
    ],
  },
  {
    label: 'Shares',
    permissions: [
      { key: 'SHARE_CREATE', label: 'Create share links' },
      { key: 'SHARE_REVOKE', label: 'Revoke share links' },
    ],
  },
  {
    label: 'Administration',
    permissions: [
      { key: 'ADMIN_ROLES', label: 'Manage roles' },
      { key: 'ADMIN_USERS', label: 'Manage users' },
    ],
  },
];

const VALID_NAME = /^[A-Z][A-Z0-9_]*$/;

// ── Main panel ────────────────────────────────────────────────────────────────

export function RolesPanel() {
  const notify = useNotify();
  const [roles, setRoles] = useState<RoleInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRoles(await api.admin.roles.list());
    } catch (err) {
      if (err instanceof ForbiddenError) setForbidden(true);
      else if (!(err instanceof NetworkError)) notify('Could not load roles.', 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (adding) inputRef.current?.focus(); }, [adding]);

  const handleStartAdding = () => { setNewName(''); setNameError(null); setAdding(true); };
  const handleCancelAdding = () => { setAdding(false); setNewName(''); setNameError(null); };

  const handleSubmit = async () => {
    const name = newName.trim().toUpperCase();
    if (!name) { setNameError('Name is required.'); return; }
    if (!VALID_NAME.test(name)) { setNameError('Only uppercase letters, digits and underscores. Must start with a letter.'); return; }
    setSubmitting(true);
    try {
      const created = await api.admin.roles.create(name);
      setRoles(prev => [...prev, created]);
      setAdding(false);
      setNewName('');
      setExpandedId(created.id);
      notify(`Role "${created.name}" created.`, 'success');
    } catch (err) {
      setNameError(err instanceof Error ? err.message : 'Could not create role.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (role: RoleInfo) => {
    setDeletingId(role.id);
    try {
      await api.admin.roles.delete(role.id);
      setRoles(prev => prev.filter(r => r.id !== role.id));
      if (expandedId === role.id) setExpandedId(null);
      notify(`Role "${role.name}" deleted.`, 'info');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Could not delete role.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handlePermissionsSaved = (updated: RoleInfo) => {
    setRoles(prev => prev.map(r => r.id === updated.id ? updated : r));
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}><CircularProgress size={24} /></Box>;
  }

  if (forbidden) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, pt: 6, color: 'text.disabled' }}>
        <LockOutlinedIcon sx={{ fontSize: 40 }} />
        <Typography variant="body2" sx={{ fontWeight: 500 }}>Access denied</Typography>
        <Typography variant="caption" sx={{ textAlign: 'center' }}>
          The ADMIN or SUPERUSER role is required to manage roles.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {roles.map(role => (
        <Box key={role.id} sx={{ border: '1px solid', borderColor: expandedId === role.id ? 'primary.main' : 'divider', borderRadius: 1.5, overflow: 'hidden', transition: 'border-color 120ms' }}>
          {/* Row header */}
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
            onClick={() => setExpandedId(prev => prev === role.id ? null : role.id)}
          >
            <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 18, color: role.builtin ? 'primary.main' : 'text.secondary', flexShrink: 0 }} />
            <Typography variant="body2" sx={{ flex: 1, fontWeight: 500, fontFamily: 'monospace', fontSize: '0.8125rem' }}>
              {role.name}
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ mr: 0.5 }}>
              {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
            </Typography>
            {role.builtin
              ? <Chip label="System" size="small" sx={{ height: 20, fontSize: '0.68rem', bgcolor: 'primary.50', color: 'primary.main', '& .MuiChip-label': { px: 1 }, mr: 0.5 }} />
              : (
                <Tooltip title="Delete role" placement="left">
                  <span>
                    <IconButton
                      size="small"
                      onClick={e => { e.stopPropagation(); handleDelete(role); }}
                      disabled={deletingId === role.id}
                      sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}
                    >
                      {deletingId === role.id
                        ? <CircularProgress size={14} color="inherit" />
                        : <DeleteOutlinedIcon sx={{ fontSize: 16 }} />}
                    </IconButton>
                  </span>
                </Tooltip>
              )
            }
            {expandedId === role.id
              ? <ExpandLessIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              : <ExpandMoreIcon sx={{ fontSize: 18, color: 'text.secondary' }} />}
          </Box>

          {/* Permission editor */}
          <Collapse in={expandedId === role.id} unmountOnExit>
            <Divider />
            <PermissionEditor role={role} onSaved={handlePermissionsSaved} />
          </Collapse>
        </Box>
      ))}

      {/* Inline add form */}
      {adding && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, px: 1.5, py: 1, borderRadius: 1.5, border: '1px solid', borderColor: 'primary.main', bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 18, color: 'primary.main', flexShrink: 0 }} />
            <InputBase
              inputRef={inputRef}
              value={newName}
              onChange={e => { setNewName(e.target.value.toUpperCase()); setNameError(null); }}
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); if (e.key === 'Escape') handleCancelAdding(); }}
              placeholder="ROLE_NAME"
              disabled={submitting}
              sx={{ flex: 1, fontFamily: 'monospace', fontSize: '0.8125rem', '& input': { p: 0 } }}
            />
            <Tooltip title="Confirm">
              <span>
                <IconButton size="small" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? <CircularProgress size={14} /> : <CheckIcon sx={{ fontSize: 16 }} />}
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Cancel">
              <IconButton size="small" onClick={handleCancelAdding} disabled={submitting}>
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
          {nameError && <Typography variant="caption" color="error" sx={{ pl: 3.5 }}>{nameError}</Typography>}
        </Box>
      )}

      {/* Add button */}
      {!adding && (
        <Box
          component="button"
          onClick={handleStartAdding}
          sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.875, borderRadius: 1.5, border: '1px dashed', borderColor: 'divider', bgcolor: 'transparent', cursor: 'pointer', width: '100%', color: 'text.secondary', transition: 'all 120ms', '&:hover': { borderColor: 'primary.main', color: 'primary.main', bgcolor: 'primary.50' } }}
        >
          <AddOutlinedIcon sx={{ fontSize: 16 }} />
          <Typography variant="body2">New role</Typography>
        </Box>
      )}
    </Box>
  );
}

// ── Permission editor (inside collapsed row) ──────────────────────────────────

interface PermissionEditorProps {
  role: RoleInfo;
  onSaved: (updated: RoleInfo) => void;
}

function PermissionEditor({ role, onSaved }: PermissionEditorProps) {
  const notify = useNotify();
  const [selected, setSelected] = useState<Set<string>>(() => new Set(role.permissions));
  const [saving, setSaving] = useState(false);
  const readonly = role.builtin;

  const toggle = (key: string) => {
    if (readonly) return;
    setSelected(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api.admin.roles.setPermissions(role.id, [...selected]);
      onSaved(updated);
      notify('Permissions saved.', 'success');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Could not save permissions.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const isDirty = [...selected].sort().join() !== [...role.permissions].sort().join();

  return (
    <Box sx={{ px: 2, pt: 1.5, pb: 2 }}>
      {readonly && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, fontStyle: 'italic' }}>
          Built-in role — permissions are managed by the system and cannot be changed.
        </Typography>
      )}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 0 }}>
        {PERMISSION_GROUPS.map((group, gi) => (
          <Box key={group.label} sx={{ mb: gi < PERMISSION_GROUPS.length - 1 ? 1.5 : 0 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.68rem', display: 'block', mb: 0.5 }}>
              {group.label}
            </Typography>
            <FormGroup>
              {group.permissions.map(p => (
                <FormControlLabel
                  key={p.key}
                  control={
                    <Checkbox
                      size="small"
                      checked={selected.has(p.key)}
                      onChange={() => toggle(p.key)}
                      disabled={readonly || saving}
                      sx={{ py: 0.25 }}
                    />
                  }
                  label={<Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>{p.label}</Typography>}
                  sx={{ ml: 0 }}
                />
              ))}
            </FormGroup>
          </Box>
        ))}
      </Box>
      {!readonly && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            size="small"
            variant="contained"
            disableElevation
            onClick={handleSave}
            disabled={!isDirty || saving}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}
          >
            Save
          </Button>
        </Box>
      )}
    </Box>
  );
}
