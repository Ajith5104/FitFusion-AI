FitFusion-AI is a next-generation platform that leverages high-fidelity AI to enable users to virtually try on clothing items. By combining garment images with person photos, the application generates realistic, high-resolution previews using the state-of-the-art IDM-VTON model.

## 🌐 Live Demo: https://fit-fusion-ai-kappa.vercel.app

## 🚀 Features

- **AI-Powered Virtual Try-On**: Seamlessly blend clothes onto photos of models or yourself.
- **Modern Glassmorphism UI**: A stunning, premium interface built with React and advanced CSS.
- **Persistent History**: View and reload your recent generations, synced with MongoDB.
- **Quota Management**: Intelligent handling of API limits with a built-in settings modal for custom tokens.
- **Serverless Ready**: Optimized for deployment on Vercel with a monorepo structure.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Lucide Icons, Framer Motion.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB Atlas.
- **AI/Cloud Services**:
  - **Replicate**: Powers the virtual try-on inference.
  - **Cloudinary**: Handles high-speed image storage and transformations.

## 📦 Project Structure

```text
FitFusion-AI/
├── frontend/           # React application
│   ├── public/         # Static assets (favicons, etc.)
│   └── src/            # Components, logic, and styles
├── backend/            # Express server
│   ├── config/         # Cloudinary and DB configurations
│   ├── controllers/    # Route handlers
│   ├── models/         # MongoDB schemas
│   └── server.js       # Entry point
└── vercel.json         # Vercel deployment orchestration
```

## ⚙️ Local Setup

Live Demo: https://fit-fusion-ai-exa6.vercel.app

### 1. Backend Configuration
Navigate to `/backend` and create a `.env` file:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
REPLICATE_API_TOKEN=your_replicate_token
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
Run `npm install && npm run dev` to start the server.

### 2. Frontend Configuration
Navigate to `/frontend` and create a `.env` file:
```env
VITE_API_URL=https://fit-fusion-ai-exa6.vercel.app
```
Run `npm install && npm run dev` to start the studio.

## ☁️ Deployment

This project is optimized for **Vercel**. 

1. **Deploy Backend**: Point Vercel to the `backend/` directory. Use the environment variables from your backend `.env`.
2. **Deploy Frontend**: Point Vercel to the `frontend/` directory. Set `VITE_API_URL` to your backend's Vercel URL.
3. **Routing**: The `frontend/vercel.json` handles SPA routing to prevent 404s on refresh.

## 📜 License
© 2026 FitFusion AI. Built with premium aesthetics and AI intelligence.
