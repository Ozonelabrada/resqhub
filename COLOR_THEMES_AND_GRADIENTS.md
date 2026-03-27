# Color Themes & Gradient Patterns Summary

## 1. Core Color Scheme (Defined in `src/index.css`)

### Light Mode (`:root`)
- **Primary**: `hsl(173 80% 36%)` - Teal 600 (`#14b8a6`)
- **Primary Foreground**: White (`hsl(0 0% 100%)`)
- **Secondary**: `hsl(160 84% 39%)` - Emerald 600
- **Secondary Foreground**: White
- **Accent**: `hsl(24 94% 50%)` - Orange 600 (`#ea580c`)
- **Accent Foreground**: White
- **Destructive**: `hsl(0 84.2% 60.2%)` - Red
- **Background**: White (`hsl(0 0% 100%)`)
- **Foreground**: Dark slate (`hsl(222.2 84% 4.9%)`)
- **Ring**: Teal (`hsl(173 80% 36%)`)

### Dark Mode (`.dark`)
- **Primary**: `hsl(173 80% 40%)` - Lighter Teal
- **Secondary**: `hsl(160 84% 45%)` - Lighter Emerald
- **Accent**: `hsl(24 94% 55%)` - Lighter Orange
- **Background**: Dark slate (`hsl(222.2 84% 4.9%)`)
- **Foreground**: Off-white (`hsl(210 40% 98%)`)

### Theme Colors Used in Manifest & Offline Pages
- **theme_color**: `#0d9488` (Teal 700)
- **Offline Page Gradient**: `linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)`

---

## 2. Primary Color Usages

### Teal (Primary Brand Color)
**Hex**: `#14b8a6` (Teal 500), `#0d9488` (Teal 700), `#115e59` (Teal 900)

**Used For**:
- Header navigation bars
- Primary CTA buttons
- Active states on navigation items
- Primary text emphasis
- Link hover states

**Key Locations**:
- [src/layouts/PublicLayout.tsx](src/layouts/PublicLayout.tsx) - header gradient
- [src/layouts/AdminLayout.tsx](src/layouts/AdminLayout.tsx) - active menu items
- Footer (`bg-teal-900`)
- Links with `hover:text-orange-400`

---

## 3. Accent Colors

### Orange (Call-to-Action Accent)
**Hex**: `#ea580c` (Orange 600), `#fed7aa` (Orange 100)

**Used For**:
- Hover effects on links
- Secondary emphasis
- Warning/caution badges
- Accent highlights in cards

**Key Locations**:
- Footer links hover: `hover:text-orange-400`
- Info banner: `bg-orange-50 text-orange-800`
- Offline page button: `background: #14b8a6`

### Emerald/Green (Success/Positive Actions)
**Hex**: `#059669` (Emerald 600), `#10b981` (Green 600)

**Used For**:
- Success states
- Positive actions (approve, accept)
- Active community indicators
- Growth/positive metrics

**Key Locations**:
- Mobile install button: `from-green-500 to-emerald-600`
- Success badges: `bg-green-50 border-green-200`
- Stat cards: `bg-green-50 border-green-200`

### Blue/Indigo (Information/Neutral)
**Hex**: `#2563eb` (Blue 600), `#4f46e5` (Indigo 600), `#06b6d4` (Cyan 500)

**Used For**:
- Information states
- Event badges
- Neutral content areas
- Secondary information

**Key Locations**:
- Event update badges: `bg-blue-100 text-blue-700`
- Information alerts: `bg-blue-50 border-blue-200`
- Mobile install section: `bg-blue-50 to-cyan-50`

### Purple/Violet (Special/Premium Features)
**Hex**: `#a855f7` (Purple 600), `#7c3aed` (Violet 600)

**Used For**:
- Premium features
- Volunteer badges
- Announcement indicators
- Special modals

**Key Locations**:
- Add volunteer modal: `from-purple-50 to-violet-50`
- Announcement badges: `bg-purple-100 text-purple-700`
- Premium tier indicators

### Red/Rose (Destructive/Alert Actions)
**Hex**: `#dc2626` (Red 600), `#f43f5e` (Rose 500)

**Used For**:
- Destructive actions
- Error states
- High priority/urgent alerts
- Delete/warning actions

**Key Locations**:
- Danger confirmation modal: `from-rose-500 to-red-600`
- Error messages: `bg-red-50 border-red-200`
- Notification badges: `bg-rose-500`

### Amber/Yellow (Warning)
**Hex**: `#f59e0b` (Amber 500), `#f97316` (Orange 600)

**Used For**:
- Warning/caution messages
- Medium priority alerts
- Pending states

**Key Locations**:
- Warning confirmation modal: `from-amber-500 to-orange-600`
- Caution notices: `bg-amber-50 border-amber-100`

---

## 4. Button Gradients (Key Patterns)

### Primary CTAs
```
bg-gradient-to-r from-teal-600 to-teal-700
hover:from-teal-700 hover:to-teal-800
```
**Used For**: Main action buttons across the site

