# joshweb-backend

## Project Overview

**joshweb-backend** is a server-side application built using Node.js and Express. This project is structured with a dedicated backend folder for the server-side part of the application.

## Installation Steps

To set up the project locally, follow these steps:

### 1. **Fork and Clone the Repository**
1. First, fork the repository on GitHub.
2. Then, clone your forked repository:
 ```bash
  git clone https://github.com/yourusername/josh-backend.git
   ```

### 2. **Navigate to the Backend Directory**  
```bash
cd josh-web/backend
```

### 3. **Fetch the Dev Branch**  
Make sure you have the latest `dev` branch:  
```bash
git fetch origin dev
git checkout dev
```

### 4. **Install Dependencies**  
Make sure you have Node.js installed. Then run:  
```bash
npm install
```

### 5. **Set Up Environment Variables**  
We have provided an `.env.sample` file in the root directory. Create a `.env` file and configure it accordingly.

### 6. **Set Up MongoDB Online**  
To use MongoDB online, follow these steps:  

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database) and sign up or log in.  
2. Create a new project and set up a free cluster.  
3. In the "Database" section, create a new database and collection.  
4. Click on "Connect" → "Connect your application" and copy the connection string.  
5. Replace `<username>`, `<password>`, and `<dbname>` with your actual database credentials in the `.env` file:  
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority

### 7. **Start the Development Server**  
After setting up the environment variables and database connection, start the server:  
```bash
npm start
```

## Additional Information  
- Ensure you have the latest version of Node.js and npm installed.  
- For any issues or contributions, please refer to the project's GitHub page.

