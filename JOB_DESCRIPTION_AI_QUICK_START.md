# AI Job Description Generator - Quick Start Guide 🚀

## ✅ What Was Built

An **AI-powered chatbot** on the Manage Internships page (`/company/opportunities/[companyId]`) that:
- Detects when you open the "Post an Opportunity" modal
- Automatically offers to help generate a job description
- Creates professional, structured descriptions tailored for high school students
- Inserts the description directly into your form with one click

---

## 🎯 How to Test (3 Minutes)

### Step 1: Start the Development Server
```bash
cd internx-new
npm run dev
```

### Step 2: Sign In as a Company
1. Go to `http://localhost:3000/company-sign-in`
2. Sign in with your company account

### Step 3: Navigate to Opportunities Page
Go to: `http://localhost:3000/company/opportunities/[YOUR_COMPANY_ID]`

> **Note:** Replace `[YOUR_COMPANY_ID]` with your actual company ID from Supabase

### Step 4: See the AI Panel
- You should see an **AI Assistant panel** on the left side
- Header shows "AI Assistant - Job description generator"
- Panel is resizable (drag the right edge)
- Can be locked with the lock icon
- Can be toggled with the chevron button

### Step 5: Test Basic AI Chat (Optional)
Before opening the modal, try asking the AI something:
- "Generate a marketing internship description"
- "Create a software engineering role description"

The AI will respond, but won't have a "Paste" button yet (only works when modal is open).

### Step 6: Open the Modal
Click the **"Post an Internship"** button in the top right.

**Expected Result:**
- Modal opens with the internship form
- AI automatically sends a message:
  > "I see you're creating a new opportunity posting. Send me a link to your company website and briefly tell me what you're looking for. I'll generate a clean, structured description for you."

### Step 7: Request a Job Description
In the AI chat panel, type something like:

**Example 1 (with website):**
```
Website: https://openai.com
Looking for a research intern to help with AI safety projects
```

**Example 2 (without website):**
```
Need a marketing intern who can create social media content and help with email campaigns
```

**Example 3 (minimal):**
```
Software engineering intern for web development
```

### Step 8: Review Generated Description
The AI will:
1. Show a loading spinner ("Generating description...")
2. Generate a structured description with these sections:
   - **About the Team**
   - **About the Role**
   - **Team Focus Areas**
   - **In this role, you will:**
   - **You might thrive in this role if you:**
3. Display it in a scrollable preview box
4. Show a button: **"Paste into Description Field"**

### Step 9: Insert into Form
Click the **"Paste into Description Field"** button.

**Expected Result:**
- Description instantly appears in the form's "Position Description" textarea
- AI confirms: "Great! I've pasted the description into your form. Feel free to edit it as needed."
- You can now edit the description if needed

### Step 10: Complete the Form (Optional)
- Fill in other required fields (Company Name, Category, Position, etc.)
- Submit the form to create the internship posting
- The AI-generated description will be saved with the posting

---

## 🎨 Panel Features to Test

### Resize Panel
1. Hover over the **right edge** of the AI panel
2. A blue line should appear
3. Click and drag left/right to resize
4. Panel width stays between 280px and 600px

### Lock Panel Width
1. Click the **lock icon** in the panel header (top right)
2. Icon changes from unlocked to locked
3. Try to resize - it won't work anymore
4. Click again to unlock

### Toggle Panel
1. Click the **chevron button** on the left edge of the page
2. Panel slides out/in smoothly
3. Button position adjusts based on panel state

### Persistent Preferences
1. Resize the panel to a specific width
2. Lock it
3. Refresh the page
4. Panel should open with the same width and lock state

---

## 💡 Example Queries to Try

### Software Engineering
```
Website: https://vercel.com
Need a full-stack intern who knows React and Node.js
```

### Marketing
```
Looking for a creative marketing intern to help with social media, content creation, and community management
```

### Design
```
Website: https://figma.com
Need a UI/UX design intern for our design system team
```

### Research
```
Academic research assistant position for high school students interested in biology and data analysis
```

### Minimal Input
```
Finance analyst intern
```

---

## 🧪 What to Check

### ✅ AI Panel
- [ ] Panel appears on left side
- [ ] Default width is 320px
- [ ] Can resize between 280-600px
- [ ] Lock icon works
- [ ] Toggle button works
- [ ] No text selection during resize
- [ ] Preferences persist after refresh

### ✅ Modal Detection
- [ ] Auto-message appears when modal opens
- [ ] Message only appears once per modal session
- [ ] Resets when modal closes and reopens

### ✅ Job Description Generation
- [ ] AI accepts website URL
- [ ] AI accepts requirements text
- [ ] AI works with minimal input
- [ ] Generated description has proper structure:
  - About the Team
  - About the Role
  - Team Focus Areas
  - In this role, you will: (bullets)
  - You might thrive in this role if you: (bullets)
- [ ] Description is professional and age-appropriate
- [ ] No gradients or emojis in description text
- [ ] Preview box is scrollable

