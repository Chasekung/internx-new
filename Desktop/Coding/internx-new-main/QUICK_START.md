# 🚀 InternX Quick Start Guide

## ⚡ **Get Started in 5 Minutes**

### 1. **Environment Setup**
```bash
# Install dependencies (already done)
npm install

# Set up environment variables
cp env.template .env.local
# Edit .env.local with your Supabase and OpenAI credentials
```

### 2. **Start Development Server**
```bash
npm run dev
# Your app will be available at http://localhost:3000
```

### 3. **Daily Workflow**
```bash
# Use the automated script
./scripts/start-feature.sh

# Or manually:
git checkout develop && git pull origin develop
git checkout -b feature/your-feature-name
# ... work on your feature ...
git add . && git commit -m "feat: description"
git push origin feature/your-feature-name
```

## 🎯 **Current Status**
- ✅ Repository cloned and configured
- ✅ Dependencies installed
- ✅ Feature branch created: `feature/user-profile-enhancement`
- ✅ Collaboration workflow documented

## 🔄 **Next Steps**
1. **Set up environment variables** in `.env.local`
2. **Start development server** with `npm run dev`
3. **Begin coding** your feature
4. **Use the workflow script** for daily operations

## 📚 **Key Files**
- `COLLABORATION_WORKFLOW.md` - Complete workflow guide
- `scripts/start-feature.sh` - Automated workflow script
- `env.template` - Environment variables template

## 🚨 **Important Reminders**
- Always work on feature branches, never on `main` or `develop`
- Pull latest `develop` before starting new features
- Test thoroughly before creating Pull Requests
- Communicate with your partner about overlapping changes

---

**Ready to code? Run `./scripts/start-feature.sh` to begin!** 🚀 