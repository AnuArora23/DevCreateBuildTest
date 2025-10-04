#!/usr/bin/env python3
"""
Simple test script to verify the Plant Disease Detection API
"""

import requests
import json
import sys
from pathlib import Path

API_BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test the health check endpoint"""
    try:
        response = requests.get(f"{API_BASE_URL}/")
        response.raise_for_status()
        print("✅ Health check passed")
        print(f"   Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_get_models():
    """Test getting available models"""
    try:
        response = requests.get(f"{API_BASE_URL}/models")
        response.raise_for_status()
        data = response.json()
        print("✅ Get models endpoint working")
        print(f"   Available models: {data.get('available_models', [])}")
        return True
    except Exception as e:
        print(f"❌ Get models failed: {e}")
        return False

def test_model_status():
    """Test getting model status"""
    try:
        response = requests.get(f"{API_BASE_URL}/model-status")
        response.raise_for_status()
        data = response.json()
        print("✅ Model status endpoint working")
        print(f"   Crop detector loaded: {data.get('crop_detector', {}).get('loaded', False)}")
        return True
    except Exception as e:
        print(f"❌ Model status failed: {e}")
        return False

def test_detect_disease_with_dummy_image():
    """Test disease detection with a dummy image (if available)"""
    # Create a simple test image
    try:
        from PIL import Image
        import io
        
        # Create a simple RGB image
        img = Image.new('RGB', (224, 224), color='green')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        
        files = {'image': ('test.jpg', img_bytes, 'image/jpeg')}
        response = requests.post(f"{API_BASE_URL}/detect-crop-only", files=files)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Crop detection endpoint working")
            print(f"   Detected crop: {data.get('crop_type', 'unknown')}")
            print(f"   Confidence: {data.get('confidence', 0):.3f}")
            return True
        else:
            print(f"❌ Crop detection failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except ImportError:
        print("⚠️  PIL not available, skipping image test")
        return True
    except Exception as e:
        print(f"❌ Disease detection test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing Plant Disease Detection API")
    print("=" * 50)
    
    tests = [
        ("Health Check", test_health_check),
        ("Get Models", test_get_models),
        ("Model Status", test_model_status),
        ("Image Detection", test_detect_disease_with_dummy_image),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Running {test_name}...")
        if test_func():
            passed += 1
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! API is working correctly.")
        return 0
    else:
        print("⚠️  Some tests failed. Check the API server and models.")
        return 1

if __name__ == "__main__":
    sys.exit(main())