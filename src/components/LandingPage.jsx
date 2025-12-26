import React, { useState } from 'react';
import { ArrowRight, BookOpen, Brain, Sparkles, Mic, Video, FileText, Zap, CheckCircle, PlayCircle } from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">StudyMate AI</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How it works</a>
              <button
                onClick={onGetStarted}
                className="bg-black text-white px-6 py-2.5 rounded-full hover:bg-gray-800 transition-all font-medium"
              >
                Try StudyMate AI
              </button>
            </nav>
            <button
              onClick={onGetStarted}
              className="md:hidden bg-black text-white px-4 py-2 rounded-full text-sm font-medium"
            >
              Try Now
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-blue-50 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              Powered by Gemini AI
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Understand{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Anything
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Your AI-powered study companion. Upload documents, watch videos, and get instant help with any subject.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onGetStarted}
                className="group bg-black text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition-all flex items-center gap-2 shadow-xl hover:shadow-2xl"
              >
                Try StudyMate AI
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="text-gray-700 px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-100 transition-all flex items-center gap-2">
                <PlayCircle className="w-5 h-5" />
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-3xl mx-auto">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">100+</div>
                <div className="text-sm text-gray-600">Study Sessions</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">50+</div>
                <div className="text-sm text-gray-600">Documents</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">1000+</div>
                <div className="text-sm text-gray-600">Questions Answered</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">24/7</div>
                <div className="text-sm text-gray-600">AI Assistance</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Your AI-Powered Study Partner
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to master any subject, powered by advanced AI
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-all border border-blue-100">
              <div className="bg-blue-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Chat Tutor</h3>
              <p className="text-gray-600 leading-relaxed">
                Ask questions and get instant, detailed explanations tailored to your learning style.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-xl transition-all border border-purple-100">
              <div className="bg-purple-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Mic className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Audio Dialogues</h3>
              <p className="text-gray-600 leading-relaxed">
                Listen to AI-generated teacher-student conversations about your study material.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all border border-green-100">
              <div className="bg-green-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Study Guides</h3>
              <p className="text-gray-600 leading-relaxed">
                Auto-generate comprehensive study guides with key concepts, tips, and practice questions.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 hover:shadow-xl transition-all border border-orange-100">
              <div className="bg-orange-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Video className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Video Integration</h3>
              <p className="text-gray-600 leading-relaxed">
                Link YouTube videos and get AI-powered summaries and key takeaways.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 hover:shadow-xl transition-all border border-cyan-100">
              <div className="bg-cyan-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Document Analysis</h3>
              <p className="text-gray-600 leading-relaxed">
                Upload PDFs and text files. AI reads and understands your study material.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 hover:shadow-xl transition-all border border-indigo-100">
              <div className="bg-indigo-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Answers</h3>
              <p className="text-gray-600 leading-relaxed">
                Get quick, accurate answers to complex questions in seconds, not hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start learning smarter in just three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Upload Your Material</h3>
              <p className="text-gray-600">
                Upload PDFs, textbooks, notes, or add YouTube video links for any subject.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Ask Questions</h3>
              <p className="text-gray-600">
                Chat with AI, generate study guides, or listen to audio explanations.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Master the Subject</h3>
              <p className="text-gray-600">
                Learn faster with personalized explanations, practice questions, and exam tips.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join students worldwide who are learning smarter with AI-powered study tools.
          </p>
          <button
            onClick={onGetStarted}
            className="bg-white text-blue-600 px-10 py-5 rounded-full text-lg font-bold hover:bg-gray-100 transition-all shadow-2xl hover:shadow-3xl inline-flex items-center gap-2"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-blue-100 mt-6 text-sm">No credit card required • Start learning in seconds</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-blue-500" />
                <span className="text-xl font-bold text-white">StudyMate AI</span>
              </div>
              <p className="text-gray-400 max-w-md">
                Your AI-powered study companion. Learn smarter, not harder with advanced AI technology.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How it works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2025 StudyMate AI. Built by Shaswat Kumar 😎. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;