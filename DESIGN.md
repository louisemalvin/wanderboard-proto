---
name: Wanderboard
description: Your travel board, organized.
colors:
  primary: "#2E6F40"
  primary-hover: "#245A34"
  selected-surface: "#E7F1E8"
  selected-border: "#BFCDBF"
  app-bg: "#F7F4EF"
  surface: "#FFFDFC"
  clay-surface: "#F0DAD5"
  ink: "#1F2A22"
  muted: "#667066"
  border: "#DED6CC"
  field-border: "#DED6CC"
  trail-amber: "#C47A3D"
  success: "#10b981"
  warning: "#f59e0b"
  error: "#ef4444"
typography:
  display:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.45
  title:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.4
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.35
rounded:
  md: "6px"
  lg: "8px"
  xl: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.surface}"
    rounded: "{rounded.lg}"
  input-default:
    backgroundColor: "{colors.app-bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
  card-default:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "16px"
---

# Design System: Wanderboard

## 1. Overview

**Creative North Star: "The Quiet Planning Desk"**

Wanderboard is a restrained product interface for turning uncertain travel ideas into a usable board. The system should feel polished, simple, and elegant: closer to Figma or Notion than a travel brochure. It supports exploration without spectacle, keeping the map, planner panels, and itinerary review in a calm shared workspace.

The visual system is light, natural, and planner-first: mist backgrounds, near-white panels, forest green for decisions, and clay warmth for context. Surfaces are flat, readable, and task-first. The product explicitly rejects over-decorated AI/SaaS clichés, heavy gradients, default glassmorphism, travel-agency brochure aesthetics, noisy map UI, and novelty that competes with planning.

**Key Characteristics:**
- Restrained light product UI with a rare, functional forest accent.
- Dense enough for planning, never cluttered for decoration.
- Familiar controls, clear recovery states, and readable map-adjacent panels.
- Full-screen itinerary review when review is the primary task.

## 2. Colors

The palette is a quiet field-notebook workspace with forest green used as a functional signal, not decoration.

### Primary
- **Forest Action**: Used for primary actions, selected places, preview links, map markers, and active states. Its job is orientation and commitment.
- **Forest Hover**: Used only for hover/active states on primary controls.

### Secondary
- **Semantic Green / Amber / Red**: Used for saved, unsaved/warning, and failed/error states. These colors must be paired with text or icons; never rely on color alone.

### Tertiary
- **Category Chip Colors**: Forest, clay, orange, amber, red, and neutral tints appear in place-type badges. They should remain small, label-sized accents, not page-level palette roles.

### Neutral
- **Mist Background**: The outer planning canvas and start page base.
- **Panel Surface**: Cards, panels, fields, overlays, and top bars.
- **Clay Surface**: Secondary warmth for callouts, contextual chips, and gentle contrast.
- **Ink**: Primary readable text.
- **Muted Text**: Secondary descriptions and metadata; verify contrast before using on tinted backgrounds.
- **Border / Field Border**: Structure and separation in place of heavy shadow.

### Named Rules
**The Quiet Accent Rule.** Forest green should cover less than 10% of a typical screen. If the screen starts looking green, the accent has failed.

**The Light Workspace Rule.** Wanderboard is primarily light. Do not add dark-mode branches unless there is a product requirement for them.

**The Contrast Before Elegance Rule.** Muted text must remain readable at WCAG AA contrast. Light gray elegance is not allowed to make planning harder.

## 3. Typography

**Display Font:** Geist, with system-ui fallback  
**Body Font:** Geist, with system-ui fallback  
**Label/Mono Font:** Geist Mono only for technical identifiers if needed

**Character:** One clean sans family carries the product. The type system is precise, compact, and familiar, matching a workflow tool rather than a campaign page.

