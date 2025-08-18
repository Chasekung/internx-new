#!/bin/bash

# 🚀 InternX Feature Development Script
# This script automates the daily workflow for feature development

echo "🚀 Welcome to InternX Development Workflow!"

# Function to start a new feature
start_feature() {
    echo "📋 Starting new feature development..."
    
    # Switch to develop and pull latest
    echo "🔄 Updating develop branch..."
    git checkout develop
    git pull origin develop
    
    # Get feature name from user
    read -p "🎯 Enter feature name (e.g., user-profile-enhancement): " feature_name
    
    # Create feature branch
    branch_name="feature/$feature_name"
    echo "🌿 Creating feature branch: $branch_name"
    git checkout -b "$branch_name"
    
    echo "✅ Feature branch created successfully!"
    echo "📍 Current branch: $(git branch --show-current)"
    echo "🚀 You can now start developing your feature!"
}

# Function to update feature branch with latest develop
update_feature() {
    echo "🔄 Updating feature branch with latest develop..."
    
    current_branch=$(git branch --show-current)
    if [[ $current_branch == develop ]]; then
        echo "❌ You're currently on develop branch. Switch to a feature branch first."
        return 1
    fi
    
    echo "📥 Pulling latest changes from develop..."
    git checkout develop
    git pull origin develop
    
    echo "🔄 Merging latest develop into your feature branch..."
    git checkout "$current_branch"
    git merge develop
    
    echo "✅ Feature branch updated successfully!"
}

# Function to finish feature development
finish_feature() {
    echo "🏁 Finishing feature development..."
    
    current_branch=$(git branch --show-current)
    if [[ $current_branch == develop ]] || [[ $current_branch == main ]]; then
        echo "❌ You're on a protected branch. Switch to a feature branch first."
        return 1
    fi
    
    echo "📤 Pushing feature branch to remote..."
    git push origin "$current_branch"
    
    echo "✅ Feature branch pushed successfully!"
    echo "📋 Next steps:"
    echo "   1. Create Pull Request on GitHub from $current_branch to develop"
    echo "   2. Wait for partner review and approval"
    echo "   3. Merge on GitHub"
    echo "   4. Run: git checkout develop && git pull origin develop"
    echo "   5. Run: git branch -d $current_branch"
}

# Function to show current status
show_status() {
    echo "📊 Current Development Status:"
    echo "📍 Current branch: $(git branch --show-current)"
    echo "🔄 Remote status:"
    git status --porcelain
    echo ""
    echo "🌿 Available branches:"
    git branch -a
}

# Main menu
while true; do
    echo ""
    echo "🎯 InternX Development Menu:"
    echo "1. 🚀 Start new feature"
    echo "2. 🔄 Update feature branch with latest develop"
    echo "3. 🏁 Finish feature development"
    echo "4. 📊 Show current status"
    echo "5. 🚪 Exit"
    echo ""
    read -p "Choose an option (1-5): " choice
    
    case $choice in
        1)
            start_feature
            ;;
        2)
            update_feature
            ;;
        3)
            finish_feature
            ;;
        4)
            show_status
            ;;
        5)
            echo "👋 Goodbye! Happy coding!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please choose 1-5."
            ;;
    esac
done 