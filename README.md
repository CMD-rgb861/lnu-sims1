# GeoJustice

GeoJustice is a web-based application that visualizes real-time conflict hotspots at the barangay level to strengthen the Barangay Justice System through proactive conflict management and data-driven decision-making.

---

## 🚀 Initial Setup & Prerequisites

Before you begin, ensure your development environment meets the following requirements.

### Database Environment

This application is built and tested using a specific database stack. To avoid compatibility issues, please use:

* **Database:** PostgreSQL
* **Version:** **16.11**
* **Extension:** **PostGIS 3.5.4**

Using different versions may result in unexpected errors, especially with GIS-related queries.

### Other Requirements

* PHP 8.3+
* Composer 2.x
* Node.js 20.x+
* Laravel 12
* React 18

---

## 📦 Installation

1.  Clone the repository:
    ```bash
    git clone [https://github.com/riconotrich12/geojustice-v1.git](https://github.com/riconotrich12/geojustice-v1.git)
    cd geojustice-v1
    ```

    > **Laragon Users Note:**
    >
    > * Clone or move your project folder (e.g., `geojustice-v1`) inside Laragon's **`www`** directory.
    > * Laragon will automatically create a virtual host for you. The URL will be based on the folder name (e.g., `http://geojustice-v1.test`).
    > * Use the **Laragon Terminal** (click "Terminal" in the Laragon app) to run all your `npm` and `artisan` commands.

2.  Install backend dependencies:
    ```bash
    composer install
    ```

3.  Install frontend dependencies:
    ```bash
    npm install
    ```

4.  Set up your environment file:
    ```bash
    cp .env.example .env
    ```

5.  **Important:** Edit your `.env` file to match your  PostgreSQL database credentials:
    ```ini
    DB_CONNECTION=pgsql
    DB_HOST=127.0.0.1
    DB_PORT=5432
    DB_DATABASE=geojustice
    DB_USERNAME=postgres
    DB_PASSWORD=
    ```
    # Add these additional configurations as well to properly initiate Laravel Sanctum
    APP_URL=http://geojustice-v1.test
    SANCTUM_STATEFUL_DOMAINS=geojustice-v1.test:5173,geojustice-v1.test
    SESSION_DOMAIN=geojustice-v1.test
    VITE_APP_NAME="${APP_NAME}"
    VITE_APP_VERSION=1.0.0
    VITE_API_URL="http://geojustice-v1.test"
    ```

6.  Generate the application key:
    ```bash
    php artisan key:generate
    ```

7.  Run the database migrations and seeders:
    ```bash
    php artisan migrate --seed
    ```

8.  Start the development servers:
    ```bash
    # Terminal 1 (Vite for React)
    npm run dev
    
    # Terminal 2 (Laravel)
    php artisan serve
    ```
9.  Access your application at `http://geojustice-v1.test` (or whatever URL Laragon created for you). The `npm run dev` process will handle both the frontend and backend.