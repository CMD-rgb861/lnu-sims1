# LNU SIMS

LNU-SIMS is a web-based application exclusive for Leyte Normal University that manages all student-related processes and services. Originally designed for the online pre-enrollment process, the application is structured for continuous expansion and development in order to accomodate additional modules and features as warranted by the university. 

---

## 🚀 Initial Setup & Prerequisites

Before you begin, ensure your development environment meets the following requirements.

### Database Environment

This application is built and tested using a specific database stack. To avoid compatibility issues, please use:

* **Database:** MySQL
* **Version:** **8.0.30**

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
    git clone [https://github.com/riconotrich12/lnu-sims](https://github.com/riconotrich12/lnu-sims.git)
    cd lnu-sims
    ```

    > **Laragon Users Note:**
    >
    > * Clone or move your project folder (e.g., `lnu-sims`) inside Laragon's **`www`** directory.
    > * Laragon will automatically create a virtual host for you. The URL will be based on the folder name (e.g., `http://lnu-sims.test`).
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
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=lnu_poes
    DB_USERNAME=root
    DB_PASSWORD=
    ```
    # Add these additional configurations as well to properly initiate Laravel Sanctum
    APP_URL=http://lnu-sims.test
    SANCTUM_STATEFUL_DOMAINS=lnu-sims.test:5173,lnu-sims.test
    SESSION_DOMAIN=lnu-sims.test
    VITE_APP_NAME="${APP_NAME}"
    VITE_APP_VERSION=1.0.1
    VITE_API_URL="http://lnu-sims.test"
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
9.  Access your application at `http://lnu-sims.test` (or whatever URL Laragon created for you). The `npm run dev` process will handle both the frontend and backend.