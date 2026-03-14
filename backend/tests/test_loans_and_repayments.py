"""
Test suite for NaijaFinance API - Loan lifecycle testing
Tests: Login, Customers, Loan Applications, Loan Approval, Loan Repayments

Bug Fixes to verify:
1. Loan approval should create an active loan record (previously only updated status)
2. Record loan repayment should show active loans and update outstanding balance
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAuthentication:
    """Test login flow with admin credentials"""
    
    def test_login_success(self, api_client):
        """Test login with valid admin credentials"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@naijafinance.ng",
            "password": "admin123"
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        
        data = response.json()
        assert "access_token" in data, "No access token in response"
        assert "user" in data, "No user in response"
        assert data["user"]["email"] == "admin@naijafinance.ng"
        assert data["user"]["role"] == "super_admin"
        print(f"Login successful for user: {data['user']['full_name']}")
    
    def test_login_invalid_credentials(self, api_client):
        """Test login with invalid credentials returns 401"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "invalid@naijafinance.ng",
            "password": "wrongpassword"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"


class TestLoanLifecycle:
    """Full loan lifecycle: Create Customer -> Create Application -> Approve -> Record Repayment"""
    
    def test_01_create_customer(self, authenticated_client):
        """Create a test customer for loan application"""
        test_id = str(uuid.uuid4())[:8]
        response = authenticated_client.post(f"{BASE_URL}/api/customers", json={
            "full_name": f"TEST_LoanCustomer_{test_id}",
            "phone": f"+234 800 TEST {test_id}",
            "address": "123 Test Street, Lagos",
            "guarantor_name": "Test Guarantor",
            "guarantor_phone": "+234 800 000 0000"
        })
        assert response.status_code == 200, f"Create customer failed: {response.text}"
        
        data = response.json()
        assert "id" in data, "Customer ID not in response"
        assert "customer_number" in data, "Customer number not in response"
        assert data["full_name"].startswith("TEST_LoanCustomer_")
        
        # Store customer_id for later tests
        pytest.test_customer_id = data["id"]
        pytest.test_customer_number = data["customer_number"]
        print(f"Created customer: {data['customer_number']} - {data['full_name']}")
    
    def test_02_create_loan_application(self, authenticated_client):
        """Create loan application for the test customer"""
        customer_id = getattr(pytest, 'test_customer_id', None)
        if not customer_id:
            pytest.skip("No test customer available")
        
        response = authenticated_client.post(f"{BASE_URL}/api/loans/applications", json={
            "customer_id": customer_id,
            "loan_type": "personal",
            "loan_amount": 50000.00,
            "duration_months": 6,
            "purpose": "TEST - Business expansion testing",
            "employment_status": "Employed",
            "monthly_income": 100000.00,
            "guarantor_name": "Test Guarantor",
            "guarantor_phone": "+234 800 000 0000"
        })
        assert response.status_code == 200, f"Create loan application failed: {response.text}"
        
        data = response.json()
        assert "id" in data, "Application ID not in response"
        assert "application_number" in data, "Application number not in response"
        assert data["status"] == "pending", f"Expected status pending, got {data['status']}"
        assert data["loan_amount"] == 50000.00
        
        # Store application_id for approval test
        pytest.test_application_id = data["id"]
        pytest.test_application_number = data["application_number"]
        print(f"Created loan application: {data['application_number']} for amount {data['loan_amount']}")
    
    def test_03_approve_loan_application(self, authenticated_client):
        """BUG FIX TEST: Approve loan application should create a Loan record"""
        application_id = getattr(pytest, 'test_application_id', None)
        if not application_id:
            pytest.skip("No test application available")
        
        # First, get initial loan count
        loans_before = authenticated_client.get(f"{BASE_URL}/api/loans")
        loans_before_count = len(loans_before.json())
        
        # Approve the application
        response = authenticated_client.post(f"{BASE_URL}/api/loans/applications/{application_id}/approve")
        assert response.status_code == 200, f"Approve loan failed: {response.text}"
        
        data = response.json()
        assert "message" in data, "No message in response"
        assert "loan_number" in data, "CRITICAL: No loan_number in response - loan was not created!"
        
        pytest.test_loan_number = data["loan_number"]
        print(f"Loan approved and created: {data['loan_number']}")
        
        # Verify a new loan was created (BUG FIX VERIFICATION)
        loans_after = authenticated_client.get(f"{BASE_URL}/api/loans")
        loans_after_count = len(loans_after.json())
        assert loans_after_count > loans_before_count, \
            f"CRITICAL BUG: No new loan created! Before: {loans_before_count}, After: {loans_after_count}"
        
        # Find the new loan and verify its properties
        loans_data = loans_after.json()
        new_loan = next((l for l in loans_data if l["loan_number"] == data["loan_number"]), None)
        assert new_loan is not None, f"Could not find loan with number {data['loan_number']}"
        
        # Verify loan has proper values
        assert new_loan["status"] == "active", f"Loan status should be active, got {new_loan['status']}"
        assert new_loan["principal_amount"] == 50000.00
        assert new_loan["interest_rate"] > 0, "Interest rate not set"
        assert new_loan["monthly_payment"] > 0, "Monthly payment not calculated"
        assert new_loan["outstanding_balance"] > 0, "Outstanding balance not set"
        
        # Store loan_id for repayment test
        pytest.test_loan_id = new_loan["id"]
        pytest.test_loan_outstanding = new_loan["outstanding_balance"]
        print(f"Verified loan: Interest={new_loan['interest_rate']}%, Monthly={new_loan['monthly_payment']}, Outstanding={new_loan['outstanding_balance']}")
    
    def test_04_get_active_loans_for_repayment(self, authenticated_client):
        """BUG FIX TEST: Verify active loans appear in loans list for repayment dropdown"""
        response = authenticated_client.get(f"{BASE_URL}/api/loans")
        assert response.status_code == 200, f"Get loans failed: {response.text}"
        
        loans = response.json()
        active_loans = [l for l in loans if l["status"] != "completed"]
        
        assert len(active_loans) > 0, "CRITICAL: No active loans available for repayment dropdown"
        print(f"Found {len(active_loans)} active loans for repayment")
        
        # Verify our test loan is in the list
        loan_id = getattr(pytest, 'test_loan_id', None)
        if loan_id:
            test_loan = next((l for l in active_loans if l["id"] == loan_id), None)
            assert test_loan is not None, f"Test loan {loan_id} not found in active loans"
            print(f"Test loan found: {test_loan['loan_number']} - Outstanding: {test_loan['outstanding_balance']}")
    
    def test_05_record_loan_repayment(self, authenticated_client):
        """BUG FIX TEST: Record repayment and verify outstanding balance updates"""
        loan_id = getattr(pytest, 'test_loan_id', None)
        customer_id = getattr(pytest, 'test_customer_id', None)
        initial_outstanding = getattr(pytest, 'test_loan_outstanding', None)
        
        if not all([loan_id, customer_id, initial_outstanding]):
            pytest.skip("Required test data not available")
        
        repayment_amount = 5000.00
        response = authenticated_client.post(f"{BASE_URL}/api/loans/repayments", json={
            "loan_id": loan_id,
            "customer_id": customer_id,
            "amount": repayment_amount,
            "notes": "TEST repayment"
        })
        assert response.status_code == 200, f"Record repayment failed: {response.text}"
        
        data = response.json()
        assert "id" in data, "Repayment ID not in response"
        assert data["amount"] == repayment_amount
        print(f"Recorded repayment of {repayment_amount}")
        
        # Verify outstanding balance was updated
        loans_response = authenticated_client.get(f"{BASE_URL}/api/loans")
        loans = loans_response.json()
        updated_loan = next((l for l in loans if l["id"] == loan_id), None)
        
        assert updated_loan is not None, "Could not find loan after repayment"
        new_outstanding = updated_loan["outstanding_balance"]
        expected_outstanding = initial_outstanding - repayment_amount
        
        assert abs(new_outstanding - expected_outstanding) < 0.01, \
            f"Outstanding balance not updated correctly! Expected: {expected_outstanding}, Got: {new_outstanding}"
        
        print(f"Outstanding balance updated: {initial_outstanding} -> {new_outstanding}")
    
    def test_06_verify_application_status_updated(self, authenticated_client):
        """Verify the loan application status changed to approved"""
        response = authenticated_client.get(f"{BASE_URL}/api/loans/applications")
        assert response.status_code == 200
        
        apps = response.json()
        application_id = getattr(pytest, 'test_application_id', None)
        
        if application_id:
            test_app = next((a for a in apps if a["id"] == application_id), None)
            if test_app:
                assert test_app["status"] == "approved", f"Application status should be approved, got {test_app['status']}"
                print(f"Application {test_app['application_number']} status: {test_app['status']}")


class TestSavingsEndpoints:
    """Test savings accounts and collections functionality"""
    
    def test_get_savings_accounts(self, authenticated_client):
        """Test fetching savings accounts list"""
        response = authenticated_client.get(f"{BASE_URL}/api/savings/accounts")
        assert response.status_code == 200, f"Get savings accounts failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list of accounts"
        print(f"Found {len(data)} savings accounts")
    
    def test_get_savings_transactions(self, authenticated_client):
        """Test fetching savings transactions list"""
        response = authenticated_client.get(f"{BASE_URL}/api/savings/transactions")
        assert response.status_code == 200, f"Get savings transactions failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list of transactions"
        print(f"Found {len(data)} savings transactions")


class TestDashboardMetrics:
    """Test dashboard metrics endpoint"""
    
    def test_get_dashboard_metrics(self, authenticated_client):
        """Test fetching dashboard metrics"""
        response = authenticated_client.get(f"{BASE_URL}/api/dashboard/metrics")
        assert response.status_code == 200, f"Get dashboard metrics failed: {response.text}"
        
        data = response.json()
        assert "total_customers" in data
        assert "total_savings" in data
        assert "total_loans_disbursed" in data
        assert "total_loans_outstanding" in data
        print(f"Dashboard metrics: Customers={data['total_customers']}, Loans Outstanding={data['total_loans_outstanding']}")