### Green Success Buttons
```
bg-gradient-to-r from-green-500 to-emerald-600
hover:from-green-600 hover:to-emerald-700
```
**Used For**: Install/approve/positive actions
**Location**: [src/components/pages/public/HubHomePage/components/MobileInstallSection.tsx](src/components/pages/public/HubHomePage/components/MobileInstallSection.tsx#L111)

### Teal-Emerald Gradient (Primary Success)
```
bg-gradient-to-r from-teal-500 to-emerald-600
shadow-lg shadow-teal-200
```
**Used For**: Match success, primary confirmations
**Location**: [src/components/modals/MatchModal/MatchSuccessModal.tsx](src/components/modals/MatchModal/MatchSuccessModal.tsx#L159)

### Danger Gradient
```
bg-gradient-to-br from-rose-500 to-red-600
shadow-red-200
```
**Used For**: Destructive confirmations
**Location**: [src/components/modals/ConfirmationModal/ConfirmationModal.tsx](src/components/modals/ConfirmationModal/ConfirmationModal.tsx#L53)

### Success Gradient
```
bg-gradient-to-br from-emerald-500 to-teal-600
shadow-emerald-200
```
**Used For**: Positive confirmations
**Location**: [src/components/modals/ConfirmationModal/ConfirmationModal.tsx](src/components/modals/ConfirmationModal/ConfirmationModal.tsx#L61)

### Info Gradient
```
bg-gradient-to-br from-blue-500 to-indigo-600
shadow-blue-200
```
**Used For**: Information modals
**Location**: [src/components/modals/ConfirmationModal/ConfirmationModal.tsx](src/components/modals/ConfirmationModal/ConfirmationModal.tsx#L69)

### Warning Gradient
```
bg-gradient-to-br from-amber-500 to-orange-600
shadow-amber-200
```
**Used For**: Warning confirmations
**Location**: [src/components/modals/ConfirmationModal/ConfirmationModal.tsx](src/components/modals/ConfirmationModal/ConfirmationModal.tsx#L78)

---

## 5. Background Colors for Cards & Sections

### Light Gradient Backgrounds (30% opacity, for sections)
| Color | Pattern | Use Case |
|-------|---------|----------|
| Teal-Emerald | `bg-gradient-to-br from-teal-50 to-emerald-50` | Card backgrounds, section backgrounds |
| Blue-Cyan | `bg-gradient-to-br from-blue-50 to-cyan-50` | Mobile install section, light backgrounds |
| Amber-Orange | `bg-gradient-to-br from-amber-100 to-orange-100` | Warning sections, trade market alerts |
| Purple-Violet | `bg-gradient-to-br from-purple-50 to-violet-50` | Modal headers, premium sections |
| Orange-Red | `bg-gradient-to-r from-orange-50 to-red-50` | Alert sections, seller warnings |
| Teal-Cyan | `bg-gradient-to-r from-teal-50 to-cyan-50` | Rider sections |
| Green-Emerald | `bg-gradient-to-br from-green-50 to-emerald-100` | Success sections, active stats |
| Orange-Amber | `bg-gradient-to-br from-orange-50 to-amber-50` | Responsible posting reminders |

### Solid Background Colors (50% opacity)
| Color | Use | Location |
|-------|-----|----------|
| `bg-teal-50` | Card hover states, active navigation | Navigation items |
| `bg-red-50/50` | Danger modal backdrop gradient | ConfirmationModal |
| `bg-emerald-50/50` | Success modal backdrop | ConfirmationModal |
| `bg-blue-50/50` | Info modal backdrop | ConfirmationModal |
| `bg-amber-50/50` | Warning modal backdrop | ConfirmationModal |
| `bg-slate-50` | Default page background | Multiple pages |
| `bg-slate-900/bg-slate-800` | Dark sections (events, items) | Product showcase backgrounds |

---

## 6. Decorative Gradient Overlays

### Blur Gradients (for ambient effects)
```
bg-gradient-to-br from-teal-200 to-emerald-200 blur-3xl opacity-20
bg-gradient-to-br from-blue-500 to-cyan-500 blur-2xl opacity-20
bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-2xl
bg-gradient-to-tr from-orange-200 to-teal-200 blur-3xl opacity-20
```
**Used For**: Background depth effects, ambient glow

### Hover Overlays
```
bg-gradient-to-br from-teal-200 to-emerald-200 opacity-0 hover:opacity-100
bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100
```
**Used For**: Image hover effects, interactive elements

### Border Gradients (in modal headers)
```
w-full h-40 bg-gradient-to-b from-{color}-50/50 to-transparent
```
**Used For**: Modal decorative headers

---

## 7. Color Usage by Component Type

### Navigation & Headers
- **Primary**: Teal gradient
- **Active states**: Teal backgrounds with shadow
- **Hover**: Orange accent for links
- **Mobile header**: `from-teal-600 to-teal-500 shadow-lg shadow-teal-600/20`

### Modals & Dialogs
| Modal Type | Gradient Pattern |
|-----------|-----------------|
| Danger | `from-rose-500 to-red-600` + `shadow-red-200` |
| Success | `from-emerald-500 to-teal-600` + `shadow-emerald-200` |
| Info | `from-blue-500 to-indigo-600` + `shadow-blue-200` |
| Warning | `from-amber-500 to-orange-600` + `shadow-amber-200` |

### Status Badges & Indicators
| Status | Color |
|--------|-------|
| Urgent/Critical | Red (`from-rose-500`) |
| High/Important | Orange (`from-amber-500`) |
| Medium/Neutral | Blue (`from-blue-500`) |
| Active/Positive | Green/Emerald (`from-green-500` to `from-emerald-500`) |
| Pending/Info | Orange (`from-orange-100`) |

### Event/Update Badges
- **Events**: `bg-blue-100 text-blue-700`
- **Announcements**: `bg-purple-100 text-purple-700`
- **General Updates**: `bg-orange-100 text-orange-700`

### Community & Card Borders
- **Active/Selected**: Teal borders (`border-teal-100/200`)
- **Important**: Orange borders (`border-orange-100`)
- **Success**: Green borders (`border-green-200`)

---

## 8. Notification & Toast Colors

```typescript
// From src/components/ui/Toast/Toast.tsx
Success: 'bg-emerald-600 text-white shadow-emerald-200/50'
Info: 'bg-blue-600 text-white shadow-blue-200/50'
Warning: 'bg-amber-500 text-white shadow-amber-200/50'
Error: 'bg-red-600 text-white shadow-red-200/50'
Default: 'bg-slate-800 text-white shadow-slate-200/50'
```

---

## 9. Priority Badge Color Mapping

```typescript
// From src/components/pages/admin/ReportsPage.tsx
'urgent': 'bg-red-600 text-white'
'high': 'bg-red-100 text-red-800'
'medium': 'bg-orange-100 text-orange-800'
'low': 'bg-slate-100 text-slate-800'
```

---

## 10. Color Consistency Patterns

### Consistent Teal Usage
- **Primary**: `#14b8a6` (Teal 500/600)
- **Darker**: `#0d9488` (Teal 700)
- **Darkest**: `#115e59` (Teal 900)
- **Light**: `#ccfbf1` (Teal 100), `#99f6e4` (Teal 200)

### Consistent Emerald Usage (Secondary Primary)
- **Primary**: `#059669` (Emerald 600)
- **Light**: `#a7f3d0` (Emerald 200)

### Consistent Orange Usage (Accent)
- **Primary**: `#ea580c` (Orange 600)
- **Light**: `#fed7aa` (Orange 100)
- **Darkest**: `#7c2d12` (Orange 900)

### Shadow Conventions
- **Teal elements**: `shadow-teal-200` or `shadow-teal-200/50`
- **Red elements**: `shadow-red-200` or `shadow-red-600/20`
- **Blue elements**: `shadow-blue-200` or `shadow-blue-600/20`
- **Emerald elements**: `shadow-emerald-200` or `shadow-emerald-600/20`
- **Amber elements**: `shadow-amber-200` or `shadow-amber-600/20`

---

## 11. Key Theme Files

| File | Purpose | Key Colors |
|------|---------|-----------|
| [src/index.css](src/index.css) | Theme root variables | Primary, Secondary, Accent, Destructive |
| [src/components/ui/button.tsx](src/components/ui/button.tsx) | Button variants | Primary, Secondary, Accent, Destructive |
| [src/components/modals/ConfirmationModal/ConfirmationModal.tsx](src/components/modals/ConfirmationModal/ConfirmationModal.tsx) | Modal gradients | 4 severity types with gradients |
| [public/manifest.json](public/manifest.json) | PWA theme color | Teal 700 (#0d9488) |
| [public/offline.html](public/offline.html) | Offline page styling | Teal gradient |
| [src/components/ui/Toast/Toast.tsx](src/components/ui/Toast/Toast.tsx) | Toast notifications | 5 severity types |

---

## 12. Recommended Consistent Theme Application

### For New CTAs
Use the primary teal gradient:
```
bg-gradient-to-r from-teal-600 to-teal-700
hover:from-teal-700 hover:to-teal-800
shadow-lg shadow-teal-200
```

### For Section Headers
Use appropriate color with light background:
```
bg-gradient-to-br from-{color}-50 to-{color-alt}-50
border border-{color}-100
```

### For Status/Badge Changes
Match the established priority color scheme (Red > Orange > Blue > Green)

### For Icons & Accents
- Active: Teal (`text-teal-600`)
- Hover: Orange (`text-orange-400`)
- Success: Green/Emerald (`text-green-600` / `text-emerald-600`)
- Error: Red (`text-red-600`)
- Info: Blue (`text-blue-600`)
