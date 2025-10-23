# AI-Powered Interview Prep App

An AI-based web application to simulate job interviews. Users upload their resume and a job description, then chat with an AI interviewer that generates questions and evaluates answers.

## Demo
- **Live Demo:** [Link to frontend deployed on Vercel/Netlify]  
- **Backend API:** [Link to backend deployed on Render/Vercel]  

## Features
- User signup/login with JWT authentication
- Resume and Job Description upload (PDF)
- AI-generated interview questions from uploaded JD
- AI evaluates answers against uploaded resume
- Score and feedback provided per answer
- Responsive UI built with React & Tailwind

## Tech Stack
- **Frontend:** React, Tailwind CSS, Axios
- **Backend:** Node.js, Express, MongoDB (Atlas)
- **AI:** Cohere API (Chat model)
- **File Storage:** Cloudinary
- **Authentication:** JWT, bcrypt

## Usage
1. Signup or login
2. Upload your Resume (PDF) and Job Description (PDF)
3. Proceed to Chat
4. Answer the AI-generated interview questions
5. View AI feedback and score per answer

## Setup & Installation

### Backend Setup
**Navigate to the backend folder**
cd backend

**Install dependencies**
npm install

**Create a `.env` file in the backend folder with the following content**
echo "PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
COHERE_API_KEY=your_cohere_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_secret" > .env

**Run the backend server**
npm run dev

### Frontend Setup
**Navigate to the frontend folder**
cd ../frontend

**Install dependencies**
npm install

**Run the frontend development server**
npm run dev
