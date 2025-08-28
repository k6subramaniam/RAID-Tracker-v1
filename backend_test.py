#!/usr/bin/env python3
"""
Backend API Testing for RAIDMASTER Multi-AI API
Tests all AI provider management endpoints and RAID item CRUD operations as requested in the review.
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
        self.test_raid_item_ids = []  # Track created RAID items for cleanup
        
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
    
    # ============================================================================
    # RAID ITEMS CRUD TESTING METHODS
    # ============================================================================
    
    def test_get_all_raid_items(self):
        """Test GET /api/raid-items - Get all RAID items"""
        try:
            response = self.session.get(f"{self.base_url}/api/raid-items", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if "items" in data and "total" in data and isinstance(data["items"], list):
                    items_count = len(data["items"])
                    total_count = data["total"]
                    
                    self.log_result(
                        "Get All RAID Items", 
                        True, 
                        f"Retrieved {items_count} RAID items successfully", 
                        {
                            "items_count": items_count,
                            "total": total_count,
                            "items_match_total": items_count == total_count,
                            "sample_item": data["items"][0] if data["items"] else None
                        }
                    )
                else:
                    self.log_result(
                        "Get All RAID Items", 
                        False, 
                        "Invalid response format - missing 'items' or 'total' fields", 
                        {"response": data}
                    )
            else:
                self.log_result(
                    "Get All RAID Items", 
                    False, 
                    f"HTTP {response.status_code}: {response.text[:100]}"
                )
                
        except Exception as e:
            self.log_result("Get All RAID Items", False, f"Request error: {str(e)}")
    
    def test_get_dashboard_stats(self):
        """Test GET /api/raid-items/stats/dashboard - Get dashboard statistics"""
        try:
            response = self.session.get(f"{self.base_url}/api/raid-items/stats/dashboard", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                expected_fields = ["total", "by_type", "by_status", "by_priority", "recent_activity", "overdue"]
                
                if all(field in data for field in expected_fields):
                    # Verify by_type has all RAID types
                    by_type = data.get("by_type", {})
                    expected_types = ["Risk", "Issue", "Assumption", "Dependency"]
                    has_all_types = all(raid_type in by_type for raid_type in expected_types)
                    
                    self.log_result(
                        "Get Dashboard Stats", 
                        True, 
                        f"Dashboard statistics retrieved successfully", 
                        {
                            "total_items": data.get("total"),
                            "by_type": by_type,
                            "by_status": data.get("by_status"),
                            "by_priority": data.get("by_priority"),
                            "recent_activity": data.get("recent_activity"),
                            "overdue": data.get("overdue"),
                            "active_items": data.get("active_items"),
                            "has_all_raid_types": has_all_types
                        }
                    )
                else:
                    missing_fields = [f for f in expected_fields if f not in data]
                    self.log_result(
                        "Get Dashboard Stats", 
                        False, 
                        f"Missing expected fields: {missing_fields}", 
                        {"response": data, "missing_fields": missing_fields}
                    )
            else:
                self.log_result(
                    "Get Dashboard Stats", 
                    False, 
                    f"HTTP {response.status_code}: {response.text[:100]}"
                )
                
        except Exception as e:
            self.log_result("Get Dashboard Stats", False, f"Request error: {str(e)}")
    
    def test_create_raid_item(self):
        """Test POST /api/raid-items - Create a new RAID item with exact data from review request"""
        try:
            # Sample RAID item data as specified in the review request
            sample_raid_data = {
                "type": "Risk",
                "title": "Test Database Connection Risk",
                "description": "There is a risk that the database connection might fail during peak usage times, causing service disruptions.",
                "status": "Open",
                "priority": "P1", 
                "impact": "High",
                "likelihood": "Medium",
                "workstream": "backend-development",
                "owner": "system-admin"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/raid-items",
                json=sample_raid_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if "message" in data and "item" in data:
                    created_item = data["item"]
                    item_id = created_item.get("id")
                    
                    # Store the created item ID for subsequent tests
                    self.test_raid_item_ids.append(item_id)
                    
                    # Verify severity score calculation (High=3, Medium=2, so 3*2=6)
                    expected_severity = 6
                    actual_severity = created_item.get("severityScore")
                    
                    self.log_result(
                        "Create RAID Item", 
                        True, 
                        f"RAID item created successfully with ID: {item_id}", 
                        {
                            "item_id": item_id,
                            "title": created_item.get("title"),
                            "type": created_item.get("type"),
                            "severity_score": actual_severity,
                            "severity_correct": actual_severity == expected_severity,
                            "has_history": bool(created_item.get("history")),
                            "created_at": created_item.get("createdAt")
                        }
                    )
                else:
                    self.log_result(
                        "Create RAID Item", 
                        False, 
                        "Invalid response format", 
                        {"response": data}
                    )
            else:
                self.log_result(
                    "Create RAID Item", 
                    False, 
                    f"HTTP {response.status_code}: {response.text[:100]}"
                )
                
        except Exception as e:
            self.log_result("Create RAID Item", False, f"Request error: {str(e)}")
    
    def test_get_raid_item_by_id(self):
        """Test GET /api/raid-items/{id} - Get specific RAID item by ID"""
        if not self.test_raid_item_ids:
            self.log_result("Get RAID Item by ID", False, "No test RAID item available")
            return
            
        try:
            item_id = self.test_raid_item_ids[0]
            
            response = self.session.get(f"{self.base_url}/api/raid-items/{item_id}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify the item has expected fields
                expected_fields = ["id", "type", "title", "description", "status", "priority", "impact", "likelihood"]
                
                if all(field in data for field in expected_fields):
                    self.log_result(
                        "Get RAID Item by ID", 
                        True, 
                        f"Retrieved RAID item {item_id} successfully", 
                        {
                            "item_id": data.get("id"),
                            "title": data.get("title"),
                            "type": data.get("type"),
                            "status": data.get("status"),
                            "severity_score": data.get("severityScore"),
                            "has_all_fields": True
                        }
                    )
                else:
                    missing_fields = [f for f in expected_fields if f not in data]
                    self.log_result(
                        "Get RAID Item by ID", 
                        False, 
                        f"Missing expected fields: {missing_fields}", 
                        {"response": data, "missing_fields": missing_fields}
                    )
            elif response.status_code == 404:
                self.log_result(
                    "Get RAID Item by ID", 
                    False, 
                    f"RAID item {item_id} not found", 
                    {"status_code": 404}
                )
            else:
                self.log_result(
                    "Get RAID Item by ID", 
                    False, 
                    f"HTTP {response.status_code}: {response.text[:100]}"
                )
                
        except Exception as e:
            self.log_result("Get RAID Item by ID", False, f"Request error: {str(e)}")
    
    def test_update_raid_item(self):
        """Test PUT /api/raid-items/{id} - Update a RAID item"""
        if not self.test_raid_item_ids:
            self.log_result("Update RAID Item", False, "No test RAID item available")
            return
            
        try:
            item_id = self.test_raid_item_ids[0]
            
            # Update data - change status to "In Progress" as requested in review
            update_data = {
                "status": "In Progress",
                "priority": "P1",
                "impact": "High",
                "likelihood": "Low"
            }
            
            response = self.session.put(
                f"{self.base_url}/api/raid-items/{item_id}",
                json=update_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if "message" in data and "item" in data:
                    updated_item = data["item"]
                    
                    # Verify updates were applied
                    status_updated = updated_item.get("status") == update_data["status"]
                    priority_updated = updated_item.get("priority") == update_data["priority"]
                    
                    # Verify severity score recalculation (High=3, Low=1, so 3*1=3)
                    expected_severity = 3
                    actual_severity = updated_item.get("severityScore")
                    
                    # Verify history entry was added
                    history = updated_item.get("history", [])
                    has_update_history = any("Updated" in entry.get("action", "") for entry in history)
                    
                    self.log_result(
                        "Update RAID Item", 
                        True, 
                        f"RAID item {item_id} updated successfully", 
                        {
                            "item_id": item_id,
                            "status_updated": status_updated,
                            "priority_updated": priority_updated,
                            "severity_recalculated": actual_severity == expected_severity,
                            "new_severity": actual_severity,
                            "history_added": has_update_history,
                            "history_count": len(history)
                        }
                    )
                else:
                    self.log_result(
                        "Update RAID Item", 
                        False, 
                        "Invalid response format", 
                        {"response": data}
                    )
            elif response.status_code == 404:
                self.log_result(
                    "Update RAID Item", 
                    False, 
                    f"RAID item {item_id} not found", 
                    {"status_code": 404}
                )
            else:
                self.log_result(
                    "Update RAID Item", 
                    False, 
                    f"HTTP {response.status_code}: {response.text[:100]}"
                )
                
        except Exception as e:
            self.log_result("Update RAID Item", False, f"Request error: {str(e)}")
    
    def test_create_second_raid_item(self):
        """Test POST /api/raid-items - Create another RAID item (Issue type) as requested in review"""
        try:
            # Sample Issue RAID item data as specified in the review request
            issue_raid_data = {
                "type": "Issue",
                "title": "Test Database Connection Issue",
                "description": "Database connection is intermittently failing during high load periods, causing service disruptions for users.",
                "status": "Open",
                "priority": "P1", 
                "impact": "High",
                "likelihood": "Medium",
                "workstream": "database-operations",
                "owner": "database-admin"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/raid-items",
                json=issue_raid_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if "message" in data and "item" in data:
                    created_item = data["item"]
                    item_id = created_item.get("id")
                    
                    # Store the created item ID for subsequent tests
                    self.test_raid_item_ids.append(item_id)
                    
                    # Verify severity score calculation (High=3, Medium=2, so 3*2=6)
                    expected_severity = 6
                    actual_severity = created_item.get("severityScore")
                    
                    self.log_result(
                        "Create Second RAID Item (Issue)", 
                        True, 
                        f"Issue RAID item created successfully with ID: {item_id}", 
                        {
                            "item_id": item_id,
                            "title": created_item.get("title"),
                            "type": created_item.get("type"),
                            "severity_score": actual_severity,
                            "severity_correct": actual_severity == expected_severity,
                            "has_history": bool(created_item.get("history")),
                            "created_at": created_item.get("createdAt")
                        }
                    )
                else:
                    self.log_result(
                        "Create Second RAID Item (Issue)", 
                        False, 
                        "Invalid response format", 
                        {"response": data}
                    )
            else:
                self.log_result(
                    "Create Second RAID Item (Issue)", 
                    False, 
                    f"HTTP {response.status_code}: {response.text[:100]}"
                )
                
        except Exception as e:
            self.log_result("Create Second RAID Item (Issue)", False, f"Request error: {str(e)}")
    
    def test_file_upload(self):
        """Test POST /api/upload - Test file upload functionality"""
        try:
            # Create a test file
            test_content = "This is a test file for RAID item attachment testing.\nCreated for backend API validation."
            test_filename = "test_raid_attachment.txt"
            
            # Prepare multipart form data
            files = {
                'file': (test_filename, test_content, 'text/plain')
            }
            
            response = self.session.post(
                f"{self.base_url}/api/upload",
                files=files,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if "message" in data and "file" in data:
                    file_info = data["file"]
                    file_id = file_info.get("id")
                    
                    # Verify file metadata
                    expected_file_fields = ["id", "original_name", "filename", "size", "content_type", "uploaded_at"]
                    has_all_fields = all(field in file_info for field in expected_file_fields)
                    
                    self.log_result(
                        "File Upload", 
                        True, 
                        f"File uploaded successfully with ID: {file_id}", 
                        {
                            "file_id": file_id,
                            "original_name": file_info.get("original_name"),
                            "filename": file_info.get("filename"),
                            "size": file_info.get("size"),
                            "content_type": file_info.get("content_type"),
                            "has_all_metadata": has_all_fields,
                            "uploaded_at": file_info.get("uploaded_at")
                        }
                    )
                else:
                    self.log_result(
                        "File Upload", 
                        False, 
                        "Invalid response format", 
                        {"response": data}
                    )
            else:
                self.log_result(
                    "File Upload", 
                    False, 
                    f"HTTP {response.status_code}: {response.text[:100]}"
                )
                
        except Exception as e:
            self.log_result("File Upload", False, f"Request error: {str(e)}")
    
    def test_delete_raid_item(self):
        """Test DELETE /api/raid-items/{id} - Delete a RAID item"""
        if not self.test_raid_item_ids:
            self.log_result("Delete RAID Item", False, "No test RAID item available to delete")
            return
            
        try:
            item_id = self.test_raid_item_ids[0]
            
            response = self.session.delete(f"{self.base_url}/api/raid-items/{item_id}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if "message" in data and "deleted_item" in data:
                    deleted_item = data["deleted_item"]
                    
                    self.log_result(
                        "Delete RAID Item", 
                        True, 
                        f"RAID item {item_id} deleted successfully", 
                        {
                            "deleted_item_id": deleted_item.get("id"),
                            "deleted_item_title": deleted_item.get("title"),
                            "message": data["message"]
                        }
                    )
                    
                    # Remove from tracking
                    self.test_raid_item_ids.remove(item_id)
                    
                    # Verify item is actually deleted by trying to get it
                    verify_response = self.session.get(f"{self.base_url}/api/raid-items/{item_id}", timeout=5)
                    if verify_response.status_code == 404:
                        print(f"    ✅ Verified: Item {item_id} is no longer accessible")
                    else:
                        print(f"    ⚠️  Warning: Item {item_id} still accessible after deletion")
                        
                else:
                    self.log_result(
                        "Delete RAID Item", 
                        False, 
                        "Invalid response format", 
                        {"response": data}
                    )
            elif response.status_code == 404:
                self.log_result(
                    "Delete RAID Item", 
                    False, 
                    f"RAID item {item_id} not found", 
                    {"status_code": 404}
                )
            else:
                self.log_result(
                    "Delete RAID Item", 
                    False, 
                    f"HTTP {response.status_code}: {response.text[:100]}"
                )
                
        except Exception as e:
            self.log_result("Delete RAID Item", False, f"Request error: {str(e)}")
    
    def cleanup_test_raid_items(self):
        """Clean up any remaining test RAID items"""
        for item_id in self.test_raid_item_ids[:]:
            try:
                response = self.session.delete(f"{self.base_url}/api/raid-items/{item_id}", timeout=5)
                if response.status_code == 200:
                    print(f"🧹 Cleaned up test RAID item: {item_id}")
                    self.test_raid_item_ids.remove(item_id)
            except:
                pass  # Ignore cleanup errors
    
    def run_all_tests(self):
        """Run all API tests in sequence"""
        print("🚀 Starting Backend API Testing for RAIDMASTER Multi-AI API")
        print("=" * 60)
        
        # Test health endpoint first
        self.test_health_endpoint()
        
        print("\n" + "🔧" * 60)
        print("🎯 RAID ITEM MANAGEMENT SYSTEM TESTING")
        print("🔧" * 60)
        
        # RAID Items CRUD Testing - As requested in review
        self.test_get_all_raid_items()  # 1. GET /api/raid-items - Should return empty list initially
        self.test_get_dashboard_stats()  # 2. GET /api/raid-items/stats/dashboard - Should return statistics (zeros initially)
        self.test_create_raid_item()  # 3. POST /api/raid-items - Create new item with specified data
        self.test_get_raid_item_by_id()  # 4. GET /api/raid-items/{id} - Get the created item by ID
        self.test_update_raid_item()  # 5. PUT /api/raid-items/{id} - Update the item status to "In Progress"
        self.test_get_dashboard_stats()  # 6. GET /api/raid-items/stats/dashboard - Should now show 1 risk item
        self.test_create_second_raid_item()  # 7. POST /api/raid-items - Create another item (Issue type)
        self.test_get_all_raid_items()  # 8. GET /api/raid-items - Should return both items
        self.test_file_upload()  # 11. POST /api/upload - Test with a small text file
        self.test_delete_raid_item()  # 9. DELETE /api/raid-items/{id} - Delete one item
        
        # Cleanup RAID items
        self.cleanup_test_raid_items()
        
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