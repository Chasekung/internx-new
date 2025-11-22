# AI Search Visual Guide 🎨

## Page Layout Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        NAVIGATION BAR (64px)                        │
│                     [Logo] [Links] [Profile]                        │
├──────────────┬──────────────────────────────────────────────────────┤
│              │                                                      │
│   AI PANEL   │              MAIN SEARCH CONTENT                    │
│   (280px)    │              (Flex - Remaining Width)               │
│              │                                                      │
│ ┌──────────┐ │  ┌─────────────────────────────────────────────┐   │
│ │ ⚡ AI    │ │  │        "Find Your Next Intern"              │   │
│ │ Assistant│ │  │   Use AI to find perfect candidates...      │   │
│ │          │ │  └─────────────────────────────────────────────┘   │
│ ├──────────┤ │                                                      │
│ │          │ │  ┌─────────────────────────────────────────────┐   │
│ │ 💬 Chat  │ │  │ 🔍 [Search by name, school, skills...]     │   │
│ │ Messages │ │  │ [Search Interns]                           │   │
│ │          │ │  └─────────────────────────────────────────────┘   │
│ │ (scroll) │ │                                                      │
│ │          │ │  ┌───────────────────────────────────────────┐     │
│ │ User:    │ │  │     "Showing 150 interns"                 │     │
│ │ "Find    │ │  └───────────────────────────────────────────┘     │
│ │ students"│ │                                                      │
│ │          │ │  ┌─────┐  ┌─────┐  ┌─────┐                        │
│ │ AI:      │ │  │ 👤  │  │ 👤  │  │ 👤  │  ← Student Cards       │
│ │ "I found"│ │  │Sarah│  │ John│  │Emma │    (Grid Layout)       │
│ │ [Card]   │ │  │Chen │  │ Doe │  │ Lee │                        │
│ │ [Card]   │ │  └─────┘  └─────┘  └─────┘                        │
│ │ [Card]   │ │                                                      │
│ │          │ │  ┌─────┐  ┌─────┐  ┌─────┐                        │
│ ├──────────┤ │  │ 👤  │  │ 👤  │  │ 👤  │                        │
│ │ 🔄 New   │ │  │Alex │  │Maya │  │Ryan │                        │
│ │ Chat     │ │  │Wang │  │Patel│  │Kim  │                        │
│ ├──────────┤ │  └─────┘  └─────┘  └─────┘                        │
│ │[Input] →││ │                                                      │
│ └──────────┘ │  ┌─────┐  ┌─────┐  ┌─────┐                        │
│              │  │  +144 more students below...  │                  │
│              │  └───────────────────────────────┘                  │
│              │                                                      │
└──────────────┴──────────────────────────────────────────────────────┘
     ↑
  [< Toggle]  ← Collapse/Expand Button
```

---

## AI Panel Close-Up

```
┌───────────────────────────────┐
│ ┌───┐ AI Assistant           │  ← Header (Blue-purple gradient)
│ │⚡ │ Smart candidate search  │     Sparkles icon badge
│ └───┘                         │
├───────────────────────────────┤
│                               │
│  💬 Ask me to find           │  ← Empty State (First Load)
│     candidates!              │
│                               │
│  Try: "Find students         │
│  interested in marketing"    │
│                               │
├───────────────────────────────┤  ← OR ↓ With Messages:
│                               │
│     ┌─────────────────────┐  │  ← User Message (Blue, Right)
│     │ Find students       │  │
│     │ interested in       │  │
│     │ marketing           │  │
│     └─────────────────────┘  │
│                               │
│  ┌──────────────────────────┐│  ← AI Response (Gray, Left)
│  │ I found 8 students       ││
│  │ interested in marketing  ││
│  │ and social media!        ││
│  └──────────────────────────┘│
│                               │
│  ┌──────────────────────────┐│  ← Candidate Preview Card
│  │ 👤 Sarah Chen            ││     (Clickable)
│  │ Marketing enthusiast     ││
│  │ with social media exp.   ││
│  └──────────────────────────┘│
│                               │
│  ┌──────────────────────────┐│
│  │ 👤 John Doe              ││
│  │ Content creator with     ││
│  │ Adobe Suite skills       ││
│  └──────────────────────────┘│
│                               │
│  ┌──────────────────────────┐│
│  │ 👤 Emma Lee              ││
│  │ Digital marketing intern ││
│  │ with SEO knowledge       ││
│  └──────────────────────────┘│
│                               │
│     +5 more shown in results │  ← Indicator
│                               │
│     ┌─────────────────────┐  │  ← Next User Message
│     │ From those, who has │  │
│     │ video editing?      │  │
│     └─────────────────────┘  │
│                               │
│  ┌──────────────────────────┐│
│  │ Out of the marketing     ││
│  │ students, 3 have video   ││
│  │ editing experience...    ││
│  └──────────────────────────┘│
│                               │
│  ┌──────────────────────────┐│
│  │ 👤 Sarah Chen            ││
│  │ Premiere Pro & After FX  ││
│  └──────────────────────────┘│
│                               │
│  ... (scroll to see more)    │
│                               │
├───────────────────────────────┤
│   🔄 Start New Chat          │  ← Reset Button
├───────────────────────────────┤
│ [Type your question...] [→]  │  ← Chat Input + Send
└───────────────────────────────┘
```

---

## Candidate Preview Card (In Chat)

```
┌─────────────────────────────────┐
│  ┌────┐                         │
│  │ 👤 │  Sarah Chen             │  ← Name (Bold)
│  └────┘  Marketing enthusiast   │  ← Headline/Bio (Gray)
│          with social media exp. │
└─────────────────────────────────┘
       ↑
   8x8 photo       ↑
  (or initial)   Hover: Shadow + Cursor
                 Click: Go to profile
