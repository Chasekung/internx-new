# 🚀 InternX Collaboration Workflow Guide

## 📋 **Overview**
This guide outlines the collaboration workflow for the InternX project, ensuring smooth development between co-founders while maintaining code quality and avoiding conflicts.

## 🌿 **Branch Structure**
```
main (production) ← develop (integration) ← feature branches
```

- **`main`**: Production-ready code only
- **`develop`**: Integration testing branch
- **`feature/*`**: Individual feature development branches

## 🔄 **Daily Development Workflow**

### 1. **Start of Day**
```bash
# Switch to develop branch and pull latest changes
git checkout develop
git pull origin develop

# Create new feature branch (if starting new feature)
git checkout -b feature/your-feature-name
```

### 2. **During Development**
```bash
# Make your changes and commit frequently
git add .
git commit -m "feat: add user profile enhancement"

# Push your feature branch to remote
git push origin feature/your-feature-name
```

### 3. **End of Day**
```bash
# Commit any remaining work
git add .
git commit -m "feat: complete user profile enhancement"

# Push to remote
git push origin feature/your-feature-name
```

## 🎯 **Feature Development Process**

### **Phase 1: Development**
1. Create feature branch from `develop`
2. Develop your feature independently
3. Commit frequently with clear messages
4. Push to remote for backup

### **Phase 2: Testing**
1. Test your feature locally
2. Create Vercel preview deployment
3. Test in preview environment
4. Fix any issues found

### **Phase 3: Integration**
1. Create Pull Request to `develop`
2. Partner reviews the code
3. Resolve any conflicts
4. Merge to `develop` for integration testing

### **Phase 4: Production**
1. After integration testing on `develop`
2. Create Pull Request from `develop` to `main`
3. Final review and testing
4. Deploy to production

## 🚀 **Vercel Preview Deployments**

### **Automatic Previews**
- Every feature branch gets automatic preview deployment
- Preview URL: `https://your-feature-branch-name.vercel.app`
- Perfect for testing before integration

### **Manual Deployment**
```bash
# Deploy current branch to Vercel
vercel --prod
```

## 📝 **Commit Message Convention**

Use conventional commit format:
```
type(scope): description

feat: add new feature
fix: fix bug
docs: update documentation
style: formatting changes
refactor: code restructuring
test: add tests
chore: maintenance tasks
```

## 🔀 **Merging Process**

### **Feature → Develop**
```bash
# On GitHub: Create Pull Request
# From: feature/your-feature-name
# To: develop

# After approval, merge on GitHub
# Then locally:
git checkout develop
git pull origin develop
git branch -d feature/your-feature-name
```

### **Develop → Main**
```bash
# On GitHub: Create Pull Request
# From: develop
# To: main

# After final testing, merge on GitHub
# Then locally:
git checkout main
git pull origin main
```

## 🚨 **Conflict Resolution**

### **Preventing Conflicts**
1. Always work on feature branches
2. Pull latest `develop` before creating feature branch
3. Communicate with partner about overlapping changes
4. Keep features small and focused

### **Resolving Conflicts**
```bash
# If conflicts occur during merge:
git status                    # Check conflicted files
# Edit conflicted files manually
git add .                     # Mark conflicts as resolved
git commit -m "resolve merge conflicts"
```

## 🛠️ **Development Environment Setup**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Git
- Vercel CLI (optional)

### **Initial Setup**
```bash
# Install dependencies
npm install

# Set up environment variables
cp env.template .env.local
# Edit .env.local with your values

# Start development server
npm run dev
```

### **Environment Variables**
Copy `env.template` to `.env.local` and fill in:
- Supabase credentials
- OpenAI API key
- Other service keys as needed

## 📱 **Testing Strategy**

### **Local Testing**
```bash
npm run dev          # Start development server
npm run build        # Test build process
npm run lint         # Check code quality
```

### **Preview Testing**
- Use Vercel preview deployments
- Test on different devices/browsers
- Verify all functionality works

### **Integration Testing**
- Test on `develop` branch
- Ensure compatibility with partner's changes
- Run full application tests

## 🔒 **Security & Best Practices**

### **Never Commit**
- API keys or secrets
- `.env.local` file
- Node modules
- Build artifacts

### **Always Commit**
- Source code changes
- Configuration files
- Documentation updates
- Test files

## 📞 **Communication Protocol**

### **Daily Standup**
- Share what you're working on
- Mention any potential conflicts
- Update on feature progress

### **Before Merging**
- Notify partner about major changes
- Discuss integration approach
- Plan testing strategy

## 🚀 **Quick Reference Commands**

```bash
# Daily workflow
git checkout develop && git pull origin develop
git checkout -b feature/new-feature
# ... work on feature ...
git add . && git commit -m "feat: description"
git push origin feature/new-feature

# Update feature branch with latest develop
git checkout develop && git pull origin develop
git checkout feature/your-feature
git merge develop

# Clean up after merge
git checkout develop
git branch -d feature/your-feature
```

## 🎯 **Current Project Status**

- **Main Branch**: Production-ready code
- **Develop Branch**: Integration testing
- **AI Accuracy System**: Partner's current feature
- **Your Focus**: User profile enhancements

## 📚 **Additional Resources**

- [Git Flow Documentation](https://nvie.com/posts/a-successful-git-branching-model/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

---

**Remember**: Always communicate with your partner, test thoroughly, and keep the `main` branch stable! 🚀 