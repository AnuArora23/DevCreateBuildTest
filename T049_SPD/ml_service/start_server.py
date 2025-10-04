#!/usr/bin/env python3
"""
Startup script for the Plant Disease Detection API
"""

import sys
import subprocess
import os
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ is required")
        return False
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    return True

def check_dependencies():
    """Check if required packages are installed"""
    required_packages = [
        'fastapi', 'uvicorn', 'tensorflow', 'opencv-python', 
        'PIL', 'numpy', 'multipart'
    ]
    
    missing = []
    for package in required_packages:
        try:
            if package == 'PIL':
                __import__('PIL')
            elif package == 'opencv-python':
                __import__('cv2')
            else:
                __import__(package)
        except ImportError:
            missing.append(package)
    
    if missing:
        print(f"❌ Missing packages: {', '.join(missing)}")
        print("   Run: pip install -r requirements.txt")
        return False
    
    print("✅ All required packages are installed")
    return True

def check_directories():
    """Check if required directories exist"""
    base_dir = Path(__file__).parent
    required_dirs = [
        base_dir / "models",
        base_dir / "models" / "disease_models",
        base_dir / "logs",
        base_dir / "temp"
    ]
    
    for directory in required_dirs:
        directory.mkdir(parents=True, exist_ok=True)
    
    print("✅ Required directories created/verified")
    return True

def check_models():
    """Check if model files are present"""
    base_dir = Path(__file__).parent
    models_dir = base_dir / "models" / "disease_models"
    crop_detector = base_dir / "models" / "crop_detector.keras"
    
    # Check for disease models
    disease_models = list(models_dir.glob("*.keras"))
    
    if not disease_models:
        print("⚠️  No disease detection models found in models/disease_models/")
        print("   Place your .keras model files there")
    else:
        print(f"✅ Found {len(disease_models)} disease detection model(s)")
    
    if not crop_detector.exists():
        print("⚠️  Crop detector model not found at models/crop_detector.keras")
        print("   The system will use a dummy model for development")
    else:
        print("✅ Crop detector model found")
    
    return True

def start_server():
    """Start the FastAPI server"""
    print("\n🚀 Starting Plant Disease Detection API server...")
    print("   Server will be available at: http://localhost:8000")
    print("   API Documentation: http://localhost:8000/docs")
    print("   Press Ctrl+C to stop the server\n")
    
    try:
        # Start the server using uvicorn
        cmd = [
            sys.executable, "-m", "uvicorn", 
            "app:app",
            "--host", "0.0.0.0",
            "--port", "8000",
            "--reload"
        ]
        
        subprocess.run(cmd, cwd=Path(__file__).parent)
        
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        return False
    
    return True

def main():
    """Main function to run all checks and start server"""
    print("🌿 Plant Disease Detection API - Startup Script")
    print("=" * 50)
    
    # Run all checks
    checks = [
        ("Python Version", check_python_version),
        ("Dependencies", check_dependencies),
        ("Directories", check_directories),
        ("Models", check_models),
    ]
    
    all_passed = True
    for check_name, check_func in checks:
        print(f"\n🔍 Checking {check_name}...")
        if not check_func():
            all_passed = False
    
    if not all_passed:
        print("\n❌ Some checks failed. Please fix the issues before starting.")
        return 1
    
    print("\n✅ All checks passed!")
    
    # Ask user if they want to start the server
    try:
        start = input("\n▶️  Start the server? (Y/n): ").strip().lower()
        if start in ('', 'y', 'yes'):
            start_server()
        else:
            print("👍 Server not started. Run 'python app.py' when ready.")
            
    except KeyboardInterrupt:
        print("\n👋 Goodbye!")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())