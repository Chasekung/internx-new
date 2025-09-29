#!/usr/bin/env python3
"""
Script to fix all remaining Supabase client initialization issues
"""

import os
import re
from pathlib import Path

def fix_file(file_path):
    """Fix a single file by replacing createClientComponentClient with useSupabase hook"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Check if file already uses useSupabase
        if 'useSupabase' in content:
            print(f"  ✓ Already fixed: {file_path}")
            return False
        
        # Add useSupabase import if not present
        if 'createClientComponentClient' in content and 'useSupabase' not in content:
            # Add import
            if "from '@/hooks/useSupabase'" not in content:
                # Find the last import line
                import_pattern = r'^import.*$'
                imports = re.findall(import_pattern, content, re.MULTILINE)
                if imports:
                    last_import = imports[-1]
                    content = content.replace(last_import, f"{last_import}\nimport {{ useSupabase }} from '@/hooks/useSupabase';")
            
            # Replace createClientComponentClient import
            content = re.sub(
                r'import.*createClientComponentClient.*from.*@supabase/auth-helpers-nextjs.*\n?',
                '',
                content
            )
            
            # Replace the client initialization pattern
            # Pattern 1: const [supabase, setSupabase] = useState<any>(null);
            content = re.sub(
                r'const \[supabase, setSupabase\] = useState<any>\(null\);',
                'const { supabase, error: supabaseError } = useSupabase();',
                content
            )
            
            # Pattern 2: const client = createClientComponentClient();
            content = re.sub(
                r'const client = createClientComponentClient\(\);',
                '',
                content
            )
            
            # Pattern 3: setSupabase(client);
            content = re.sub(
                r'setSupabase\(client\);',
                '',
                content
            )
            
            # Pattern 4: Remove the entire useEffect that initializes Supabase
            content = re.sub(
                r'// Initialize Supabase client when component mounts\s*\n\s*useEffect\(\(\) => \{\s*\n\s*const client = createClientComponentClient\(\);\s*\n\s*setSupabase\(client\);\s*\n\s*\}, \[\]\);',
                '',
                content
            )
            
            # Pattern 5: Remove useEffect with just createClientComponentClient
            content = re.sub(
                r'useEffect\(\(\) => \{\s*\n\s*const client = createClientComponentClient\(\);\s*\n\s*setSupabase\(client\);\s*\n\s*\}, \[\]\);',
                '',
                content
            )
            
            # Add error handling to useEffect that depends on supabase
            # Find useEffect that checks if (!supabase) return;
            supabase_use_effects = re.finditer(
                r'useEffect\(\(\) => \{\s*\n\s*if \(!supabase\) return;',
                content,
                re.MULTILINE
            )
            
            for match in supabase_use_effects:
                start_pos = match.start()
                # Find the end of this useEffect
                brace_count = 0
                end_pos = start_pos
                for i, char in enumerate(content[start_pos:], start_pos):
                    if char == '{':
                        brace_count += 1
                    elif char == '}':
                        brace_count -= 1
                        if brace_count == 0:
                            end_pos = i + 1
                            break
                
                if end_pos > start_pos:
                    useEffect_content = content[start_pos:end_pos]
                    # Add error check
                    if 'supabaseError' not in useEffect_content:
                        new_use_effect = useEffect_content.replace(
                            'if (!supabase) return;',
                            'if (!supabase) return;\n    if (supabaseError) {\n      console.error(\'Supabase error:\', supabaseError);\n      return;\n    }'
                        )
                        content = content.replace(useEffect_content, new_use_effect)
            
            # Add supabaseError to useEffect dependencies
            content = re.sub(
                r'}, \[supabase\]\);',
                '}, [supabase, supabaseError]);',
                content
            )
            
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"  ✓ Fixed: {file_path}")
                return True
            else:
                print(f"  - No changes needed: {file_path}")
                return False
                
    except Exception as e:
        print(f"  ✗ Error fixing {file_path}: {e}")
        return False

def main():
    """Main function to fix all files"""
    print("🔧 Fixing all remaining Supabase client initialization issues...")
    
    # Get all TypeScript/TSX files
    tsx_files = []
    for root, dirs, files in os.walk('.'):
        for file in files:
            if file.endswith(('.tsx', '.ts')) and 'node_modules' not in root:
                tsx_files.append(os.path.join(root, file))
    
    # Filter files that need fixing
    files_to_fix = []
    for file_path in tsx_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                if 'createClientComponentClient' in content and 'useSupabase' not in content:
                    files_to_fix.append(file_path)
        except:
            continue
    
    print(f"Found {len(files_to_fix)} files that need fixing:")
    
    fixed_count = 0
    for file_path in files_to_fix:
        print(f"\nProcessing: {file_path}")
        if fix_file(file_path):
            fixed_count += 1
    
    print(f"\n🎉 Fixed {fixed_count} out of {len(files_to_fix)} files!")
    
    # Check for any remaining issues
    remaining_files = []
    for file_path in tsx_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                if 'createClientComponentClient' in content and 'useSupabase' not in content:
                    remaining_files.append(file_path)
        except:
            continue
    
    if remaining_files:
        print(f"\n⚠️  {len(remaining_files)} files still have issues:")
        for file_path in remaining_files:
            print(f"  - {file_path}")
    else:
        print("\n✅ All Supabase client issues have been resolved!")

if __name__ == "__main__":
    main() 