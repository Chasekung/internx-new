# Modal + Chatbot Refactor - Quick Test Guide ⚡

## 🎯 3-Minute Verification

### Test 1: Visual Layering (30 seconds)
```bash
1. Navigate to /company/opportunities/[companyId]
2. Click "Post an Internship"
3. Look at screen:
```

**✅ Expected:**
- Left chatbot: **Sharp, clear, no blur**
- Right content: **Blurred**
- Modal: **Centered, crisp**
- Backdrop: **Only covers right side**

---

### Test 2: Chatbot Interaction (30 seconds)
```bash
With modal open:
1. Try typing in chatbot
2. Try clicking "Start New Chat"
3. Try selecting text in a chat message
4. Try copying text
```

**✅ Expected:**
- All interactions work normally
- Chatbot is fully responsive
- No "blocked" cursor
- Text is selectable

---

### Test 3: No Immediate AI Message (15 seconds)
```bash
1. Click "Post an Internship"
2. Check chatbot
```

**✅ Expected:**
- Modal opens
- **NO new AI message appears**
- Chatbot shows previous state

---

### Test 4: AI Triggers After Form Complete (60 seconds)
```bash
Fill these fields IN ORDER:
1. Company Name: "Test Corp"
2. For-Profit/Non-Profit: "For-Profit"
3. Category: "Marketing"
4. Position: "Content Creator"
5. Work Location: "Online"
6. Hours/Week: "15"
7. Pay: "20"
8. Business Email: "test@test.com"
```

**✅ Expected:**
- After completing email field, AI sends message
- Message says: **"I see you're posting a for-profit Content Creator opportunity in Marketing"**
- Message mentions: **"online/remote position"**

---

### Test 5: Context-Aware Generation (45 seconds)
```bash
1. Complete form as above
2. In chatbot, type: "Website: https://buffer.com, need someone who can write blog posts and manage Twitter"
3. Wait for AI response
```

**✅ Expected:**
- AI generates description
- Mentions **"Content Creator"** or **"Marketing"**
- Includes **social media** responsibilities
- Mentions **writing/content creation** skills
- Shows "Paste into Description Field" button

---

### Test 6: Copy/Paste (30 seconds)
```bash
1. Open modal
2. Type something in chatbot
3. Select and copy text from chatbot
4. Click into a modal form field
5. Paste
```

**✅ Expected:**
- Can select text in chatbot ✅
- Can copy from chatbot ✅
- Can click into modal fields ✅
- Paste works ✅

---

## 🐛 Quick Troubleshooting

### Chatbot is Blurred
❌ **Issue:** Chatbot has blur effect

**Fix:**
```typescript
// Check: Chatbot should have z-index 99
<motion.div style={{ zIndex: 99 }}>
```

### Can't Click Chatbot
❌ **Issue:** Chatbot not responsive

**Fix:**
```typescript
// Check: Only main content should be non-interactive
<div className={isModalOpen ? 'pointer-events-none' : ''}>
  {/* Main content only, not chatbot */}
</div>
```

### AI Triggers Immediately
❌ **Issue:** AI message appears when modal opens

**Fix:**
```typescript
// Check: useEffect should monitor form fields, not just isModalOpen
useEffect(() => {
  const allFieldsComplete = /* all fields check */;
  if (allFieldsComplete && isModalOpen) {
    // trigger
  }
}, [/* all form fields */]);
```

### Description Not Tailored
❌ **Issue:** Description is generic

**Fix:**
```typescript
// Check: opportunityContext is passed to API
body: JSON.stringify({
  companyWebsite,
  requirements,
  opportunityContext: {
    category: form.category,
    position: form.position,
    // ... etc
  }
})
```

---

## 📊 Visual Checklist

```
┌─────────────────────────────────────────────────────┐
│  WHEN MODAL IS OPEN:                                │
│                                                      │
│  ┌──────────┐  ┌─────────────────────────────────┐ │
│  │          │  │                                  │ │
│  │   CHAT   │  │        RIGHT CONTENT            │ │
│  │          │  │         (BLURRED)               │ │
│  │  SHARP   │  │    ┌──────────────────┐        │ │
│  │ Z-99     │  │    │                  │        │ │
│  │          │  │    │   MODAL FORM     │ Z-100  │ │
│  │          │  │    │   (SHARP)        │        │ │
│  │ ALWAYS   │  │    │                  │        │ │
│  │CLICKABLE │  │    └──────────────────┘        │ │
│  │          │  │                                  │ │
│  └──────────┘  └─────────────────────────────────┘ │
│       ↑                    ↑                        │
│    No blur           Backdrop + blur               │
│    z-99              z-98, z-1                      │
└─────────────────────────────────────────────────────┘
```

---

## ✅ Success Criteria

After testing, you should see:

1. ✅ **Chatbot never blurs** - Always sharp
2. ✅ **Chatbot always clickable** - Buttons, inputs, text selection work
3. ✅ **Right pane blurs** - Background becomes unfocused
4. ✅ **Modal appears centered** - On top of everything
5. ✅ **AI waits for form** - No immediate message
6. ✅ **AI knows context** - Messages mention role, category, location
7. ✅ **Descriptions are tailored** - Match selected fields
8. ✅ **Copy/paste works** - Between chatbot and modal

---

## 🚀 Dev Server Commands

```bash
# Start dev server
cd internx-new
npm run dev

# If you see module errors
rm -rf .next
npm run dev

# Check if running
curl http://localhost:3000
```

---

## 📝 Test Data Sets

### Software Engineering Internship
```
Company: Tech Startup Inc
Type: For-Profit
Category: Software Engineering
Position: Full Stack Developer
Location: In-Person
Address: 456 Tech Ave
City: Palo Alto
State: CA
Hours: 25
Pay: 35
Email: jobs@techstartup.com
```

**Expected AI Context:**
- Technical language
- Mentions coding/development
- Lists programming skills
- In-person expectations

---

### Marketing Internship
```
Company: Creative Agency
Type: For-Profit
Category: Marketing
Position: Social Media Manager
Location: Online
Hours: 15
Pay: 18
Email: hr@creativeagency.com
```

**Expected AI Context:**
- Creative language
- Mentions content/social media
- Lists communication skills
- Remote work expectations

---

### Non-Profit Research
```
Company: Environmental Foundation
Type: Non-Profit
Category: Research
Position: Research Assistant
Location: In-Person
Address: 789 Green St
City: Seattle
State: WA
Hours: 10
Pay: 0
Email: volunteers@envfoundation.org
```

**Expected AI Context:**
- Mission-driven language
- Mentions research/analysis
- Lists analytical skills
- Emphasizes impact/learning

---

## ⏱️ Total Test Time: ~3 minutes

**If all tests pass:** ✅ Feature is working correctly!

**If any test fails:** See MODAL_CHATBOT_REFACTOR.md for detailed troubleshooting

---

**Quick Test Guide**  
**Version:** 1.0  
**Date:** November 21, 2025

