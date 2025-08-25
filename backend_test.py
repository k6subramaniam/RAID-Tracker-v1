#!/usr/bin/env python3
"""
Backend API Testing for RAIDMASTER Multi-AI API
Tests all AI provider management endpoints as requested in the review.
"""

import requests
import json
import time
import uuid
from typing import Dict, Any, List

class BackendAPITester:
    def __init__(self, base_url: str = "http://localhost:8001"):
        self.base_url = base_url
        self.session = requests.Session()
        self.test_results = []
        self.test_provider_ids = []  # Track created providers for cleanup
        
    def log_result(self, test_name: str, success: bool, message: str, details: Dict = None):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details or {},
            "timestamp": time.strftime('%Y-%m-%d %H:%M:%S')
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if details:
            print(f"    Details: {details}")
    
    def test_health_endpoint(self):
        """Test GET /api/health - Check if the service is running"""
        try:
            response = self.session.get(f"{self.base_url}/api/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                expected_fields = ["status", "service", "providers_count", "active_providers"]
                
                if all(field in data for field in expected_fields):
                    self.log_result(
                        "Health Check", 
                        True, 
                        f"Service is healthy - {data.get('service', 'Unknown')}", 
                        {
                            "status": data.get("status"),
                            "providers_count": data.get("providers_count"),
                            "active_providers": data.get("active_providers")
                        }
                    )
                else:
                    self.log_result(
                        "Health Check", 
                        False, 
                        f"Missing expected fields in response", 
                        {"received_fields": list(data.keys()), "expected_fields": expected_fields}
                    )
            else:
                self.log_result(
                    "Health Check", 
                    False, 
                    f"HTTP {response.status_code}: {response.text[:100]}"
                )
                
        except Exception as e:
            self.log_result("Health Check", False, f"Connection error: {str(e)}")
    
    def test_get_providers(self):
        """Test GET /api/ai/providers - Get list of AI providers"""
        try:
            response = self.session.get(f"{self.base_url}/api/ai/providers", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if "providers" in data and isinstance(data["providers"], list):
                    providers = data["providers"]
                    provider_count = len(providers)
                    
                    # Check if default providers are loaded
                    provider_names = [p.get("name", "") for p in providers]
                    
                    self.log_result(
                        "Get Providers", 
                        True, 
                        f"Retrieved {provider_count} providers successfully", 
                        {
                            "provider_count": provider_count,
                            "provider_names": provider_names[:5],  # Show first 5
                            "sample_provider": providers[0] if providers else None
                        }
                    )
                else:
                    self.log_result(
                        "Get Providers", 
                        False, 
                        "Invalid response format - missing 'providers' array", 
                        {"response": data}
                    )
            else:
                self.log_result(
                    "Get Providers", 
                    False, 
                    f"HTTP {response.status_code}: {response.text[:100]}"
                )
                
        except Exception as e:
            self.log_result("Get Providers", False, f"Request error: {str(e)}")
    
    def test_add_provider(self):
        """Test POST /api/ai/providers - Add a new AI provider"""
        try:
            # Create test provider data
            test_provider = {
                "id": f"test_provider_{uuid.uuid4().hex[:8]}",
                "name": "Test OpenAI Provider",
                "provider": "openai",
                "model": "gpt-4o",
                "api_key": "sk-test-key-for-testing-purposes-only",
                "enabled": True
            }
            
            response = self.session.post(
                f"{self.base_url}/api/ai/providers", 
                json=test_provider,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if "message" in data and "provider_id" in data:
                    provider_id = data["provider_id"]
                    self.test_provider_ids.append(provider_id)  # Track for cleanup
                    
                    self.log_result(
                        "Add Provider", 
                        True, 
                        f"Provider added successfully with ID: {provider_id}", 
                        {
                            "provider_id": provider_id,
                            "message": data["message"]
                        }
                    )
                else:
                    self.log_result(
                        "Add Provider", 
                        False, 
                        "Invalid response format", 
                        {"response": data}
                    )
            else:
                self.log_result(
                    "Add Provider", 
                    False, 
                    f"HTTP {response.status_code}: {response.text[:100]}"
                )
                
        except Exception as e:
            self.log_result("Add Provider", False, f"Request error: {str(e)}")
    
    def test_update_provider(self):
        """Test PUT /api/ai/providers/{id} - Update an AI provider"""
        if not self.test_provider_ids:
            self.log_result("Update Provider", False, "No test provider available to update")
            return
            
        try:
            provider_id = self.test_provider_ids[0]
            
            # Updated provider data
            updated_provider = {
                "id": provider_id,
                "name": "Updated Test Provider",
                "provider": "openai",
                "model": "gpt-4o-mini",
                "api_key": "sk-updated-test-key-for-testing",
                "enabled": False
            }
            
            response = self.session.put(
                f"{self.base_url}/api/ai/providers/{provider_id}", 
                json=updated_provider,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if "message" in data:
                    self.log_result(
                        "Update Provider", 
                        True, 
                        f"Provider {provider_id} updated successfully", 
                        {"message": data["message"]}
                    )
                else:
                    self.log_result(
                        "Update Provider", 
                        False, 
                        "Invalid response format", 
                        {"response": data}
                    )
            else:
                self.log_result(
                    "Update Provider", 
                    False, 
                    f"HTTP {response.status_code}: {response.text[:100]}"
                )
                
        except Exception as e:
            self.log_result("Update Provider", False, f"Request error: {str(e)}")
    
    def test_validate_provider(self):
        """Test POST /api/ai/providers/{id}/validate - Validate a specific provider"""
        if not self.test_provider_ids:
            self.log_result("Validate Provider", False, "No test provider available to validate")
            return
            
        try:
            provider_id = self.test_provider_ids[0]
            
            response = self.session.post(
                f"{self.base_url}/api/ai/providers/{provider_id}/validate",
                timeout=30  # Validation might take longer
            )
            
            if response.status_code == 200:
                data = response.json()
                expected_fields = ["valid", "status", "message"]
                
                if all(field in data for field in expected_fields):
                    self.log_result(
                        "Validate Provider", 
                        True, 
                        f"Validation completed - Valid: {data['valid']}, Status: {data['status']}", 
                        {
                            "valid": data["valid"],
                            "status": data["status"],
                            "message": data["message"],
                            "response_time": data.get("response_time")
                        }
                    )
                else:
                    self.log_result(
                        "Validate Provider", 
                        False, 
                        "Invalid response format", 
                        {"response": data}
                    )
            else:
                self.log_result(
                    "Validate Provider", 
                    False, 
                    f"HTTP {response.status_code}: {response.text[:100]}"
                )
                
        except Exception as e:
            self.log_result("Validate Provider", False, f"Request error: {str(e)}")
    
    def test_validate_all_providers(self):
        """Test POST /api/ai/providers/validate-all - Validate all providers"""
        try:
            response = self.session.post(
                f"{self.base_url}/api/ai/providers/validate-all",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if "message" in data and "providers_count" in data:
                    self.log_result(
                        "Validate All Providers", 
                        True, 
                        f"Validation started for {data['providers_count']} providers", 
                        {
                            "message": data["message"],
                            "providers_count": data["providers_count"]
                        }
                    )
                else:
                    self.log_result(
                        "Validate All Providers", 
                        False, 
                        "Invalid response format", 
                        {"response": data}
                    )
            else:
                self.log_result(
                    "Validate All Providers", 
                    False, 
                    f"HTTP {response.status_code}: {response.text[:100]}"
                )
                
        except Exception as e:
            self.log_result("Validate All Providers", False, f"Request error: {str(e)}")
    
    def test_analyze_text(self):
        """Test POST /api/analyze - Analyze text with AI providers (using /api/analyze endpoint)"""
        try:
            # Create sample RAID item for analysis
            sample_raid_item = {
                "id": f"test_item_{uuid.uuid4().hex[:8]}",
                "type": "Risk",
                "title": "API Rate Limiting Risk",
                "description": "Third-party API may impose rate limits that could affect system performance during peak usage periods.",
                "status": "Open",
                "priority": "P2",
                "impact": "Medium",
                "likelihood": "High",
                "workstream": "Backend Development",
                "owner": "Backend Team",
                "dueDate": "2025-02-15"
            }
            
            analysis_request = {
                "item": sample_raid_item,
                "analysisType": "analysis"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/analyze",
                json=analysis_request,
                timeout=30  # AI analysis might take longer
            )
            
            if response.status_code == 200:
                data = response.json()
                expected_fields = ["analysis", "suggestedPriority", "confidence", "flags", "provider_used", "response_time"]
                
                if all(field in data for field in expected_fields):
                    self.log_result(
                        "Analyze Text", 
                        True, 
                        f"Analysis completed using {data['provider_used']}", 
                        {
                            "provider_used": data["provider_used"],
                            "suggested_priority": data["suggestedPriority"],
                            "confidence": data["confidence"],
                            "response_time": data["response_time"],
                            "flags_count": len(data["flags"]),
                            "analysis_preview": data["analysis"][:100] + "..." if len(data["analysis"]) > 100 else data["analysis"]
                        }
                    )
                else:
                    self.log_result(
                        "Analyze Text", 
                        False, 
                        "Invalid response format", 
                        {"response": data, "missing_fields": [f for f in expected_fields if f not in data]}
                    )
            elif response.status_code == 503:
                self.log_result(
                    "Analyze Text", 
                    False, 
                    "No active AI providers available for analysis", 
                    {"status_code": response.status_code, "response": response.text[:200]}
                )
            else:
                self.log_result(
                    "Analyze Text", 
                    False, 
                    f"HTTP {response.status_code}: {response.text[:100]}"
                )
                
        except Exception as e:
            self.log_result("Analyze Text", False, f"Request error: {str(e)}")
    
    def test_delete_provider(self):
        """Test DELETE /api/ai/providers/{id} - Delete an AI provider"""
        if not self.test_provider_ids:
            self.log_result("Delete Provider", False, "No test provider available to delete")
            return
            
        try:
            provider_id = self.test_provider_ids[0]
            
            response = self.session.delete(
                f"{self.base_url}/api/ai/providers/{provider_id}",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if "message" in data:
                    self.log_result(
                        "Delete Provider", 
                        True, 
                        f"Provider {provider_id} deleted successfully", 
                        {"message": data["message"]}
                    )
                    self.test_provider_ids.remove(provider_id)  # Remove from tracking
                else:
                    self.log_result(
                        "Delete Provider", 
                        False, 
                        "Invalid response format", 
                        {"response": data}
                    )
            else:
                self.log_result(
                    "Delete Provider", 
                    False, 
                    f"HTTP {response.status_code}: {response.text[:100]}"
                )
                
        except Exception as e:
            self.log_result("Delete Provider", False, f"Request error: {str(e)}")
    
    def cleanup_test_providers(self):
        """Clean up any remaining test providers"""
        for provider_id in self.test_provider_ids[:]:
            try:
                response = self.session.delete(f"{self.base_url}/api/ai/providers/{provider_id}", timeout=5)
                if response.status_code == 200:
                    print(f"🧹 Cleaned up test provider: {provider_id}")
                    self.test_provider_ids.remove(provider_id)
            except:
                pass  # Ignore cleanup errors
    
    def run_all_tests(self):
        """Run all API tests in sequence"""
        print("🚀 Starting Backend API Testing for RAIDMASTER Multi-AI API")
        print("=" * 60)
        
        # Test sequence as requested in review
        self.test_health_endpoint()
        self.test_get_providers()
        self.test_add_provider()
        self.test_update_provider()
        self.test_validate_provider()
        self.test_validate_all_providers()
        self.test_analyze_text()
        self.test_delete_provider()
        
        # Cleanup
        self.cleanup_test_providers()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for r in self.test_results if r["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  ❌ {result['test']}: {result['message']}")
        
        return {
            "total": total_tests,
            "passed": passed_tests,
            "failed": failed_tests,
            "success_rate": (passed_tests/total_tests)*100,
            "results": self.test_results
        }

if __name__ == "__main__":
    # Run the tests
    tester = BackendAPITester()
    summary = tester.run_all_tests()
    
    # Save detailed results to file
    with open("/app/backend_test_results.json", "w") as f:
        json.dump(summary, f, indent=2)
    
    print(f"\n💾 Detailed results saved to: /app/backend_test_results.json")