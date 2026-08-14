# TimeStem Web

**Every tap builds your day.**

TimeStem Web is the public browser/PWA front-end for the TimeStem product family by Lang Systems. One shared shell can switch between domain variants while keeping the interaction model familiar:

**tap → timestamp/timer → timeline → summary**

https://langzonedev.github.io/TimeStemWeb/

## Variants

- **Family** — caregiving and household activity tracking
- **Enterprise** — work activities, time codes and weekly work logs
- **Sport** — training, drills, recovery and event tracking

The active variant changes wording, quick actions, summaries and colour accents without changing the core navigation or interaction pattern.

## Architecture

This repository is intentionally public and contains only client-side presentation, local browser state and non-sensitive product logic. Proprietary algorithms, credentials, enterprise integrations, private organisation configuration and other protected IP must not be committed here. Where protected behaviour is required, the public client should call a private service/interface whose implementation can live in a private Lang Systems repository such as `TimeStemEnterprise`.

The first version is deliberately backend-free and stores each variant's data separately in `localStorage`.

## Development goals

1. provide a fast UX proving ground for the TimeStem family;
2. keep web and native Android behaviour aligned through shared product contracts;
3. deploy automatically to GitHub Pages from `main`;
4. remain responsive and installable as a PWA;
5. preserve TimeStem's low-friction, one-tap experience.

## Local use

Open `index.html` through any static web server. No build step or package installation is required.

## Deployment

`.github/workflows/pages.yml` deploys the repository root to GitHub Pages on pushes to `main`.

## Security boundary

Assume every byte in this repository is public. Never store secrets, API keys, private datasets, proprietary scoring/decision algorithms or customer-specific configuration in the client.