```

---

## Main Student Card (Grid)

```
┌───────────────────────────────────┐
│  ┌────────┐                       │
│  │        │  Sarah Chen           │  ← Name (XL Bold)
│  │  PHOTO │  @sarahc              │  ← Username (Blue)
│  │  20x20 │  Marketing intern     │  ← Headline
│  │        │  📍 California        │  ← Location
│  └────────┘                       │
├───────────────────────────────────┤
│  🎓 Stanford High School          │  ← Education
│     Grade 11                      │
│                                   │
│  👤 Passionate about digital      │  ← Bio
│     marketing and brand strategy. │
│     Looking to gain experience... │
│                                   │
│  🏢 Skills                        │  ← Skills
│     Social media marketing,       │
│     Adobe Photoshop, Canva        │
│                                   │
│  🏢 Career Interests              │  ← Interests
│     Marketing, Advertising,       │
│     Content Creation              │
└───────────────────────────────────┘
       ↑
   Hover: Lift + Shadow
   Click: View full profile
```

---

## Toggle Button

```
Panel OPEN:
┌────┐
│ <  │  ← Chevron Left
└────┘
  ↑
At x=280px (panel width)

Panel CLOSED:
┌────┐
│ >  │  ← Chevron Right
└────┘
  ↑
At x=0px (left edge)
```

---

## Responsive Layouts

### Desktop (1024px+)
```
┌─────────┬────────────────────────────────┐
│  Panel  │     Main Content (3 cols)      │
│  280px  │  [Card] [Card] [Card]         │
│         │  [Card] [Card] [Card]         │
│         │  [Card] [Card] [Card]         │
└─────────┴────────────────────────────────┘
```

### Tablet (768px - 1023px)
```
┌─────────┬──────────────────────┐
│  Panel  │  Main (2 cols)       │
│  280px  │  [Card] [Card]       │
│         │  [Card] [Card]       │
└─────────┴──────────────────────┘
```

### Mobile (<768px)
```
Panel Closed:
┌──────────────────────────┐
│   Main Content (1 col)   │
│      [Card]              │
│      [Card]              │
│      [Card]              │
└──────────────────────────┘

Panel Open (Overlay):
┌─────────┬────────────────┐
│  Panel  │ (Dimmed Main)  │
│  280px  │                │
│  Over   │                │
│  lay    │                │
└─────────┴────────────────┘
```

---

## Interaction States

### Chat Input

**Default:**
```
┌─────────────────────────────────────┐
│ Ask AI...                      [→] │
└─────────────────────────────────────┘
```

**Typing:**
```
┌─────────────────────────────────────┐
│ Find students with React exp   [→] │  ← Blue focus ring
└─────────────────────────────────────┘
```

**Loading:**
```
┌─────────────────────────────────────┐
│ (disabled, grayed out)         [⟳] │  ← Spinning
└─────────────────────────────────────┘
```

---

## Message Animations

### User Message
```
1. Appears from right
   opacity: 0 → 1
   x: 20px → 0px
   
2. Fades in
   duration: 0.3s
   
3. Final state: Right-aligned blue bubble
```

### AI Response
```
1. Appears from left
   opacity: 0 → 1
   x: -20px → 0px
   
2. Fades in
   duration: 0.3s
   
3. Final state: Left-aligned gray bubble
```

### Candidate Cards (in chat)
```
1. Stagger animation
   Each card delays by 0.1s
   
