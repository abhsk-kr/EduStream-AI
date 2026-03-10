# EduStream AI 🎓

EduStream AI is an intelligent, full-stack learning platform that transforms any educational YouTube video or local media file into structured, interactive learning modules. By leveraging OpenAI's powerful language models, it automatically generates comprehensive textbook-style notes, key takeaways, and interactive quizzes to supercharge your learning process.

## 🚀 Features

*   **Smart Video Processing**: Paste any YouTube URL or upload a local audio/video file (up to 90 minutes).
*   **AI-Powered Summarization**: Uses GPT-4o to analyze transcripts and generate deeply elaborated, chapter-based notes.
*   **Interactive Quizzes**: Automatically constructs 5-question multiple-choice quizzes based on the extracted key concepts to test your understanding.
*   **Dashboard & Progress Tracking**: Keep track of your learning modules, quiz scores, and overall progress.
*   **Dark Mode**: Fully supported dark mode across the entire application for comfortable late-night studying.
*   **Responsive Design**: Built with Tailwind CSS, ensuring a seamless experience on both desktop and mobile devices.

## 🛠️ Technology Stack

This project uses a 3-tier architecture:

### 1. Frontend (Client)
*   **Framework**: React (Vite)
*   **Styling**: Tailwind CSS v4
*   **Routing**: React Router DOM
*   **Icons**: React Icons (Feather)
*   **HTTP Client**: Axios

### 2. Main Backend (Server)
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB (Mongoose)
*   **Authentication**: JWT (JSON Web Tokens) & bcryptjs
*   **File Uploads**: Multer (Local storage before AI processing)

### 3. AI Service (Python)
*   **Framework**: FastAPI
*   **LLM Provider**: OpenAI (GPT-4o)
*   **Transcription APIs**: `youtube-transcript-api` (for YouTube) & OpenAI Whisper-1 (for local media)
*   **Media Processing**: `imageio-ffmpeg` (for extracting and chunking local audio)

## 💻 Running the Project Locally

### Prerequisites
*   Node.js (v20+)
*   Python (v3.11+)
*   MongoDB (Local or Atlas URL)
*   OpenAI API Key
*   FFmpeg (must be installed on your system if you plan to use local file uploads)

### 1. Clone the Repository
```bash
git clone https://github.com/abhsk-kr/EduStream-AI.git
cd EduStream-AI
```

### 2. Set up the Node.js API Server
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/edustream
JWT_SECRET=your_super_secret_jwt_key
AI_SERVICE_URL=http://localhost:8000
```
Start the server:
```bash
npm run dev
```

### 3. Set up the Python AI Service
```bash
cd ../ai-service
python3 -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
```
Create a `.env` file in the `ai-service` directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
```
Start the FastAPI server:
```bash
uvicorn main:app --reload --port 8000
```

### 4. Set up the React Frontend
```bash
cd ../client
npm install
```
*(Optional)* Create a `.env` file in the `client` directory if you need to override the API URL:
```env
VITE_API_URL=http://localhost:5000
```
Start the Vite development server:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## ☁️ Deployment (Render)

This project is fully configured for a 1-click deployment using Render Blueprints.

1. Ensure all code is pushed to your GitHub repository.
2. Go to your [Render Dashboard](https://dashboard.render.com).
3. Click **New** -> **Blueprint**.
4. Connect your GitHub repository.
5. Render will read the `render.yaml` file at the root of the project.
6. Provide the required environment variables (`MONGO_URI`, `JWT_SECRET`, `OPENAI_API_KEY`) when prompted.
7. Click **Apply**. Render will automatically provision and link the AI Service, Node API, and React Frontend in the correct order.

## 📄 License

This project is licensed under the MIT License.
