# 🏆 Sports Arena Management Platform

A modern, high-performance web application designed to manage premium sports facilities, schedule sessions, and host region-wide tournaments. Built with React, TypeScript, Tailwind CSS, and Vite.

---

## 🌟 Project Blueprint & Features

### 🌐 PUBLIC SIDE (Customer-Facing)

#### 1️⃣ Home Page
- **Purpose**: Introduction & quick access
- **Features**: Config-driven Arena name and Logo, Hero section, "Book Now" CTA, Featured facilities preview, Upcoming tournaments preview, Contact information, Opening hours, Quick navigation links.

#### 2️⃣ Facilities Listing Page
- **Purpose**: Show all rentable facilities
- **Features**: List of facilities, Facility type filters (football, snooker, playground, etc.), Price per hour display, Availability indicator, "View Details" button, Search functionality, Sort by price.

#### 3️⃣ Facility Details Page
- **Purpose**: Detailed facility view & booking entry
- **Features**: Facility name, Type, Description, Price/hour, Image gallery, Opening hours, Time slot selector (date picker + hourly grid), Selected time preview, "Book Now" action.

#### 4️⃣ Booking Page (Customer Flow)
- **Purpose**: Confirm booking
- **Features**: Selected facility summary, Selected date & time, Price calculation (hours × rate), Customer details form, Booking status preview, Optional payment status indicator, Confirmation modal, Booking success page.

#### 5️⃣ Tournament Listing Page
- **Purpose**: Show active and upcoming tournaments
- **Features**: Tournament cards, Filter by sport type, Status badge (upcoming, ongoing, completed), Prize display, Start date, "View Details" button.

#### 6️⃣ Tournament Details Page
- **Purpose**: Full tournament overview
- **Features**: Sport type, Prize, Status, Registered teams list, Bracket view (if generated), Match list with scores, "Register Team" action.

#### 7️⃣ Team Registration Page
- **Purpose**: Register a team into a tournament
- **Features**: Team name input, Team manager details, Confirmation modal, Registration success state.

#### 8️⃣ Login / Role Selection
- **Purpose**: Simulate different user roles
- **Features**: Role selection (Admin, Staff, Customer, Team Manager), Store role in state, Permission-based UI rendering.

---

### 🛠 ADMIN DASHBOARD

#### 9️⃣ Dashboard Home
- **Purpose**: Overview
- **Features**: Total bookings, Active tournaments, Total facilities, Upcoming sessions today, Quick action buttons, Revenue summary.

#### 🔟 Facilities Management
- **Purpose**: CRUD UI for facilities
- **Features**: Table of facilities, Add/Edit facility modals, Enable/disable facility toggles, Set custom pricing and facility types.

#### 1️⃣1️⃣ Bookings Management
- **Purpose**: Manage all platform bookings
- **Features**: Booking table, Status/Date/Facility filtering, Change booking statuses, Cancel/Mark completed functions, Search by customer name.

#### 1️⃣2️⃣ Calendar View
- **Purpose**: Visual booking schedule
- **Features**: Daily/Weekly views, Hourly time grid, Visual booking blocks, Click-to-view details.

#### 1️⃣3️⃣ Tournaments Management
- **Purpose**: Admin tournament control
- **Features**: Create/Edit/Delete tournaments, Change event statuses, Generate fixtures logic, View brackets.

#### 1️⃣4️⃣ Teams Management
- **Purpose**: Manage registered teams
- **Features**: Team list view, View by tournament, Edit details, Remove teams.

#### 1️⃣5️⃣ Matches Management
- **Purpose**: Record match results
- **Features**: Match lists, Input/Update scores, Auto-update tournament status logically based on results.

#### 1️⃣6️⃣ User Management (Phase 1)
- **Purpose**: Manage platform users
- **Features**: List users, Assign roles, Enable/Disable users, Filter by role.

---

## 💻 Tech Stack

- **Framework**: React + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + styled-components
- **UI Components**: shadcn/ui + Framer Motion
- **Animations**: CSS Keyframes + Framer Motion 

---

## 🚀 Getting Started

The only requirement is having Node.js & npm installed - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

Follow these steps to run the app locally:

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies
npm install

# Step 4: Start the development server
npm run dev
```

---

## 🌍 Deployment

You can seamlessly publish your project anywhere standard React/Vite outputs are supported (Vercel, Netlify, AWS, etc.). For quick deployment using your starter service (e.g. Lovable / Vercel):
1. Connect to your Git Repository
2. Allow CI/CD to build by utilizing the `npm run build` command.
3. Your deployment setup will automatically serve the `./dist` folder securely!