2. Scale up
   scale: 0.9 → 1.0
   
3. Fade in
   opacity: 0 → 1
   
4. Final state: Clickable card with hover
```

---

## Color Guide

### AI Panel
```
Background:      #FFFFFF (White)
Border:          #E5E7EB (Gray-200)
Text:            #111827 (Gray-900)
Subtitle:        #6B7280 (Gray-500)
```

### Chat Messages
```
User Bubble:
  Background:    #2563EB (Blue-600)
  Text:          #FFFFFF (White)
  Alignment:     Right
  
AI Bubble:
  Background:    #F3F4F6 (Gray-100)
  Text:          #111827 (Gray-900)
  Alignment:     Left
```

### Buttons
```
Primary (Send, Search):
  Background:    #2563EB (Blue-600)
  Hover:         #1D4ED8 (Blue-700)
  Text:          #FFFFFF (White)
  
Secondary (Reset):
  Background:    Transparent
  Text:          #2563EB (Blue-600)
  Hover:         #1D4ED8 (Blue-700)
```

### Icons
```
AI Badge:
  Background:    linear-gradient(blue-500 to purple-600)
  Icon:          #FFFFFF (White)
  
Icons in Cards:
  Color:         #9CA3AF (Gray-400)
```

---

## Loading States

### Panel Loading
```
┌───────────────────────────────┐
│                               │
│        [Spinning Circle]      │  ← Centered
│                               │
│   Analyzing candidates...     │  ← Text below
│                               │
└───────────────────────────────┘
```

### Main Content Loading
```
┌────────────────────────────────────┐
│                                    │
│     [Large Spinning Circle]        │
│                                    │
│   Searching for interns...         │
│                                    │
└────────────────────────────────────┘
```

### AI Thinking (In Chat)
```
┌──────────────────────────────┐
│ [⟳] Analyzing candidates...  │  ← Small spinner, gray bubble
└──────────────────────────────┘
```

---

## Empty States

### No Chat History
```
┌───────────────────────────────┐
│         ⚡ (Large)            │
│                               │
│  Ask me to find candidates!  │
│                               │
│  Try: "Find students         │
│  interested in marketing"    │
│                               │
└───────────────────────────────┘
```

### No Results
```
┌────────────────────────────────────┐
│         🔍 (Large, Gray)           │
│                                    │
│     No interns found               │
│                                    │
│  No interns match your search.    │
│  Try the AI assistant or          │
│  different keywords.               │
│                                    │
│  [Show All Interns]                │
└────────────────────────────────────┘
```

---

## Hover Effects

### Toggle Button
```
Default:     White bg, gray icon
Hover:       Gray-50 bg, darker icon
Active:      Gray-100 bg
```

### Candidate Card (Chat)
```
Default:     White bg, gray border
Hover:       Shadow-md, slight lift
Active:      Shadow-sm, scale 0.98
```

### Student Card (Grid)
```
Default:     White bg, shadow-lg
Hover:       Shadow-xl, lift -4px
Active:      Shadow-lg, lift -2px
```

### Send Button
```
Default:     Blue-600 bg
Hover:       Blue-700 bg, scale 1.05
Active:      Blue-800 bg, scale 0.95
Disabled:    Opacity 50%, no hover
```

---

## Z-Index Layers

```
100: Modal overlays (if any)
 50: AI Panel (fixed)
 40: Toggle Button (fixed)
 30: Navbar (fixed top)
 20: Dropdowns
 10: Sticky elements
  1: Main content
  0: Background elements
 -1: Grid pattern, blobs