### Hierarchy
- **Display** (700, 30px, 1.2): Product name and rare empty-state hero headings.
- **Headline** (600, 18px, 1.45): Dialog titles, major empty/error states, and itinerary section headers.
- **Title** (500, 14px, 1.4): Card titles, place names, toolbar labels, and panel headings.
- **Body** (400, 14px, 1.5): Descriptions, itinerary prose, errors, and form content. Cap long prose at 65-75ch.
- **Label** (500, 12px, 1.35): Field labels, metadata, badges, tabs, and compact status text.

### Named Rules
**The Product Scale Rule.** Do not use fluid display typography in planner UI. Fixed, predictable type sizes keep panels and controls stable.

## 4. Elevation

Wanderboard is flat by default. Depth is conveyed through tonal layering, borders, and containment. Shadows are light and structural: `shadow-sm` for cards and subtle hover feedback, not atmospheric decoration.

### Shadow Vocabulary
- **Surface Lift** (`0 1px 2px rgba(0, 0, 0, 0.05)`): Used on start-page cards or clickable place cards when a surface needs a small amount of separation.
- **Overlay Backdrop** (`rgba(0, 0, 0, 0.30)`): Used behind the full-screen itinerary preview to make review the current task.

### Named Rules
**The Flat-by-Default Rule.** Surfaces rest on borders and tonal layers. Shadows appear only for cards, hover feedback, or overlays.

## 5. Components

### Buttons
- **Shape:** Gently rounded product controls (8px radius).
- **Primary:** Forest Action background with white text, medium weight, and compact padding.
- **Hover / Focus:** Darken forest green on hover; use visible focus rings with enough contrast.
- **Secondary / Ghost:** Text or neutral hover backgrounds for toolbar actions, back links, and preview actions.

### Chips
- **Style:** Small rounded pills with tinted backgrounds and dark readable text.
- **State:** Category chips are labels, not controls, unless explicitly wired as filters.

### Cards / Containers
- **Corner Style:** 8px for compact planner items, 12px for larger start-page cards.
- **Background:** White or zinc surfaces with borders.
- **Shadow Strategy:** Flat by default, `shadow-sm` only where separation is needed.
- **Border:** Zinc borders are the main structural device.
- **Internal Padding:** 12px for dense cards, 16px for start-page cards.

### Inputs / Fields
- **Style:** Light zinc field background, zinc border, 8px radius, 12px horizontal padding.
- **Focus:** Border and ring shift to a strong neutral or primary accent; focus must be visible.
- **Error / Disabled:** Errors use red text plus explanatory copy; disabled states reduce emphasis but must remain readable.

### Navigation
- **Style:** A sticky 48px planner top bar with neutral surface, bottom border, compact text, and restrained icon buttons.
- **Mobile Treatment:** The panel toggle is explicit; hidden panels must not trap inaccessible content.

### Ask Wanderboard Pill
The Ask pill is the signature AI control. It should feel like a workflow command surface, not a chatbot toy: compact at rest, focused when expanded, and explicit when AI is unavailable.

### Itinerary Overlay
The itinerary preview is a full-screen dialog because review is the primary task. It uses a neutral header, scrollable content, Escape/close behavior, and a backdrop that clearly exits map interaction mode.

## 6. Do's and Don'ts

### Do:
- **Do** keep the board editable and make generated content feel like a starting point.
- **Do** use the forest accent for primary actions, selected states, and map orientation only.
- **Do** use borders and tonal surfaces before adding shadows.
- **Do** provide clear recovery actions for errors, unavailable AI, empty state, and local-storage failures.
- **Do** keep map information available in text panels or itinerary summaries.

### Don't:
- **Don't** use over-decorated AI/SaaS clichés.
- **Don't** use heavy gradients, gradient text, or default glassmorphism.
- **Don't** make the product look like a travel-agency brochure, destination content site, static itinerary generator, or decorative demo.
- **Don't** let noisy map UI compete with planner controls.
- **Don't** hardcode a destination-first identity; the interface must adapt to the trip the user describes.
- **Don't** use arbitrary z-index values in new work; define semantic layers for sticky bars, overlays, dialogs, toasts, and tooltips.
