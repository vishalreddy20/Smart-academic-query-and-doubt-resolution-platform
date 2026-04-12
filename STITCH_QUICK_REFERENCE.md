# Stitch Design System - Developer Quick Reference

## 🎨 Color Tokens (Use These in Tailwind Classes)

### Primary Actions & Emphasis
```jsx
bg-primary              // Black (#000000)
bg-primary-container    // Dark Navy (#131b2e)
text-on-primary        // White (#ffffff)
```

### Secondary (Teal - Trust)
```jsx
bg-secondary           // Teal (#006a61) - Main CTA
bg-secondary-container // Light Teal (#86f2e4) - Backgrounds
text-on-secondary      // White
text-on-secondary-container // Dark Teal
```

### Surface Hierarchy (Cards & Sections)
```jsx
bg-surface             // Off-white (#f7f9fb) - Page background
bg-surface-container-low    // Light gray (#f2f4f6) - Input backgrounds
bg-surface-container-lowest // White (#ffffff) - Card backgrounds
bg-surface-container-high   // Medium gray (#e6e8ea) - Hover states
```

### Error/Status
```jsx
bg-error               // Red (#ba1a1a)
bg-error-container     // Light red (#ffdad6)
text-error             // Red
```

### Text Colors
```jsx
text-on-surface        // Dark (#191c1e) - Main text
text-on-surface-variant // Gray (#45464d) - Secondary text
text-outline-variant   // Subtle gray (#c6c6cd) - Disabled/helper text
```

---

## 🧩 Component Classes

### Buttons
```jsx
// Primary CTA (Gradient + Shadow)
<button className="btn-primary">Action</button>

// Secondary button
<button className="btn-secondary">Cancel</button>

// Tertiary (Ghost/outline)
<button className="text-secondary hover:text-on-secondary-container hover:underline">Link Button</button>
```

### Cards
```jsx
// Premium elevated card
<div className="card-elevated p-8 rounded-xl">
  {/* Content */}
</div>

// Simple surface card
<div className="bg-surface-container-lowest rounded-lg shadow-editorial">
  {/* Content */}
</div>
```

### Form Inputs
```jsx
// Standard input
<input 
  className="bg-surface-container-low border-none rounded-lg px-4 py-3 
             focus:ring-2 focus:ring-secondary/20 focus:bg-surface-container-lowest 
             text-on-surface placeholder:text-outline-variant/50"
/>

// Textarea
<textarea 
  className="bg-surface-container-low border-none rounded-lg px-4 py-3 
             focus:ring-2 focus:ring-secondary/20 focus:bg-surface-container-lowest 
             text-on-surface placeholder:text-outline-variant/50 resize-none"
/>

// Select
<select 
  className="bg-surface-container-low border-none rounded-lg px-4 py-3 
             focus:ring-2 focus:ring-secondary/20 text-on-surface appearance-none"
>
  <option>Choose option</option>
</select>
```

### Badges & Status
```jsx
// Open doubt badge
<span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-medium uppercase">
  Open
</span>

// Claimed badge
<span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-xs font-medium uppercase">
  Claimed
</span>

// Resolved badge
<span className="bg-surface-container-highest text-on-surface-variant px-3 py-1 rounded-full text-xs font-medium uppercase">
  Resolved
</span>

// Error badge
<span className="bg-error-container text-error px-3 py-1 rounded-full text-xs font-medium uppercase">
  Error
</span>
```

### Navigation/Sections
```jsx
// Sidebar nav item (active)
<a className="bg-white text-secondary font-bold rounded-lg shadow-sm flex items-center gap-3 p-3 hover:translate-x-1 transition-transform">
  <span className="material-symbols-outlined">icon_name</span>
  <span>Label</span>
</a>

// Sidebar nav item (inactive)
<a className="text-slate-600 hover:bg-slate-200/50 flex items-center gap-3 p-3 hover:translate-x-1 transition-transform">
  <span className="material-symbols-outlined">icon_name</span>
  <span>Label</span>
</a>
```

### Icons (Material Symbols)
```jsx
// Always add material-symbols-outlined class and data-icon attribute
<span className="material-symbols-outlined" data-icon="icon_name">icon_name</span>

// Common icons:
history_edu      // Education/book
menu_book        // Doubts/queries
auto_stories     // Knowledge base
reorder          // Queue
analytics        // Statistics
forum            // Messages/comments
logout           // Sign out
settings         // Settings
notifications    // Notifications
search           // Search
visibility       // Show password
visibility_off   // Hide password
```

---

## 📏 Spacing & Sizing

### Padding/Margin (Tailwind scale)
```jsx
p-2  // 0.5rem - Tight spacing
p-4  // 1rem - Normal spacing
p-6  // 1.5rem - Card padding
p-8  // 2rem - Section padding
p-10 // 2.5rem - Large padding
p-12 // 3rem - XL padding
```

### Border Radius
```jsx
rounded-lg   // 0.5rem - Subtle
rounded-xl   // 0.75rem - Standard components
rounded-full  // 9999px - Edges (pills, circles)
```

