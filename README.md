# NaijaFinance Enterprise Platform

A comprehensive production-ready financial management platform designed for community finance companies in Nigeria.

## 🌟 Features

### Core Modules

1. **Daily Contribution Savings (Esusu/Ajo)**
   - Daily, weekly, and monthly collection tracking
   - Agent mobile interface
   - Cash reconciliation system
   - Discrepancy alerts

2. **Loan Management**
   - Loan applications with approval workflow
   - Automated interest calculation
   - Repayment tracking
   - Guarantor management
   - Overdue loan alerts

3. **Investor Fund Management**
   - Investment tracking
   - Automated profit calculations
   - Monthly/Quarterly/Annual return plans
   - Investment certificates

4. **ATM Card Cash Services**
   - Card withdrawal/deposit for any ATM card
   - Balance inquiry
   - Transaction fee tracking
   - Supports Visa, Mastercard, Verve

5. **Mini Mart POS**
   - Product inventory management
   - Sales tracking
   - Stock alerts
   - Receipt generation

6. **Cash Office Management**
   - Central cash ledger
   - All inflows and outflows tracking
   - Real-time cash balance
   - Reconciliation tools

7. **Accounting System**
   - General ledger
   - Profit & Loss statements
   - Balance sheet
   - Cash flow reports

8. **Reports Center**
   - Agent collections reports
   - Loan portfolio analysis
   - Excel export functionality
   - PDF generation support

## 🔐 Security Features

- **Role-Based Access Control (RBAC)**
- **JWT Authentication**
- **Encrypted Passwords (bcrypt)**
- **Transaction Audit Logs**
- **Permission-based API endpoints**

## 👥 User Roles

The platform supports 9 distinct user roles:
- Super Admin
- Branch Manager
- Cashier
- Loan Officer
- Savings Officer
- Agent
- POS Operator
- Auditor
- Investor

## 🛠️ Technology Stack

### Backend
- **FastAPI** (Python 3.11)
- **MongoDB** with Motor (async driver)
- **JWT** for authentication
- **ReportLab & OpenPyxl** for report generation

### Frontend
- **React 19** with React Router
- **Tailwind CSS** with custom design system
- **Shadcn UI** components
- **Axios** for API calls
- **Sonner** for notifications

### Design
- **Primary Color**: Emerald Green (#064E3B)
- **Secondary Color**: Gold (#D97706)
- **Fonts**: Manrope (headings), Inter (body)
- **Mobile-responsive** with agent-focused layouts

## 🚀 Getting Started

### Default Credentials

After seeding the database, use these credentials:

```
Admin: admin@naijafinance.ng / admin123
Agent: agent1@naijafinance.ng / agent123
Cashier: cashier@naijafinance.ng / cashier123
Loan Officer: loans@naijafinance.ng / loans123
```

### Seeding the Database

Run the seed script to create initial users and data:

```bash
cd /app/backend
python seed_db.py
```

### Running Locally

The application is already configured and running in the Emergent environment:
- Backend: FastAPI on port 8001
- Frontend: React on port 3000
- MongoDB: localhost:27017

### Environment Variables

**Backend (.env)**
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
CORS_ORIGINS=*
JWT_SECRET_KEY=your-secret-key-change-in-production-2024
```

**Frontend (.env)**
```
REACT_APP_BACKEND_URL=https://your-domain.preview.emergentagent.com
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Customers
- `POST /api/customers` - Create customer
- `GET /api/customers` - List customers
- `GET /api/customers/{id}` - Get customer details

### Savings
- `POST /api/savings/accounts` - Create savings account
- `GET /api/savings/accounts` - List savings accounts
- `POST /api/savings/transactions` - Record collection
- `GET /api/savings/transactions` - List transactions
- `POST /api/savings/transactions/{id}/verify` - Verify transaction

### Loans
- `POST /api/loans/applications` - Submit loan application
- `GET /api/loans/applications` - List applications
- `POST /api/loans/applications/{id}/approve` - Approve application
- `POST /api/loans` - Create loan
- `GET /api/loans` - List loans
- `POST /api/loans/repayments` - Record repayment
- `GET /api/loans/repayments` - List repayments

### Investments
- `POST /api/investments` - Create investment
- `GET /api/investments` - List investments

### ATM Services
- `POST /api/atm/transactions` - Record ATM transaction
- `GET /api/atm/transactions` - List ATM transactions

### POS
- `POST /api/products` - Create product
- `GET /api/products` - List products
- `POST /api/sales` - Create sale
- `GET /api/sales` - List sales

### Cash Office
- `GET /api/cash/ledger` - Get cash ledger
- `GET /api/cash/balance` - Get current balance

### Dashboard
- `GET /api/dashboard/metrics` - Get dashboard metrics

### Reports
- `GET /api/reports/agent-collections/excel` - Download agent collections
- `GET /api/reports/loan-portfolio/excel` - Download loan portfolio

## 🗄️ Database Schema

### Collections

- **users** - User accounts with roles
- **customers** - Customer profiles
- **savings_accounts** - Savings account details
- **savings_transactions** - Collection records
- **loan_applications** - Loan application submissions
- **loans** - Active loans
- **loan_repayments** - Loan payment records
- **investments** - Investment records
- **atm_transactions** - ATM service transactions
- **products** - Inventory items
- **sales** - Sales records
- **cash_ledger** - All cash movements
- **branches** - Branch information
- **audit_logs** - System audit trail

## 📱 Mobile Experience

The platform is fully responsive with special considerations for agents:
- Bottom navigation bar on mobile
- Simplified collection entry
- Customer list optimized for mobile
- Quick action buttons

## 🔧 Development

### Backend Structure
```
/app/backend/
├── server.py          # Main FastAPI application
├── requirements.txt   # Python dependencies
├── seed_db.py        # Database seeding script
└── .env              # Environment variables
```

### Frontend Structure
```
/app/frontend/
├── src/
│   ├── pages/        # Page components
│   ├── components/   # Reusable components
│   ├── context/      # React context (Auth)
│   ├── lib/          # Utilities (API, utils)
│   └── App.js        # Main app component
├── package.json      # Node dependencies
└── tailwind.config.js # Tailwind configuration
```

## 🎨 Design System

Following the design guidelines in `/app/design_guidelines.json`:
- Swiss Finance aesthetic with organic earthy tones
- Trust-first color palette
- High contrast for financial data
- Bento grid layout for dashboards
- Mobile-first agent interface

## 📈 Scalability

The system supports:
- Multiple branches
- Thousands of customers
- Hundreds of agents
- High transaction volume

## 🛡️ Anti-Fraud Controls

- Daily reconciliation
- Agent collection limits
- Transaction approval thresholds
- Suspicious transaction alerts
- Audit logging for all actions

## 🤝 Support

For issues or questions, contact the development team or refer to the API documentation.

## 📄 License

Proprietary - NaijaFinance Enterprise Platform

---

Built with ❤️ for Nigerian community finance companies
