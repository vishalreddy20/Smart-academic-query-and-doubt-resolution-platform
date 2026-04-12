# Design System Specification: The Academic Curator

## 1. Overview & Creative North Star

### Creative North Star: "The Digital Curator"
This design system moves away from the sterile, "SaaS-standard" aesthetic toward a high-end editorial experience. It is designed for a Smart Academic Query platform where intelligence meets clarity. We treat information not as "data points" but as "curated knowledge."

**The Aesthetic Pillar: Editorial Authority**
We break the rigid, boxy nature of traditional platforms by using dramatic typographic scales, intentional asymmetry, and "breathable" layouts. The goal is to make the user feel like they are reading a premium academic journal that has been digitized for the future. We prioritize depth through tonal layering rather than structural lines, creating a UI that feels like stacked sheets of fine paper and frosted glass.

---

## 2. Colors & Atmospheric Tones

Our palette is anchored in **Deep Navy (#0F172A)** for authority and **Teal (#0D9488)** for professional trust. We use **Amber (#F59E0B)** and **Coral (#F43F5E)** sparingly as "radiant signals" to draw the eye to critical status updates.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section off content. Physical boundaries must be defined solely through background color shifts (e.g., a `surface-container-low` card sitting on a `surface` background) or subtle tonal transitions.

### Surface Hierarchy & Nesting
Depth is achieved through the physical stacking of tones. 
- **Base Layer:** `surface` (#f7f9fb)
- **Secondary Sections:** `surface-container-low` (#f2f4f6)
- **Primary Cards/Containers:** `surface-container-lowest` (#ffffff)
- **High-Impact Floating Elements:** Use **Glassmorphism** (Semi-transparent `surface_container_lowest` with a 12px-20px backdrop-blur) to create a sense of lightness and premium polish.

### Signature Textures
Main CTAs and Hero backgrounds should never be a flat hex code. Use a subtle linear gradient (135°) transitioning from `primary` (#000000) to `primary_container` (#131b2e) to provide a "soul" and visual depth that flat colors lack.

---

## 3. Typography: The Editorial Voice

We pair the classical elegance of **Newsreader** (Serif) for headings with the functional precision of **Inter** (Sans-serif) for utility.

| Level | Token | Font Family | Size | Character |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | Newsreader | 3.5rem | High-contrast, dramatic. Used for Hero moments. |
| **Headline** | `headline-md` | Newsreader | 1.75rem | Academic authority for section titles. |
| **Title** | `title-lg` | Inter | 1.375rem | Semibold. For card headings and query titles. |
| **Body** | `body-md` | Inter | 0.875rem | High readability, generous line-height (1.6). |
| **Label** | `label-md` | Inter | 0.75rem | Uppercase with 0.05em tracking for metadata. |

---

## 4. Elevation & Depth: Tonal Layering

We reject traditional structural lines in favor of **The Layering Principle**.

*   **Ambient Shadows:** For floating elements (Modals/Popovers), use the "Ghost Shadow": `0px 20px 40px rgba(15, 23, 42, 0.06)`. The shadow must be a tinted version of the `on-surface` color, never pure black.
*   **The Ghost Border Fallback:** If a boundary is required for accessibility (e.g., input fields), use `outline-variant` at **20% opacity**. 100% opaque borders are forbidden as they "choke" the editorial flow.
*   **Glassmorphism:** To elevate the "Smart Academic" feel, use semi-transparent surface tokens for navigation bars or floating action buttons, allowing the atmospheric background gradients to bleed through.

---

## 5. Component Architecture

### Buttons: The Action Drivers
*   **Primary:** Gradient fill (`primary` to `primary_container`), `md` radius (0.75rem). Hover state: Slight scale-up (1.02) and increased shadow spread.
*   **Secondary:** `surface_container_high` background with `on_surface` text. No border.
*   **Tertiary:** Ghost style. Underline appears only on hover to maintain editorial cleanliness.

### Cards: The Knowledge Containers
*   **Construction:** Use `surface_container_lowest` (white) on a `surface` background. 
*   **Spacing:** Internal padding must follow the `6` (2rem) or `8` (2.75rem) spacing tokens.
*   **Rule:** No dividers. Use vertical white space (`spacing-4`) to separate the header from the content.

### Inputs & Fields
*   **State:** Default state uses `surface_container_low`. On focus, transition to `surface_container_lowest` with a subtle Teal (`secondary`) "Ghost Border."
*   **Micro-copy:** Helper text should use `label-sm` in `on_surface_variant` to keep the focus on the user's input.

### Academic Status Badges (Chips)
*   **Open:** `secondary_container` background with `on_secondary_container` text.
*   **Claimed:** `primary_container` (Deep Navy) background with `primary_fixed_dim` text.
*   **Resolved:** `surface_container_highest` background with `on_surface_variant` (The "Archived" look).

---

## 6. Global Tokens

### Spacing Scale (The 0.7rem Rhythm)
We use a non-standard rhythm to create a custom "feel."
- `3`: 1rem (Small utility gaps)
- `4`: 1.4rem (Standard gutter)
- `6`: 2rem (Section padding)
- `10`: 3.5rem (Hero margins)

### Roundedness (The Soft Academic Edge)
- `sm`: 0.25rem (Checkboxes/Inner components)
- `DEFAULT`: 0.5rem (Buttons)
- `md`: 0.75rem (Standard Cards)
- `xl`: 1.5rem (Feature Containers/Search Bars)

---

## 7. Do's and Don'ts

### Do
*   **DO** use asymmetry. Align a large serif headline to the left and body text to a narrower column on the right.
*   **DO** use "Ink" (#0F172A) for body text instead of pure black to maintain a premium feel.
*   **DO** use background color shifts to define hierarchy.

### Don't
*   **DON'T** use 1px dividers to separate list items. Use `spacing-2` or `spacing-3` of empty space.
*   **DON'T** use heavy drop shadows. If a card doesn't look elevated enough, change its background tone rather than adding a shadow.
*   **DON'T** use bright, saturated colors for large surfaces. Keep the "energetic" colors (Amber/Coral) restricted to small, meaningful UI signals.