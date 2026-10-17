---
name: CivicPulse
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#44474c'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#74777d'
  outline-variant: '#c4c6cd'
  surface-tint: '#4f6073'
  primary: '#041627'
  on-primary: '#ffffff'
  primary-container: '#1a2b3c'
  on-primary-container: '#8192a7'
  inverse-primary: '#b7c8de'
  secondary: '#785900'
  on-secondary: '#ffffff'
  secondary-container: '#fdc003'
  on-secondary-container: '#6c5000'
  tertiary: '#2b0033'
  on-tertiary: '#ffffff'
  tertiary-container: '#4c0059'
  on-tertiary-container: '#d560e6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d2e4fb'
  primary-fixed-dim: '#b7c8de'
  on-primary-fixed: '#0b1d2d'
  on-primary-fixed-variant: '#38485a'
  secondary-fixed: '#ffdf9e'
  secondary-fixed-dim: '#fabd00'
  on-secondary-fixed: '#261a00'
  on-secondary-fixed-variant: '#5b4300'
  tertiary-fixed: '#ffd6fe'
  tertiary-fixed-dim: '#f9abff'
  on-tertiary-fixed: '#35003f'
  on-tertiary-fixed-variant: '#7b008f'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  headline-lg:
    fontFamily: Public Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Public Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Public Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Public Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Public Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Public Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-margin: 24px
  gutter: 16px
  touch-target-min: 48px
---

## Brand & Style
The design system is centered on the "Digital Town Square" concept, balancing institutional trust with community warmth. It serves as a bridge between citizens and their physical environment, necessitating a style that is both authoritative and approachable.

The aesthetic follows a **Modern / Corporate** direction with a focus on high-utility clarity. It prioritizes information density for map-based interactions while maintaining enough whitespace to ensure the UI feels calm and navigable for users of all ages, including elderly citizens. The visual language uses clean lines, purposeful color-coding, and subtle depth to guide the eye toward actionable community insights.

## Colors
The palette is strategically segmented into functional categories to aid quick recognition on a map:

- **Primary (Deep Navy):** Used for core navigation, headers, and primary administrative actions. It evokes stability and officiality.
- **Memories (Warm Gold):** Applied to community stories and historical anecdotes, creating a nostalgic and warm feeling.
- **Heritage (Regal Purple):** Reserved for landmarks, cultural preservation, and protected sites.
- **Safety Issues (Clear Red):** A high-visibility alert color for reporting hazards or infrastructure concerns.
- **Accessibility (Bright Blue):** Used for mobility-related updates, ramp locations, and inclusive design markers.

Background surfaces should remain neutral (whites and soft greys) to allow these category colors to serve as effective wayfinding signals.

## Typography
This design system utilizes **Public Sans**, an open-source typeface designed for government and institutional use. It is chosen for its exceptional legibility, neutral tone, and accessibility features.

- **Headlines:** Use Bold and Semi-Bold weights to create clear hierarchy. On mobile, headlines scale down to ensure they don't dominate the map view.
- **Body:** Set at 16px (Medium) or 18px (Large) to ensure readability for users with varying visual acuity. 
- **Labels:** Used for map markers, navigation tabs, and metadata.
- **Line Heights:** Generous line-heights are maintained throughout to prevent visual crowding in information-dense areas like report descriptions.

## Layout & Spacing
The layout uses a **Fluid Grid** for the main map interface, allowing the map to fill the viewport while UI overlays (drawers, sidebars, search bars) occupy fixed-width containers.

- **Desktop:** A 12-column grid with 24px gutters. Detailed information panels appear in a side drawer (400px fixed width).
- **Mobile:** Elements use a single-column layout with 16px margins. Information is served through "Bottom Sheets" to allow for easy one-handed operation.
- **Rhythm:** An 8px base unit governs all padding and margins. Every interactive element (buttons, icons) must respect a minimum touch target of 48px to accommodate elderly users and mobile interaction.

## Elevation & Depth
Depth is used to distinguish the "interactive layer" from the "map layer."

- **The Map Base:** The lowest elevation, flat and non-moving.
- **Map Markers:** Subtle shadows are used to lift pins off the map, ensuring visibility across varied terrain colors.
- **Floating UI:** Search bars and action buttons use **Ambient Shadows** (15% opacity, 8px blur, 4px Y-offset) to appear as if floating above the map.
- **Surface Containers:** Modals and bottom sheets use a "Tonal Layer" approach, utilizing white backgrounds with thin, light grey borders (#E0E0E0) instead of heavy shadows to maintain a clean, modern feel.

## Shapes
The design system employs **Rounded** corners to evoke a friendly, community-oriented feeling.

- **Standard Elements (Buttons, Inputs):** 8px corner radius.
- **Containers (Cards, Sidebars):** 12px (rounded-lg) corner radius.
- **Bottom Sheets:** 24px (rounded-xl) top-only radius for a soft, tactile pull-up experience.
- **Icon Buttons:** Circular (pill-shaped) to distinguish them from primary action buttons.

## Components
- **Buttons:** Primary buttons use the Navy (#1A2B3C) with white text. Secondary buttons for categories (e.g., "Add Memory") use a ghost style with a colored border and icon matching the category color.
- **Map Pins:** Custom teardrop pins with category icons in the center. The pin tail should be sharp to point exactly at the location, while the head is rounded.
- **Cards:** Used in search results and "Memories" feeds. Cards feature 12px corners, a subtle 1px border, and generous internal padding (20px).
- **Input Fields:** Large, 48px height fields with 8px rounded corners. The focus state uses a 2px Navy border to ensure accessibility.
- **Chips:** Used for filtering categories. When active, they take on the full category color; when inactive, they are light grey with a colored label.
- **Bottom Sheets (Mobile):** The primary container for viewing details. They must include a clear "drag handle" at the top and be dismissible via a downward swipe or a "Close" icon.
- **Status Indicators:** Vibrant, pill-shaped badges for "Safety" (Red) and "Accessibility" (Blue) to provide immediate context on report status.