Here are the commands to run the backend and the AI service separately in their respective directories:

### **1. To Run the Backend (Java Spring Boot)**

The backend is a Maven project. You can run it using the Spring Boot Maven plugin.

**Prerequisites:**
*   Java (version 17 or higher)
*   Maven

**Commands:**

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Run the application in development mode:**
    ```bash
    mvn spring-boot:run -Dspring.profiles.active=prod

    mvn spring-boot:run -Dspring.profiles.active=prod -D AI_SERVICE_URL=http://localhost:8000
    ```

The backend server will start, and it will be accessible at `http://localhost:4000` (or the port specified in your `application.yml`).

### **2. To Run the AI Service (Python FastAPI)**

The AI service is a Python project. It's recommended to run it in a virtual environment to manage its dependencies.

**Prerequisites:**
*   Python (version 3.8 or higher)
*   `pip` (Python package installer)

**Commands:**

1.  **Navigate to the AI service directory:**
    ```bash
    cd ai-report-service
    ```

2.  **Create and activate a virtual environment:**
    *   **On macOS and Linux:**
        ```bash
        python3 -m venv venv
        source venv/bin/activate
        ```
    *   **On Windows:**
        ```bash
        python -m venv venv
        .\venv\Scripts\activate
        ```

3.  **Install the required dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Run the FastAPI application using uvicorn:**
    ```bash
    uvicorn app.main:app --reload --port 8000
    ```

The AI service will start, and it will be accessible at `http://localhost:8000`. The `--reload` flag will automatically restart the server when you make changes to the code.

By running these commands in separate terminal windows, you can have both the backend and the AI service running locally without using Docker Compose.