### Shadows
```jsx
shadow-ghost     // Premium elevation (0px 20px 40px rgba...)
shadow-editorial // Subtle shadow (0px 4px 12px rgba...)
hover:scale-105  // Subtle lift on hover
```

---

## 🔤 Typography Classes

### Font Selection
```jsx
font-headline     // Newsreader serif - Section titles, headlines
font-body        // Inter sans-serif - Body text
font-label       // Inter sans-serif - Labels, metadata
```

### Font Sizes (use with font-headline/body/label)
```jsx
text-xs  // 0.75rem - Labels
text-sm  // 0.875rem - Secondary text
text-base // 1rem - Default body
text-lg  // 1.125rem - Larger text
text-2xl // 1.5rem - Subheadings
text-3xl // 1.875rem - Headings
text-5xl // 3rem - Large headings
text-6xl // 3.75rem - Hero headings
```

### Font Weight
```jsx
font-light    // 300 - Elegant, secondary
font-normal   // 400 - Default body
font-medium   // 500 - Emphasis
font-semibold // 600 - Strong emphasis
font-bold     // 700 - Headings
```

### Text Color Combinations
```jsx
// Normal text on surface
<p className="text-on-surface font-body">Main content</p>

// Secondary/muted text
<p className="text-on-surface-variant font-body text-sm">Meta information</p>

// Label text
<label className="font-label text-xs uppercase tracking-wider text-on-surface-variant">Field Label</label>

// Emphasis/heading
<h2 className="font-headline text-3xl font-medium text-on-surface">Section Title</h2>
```

---

## 🎬 Animation & Interaction

### Hover States
```jsx
// Scale up on hover
hover:scale-105 transition-all

// Change color on hover
hover:bg-secondary hover:text-on-secondary transition-colors

// Translate on hover
hover:translate-x-1 transition-transform duration-200

// All transitions
transition-all duration-300
```

### State Classes
```jsx
disabled:opacity-50
disabled:cursor-not-allowed

focus:ring-2
focus:ring-secondary/20
focus:outline-none

placeholder:text-outline-variant/50
```

---

## 📱 Responsive Breakpoints

```jsx
// Mobile first
<div className="p-4">
  {/* Mobile styles */}
</div>

// Tablet and up
<div className="sm:p-6 md:p-8">
  {/* Adjusted for larger screens */}
</div>

// Common breakpoints in Tailwind
sm   // 640px
md   // 768px (tablet)
lg   // 1024px (desktop)
xl   // 1280px
2xl  // 1536px
```

---

## ✅ Component Checklist

When building a page, ensure:

- [ ] All text uses semantic color tokens (not hardcoded colors)
- [ ] Forms use `surface-container-low` for input backgrounds
- [ ] Buttons use `btn-primary` or `btn-secondary`
- [ ] Cards use `card-elevated` or `surface-container-lowest`
- [ ] Headings use `font-headline`
- [ ] Labels use `font-label` + uppercase + tracking-wider
- [ ] Icons use `<span className="material-symbols-outlined">`
- [ ] Status badges use color-coded containers
- [ ] Mobile layout preserves all content above fold
- [ ] Focus rings visible on interactive elements
- [ ] All text has sufficient contrast (WCAG AA minimum)

---

## 🏗️ Layout Patterns

### Split Desktop / Single Mobile
```jsx
<main className="flex min-h-screen flex-col md:flex-row">
  {/* Left: Hidden on mobile, shown on md+ */}
  <section className="hidden md:flex md:w-1/2">Left content</section>
  
  {/* Right: Full width on mobile */}
  <section className="flex-1">Right content</section>
</main>
```

### Card Grid
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <div className="card-elevated">Card</div>
  ))}
</div>
```

### Sidebar + Main Content
```jsx
<main className="flex">
  <aside className="w-72 bg-surface-container-low hidden md:flex flex-col p-6">
    {/* Sidebar nav */}
  </aside>
  
  <section className="flex-1 md:ml-72">
    {/* Main content */}
  </section>
</main>
```

---

## 🐛 Common Mistakes to Avoid

❌ Hardcoding colors: `className="bg-blue-500"`  
✅ Use tokens: `className="bg-secondary"`

❌ Inconsistent spacing: Mix of p-2, p-5, p-7  
✅ Use scale: p-4, p-6, p-8 (multiples of 2)

❌ No focus states: Keyboard users can't navigate  
✅ Add: `focus:ring-2 focus:ring-secondary/20`

❌ Black text on dark backgrounds: Poor contrast  
✅ Use: `text-on-surface` tokens for contrast

❌ Material icons without class: Missing appearance  
✅ Always add: `className="material-symbols-outlined"`

---

## 📚 Files to Reference

- **Color tokens:** `tailwind.config.js` - Full list of color values
- **CSS utilities:** `src/index.css` - @layer components
- **HTML patterns:** `stitch/*/code.html` - Structure & class usage
- **Screenshots:** `stitch/*/screen.png` - Visual reference
- **Full spec:** `stitch/scholar_ink/DESIGN.md` - Design philosophy

---

**Keep this guide open while building pages!** 🎨
