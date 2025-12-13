# ComeQuick - Project Demo Guide

**Welcome to ComeQuick**, a seamless campus ride-hailing application. This guide will walk you through how to use and demonstrate the project, whether you are a technical user or just exploring the features.

---

## 🚀 Getting Started

To demonstrate this application, you will essentially play two roles: the **Passenger** (requesting a ride) and the **Driver** (giving the ride).

### Prerequisites
1.  **Internet Connection**: Required for map data and image uploads (Cloudinary).
2.  **Server Running**: Ensure the backend server is running (`npm run dev` in `backend` folder).
3.  **Client Running**: Ensure the frontend app is running (`npm run dev` in `frontend` folder).

### Opening the App
We recommend opening the app in **two different browser windows** (or one normal window and one Incognito/Private window) to simulate two different users.

-   **Window 1 (Passenger)**: Go to `http://localhost:5173/`
-   **Window 2 (Driver)**: Go to `http://localhost:5173/driver`

---

## 📱 Demo Steps

### Step 1: Passenger Setup (Window 1)
1.  Click **"Request a Ride"** or **"Passenger Login"**.
2.  If you don't have an account, click **Sign up**. Enter a name, email (e.g., `student@school.edu`), phone, and password.
3.  Once logged in, go to the **Profile** page (top right avatar).
4.  **Upload a Photo**: Click the camera icon and select an image.
    *   *Note: This image is safely stored in the cloud (Cloudinary API) and will be visible to your driver.*
5.  Go back to the Dashboard.

### Step 2: Requesting a Ride (Window 1)
1.  Click **"Request a Ride"**.
2.  Choose a pickup location (e.g., "Library") and destination (e.g., "Student Center").
3.  Click **"Find Driver"**.
4.  You will see a "Searching for driver..." screen.

### Step 3: Driver Acceptance (Window 2)
1.  In your second window, go to the **Driver Portal** or `/driver/login`.
2.  Log in as a driver (Use demo credentials or register a new one).
    *   *Demo Driver Phone*: `0555555555` / *Password*: `password` (if pre-seeded).
    *   *Or Register*: Click "Register as Driver", fill details, and login.
3.  Go to the **Dashboard**. You should see "Waiting Passengers (1)" in the list.
4.  You will see the passenger's name and **Profile Photo** in the request card.
5.  Click **"Accept Ride"**.

### Step 4: The Ride (Both Windows)
1.  **Driver View**: You will see "Active Ride" with the passenger's details.
2.  **Passenger View**: Your screen automatically updates!
    *   It now shows: "Driver accepted your ride!".
    *   You will see the **Driver's details** and their **Photo**.
    *   *Technical Note: This real-time update uses a polling mechanism to fetch the latest data from our database.*

### Step 5: Completion & Rating
1.  **Driver View**: Once you "arrive", click **"Complete Ride"**.
2.  **Passenger View**: You will be prompted to **Rate the Driver**.
3.  Select a star rating (1-5) and submit. This updates the driver's overall rating in the system.

---

## 🔧 Behind the Scenes (How it Works)

For those interested in the technology:

*   **Real-Time Data**: The app frequently checks the database (MongoDB) to see if a driver has accepted a request, ensuring you don't stare at a static screen.
*   **Image Storage**: We use an external API called **Cloudinary**. When you upload a photo, it's sent to their secure servers, and we just save the link. This keeps our database fast and lightweight.
*   **Maps**: The interactive maps are powered by **Leaflet**, allowing us to place markers dynamically based on where users say they are.

Enjoy your ride with **ComeQuick**! 🚗💨
