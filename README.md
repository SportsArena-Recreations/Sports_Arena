-- BLUEPRINT -- 
🌐 PUBLIC SIDE (Customer-Facing)
1️⃣ Home Page

Purpose: Introduction + quick access

Features:

Arena name (from config)

Logo (config-driven)

Hero section

Call-to-action: “Book Now”

Featured facilities preview

Upcoming tournaments preview

Contact information

Opening hours

Quick navigation links

2️⃣ Facilities Listing Page

Purpose: Show all rentable facilities

Features:

List of facilities

Facility type filter (football, snooker, playground, etc.)

Price per hour display

Availability indicator (UI-level)

“View Details” button

Search functionality

Sort by price

3️⃣ Facility Details Page

Purpose: Detailed facility view + booking entry

Features:

Facility name

Type

Description

Price per hour

Image gallery

Opening hours

Time slot selector (date picker + hourly grid)

Selected time preview

“Book Now” button

4️⃣ Booking Page (Customer Flow)

Purpose: Confirm booking

Features:

Selected facility summary

Selected date & time

Price calculation (hours × rate)

Customer details form

Booking status preview

Optional payment status indicator (UI only for now)

Confirmation modal

Booking success page

5️⃣ Tournament Listing Page

Purpose: Show active and upcoming tournaments

Features:

Tournament cards

Filter by sport type

Status badge (upcoming, ongoing, completed)

Prize display

Start date

“View Details” button

6️⃣ Tournament Details Page

Purpose: Full tournament overview

Features:

Tournament info

Sport type

Prize

Status

Registered teams list

Bracket view (if generated)

Match list with scores

“Register Team” button (if open)

7️⃣ Team Registration Page

Purpose: Register a team into tournament

Features:

Team name input

Team manager details

Confirmation modal

Registration success state

8️⃣ Login / Role Selection (Frontend Simulation)

Purpose: Simulate different user roles

Features:

Role selection (Admin, Staff, Customer, Team Manager)

Store role in state

Permission-based UI rendering

🛠 ADMIN DASHBOARD
9️⃣ Dashboard Home

Purpose: Overview

Features:

Total bookings

Active tournaments

Total facilities

Upcoming sessions today

Quick action buttons

Revenue summary (UI only for now)

🔟 Facilities Management Page

Purpose: CRUD UI for facilities

Features:

Table of facilities

Add facility modal

Edit facility modal

Enable/disable facility

Set price per hour

Set facility type

1️⃣1️⃣ Bookings Management Page

Purpose: Manage all bookings

Features:

Booking table

Filter by:

Date

Facility

Status

Change booking status

Cancel booking

Mark completed

Search by customer name

1️⃣2️⃣ Calendar View Page

Purpose: Visual booking schedule

Features:

Daily view

Weekly view

Hourly time grid

Facility column separation

Visual booking blocks

Click booking to view details

This is one of your most important UI components.

1️⃣3️⃣ Tournaments Management Page

Purpose: Admin tournament control

Features:

Create tournament

Edit tournament

Change status

Delete tournament

Generate fixtures (UI logic)

View tournament bracket

1️⃣4️⃣ Teams Management Page

Purpose: Manage registered teams

Features:

Team list

View by tournament

Remove team

Edit team details

1️⃣5️⃣ Matches Management Page

Purpose: Record match results

Features:

Match list

Input scores

Update scores

Auto update tournament status (UI logic)

1️⃣6️⃣ User Management Page (Optional for Phase 1)

Purpose: Manage users

Features:

List users

Assign role

Enable/disable user

Filter by role


The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
