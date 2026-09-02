import { GymSettings } from '../types';

let currentManifestBlobUrl: string | null = null;

// Preset SVG icon data URLs for browser favicon & PWA branding
const PRESET_SVGS: Record<string, string> = {
  dumbbell: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#a3e635" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>`,
  flame: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#a3e635" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
  trophy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#a3e635" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.45 1-1 1H7.5a1.5 1.5 0 0 0-1.5 1.5V22h12v-2.5a1.5 1.5 0 0 0-1.5-1.5H15c-.55 0-1-.45-1-1v-2.34"/><path d="M18 4H6v7a6 6 0 0 0 12 0V4z"/></svg>`,
  crown: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#a3e635" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.201a1 1 0 0 1-.957.734H5.81a1 1 0 0 1-.957-.734L2.019 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/></svg>`,
  shield: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#a3e635" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>`,
  zap: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#a3e635" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>`,
};

/**
 * Creates a clean SVG Data URL with background container for favicon/app icon
 */
export function getIconDataUrl(logoKeyOrUrl?: string): string {
  if (!logoKeyOrUrl) return '/icon.svg';

  if (logoKeyOrUrl.startsWith('http') || logoKeyOrUrl.startsWith('data:image')) {
    return logoKeyOrUrl;
  }

  const svgInner = PRESET_SVGS[logoKeyOrUrl] || PRESET_SVGS.dumbbell;
  const wrappedSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
    <rect width="64" height="64" rx="16" fill="#0A0A0A"/>
    <g transform="translate(14, 14) scale(1.5)">
      ${svgInner}
    </g>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(wrappedSvg)}`;
}

/**
 * Updates document title, meta tags, favicon, and dynamic PWA manifest in real-time
 */
export function updateDynamicBranding(settings: GymSettings) {
  if (typeof document === 'undefined') return;

  const appName = settings.name || 'Gym Pro Management';
  const tagline = settings.tagline || 'نظام إدارة الجيم الرياضي';
  const fullTitle = `${appName} | ${tagline}`;

  // 1. Update Document Title
  document.title = fullTitle;

  // 2. Update Meta Description & OpenGraph Tags
  const updateMetaTag = (selector: string, content: string, attr: 'name' | 'property' = 'name') => {
    let meta = document.querySelector(selector);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attr, selector.replace(/meta\[.*=["'](.*)["']\]/, '$1'));
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  };

  updateMetaTag('meta[name="description"]', `${appName} - ${tagline}`);
  updateMetaTag('meta[property="og:title"]', fullTitle, 'property');
  updateMetaTag('meta[property="og:description"]', `${appName} - ${tagline}`, 'property');
  updateMetaTag('meta[name="application-name"]', appName);
  updateMetaTag('meta[name="apple-mobile-web-app-title"]', appName);

  // 3. Update Favicon and Apple Touch Icon
  const iconUrl = getIconDataUrl(settings.logo);

  const updateLinkTag = (rel: string, href: string) => {
    let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = rel;
      document.head.appendChild(link);
    }
    link.href = href;
  };

  updateLinkTag('icon', iconUrl);
  updateLinkTag('shortcut icon', iconUrl);
  updateLinkTag('apple-touch-icon', iconUrl);

  // 4. Dynamically generate and apply Web App Manifest via Blob URL
  try {
    const manifestData = {
      id: '/',
      name: appName,
      short_name: appName.length > 12 ? appName.slice(0, 12) : appName,
      description: `${appName} - ${tagline}`,
      start_url: '/',
      scope: '/',
      display: 'standalone',
      orientation: 'portrait-primary',
      background_color: '#0A0A0A',
      theme_color: '#0A0A0A',
      icons: [
        {
          src: iconUrl,
          sizes: '192x192 512x512',
          type: iconUrl.startsWith('data:image/svg') ? 'image/svg+xml' : 'image/png',
          purpose: 'any',
        },
        {
          src: iconUrl,
          sizes: '192x192 512x512',
          type: iconUrl.startsWith('data:image/svg') ? 'image/svg+xml' : 'image/png',
          purpose: 'maskable',
        },
      ],
    };

    const manifestBlob = new Blob([JSON.stringify(manifestData, null, 2)], {
      type: 'application/manifest+json',
    });

    if (currentManifestBlobUrl) {
      URL.revokeObjectURL(currentManifestBlobUrl);
    }

    currentManifestBlobUrl = URL.createObjectURL(manifestBlob);

    let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    }
    manifestLink.href = currentManifestBlobUrl;
  } catch (err) {
    console.warn('Failed to update dynamic manifest blob:', err);
  }
}
