#!/usr/bin/env python3
"""
Simple test script to verify the Flask backend is working correctly.
"""

import requests
import json
import time

def test_backend():
    """Test the Flask backend endpoints."""
    base_url = "http://localhost:5000"
    
    print("🧪 Testing Sherlock Holmes AI Backend...")
    print("=" * 50)
    
    # Test health check
    print("1. Testing health check...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Is the server running?")
        return False
    
    # Test chat endpoint
    print("\n2. Testing chat endpoint...")
    try:
        chat_data = {
            "message": "Hello, Sherlock! Can you tell me about deduction?",
            "session_id": "test_session_001"
        }
        
        response = requests.post(
            f"{base_url}/api/chat",
            json=chat_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            print("✅ Chat endpoint working")
            result = response.json()
            print(f"   Response: {result['response'][:100]}...")
        else:
            print(f"❌ Chat endpoint failed: {response.status_code}")
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"❌ Chat test failed: {str(e)}")
    
    # Test cases endpoint
    print("\n3. Testing cases endpoint...")
    try:
        response = requests.get(f"{base_url}/api/cases")
        if response.status_code == 200:
            print("✅ Cases endpoint working")
            cases = response.json()
            print(f"   Found {cases['count']} cases")
        else:
            print(f"❌ Cases endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Cases test failed: {str(e)}")
    
    # Test search endpoint
    print("\n4. Testing search endpoint...")
    try:
        search_data = {
            "query": "murder mystery",
            "limit": 3
        }
        
        response = requests.post(
            f"{base_url}/api/search",
            json=search_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            print("✅ Search endpoint working")
            results = response.json()
            print(f"   Found {results['count']} results")
        else:
            print(f"❌ Search endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Search test failed: {str(e)}")
    
    print("\n" + "=" * 50)
    print("🎉 Backend testing completed!")
    
    return True

if __name__ == "__main__":
    test_backend()
