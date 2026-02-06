# 🚀 MatchFlow - Match-First Hiring Platform

> **Crudzaso Project - Part 2: Inherited System & Monetization**

MatchFlow is a revolutionary hiring platform that eliminates the friction of traditional recruitment. Instead of waiting for candidates to apply, companies actively search for available talent and create direct matches.

---

## 📋 Table of Contents

- [Product Overview](#-product-overview)
- [Part 2 Changes](#-part-2-inherited-system--monetization)
- [Business Rules](#-business-rules)
- [Subscription Plans](#-subscription-plans)
- [🚀 Getting Started](#-getting-started)
- [📁 Project Structure](#-project-structure)
- [👥 Test Accounts](#-test-accounts)
- [🛠️ Technologies Used](#-technologies-used)
- [📝 Team](#-team)

---

## 🎯 Product Overview

### The Problem
Traditional hiring platforms are slow and inefficient:
- Candidates wait for responses
- Companies sift through hundreds of applications
- Time-to-hire is unnecessarily long

### The MatchFlow Solution
- **No Applications**: Candidates don't apply to jobs
- **Open to Work**: Candidates activate their availability
- **Active Search**: Companies find and match candidates directly
- **Instant Connection**: Direct matches eliminate waiting time

---

## 🆕 Part 2: Inherited System & Monetization

### What's New in Part 2

This is the **second phase** of MatchFlow development. We inherited the codebase from Part 1 and:

#### ✅ Stabilization & Fixes
- ✅ Fixed json-server configuration (upgraded to v0.17.4)
- ✅ Resolved startup issues with proper port configuration (4001)
- ✅ Fixed authentication flow
- ✅ Completed reservation and blocking logic
- ✅ Enhanced error handling throughout the application

#### 💎 New Features Implemented
1. **Subscription Plans System**
   - Candidate plans (Free, Pro Level 1, Pro Level 2)
   - Company plans (Free, Business, Enterprise)
   - Plan management interface
   - Real-time plan enforcement

2. **Advanced Candidate Search**
   - Filter by name, skills, and availability
   - Plan-based visibility rules
   - Real-time reservation status

3. **Match Management System**
   - Complete hiring pipeline (Pending → Contacted → Interview → Hired/Discarded)
   - Contact information privacy rules
   - Status tracking and management

4. **Reservation System**
   - Plan-based reservation limits
   - Active reservation tracking
   - Conflict prevention

5. **Admin Dashboard**
   - Real-time statistics
   - Plans distribution charts
   - Match status analytics
   - Recent activity monitoring

#### 🎨 UI/UX Improvements
- Professional icons (Bootstrap Icons)
- Modern gradient designs
- Responsive layouts
- Improved navigation
- Better visual feedback

---

## 📜 Business Rules

### Core Rules (From Part 1)

#### Open to Work
- Candidates are visible **ONLY** when "Open to Work" is active
- Inactive candidates don't appear in company searches
- Candidates can toggle this status anytime

#### Match Creation
- Matches are **always created by companies**
- Each match links: Company + Job Offer + Candidate
- Match states: `pending` → `contacted` → `interview` → `hired` | `discarded`

#### Reservation & Blocking
- Companies can reserve candidates for specific job offers
- Reserved candidates are blocked from other reservations (unless plan allows)
- Reservations respect candidate plan limits

#### Contact Privacy
- Contact information is hidden until match status = `contacted`
- Once contacted, companies can access phone/WhatsApp

### New Rules (Part 2)

#### Candidate Plan Limits
- **Free**: Maximum 1 simultaneous reservation
- **Pro Level 1**: Maximum 2 simultaneous reservations
- **Pro Level 2**: Maximum 5 simultaneous reservations

#### Company Plan Features
- **Free**: See only available (non-reserved) candidates
- **Business**: Advanced skill filters + enhanced visibility
- **Enterprise**: See ALL candidates, even if reserved

---

## 💰 Subscription Plans

### 👤 Candidate Plans

| Plan | Price | Reservations | Features |
|------|-------|--------------|----------|
| **Free** | $0/month | 1 | ✓ Profile<br>✓ Open to Work<br>✓ Basic visibility |
| **Pro Level 1** | $29/month | 2 | ✓ Everything in Free<br>✓ Priority in searches<br>✓ Enhanced badge |
| **Pro Level 2** | $59/month | 5 | ✓ Everything in Pro 1<br>✓ Maximum exposure<br>✓ Premium support |

### 🏢 Company Plans

| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0/month | ✓ Company profile<br>✓ Post jobs<br>✓ Basic search<br>✓ Standard visibility |
| **Business** | $99/month | ✓ Everything in Free<br>✓ Advanced skill filters<br>✓ Enhanced visibility<br>✓ Priority support |
| **Enterprise** | $199/month | ✓ Everything in Business<br>✓ **View reserved candidates**<br>✓ Unlimited filters<br>✓ Dedicated manager |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Start json-server (REQUIRED)
npm run server

# Or manually:
npx json-server --watch json/db.json --port 4001
```

### Running the Application

1. Make sure json-server is running on port 4001
2. Open `index.html` in your browser or use Live Server in VS Code

**Important**: The json-server **MUST** be running before using the application. If you can't log in or register, verify json-server is active.

---

## 📁 Project Structure

```
matchFlow/
├── index.html                  # Landing page
├── package.json                # Dependencies & scripts
├── README.md                   # This file
├── assets/                     # Icons and images
├── js/
│   ├── api.js                 # API calls (fetch wrapper)
│   ├── auth.js                # Authentication & session
│   ├── candidate.js           # Candidate profile logic
│   ├── candidates-search.js   # Search & match creation
│   ├── company.js             # Company profile logic
│   ├── dashboard.js           # Admin dashboard
│   ├── login.js               # Login/Register logic
│   ├── logout.js              # Logout handler
│   ├── matches.js             # Match management
│   ├── plans.js               # Plan management
│   ├── storage.js             # LocalStorage utilities
│   └── utils.js               # Helper functions
├── json/
│   └── db.json                # JSON Server database
├── pages/
│   ├── candidate.html         # Candidate profile page
│   ├── candidates-search.html # Candidate search (companies)
│   ├── company.html           # Company profile page
│   ├── dashboard.html         # Admin dashboard
│   ├── login.html             # Login/Register page
│   ├── matches.html           # Match management page
│   └── plans.html             # Plans & pricing page
└── styles/
    ├── company.css            # Company styles
    ├── landing.css            # Landing page styles
    ├── perfil.css             # Profile styles
    ├── register.css           # Register styles
    └── shared.css             # Shared styles
```

---

## 👥 Test Accounts

### Admin Account
```
Email: admin@admin.com
Password: admin123
Plan: Enterprise
```

### Candidate Accounts
```
Email: leah@mail.com
Password: 123456
Plan: Pro Level 2
```

### Company Accounts
```
Email: techcorp@mail.com
Password: 123456
Plan: Enterprise
```
```
Email: company@mail.com
Password: 123456
Plan: Free
```

---

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6 Modules)
- **UI Framework**: Bootstrap 5.3.3
- **Icons**: Bootstrap Icons 1.11.3
- **Charts**: Chart.js (Admin Dashboard)
- **Notifications**: SweetAlert2
- **Backend Simulation**: json-server 0.17.4
- **Version Control**: Git / GitHub

---

## 🔄 Git Workflow

This project uses **Git Flow**:

- `main`: Production-ready code
- `develop`: Development branch
- `feature/*`: Feature branches

### Commit Convention

We follow **Conventional Commits**:

```
feat: Add candidate search functionality
fix: Resolve reservation blocking issue
docs: Update README with Part 2 changes
style: Improve UI with professional icons
refactor: Restructure API module
```

---

## 📝 Key Improvements from Part 1

### Fixed Issues
1. **json-server startup failure**: Downgraded from beta to stable version
2. **Port configuration**: Now explicitly uses port 4001
3. **Authentication flow**: Improved error handling
4. **Missing features**: Added complete match and reservation systems

### Enhanced Features
1. **Plans system**: Complete monetization structure
2. **Search functionality**: Advanced filters and plan-based visibility
3. **Match management**: Full hiring pipeline
4. **Admin tools**: Comprehensive dashboard with analytics
5. **UI/UX**: Professional design with icons and modern styling

### Business Logic Additions
1. **Reservation limits**: Enforced at the candidate plan level
2. **Visibility rules**: Company plans control what they can see
3. **Contact privacy**: Automatic based on match status
4. **Plan enforcement**: Real-time validation throughout the app

---

## 🎓 Learnings & Reflections

### Working with Inherited Code
- Understanding existing architecture without documentation
- Identifying and fixing incomplete features
- Balancing refactoring with forward progress

### Challenges Solved
1. **json-server compatibility**: Beta version issues
2. **Port configuration**: Hardcoded values in multiple files
3. **Missing plan enforcement**: Added throughout the system
4. **UI consistency**: Unified design language

### What We'd Improve with More Time
- Real payment gateway integration
- Advanced analytics dashboard
- Candidate profile editing
- Company branding customization
- Email notifications system
- Real-time chat functionality

---

## 📞 Support

For questions or issues:
- Check that json-server is running on port 4001
- Verify you're using the correct test accounts
- Clear browser localStorage if experiencing auth issues

---

## 📄 License

This project is part of the Crudzaso training program.

---

**© 2026 MatchFlow. Built with ❤️ by [Your Team Name]**