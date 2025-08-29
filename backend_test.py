import requests
import sys
from datetime import datetime, timezone
import json

class BudgetWiseAPITester:
    def __init__(self, base_url="https://wisespend.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_expense_id = None
        self.created_budget_id = None
        self.created_investment_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2, default=str)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, response = self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200
        )
        return success

    def test_signup(self):
        """Test user signup"""
        signup_data = {
            "email": "test@example.com",
            "password": "testpass123",
            "full_name": "Test User"
        }
        
        success, response = self.run_test(
            "User Signup",
            "POST",
            "auth/signup",
            200,
            data=signup_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            if 'user' in response:
                self.user_id = response['user']['id']
            print(f"   Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_login(self):
        """Test user login"""
        login_data = {
            "email": "test@example.com",
            "password": "testpass123"
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            if 'user' in response:
                self.user_id = response['user']['id']
            print(f"   Login successful, token: {self.token[:20]}...")
            return True
        return False

    def test_get_current_user(self):
        """Test get current user info"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_create_expense(self):
        """Test creating an expense"""
        expense_data = {
            "amount": 50.75,
            "category": "Food",
            "description": "Lunch at restaurant",
            "date": datetime.now(timezone.utc).isoformat()
        }
        
        success, response = self.run_test(
            "Create Expense",
            "POST",
            "expenses",
            200,
            data=expense_data
        )
        
        if success and 'id' in response:
            self.created_expense_id = response['id']
            return True
        return False

    def test_get_expenses(self):
        """Test getting all expenses"""
        success, response = self.run_test(
            "Get Expenses",
            "GET",
            "expenses",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} expenses")
            return True
        return False

    def test_create_budget(self):
        """Test creating a budget"""
        budget_data = {
            "category": "Food",
            "amount": 500.0,
            "period": "monthly"
        }
        
        success, response = self.run_test(
            "Create Budget",
            "POST",
            "budgets",
            200,
            data=budget_data
        )
        
        if success and 'id' in response:
            self.created_budget_id = response['id']
            return True
        return False

    def test_get_budgets(self):
        """Test getting all budgets"""
        success, response = self.run_test(
            "Get Budgets",
            "GET",
            "budgets",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} budgets")
            return True
        return False

    def test_create_investment(self):
        """Test creating an investment"""
        investment_data = {
            "name": "Apple Inc.",
            "symbol": "AAPL",
            "shares": 10.0,
            "purchase_price": 150.0,
            "purchase_date": datetime.now(timezone.utc).isoformat()
        }
        
        success, response = self.run_test(
            "Create Investment",
            "POST",
            "investments",
            200,
            data=investment_data
        )
        
        if success and 'id' in response:
            self.created_investment_id = response['id']
            return True
        return False

    def test_get_investments(self):
        """Test getting all investments"""
        success, response = self.run_test(
            "Get Investments",
            "GET",
            "investments",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} investments")
            return True
        return False

    def test_get_achievements(self):
        """Test getting achievements"""
        success, response = self.run_test(
            "Get Achievements",
            "GET",
            "achievements",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} achievements")
            return True
        return False

    def test_get_dashboard(self):
        """Test getting dashboard data"""
        success, response = self.run_test(
            "Get Dashboard Data",
            "GET",
            "dashboard",
            200
        )
        
        if success:
            expected_keys = ['user', 'recent_expenses', 'budgets', 'total_spent_this_month', 'achievements_count']
            missing_keys = [key for key in expected_keys if key not in response]
            if missing_keys:
                print(f"   Warning: Missing keys in dashboard response: {missing_keys}")
            else:
                print(f"   Dashboard data complete with all expected keys")
            return True
        return False

def main():
    print("🚀 Starting BudgetWise API Testing...")
    print("=" * 50)
    
    tester = BudgetWiseAPITester()
    
    # Test sequence
    test_results = []
    
    # Basic API test
    test_results.append(("Root Endpoint", tester.test_root_endpoint()))
    
    # Authentication tests
    test_results.append(("User Signup", tester.test_signup()))
    test_results.append(("User Login", tester.test_login()))
    test_results.append(("Get Current User", tester.test_get_current_user()))
    
    # Only proceed with authenticated tests if login was successful
    if tester.token:
        # Expense tests
        test_results.append(("Create Expense", tester.test_create_expense()))
        test_results.append(("Get Expenses", tester.test_get_expenses()))
        
        # Budget tests
        test_results.append(("Create Budget", tester.test_create_budget()))
        test_results.append(("Get Budgets", tester.test_get_budgets()))
        
        # Investment tests
        test_results.append(("Create Investment", tester.test_create_investment()))
        test_results.append(("Get Investments", tester.test_get_investments()))
        
        # Achievement tests
        test_results.append(("Get Achievements", tester.test_get_achievements()))
        
        # Dashboard test
        test_results.append(("Get Dashboard", tester.test_get_dashboard()))
    else:
        print("❌ Authentication failed, skipping authenticated endpoint tests")
    
    # Print final results
    print("\n" + "=" * 50)
    print("📊 FINAL TEST RESULTS")
    print("=" * 50)
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\n📈 Summary: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed! Backend API is working correctly.")
        return 0
    else:
        print("⚠️  Some tests failed. Please check the backend implementation.")
        return 1

if __name__ == "__main__":
    sys.exit(main())