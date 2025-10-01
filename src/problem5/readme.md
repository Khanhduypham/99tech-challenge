Problem5 -- Backend Server with ExpressJS
========================================

📘 Guideline to Configure and Start This Test
---------------------------------------------

### 1\. ✅ Pre-requirement

-   Make sure you have **Node.js** and **npm** installed.\
    Check with:

    `node -v
    npm -v`

### 2\. 📦 Install Dependencies

Run the following command to install required packages:

`npm install`

### 3\. 🗄️ Database Configuration

-   This project uses **SQLite** by default.

-   Configuration is already included in the `.env` file -- **no changes are required**.

-   If you want to use a different config, update the `.env` file accordingly.

### 4\. 🚀 Start the Server

Start the application with:

`npm start`

-   The server will run on:

    `http://localhost:3000`

-   Base API endpoint prefix:

    `/api`

### 5\. 📖 Available APIs

This repo provides 5 APIs for managing resources.

#### ➕ Create a new resource

**POST** `/api/resource`

-   **Sample body:**

    `{
      "name": "Sample Document",
      "description": "TEST",
      "type": "DOCUMENT"
    }`

#### 📂 Get all resources

**GET** `/api/resource`

-   **Query params (optional):**

    -   `page` → number (default: 1)

    -   `limit` → number (default: 10)

    -   `type` → enum: [DOCUMENT, IMAGE, VIDEO, AUDIO, LINK, OTHER]

    -   `name` → string (search by name)

#### 📄 Get a resource by ID

**GET** `/api/resource/:id`

#### ✏️ Update a resource

**PUT** `/api/resource`

-   **Sample body:**

    `{
      "id": "Id need to be updated"
      "name": "Updated Name",
      "type": "IMAGE"
    }`

#### 🗑️ Delete (soft delete) a resource

**DELETE** `/api/resource/:id`

* * * * *

### 7\. 🧪 Run Tests

Run all Jest tests:

`npm test`