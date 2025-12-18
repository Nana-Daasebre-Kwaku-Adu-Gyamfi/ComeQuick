# ComeQuick - Project Demo Guide

**Welcome to ComeQuick**, a seamless campus ride-hailing application. This guide will walk you through how to use and demonstrate the project, whether you are a technical user or just exploring the features.

---

## Getting Started

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

## Demo Steps

### Step 1: Passenger Setup (Window 1)
1.  Click **"Request a Ride"** or **"Passenger Login"**.
2.  If you don't have an account, click **Sign up**. Enter a name, email (e.g., `student@school.edu`), phone, and password.
3.  Once logged in, go to the **Profile** page (top right avatar).
4.  **Upload a Photo**: Click the camera icon and select an image.
    *   *Note: This image is safely stored in the cloud (Cloudinary API) and will be visible to your driver.*
5.  Go back to the Dashboard.

### Step 2: Requesting a Ride (Window 1)
1.  Click **"Request a Ride"**.
2.  **Pinpoint Pickup**: You can use your live location, enter an address, or click **"Map"** to drag a pin to your exact spot.
    *   *Note: This ensures drivers find you exactly where you are standing.*
3.  Enter your destination and click **"Request Ride Now"**.
4.  You will see a "Searching for driver..." screen.

### Step 3: Driver Acceptance (Window 2)
1.  In your second window, go to the **Driver Portal**.
2.  Log in as a driver.
3.  **Visual Dispatch**: Click **"View Map"** in the header to see all waiting passengers on a live map.
4.  Or stay on the Dashboard to see the list. Click **"Accept Ride"** to take a request.

### Step 4: The Ride (Both Windows)
1.  **Driver View**: Click **"Navigate to Pickup"**. 
    *   *Technical Note: This opens Google Maps with a pre-calculated route from your current GPS position to the passenger's pinpointed location.*
2.  **Passenger View**: Your screen automatically updates!
    *   It now shows: "Driver accepted your ride!".
    *   You will see the **Driver's details** and their **Photo**.

### Step 5: Completion & Rating
1.  **Driver View**: Once you arrive, click **"Complete Ride"**.
2.  **Passenger View**: You will be prompted to **Rate the Driver**.
3.  Select a quality label (Excellent, Great, etc.) and submit. This updates the driver's overall rating.

---

## Behind the Scenes (How it Works)

For those interested in the technology:

*   **Real-Time Data**: The app frequently checks the database (MongoDB) to see if a driver has accepted a request via polling.
*   **Precision Location**: We use the **Geolocation API** combined with **Leaflet** to allow for exact sub-meter pickup accuracy.
*   **Smart Navigation**: Driver navigation is powered by **Google Maps Directions API**, ensuring routes are based on live traffic and current driver position.
*   **Image Storage**: We use **Cloudinary** for secure, lightning-fast profile photo hosting.

Enjoy your ride with **ComeQuick**! 
