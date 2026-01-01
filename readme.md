# 🎓 StudyMate AI
Transform any document into an interactive learning experience with AI-powered assistance

## 🌟 Overview

StudyMate AI is an intelligent study companion that leverages advanced AI to help students learn more effectively. Upload your study materials, ask questions, and get instant, contextual answers powered by Claude AI.

## 🌐 Live Demo

**Frontend (User Application):** https://studymate-ai-shaswat.netlify.app/

**Backend API:** https://studymate-ai-hy09.onrender.com

Try the live application to experience all features including PDF upload, AI-powered Q&A, study guide generation, audio dialogue mode, and YouTube video analysis.

## ✨ Key Features

### 📚 Multi-Format Support
- **Document Processing**: PDF, TXT, DOC, DOCX
- **Video Integration**: YouTube video links with transcript analysis
- **Smart Parsing**: Automatic content extraction and structuring

### 🤖 AI-Powered Learning
- **Contextual Q&A**: Ask questions and get answers based on your uploaded materials
- **Intelligent Summaries**: Generate concise summaries of complex topics
- **Exam Preparation**: Get targeted exam tips and study strategies
- **Concept Explanations**: Break down difficult concepts into understandable chunks

### 💡 Interactive Experience
- **Real-time Chat**: Instant responses to your study queries
- **Multi-document Support**: Work with multiple study materials simultaneously
- **Progress Tracking**: Keep track of your learning sessions
- **Responsive Design**: Study seamlessly across desktop, tablet, and mobile

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** (v7+) or **yarn** (v1.22+)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/studymate-ai.git
   cd studymate-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_ANTHROPIC_API_KEY=your_claude_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173`

## 📦 Build & Deployment

### Build for Production

```bash
npm run build
# or
yarn build
```

The build output will be in the `dist/` directory.

### Deployment Options

#### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# For production deployment
vercel --prod
```

#### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

#### Other Platforms

The built files in `dist/` can be deployed to any static hosting service:
- GitHub Pages
- AWS S3 + CloudFront
- Google Firebase Hosting
- Cloudflare Pages

## 📖 Usage Guide

### 1. Upload Study Materials

Navigate to the **Upload** tab and:
- Click "Choose File" or drag and drop your document
- Supported formats: PDF, TXT, DOC, DOCX
- Wait for processing confirmation

### 2. Ask Questions

Switch to the **AI Tutor** tab:
- Type your question in the chat input
- Get instant, context-aware answers
- Ask follow-up questions for deeper understanding

### 3. Add Video Resources

Go to the **Videos** tab:
- Paste YouTube video URLs
- AI analyzes video transcripts
- Ask questions about video content

### 4. Generate Summaries

- Request topic summaries
- Get exam preparation tips
- Generate study notes

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling

### AI & APIs
- **Claude AI (Anthropic)** - Advanced language model
- **YouTube Data API** - Video integration

### UI Components
- **Lucide React** - Beautiful icon set
- Custom React components

### File Processing
- **PDF.js** - PDF parsing
- **Mammoth.js** - DOC/DOCX conversion

## 🏗️ Project Structure

```
studymate-ai/
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Helper functions
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── public/             # Static assets
├── dist/               # Build output
├── .env                # Environment variables
├── package.json        # Dependencies
└── vite.config.js      # Vite configuration
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Known Issues & Roadmap

### Current Limitations
- Large PDF files (>10MB) may take longer to process
- Video transcript availability depends on YouTube

### Upcoming Features
- [ ] Flashcard generation
- [ ] Spaced repetition system
- [ ] Multiple language support
- [ ] Collaborative study sessions
- [ ] Mobile app (React Native)

## 📞 Support & Contact

**Developer:** Shaswat Kumar  
**Email:** shaswatsinha05@gmail.com

---

**Made with 😎 for students worldwide**
