"""
Basic syntax test for PulseWave modules without importing pandas/numpy
"""

import ast
import sys


def check_python_syntax(filename):
    """Check if a Python file has valid syntax"""
    try:
        with open(filename, 'r') as f:
            source = f.read()
        
        # Parse the AST to check syntax
        ast.parse(source)
        print(f"✓ {filename} - Syntax OK")
        return True
        
    except SyntaxError as e:
        print(f"❌ {filename} - Syntax Error: {e}")
        return False
    except Exception as e:
        print(f"❌ {filename} - Error: {e}")
        return False


def main():
    """Test all module files"""
    files_to_test = [
        'sr_engine.py',
        'regime_detector.py', 
        'confluence_scorer.py',
        'signal_generator.py',
        'backtester.py',
        'data_fetcher.py',
        'main.py',
        '__init__.py'
    ]
    
    print("Testing Python syntax for all modules...")
    print("=" * 50)
    
    all_good = True
    for filename in files_to_test:
        if not check_python_syntax(filename):
            all_good = False
    
    print("=" * 50)
    if all_good:
        print("🎉 All files have valid Python syntax!")
    else:
        print("❌ Some files have syntax errors")
        sys.exit(1)


if __name__ == "__main__":
    main()