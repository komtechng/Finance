# NaijaFinance - cPanel Deployment Guide

## Prerequisites

1. **cPanel hosting** with Python Selector (CloudLinux)
2. **MongoDB Atlas** account (free tier works for starting out)
3. **SSH access** to your hosting (recommended, not required)

---

## Step 1: Set Up MongoDB Atlas (Free Cloud Database)

Since shared hosting doesn't include MongoDB, you'll use MongoDB Atlas (free):

1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free account and a **Free Shared Cluster**
3. Choose a region close to your hosting server
4. Under **Database Access**, create a database user with a username and password
5. Under **Network Access**, click **Add IP Address** and select **Allow Access from Anywhere** (0.0.0.0/0)
6. Click **Connect** > **Drivers** and copy the connection string. It looks like:
   ```
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. Replace `USERNAME` and `PASSWORD` with your actual credentials

---

## Step 2: Create Python App in cPanel

1. Log into your **cPanel**
2. Find **Setup Python App** (under Software section)
3. Click **Create Application**
4. Configure:
   - **Python version**: Select 3.9+ (3.11 recommended)
   - **Application root**: `naijafinance` (this will be /home/yourusername/naijafinance)
   - **Application URL**: Your domain (e.g., `yourdomain.com` or `app.yourdomain.com`)
   - **Application startup file**: `passenger_wsgi.py`
   - **Application Entry point**: `application`
5. Click **Create**
6. **Important**: Note the virtual environment path shown (e.g., `/home/username/virtualenv/naijafinance/3.11/`)

---

## Step 3: Upload Application Files

### Option A: Via cPanel File Manager
1. Open **File Manager** in cPanel
2. Navigate to `/home/yourusername/naijafinance/`
3. Upload these files from the `app/` folder in the deployment package:
   - `server.py`
   - `passenger_wsgi.py`
   - `seed_db.py`
   - `requirements.txt`
   - `.htaccess`
4. Create a folder called `static` inside `naijafinance/`
5. Upload ALL contents from the `public_html/` folder into the `static/` folder
   - This includes: `index.html`, `static/` folder (with JS/CSS), and other build files

### Option B: Via SSH (Faster)
```bash
cd /home/yourusername/naijafinance/
# Upload your deployment zip and extract
unzip naijafinance-deployment.zip
# Move frontend build into static folder
mv public_html static
```

### Final folder structure should look like:
```
/home/yourusername/naijafinance/
    passenger_wsgi.py
    server.py
    seed_db.py
    requirements.txt
    .htaccess
    .env
    static/
        index.html
        static/
            css/
                main.xxxxx.css
            js/
                main.xxxxx.js
        favicon.ico
        manifest.json
        ...
```

---

## Step 4: Configure Environment Variables

1. In File Manager, navigate to `/home/yourusername/naijafinance/`
2. Create a new file called `.env` (copy from `.env.example`)
3. Edit the `.env` file with your actual values:

```
MONGO_URL=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/?retryWrites=true&w=majority
DB_NAME=naijafinance
CORS_ORIGINS=*
JWT_SECRET_KEY=CHANGE-THIS-TO-A-LONG-RANDOM-STRING
```

**Important**: 
- Replace the MongoDB URL with your actual Atlas connection string from Step 1
- Generate a random string for JWT_SECRET_KEY (use a password generator, 32+ characters)
- Keep `CORS_ORIGINS=*` for now, you can restrict it later to your domain

---

## Step 5: Install Python Dependencies

### Option A: Via cPanel Python App Interface
1. Go back to **Setup Python App** in cPanel
2. Click **Edit** on your naijafinance app
3. Scroll to **Configuration files** section
4. In the "Requirements file path" field, enter: `requirements.txt`
5. Click **Run Pip Install**
6. Wait for installation to complete

### Option B: Via SSH Terminal
```bash
# Activate the virtual environment (use the path from Step 2)
source /home/yourusername/virtualenv/naijafinance/3.11/bin/activate

# Navigate to app directory
cd /home/yourusername/naijafinance/

# Install dependencies
pip install -r requirements.txt
```

---

## Step 6: Seed the Database

This creates the admin user and initial data. Do this via SSH:

```bash
# Activate virtual environment
source /home/yourusername/virtualenv/naijafinance/3.11/bin/activate

# Navigate to app
cd /home/yourusername/naijafinance/

# Run the seed script
python seed_db.py
```

If you don't have SSH, you can use cPanel's **Terminal** feature (if available) or temporarily add a seed endpoint.

---

## Step 7: Restart and Test

1. Go to **Setup Python App** in cPanel
2. Click **Restart** on your application
3. Visit your domain in a browser
4. You should see the NaijaFinance login page
5. Log in with: **admin@naijafinance.ng** / **admin123**

---

## Troubleshooting

### App shows 500 Error
- Check the error log: cPanel > Error Log (or `/home/username/logs/error.log`)
- Most common cause: incorrect MongoDB URL in `.env`
- Verify your MongoDB Atlas connection string and IP whitelist

### App shows 503 / Application Error
- Go to Setup Python App > click Restart
- Make sure all requirements were installed successfully
- Check that `passenger_wsgi.py` exists in the app root

### Login page doesn't load (blank page)
- Make sure the `static/` folder exists and contains `index.html`
- Check that the React build files were uploaded correctly

### API calls fail / "Network Error"
- The frontend and backend run on the same domain, so no CORS issues should occur
- Check that `.env` file exists with correct MongoDB URL
- Try visiting `yourdomain.com/api/` — it should return `{"message":"NaijaFinance API","version":"1.0"}`

### Can't run seed_db.py
- If no SSH/Terminal available, you can register the first admin user manually:
  1. Visit `yourdomain.com/register`
  2. Register with email `admin@naijafinance.ng`, role `super_admin`
  3. Or use a MongoDB Atlas UI to insert the admin user directly

---

## Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@naijafinance.ng | admin123 |
| Agent | agent1@naijafinance.ng | agent123 |
| Cashier | cashier@naijafinance.ng | cashier123 |
| Loan Officer | loans@naijafinance.ng | loans123 |

**Important**: Change these passwords after your first login in a production environment!

---

## Security Recommendations for Production

1. Change the `JWT_SECRET_KEY` to a strong random string (64+ characters)
2. Change all default passwords immediately after first login
3. In MongoDB Atlas, restrict IP access to your hosting server's IP only
4. Set `CORS_ORIGINS` to your actual domain (e.g., `https://yourdomain.com`)
5. Enable HTTPS on your domain via cPanel's SSL/TLS settings (most hosts offer free Let's Encrypt)