```

---

## Animation Timings

```
Panel Open/Close:     300ms ease-out
Message Fade In:      300ms ease-in
Card Hover Lift:      200ms ease-out
Button Scale:         150ms ease-in-out
Loading Spinner:      1000ms linear infinite
Blob Animation:       7000ms ease-in-out infinite
```

---

## Spacing Reference

### Panel
```
Width:           280px
Top Offset:      64px (navbar height)
Padding:         16px (p-4)
Message Gap:     16px (space-y-4)
Input Height:    40px (py-2)
```

### Cards
```
Grid Gap:        32px (gap-8)
Card Padding:    24px (p-6)
Border Radius:   12px (rounded-xl)
Image Size:      80x80px (w-20 h-20)
Icon Size:       20x20px (w-5 h-5)
```

### Typography
```
Page Title:      36px, bold (text-4xl)
Section Title:   24px, semibold (text-2xl)
Card Name:       20px, bold (text-xl)
Body Text:       14px, regular (text-sm)
Small Text:      12px, regular (text-xs)
```

---

## Accessibility Features

### Keyboard Navigation
```
Tab:         Move between inputs, buttons, cards
Enter:       Submit query, click focused element
Escape:      Close panel (future enhancement)
Space:       Toggle checkboxes (future filters)
Arrow Keys:  Navigate cards (future enhancement)
```

### Screen Readers
```
- Panel labeled as "AI Assistant Panel"
- Messages have role="log" for announcements
- Buttons have descriptive aria-labels
- Images have alt text
- Loading states announced
```

### Color Contrast
```
✅ All text meets WCAG AA standards
✅ Focus indicators visible
✅ Interactive elements distinguishable
✅ Loading states clear
```

---

## Mobile Gestures

```
Swipe Right:  Open panel (from left edge)
Swipe Left:   Close panel (from panel)
Tap:          Select card, send message
Long Press:   Copy message text (future)
Pinch Zoom:   Disabled on panel, enabled on images
```

---

## Performance Metrics

### Target Times
```
Panel Open:          < 300ms
AI Response:         2-4 seconds
Message Render:      < 100ms
Card Click:          < 50ms
Scroll Performance:  60fps
Memory Usage:        < 50MB
```

### Optimizations
```
✅ Lazy load images
✅ Virtual scrolling (future, if needed)
✅ Debounced animations
✅ Memoized components
✅ Optimized re-renders
```

---

## Browser Support

```
✅ Chrome 90+
✅ Safari 14+
✅ Firefox 88+
✅ Edge 90+
✅ Mobile Safari (iOS 14+)
✅ Chrome Mobile (Android 10+)
```

---

## Summary Diagram: Complete User Flow

```
1. Company visits /company/search
              ↓
2. Authentication check
              ↓
    ┌─────────┴─────────┐
    │   AI Panel Opens  │
    │   (Default Open)  │
    └─────────┬─────────┘
              ↓
3. Two options:
   
   Option A: AI Search          Option B: Manual Search
   ┌──────────────────┐         ┌─────────────────────┐
   │ Type in AI panel │         │ Use search bar      │
   │ "Find students..." │       │ Type keywords       │
   └────────┬─────────┘         └──────────┬──────────┘
            ↓                               ↓
   ┌──────────────────┐         ┌─────────────────────┐
   │ AI analyzes      │         │ Database query      │
   │ 500 profiles     │         │ filters results     │
   └────────┬─────────┘         └──────────┬──────────┘
            ↓                               ↓
   ┌──────────────────┐         ┌─────────────────────┐
   │ Returns matches  │         │ Shows matching      │
   │ + explanation    │         │ profiles            │
   └────────┬─────────┘         └──────────┬──────────┘
            ↓                               ↓
            └────────┬───────────────────────┘
                     ↓
            ┌────────────────┐
            │ Results Display│
            │ - Preview cards│
            │ - Main grid    │
            └────────┬───────┘
                     ↓
            ┌────────────────┐
            │ Click candidate│
            └────────┬───────┘
                     ↓
            ┌────────────────┐
            │ View Profile   │
            │ /profile/[id]  │
            └────────────────┘
```

---

## ✅ Visual Quality Checklist

Use this to verify the implementation looks correct:

### AI Panel
- [x] 280px width, fixed left
- [x] Starts below navbar (64px offset)
- [x] White background, subtle border
- [x] Sparkles icon in gradient badge
- [x] Smooth open/close animation
- [x] Scrollable chat area
- [x] Toggle button moves with panel
- [x] "Start New Chat" button visible

### Chat Messages
- [x] User messages blue, right-aligned
- [x] AI messages gray, left-aligned
- [x] Candidate cards below AI messages
- [x] Profile photos in 8x8 circles
- [x] Clickable cards with hover effect
- [x] "+X more" indicator when > 3 cards
- [x] Loading spinner during processing

### Main Content
- [x] Shifts right when panel open
- [x] Shifts left when panel closed
- [x] Smooth transition (300ms)
- [x] Search bar full width
- [x] Results in 3-column grid (desktop)
- [x] Cards with shadows and hover lift
- [x] Profile photos prominent

### Responsive
- [x] Panel overlays on mobile
- [x] Single column grid on mobile
- [x] Touch-friendly buttons
- [x] No horizontal scroll
- [x] Text readable at all sizes

### Animations
- [x] Panel slides in/out smoothly
- [x] Messages fade in
- [x] Cards stagger on load
- [x] Hover effects smooth
- [x] No jank or lag
- [x] 60fps performance

---

**Use this guide to understand the visual structure and verify everything looks correct!** 🎨

**Status:** ✅ Complete Visual Reference  
**Last Updated:** November 21, 2025

