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

    def test_signup_free_plan(self):
        """Test user signup with free plan"""
        signup_data = {
            "email": "freeuser@example.com",
            "password": "testpass123",
            "full_name": "Free Plan User",
            "subscription_plan": "free"
        }
        
        success, response = self.run_test(
            "User Signup - Free Plan",
            "POST",
            "auth/signup",
            200,
            data=signup_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            if 'user' in response:
                self.user_id = response['user']['id']
                # Verify subscription plan is correctly set
                if response['user'].get('subscription_plan') == 'free':
                    print(f"   ✅ Subscription plan correctly set to 'free'")
                else:
                    print(f"   ❌ Subscription plan mismatch: expected 'free', got '{response['user'].get('subscription_plan')}'")
                    return False
            print(f"   Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_signup_paid_plan(self):
        """Test user signup with paid plan"""
        signup_data = {
            "email": "paiduser@example.com",
            "password": "testpass123",
            "full_name": "Paid Plan User",
            "subscription_plan": "personal-plus"
        }
        
        success, response = self.run_test(
            "User Signup - Personal Plus Plan",
            "POST",
            "auth/signup",
            200,
            data=signup_data
        )
        
        if success and 'access_token' in response:
            # Verify subscription plan is correctly set
            if 'user' in response:
                if response['user'].get('subscription_plan') == 'personal-plus':
                    print(f"   ✅ Subscription plan correctly set to 'personal-plus'")
                else:
                    print(f"   ❌ Subscription plan mismatch: expected 'personal-plus', got '{response['user'].get('subscription_plan')}'")
                    return False
            return True
        return False

    def test_signup(self):
        """Test basic user signup (for backward compatibility)"""
        signup_data = {
            "email": "test@example.com",
            "password": "testpass123",
            "full_name": "Test User"
        }
        
        success, response = self.run_test(
            "User Signup - Basic",
            "POST",
            "auth/signup",
            200,
            data=signup_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            if 'user' in response:
                self.user_id = response['user']['id']
                # Should default to free plan
                if response['user'].get('subscription_plan') == 'free':
                    print(f"   ✅ Default subscription plan correctly set to 'free'")
                else:
                    print(f"   ❌ Default subscription plan should be 'free', got '{response['user'].get('subscription_plan')}'")
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
        """Test getting dashboard data with detailed validation"""
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
                print(f"   ❌ Missing keys in dashboard response: {missing_keys}")
                return False
            else:
                print(f"   ✅ Dashboard data complete with all expected keys")
                
            # Validate data types
            if not isinstance(response.get('recent_expenses'), list):
                print(f"   ❌ recent_expenses should be a list")
                return False
            
            if not isinstance(response.get('budgets'), list):
                print(f"   ❌ budgets should be a list")
                return False
                
            if not isinstance(response.get('total_spent_this_month'), (int, float)):
                print(f"   ❌ total_spent_this_month should be a number")
                return False
                
            if not isinstance(response.get('achievements_count'), int):
                print(f"   ❌ achievements_count should be an integer")
                return False
                
            # Validate user object
            user = response.get('user')
            if not user or not isinstance(user, dict):
                print(f"   ❌ user should be a valid object")
                return False
                
            if 'subscription_plan' not in user:
                print(f"   ❌ user object missing subscription_plan")
                return False
                
            print(f"   ✅ User subscription plan: {user.get('subscription_plan')}")
            print(f"   ✅ Recent expenses count: {len(response.get('recent_expenses', []))}")
            print(f"   ✅ Budgets count: {len(response.get('budgets', []))}")
            print(f"   ✅ Total spent this month: ${response.get('total_spent_this_month', 0)}")
            print(f"   ✅ Achievements count: {response.get('achievements_count', 0)}")
            
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
    
    # Authentication tests - Test subscription plan functionality
    test_results.append(("User Signup - Free Plan", tester.test_signup_free_plan()))
    test_results.append(("User Signup - Paid Plan", tester.test_signup_paid_plan()))
    test_results.append(("User Signup - Basic", tester.test_signup()))
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