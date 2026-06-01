'use client';
import type { SxProps, Theme } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import MuiLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import NextLink from 'next/link';

export interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  crumbs: Crumb[];
  sx?: SxProps<Theme>;
}

export function AppBreadcrumbs({ crumbs, sx }: Props) {
  return (
    <Breadcrumbs sx={sx}>
      {/* Home icon — always first */}
      <MuiLink
        component={NextLink}
        href="/"
        underline="hover"
        color="text.disabled"
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        <HomeOutlinedIcon sx={{ fontSize: 14 }} />
      </MuiLink>

      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;

        // Last crumb = current page → plain text, no link
        if (isLast) {
          return (
            <Typography key={i} variant="caption" color="text.secondary">
              {crumb.label}
            </Typography>
          );
        }

        // Intermediate crumb with href → link
        if (crumb.href) {
          return (
            <MuiLink
              key={i}
              component={NextLink}
              href={crumb.href}
              underline="hover"
              color="text.disabled"
              variant="caption"
              sx={{ fontWeight: 500 }}
            >
              {crumb.label}
            </MuiLink>
          );
        }

        // Intermediate crumb without href → plain text
        return (
          <Typography key={i} variant="caption" color="text.disabled" sx={{ fontWeight: 500 }}>
            {crumb.label}
          </Typography>
        );
      })}
    </Breadcrumbs>
  );
}
