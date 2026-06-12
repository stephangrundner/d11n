'use client';
import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { api, ForbiddenError, NetworkError } from '@/lib/api';
import type { EmailSettings, EmailSettingsRequest } from '@/lib/types';
import { useNotify } from '@/contexts/NotificationContext';

type FormState = {
  enabled: boolean;
  smtpHost: string;
  smtpPort: string;
  smtpUsername: string;
  smtpPassword: string;
  smtpFrom: string;
  smtpFromName: string;
  smtpTls: boolean;
  smtpAuth: boolean;
};

function toForm(s: EmailSettings): FormState {
  return {
    enabled:      s.enabled,
    smtpHost:     s.smtpHost     ?? '',
    smtpPort:     String(s.smtpPort ?? 587),
    smtpUsername: s.smtpUsername ?? '',
    smtpPassword: '',
    smtpFrom:     s.smtpFrom     ?? '',
    smtpFromName: s.smtpFromName ?? '',
    smtpTls:      s.smtpTls,
    smtpAuth:     s.smtpAuth,
  };
}

function isDirty(form: FormState, original: EmailSettings): boolean {
  return (
    form.enabled      !== original.enabled      ||
    form.smtpHost     !== (original.smtpHost     ?? '') ||
    form.smtpPort     !== String(original.smtpPort ?? 587) ||
    form.smtpUsername !== (original.smtpUsername ?? '') ||
    form.smtpPassword !== '' ||
    form.smtpFrom     !== (original.smtpFrom     ?? '') ||
    form.smtpFromName !== (original.smtpFromName ?? '') ||
    form.smtpTls      !== original.smtpTls ||
    form.smtpAuth     !== original.smtpAuth
  );
}

export function EmailPanel() {
  const notify = useNotify();
  const [settings, setSettings] = useState<EmailSettings | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testTo, setTestTo] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.admin.settings.email.get();
      setSettings(data);
      setForm(toForm(data));
    } catch (err) {
      if (err instanceof ForbiddenError) setForbidden(true);
      else if (!(err instanceof NetworkError)) notify('Could not load email settings.', 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { load(); }, [load]);

  const set = (patch: Partial<FormState>) =>
    setForm(prev => prev ? { ...prev, ...patch } : prev);

  const handleSave = async () => {
    if (!form || !settings) return;
    setSaving(true);
    try {
      const req: EmailSettingsRequest = {
        enabled:      form.enabled,
        smtpHost:     form.smtpHost,
        smtpPort:     Number(form.smtpPort) || 587,
        smtpUsername: form.smtpUsername,
        smtpPassword: form.smtpPassword || null,
        smtpFrom:     form.smtpFrom,
        smtpFromName: form.smtpFromName,
        smtpTls:      form.smtpTls,
        smtpAuth:     form.smtpAuth,
      };
      const updated = await api.admin.settings.email.update(req);
      setSettings(updated);
      setForm(toForm(updated));
      notify('Email settings saved.', 'success');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Could not save email settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!testTo.trim()) return;
    setSendingTest(true);
    try {
      await api.admin.settings.email.sendTest(testTo.trim());
      notify(`Test email sent to ${testTo.trim()}.`, 'success');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Could not send test email.', 'error');
    } finally {
      setSendingTest(false);
    }
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
          The ADMIN or SUPERUSER role is required to manage email settings.
        </Typography>
      </Box>
    );
  }

  if (!form || !settings) return null;

  const dirty = isDirty(form, settings);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

      {/* Enable toggle */}
      <FormControlLabel
        control={
          <Switch
            checked={form.enabled}
            onChange={e => set({ enabled: e.target.checked })}
            size="small"
          />
        }
        label={<Typography variant="body2">Enable email sending</Typography>}
        sx={{ ml: 0 }}
      />

      <Divider />

      {/* SMTP server */}
      <SectionLabel>SMTP Server</SectionLabel>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 1.5 }}>
        <TextField
          label="Host"
          value={form.smtpHost}
          onChange={e => set({ smtpHost: e.target.value })}
          size="small"
          placeholder="smtp.example.com"
          disabled={saving}
        />
        <TextField
          label="Port"
          value={form.smtpPort}
          onChange={e => set({ smtpPort: e.target.value })}
          size="small"
          slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '[0-9]*' } }}
          disabled={saving}
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <FormControlLabel
          control={<Switch checked={form.smtpTls} onChange={e => set({ smtpTls: e.target.checked })} size="small" disabled={saving} />}
          label={<Typography variant="body2">STARTTLS</Typography>}
          sx={{ ml: 0 }}
        />
        <FormControlLabel
          control={<Switch checked={form.smtpAuth} onChange={e => set({ smtpAuth: e.target.checked })} size="small" disabled={saving} />}
          label={<Typography variant="body2">Authentication</Typography>}
          sx={{ ml: 0 }}
        />
      </Box>

      <Divider />

      {/* Credentials */}
      <SectionLabel>Credentials</SectionLabel>
      <TextField
        label="Username"
        value={form.smtpUsername}
        onChange={e => set({ smtpUsername: e.target.value })}
        size="small"
        disabled={saving}
        fullWidth
      />
      <TextField
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={form.smtpPassword}
        onChange={e => set({ smtpPassword: e.target.value })}
        size="small"
        disabled={saving}
        fullWidth
        placeholder={settings.passwordSet ? '•••••••• (unchanged)' : ''}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title={showPassword ? 'Hide' : 'Show'}>
                  <IconButton size="small" onClick={() => setShowPassword(v => !v)} edge="end">
                    {showPassword
                      ? <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                      : <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />}
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          },
        }}
      />

      <Divider />

      {/* Sender */}
      <SectionLabel>Sender</SectionLabel>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
        <TextField
          label="From email"
          value={form.smtpFrom}
          onChange={e => set({ smtpFrom: e.target.value })}
          size="small"
          placeholder="noreply@example.com"
          disabled={saving}
        />
        <TextField
          label="From name"
          value={form.smtpFromName}
          onChange={e => set({ smtpFromName: e.target.value })}
          size="small"
          placeholder="d11n"
          disabled={saving}
        />
      </Box>

      {/* Save */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          size="small"
          disableElevation
          onClick={handleSave}
          disabled={!dirty || saving}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}
        >
          Save
        </Button>
      </Box>

      <Divider />

      {/* Test email */}
      <SectionLabel>Send test email</SectionLabel>
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
        <TextField
          label="Recipient"
          value={testTo}
          onChange={e => setTestTo(e.target.value)}
          size="small"
          placeholder="you@example.com"
          disabled={sendingTest}
          onKeyDown={e => { if (e.key === 'Enter') handleSendTest(); }}
          sx={{ flex: 1 }}
        />
        <Button
          variant="outlined"
          size="small"
          onClick={handleSendTest}
          disabled={!testTo.trim() || sendingTest}
          startIcon={sendingTest
            ? <CircularProgress size={14} color="inherit" />
            : <SendOutlinedIcon sx={{ fontSize: 16 }} />}
          sx={{ whiteSpace: 'nowrap', mt: '2px' }}
        >
          Send test
        </Button>
      </Box>

    </Box>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      variant="caption"
      sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.68rem' }}
    >
      {children}
    </Typography>
  );
}