### ✅ Description Insertion
- [ ] "Paste into Description Field" button appears
- [ ] Button inserts description into form
- [ ] Form textarea updates immediately
- [ ] Can edit description after insertion
- [ ] Confirmation message appears

### ✅ Chat Functionality
- [ ] Can send multiple messages
- [ ] Chat history persists
- [ ] "Start New Chat" button clears history
- [ ] Loading state shows during generation
- [ ] Error message if API fails

### ✅ Styling
- [ ] Black text on white backgrounds
- [ ] Blue backgrounds for user messages
- [ ] Gray backgrounds for AI messages
- [ ] No gradients anywhere
- [ ] Only Sparkles icon (no other emojis)
- [ ] Clean, professional appearance

---

## 🐛 Troubleshooting

### "Unauthorized" Error
**Problem:** AI chat returns 401 error

**Solution:** 
1. Make sure you're signed in as a company
2. Check that `localStorage.getItem('token')` exists
3. Sign out and sign back in

### No Auto-Message When Modal Opens
**Problem:** AI doesn't greet when modal opens

**Solution:**
1. Close the modal
2. Click "Start New Chat" in AI panel
3. Re-open the modal

### Description Not Inserting
**Problem:** "Paste" button doesn't work

**Solution:**
1. Check browser console for errors
2. Make sure modal is still open
3. Try generating a new description

### AI Panel Not Appearing
**Problem:** Left sidebar doesn't show

**Solution:**
1. Check if you're on the correct URL: `/company/opportunities/[companyId]`
2. Click the chevron button on the left edge
3. Clear localStorage and refresh

### OpenAI API Error
**Problem:** "Failed to generate job description"

**Solution:**
1. Check that `OPENAI_API_KEY` exists in `.env.local`
2. Verify API key is valid and has credits
3. Check browser console and server logs for details

---

## 📊 Expected Results

### Good Description Output Example
```
About the Team
We're a fast-growing startup focused on making AI accessible to everyone. Our team of 15 engineers works on cutting-edge machine learning projects in a collaborative, learning-focused environment.

About the Role
As a Software Engineering Intern, you'll contribute to real projects that impact thousands of users. This is a hands-on learning opportunity where you'll work alongside experienced engineers and ship production code.

Team Focus Areas
• Full-stack web development
• Machine learning infrastructure
• Developer tools and APIs

In this role, you will:
• Build and maintain React components for our web application
• Write backend APIs using Node.js and Python
• Participate in code reviews and team standups
• Debug issues and improve code quality

You might thrive in this role if you:
• Have experience with JavaScript, HTML, and CSS
• Are curious about AI and machine learning
• Enjoy solving problems and learning new technologies
• Can work independently and ask great questions
```

### Chat Flow Example
```
[AI] I see you're creating a new opportunity posting. Send me a link to your 
     company website and briefly tell me what you're looking for. I'll generate 
     a clean, structured description for you.

[You] Website: https://example.com
      Looking for a marketing intern to help with social media

[AI] I've generated a job description for you. Would you like me to paste 
     this into your Opportunity Description field?

     [Generated Description Preview Box with Scroll]
     About the Team
     ...

     [Paste into Description Field Button]

[You] *clicks button*

[AI] Great! I've pasted the description into your form. Feel free to edit 
     it as needed.
```

---

## 🎯 Success Metrics

After testing, you should be able to:

1. ✅ Open the opportunities page and see the AI panel
2. ✅ Resize and lock the panel
3. ✅ Open the posting modal and see auto-greeting
4. ✅ Send a query with website and requirements
5. ✅ See a professional, structured job description
6. ✅ Insert the description into the form with one click
7. ✅ Edit the description if needed
8. ✅ Submit the form successfully

---

## 🚀 Next Steps

1. **Test the feature** using this guide
2. **Try different types of queries** (with/without website, different industries)
3. **Review generated descriptions** for quality and tone
4. **Provide feedback** on what works and what could be improved
5. **Deploy to production** when satisfied

---

## 📝 Notes

- **API Key:** Make sure `OPENAI_API_KEY` is set in `.env.local`
- **Model Used:** GPT-4o (high quality, may be slower)
- **Cost:** ~$0.03 per description generation (GPT-4o pricing)
- **Rate Limits:** OpenAI default limits apply
- **Conversation Context:** AI remembers last 3 messages
- **Storage:** Chat history saved to localStorage

---

## 🆘 Need Help?

If something isn't working:

1. **Check Browser Console** (F12 → Console tab)
2. **Check Server Logs** (terminal running `npm run dev`)
3. **Verify Environment Variables** (`.env.local` file)
4. **Clear localStorage** and try again
5. **Review `JOB_DESCRIPTION_AI_FEATURE.md`** for detailed docs

---

## ✨ Happy Testing!

The AI Job Description Generator is ready to use. It should save you significant time writing professional, high-quality internship descriptions tailored for high school students.

**Enjoy! 🎉**
