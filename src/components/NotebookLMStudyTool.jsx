import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, MessageSquare, Video, Send, Loader2, PlayCircle, FileText, Sparkles, Upload, Mic, Download, Brain, List, Zap, CheckCircle2, Menu, X, ArrowLeft, Play, Pause, Square } from 'lucide-react';
import { API_URL } from '../config';

const NotebookLMStudyTool = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [studyMaterial, setStudyMaterial] = useState(null);
  const [videoLinks, setVideoLinks] = useState([]);
  const [audioDialogue, setAudioDialogue] = useState("");
  const [studyGuide, setStudyGuide] = useState(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Video transcript states
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(null);
  const [videoTranscripts, setVideoTranscripts] = useState({});
  const [loadingVideoId, setLoadingVideoId] = useState(null);

  useEffect(() => {
    if (activeTab !== "audio") {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, [activeTab]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    setStudyMaterial({
      type: "pdf",
      name: file.name,
    });
  
    const formData = new FormData();
    formData.append("file", file); 
  
    try {
      setIsLoading(true);
  
      const res = await fetch(`${API_URL}/upload-pdf`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
  
      const data = await res.json();
      console.log("Upload response:", data);
  
      setMessages([
        {
          role: "assistant",
          content: data.summary || data.message || "PDF uploaded successfully!",
        },
      ]);
  
      setActiveTab("chat");
  
    } catch (error) {
      console.error("PDF upload failed:", error);
      alert(`PDF upload failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeVideo = async (videoUrl, videoIndex) => {
    setLoadingVideoId(videoIndex);
    setSelectedVideoIndex(videoIndex);
  
    try {
      console.log("Sending video URL:", videoUrl);
      
      const res = await fetch(`${API_URL}/api/analyze/youtube`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtube_url: videoUrl }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
  
      const data = await res.json();
      console.log("Full video response:", JSON.stringify(data, null, 2));
  
      // Check all possible response formats
      let transcript = null;
      
      if (data.status === "success" && data.analysis) {
        transcript = data.analysis;
      } else if (data.status === "error" && data.message) {
        transcript = `❌ ${data.message}`;
      } else if (data.transcript) {
        transcript = data.transcript;
      } else if (data.summary) {
        transcript = data.summary;
      } else if (data.error) {
        transcript = `❌ ${data.error}`;
      } else if (typeof data === 'string' && data.trim()) {
        transcript = data;
      } else {
        transcript = "❌ Video transcript could not be fetched. The video may have disabled transcripts or is not available.";
      }
      
      setVideoTranscripts(prev => ({
        ...prev,
        [videoIndex]: transcript
      }));
      
    } catch (error) {
      console.error("Video analysis error:", error);
      setVideoTranscripts(prev => ({
        ...prev,
        [videoIndex]: `❌ Network error: ${error.message}`
      }));
    } finally {
      setLoadingVideoId(null);
    }
  };

  const addVideoLink = () => {
    const link = prompt('Enter YouTube video URL:');
    if (link && link.trim()) {
      // Split by newlines and filter empty strings
      const urls = link.split('\n').map(url => url.trim()).filter(url => url);
      
      urls.forEach(url => {
        let videoId = '';
        
        if (url.includes('youtu.be/')) {
          videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('youtube.com/watch')) {
          videoId = url.split('v=')[1]?.split('&')[0];
        }
        
        if (videoId) {
          setVideoLinks(prev => {
            // Check if video already exists
            const exists = prev.some(v => v.id === videoId);
            if (exists) return prev;
            
            return [...prev, {
              url: url,
              id: videoId,
              title: `Video ${prev.length + 1}`,
              thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
            }];
          });
        } else {
          alert(`Invalid YouTube URL: ${url}`);
        }
      });
    }
  };

  const generateAudioDialogue = async () => {
    setIsGeneratingAudio(true);
  
    try {
      console.log("Requesting audio dialogue...");
      
      const res = await fetch(`${API_URL}/audio-dialogue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
  
      // Get raw text first
      const textResponse = await res.text();
      console.log("Raw audio response:", textResponse);
      
      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(textResponse);
      } catch (parseError) {
        // If not JSON, use raw text
        data = { dialogue: textResponse };
      }
      
      console.log("Parsed audio data:", data);
  
      if (data.error) {
        alert(`Error: ${data.error}`);
        return;
      }
  
      // Check all possible response formats
      let dialogue = null;
      
      if (data.dialogue && typeof data.dialogue === 'string' && data.dialogue.trim()) {
        dialogue = data.dialogue;
      } else if (data.audio_dialogue && typeof data.audio_dialogue === 'string' && data.audio_dialogue.trim()) {
        dialogue = data.audio_dialogue;
      } else if (data.content && typeof data.content === 'string' && data.content.trim()) {
        dialogue = data.content;
      } else if (data.text && typeof data.text === 'string' && data.text.trim()) {
        dialogue = data.text;
      } else if (typeof data === 'string' && data.trim()) {
        dialogue = data;
      }
      
      if (dialogue) {
        // Clean up markdown formatting if present
        dialogue = dialogue
          .replace(/\*\*Teacher:\*\*/g, 'Teacher:')
          .replace(/\*\*Student:\*\*/g, 'Student:')
          .replace(/\*\*/g, '');
        
        setAudioDialogue(dialogue);
        setActiveTab("audio");
      } else {
        alert("No dialogue content received. Backend returned empty response.");
        console.error("Empty response - Full data:", data);
      }
  
    } catch (err) {
      console.error("Audio dialogue error:", err);
      alert(`Failed to generate audio dialogue: ${err.message}`);
    } finally {
      setIsGeneratingAudio(false);
    }
  };
  
  const playAudio = () => {
    if (!audioDialogue) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(audioDialogue);
      utterance.rate = 0.95;
      utterance.pitch = 1;
      
      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };

      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
      setIsPaused(false);
    }
  };

  const pauseAudio = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };
  
  const stopAudio = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const generateStudyGuide = async () => {
    setIsGeneratingGuide(true);
  
    try {
      const res = await fetch(`${API_URL}/study-guide`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
  
      const data = await res.json();
      console.log("Study guide response:", data);
  
      const raw = typeof data === "string" ? data : (data.guide || data.study_guide || JSON.stringify(data));
  
      let parsedGuide;
  
      try {
        const cleaned = raw
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
  
        parsedGuide = JSON.parse(cleaned);
      } catch {
        // If parsing fails, use raw text
        parsedGuide = { raw_text: raw };
      }
  
      setStudyGuide(parsedGuide);
      setActiveTab("guide");
  
    } catch (err) {
      console.error("Study guide error:", err);
      alert(`Failed to generate study guide: ${err.message}`);
    } finally {
      setIsGeneratingGuide(false);
    }
  };

  const openVideosTab = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setActiveTab("videos");
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
  
    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
  
    try {
      const response = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userMessage.content,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Chat response:", data);
  
      if (data.answer) {
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: data.answer },
        ]);
      } else if (data.response) {
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: data.response },
        ]);
      } else {
        throw new Error(data.error || "No answer received");
      }
  
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: `❌ AI couldn't answer: ${error.message}. Please try again.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    "Explain the main concept in simple terms",
    "Give me a real-world example",
    "What should I focus on for exams?",
    "Create practice questions",
    "Summarize the key points"
  ];

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .dialogue-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .dialogue-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .dialogue-scrollbar::-webkit-scrollbar-thumb {
          background: #a78bfa;
          border-radius: 10px;
        }
        
        .dialogue-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #8b5cf6;
        }
      `}</style>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <div className="bg-white shadow-lg border-b border-indigo-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {onBack && (
                  <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Back to landing page"
                  >
                    <ArrowLeft className="w-6 h-6 text-gray-700" />
                  </button>
                )}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    StudyMate AI
                  </h1>
                  <p className="text-xs md:text-sm text-gray-600 hidden sm:block">NotebookLM-Style Learning</p>
                </div>
              </div>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex gap-2">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all text-sm ${
                    activeTab === 'chat'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden md:inline">Chat</span>
                </button>
                <button
                  onClick={() => setActiveTab('audio')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all text-sm ${
                    activeTab === 'audio'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span className="hidden md:inline">Audio</span>
                </button>
                <button
                  onClick={openVideosTab}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all text-sm ${
                    activeTab === 'videos'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span className="hidden md:inline">Videos</span>
                </button>
                <button
                  onClick={() => setActiveTab('guide')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all text-sm ${
                    activeTab === 'guide'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <Brain className="w-4 h-4" />
                  <span className="hidden md:inline">Guide</span>
                </button>
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all text-sm ${
                    activeTab === 'upload'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span className="hidden md:inline">Upload</span>
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <div className="lg:hidden mt-4 pb-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setActiveTab('chat'); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                    activeTab === 'chat' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </button>
                <button
                  onClick={() => { setActiveTab('audio'); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                    activeTab === 'audio' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  Audio
                </button>
                <button
                  onClick={() => { openVideosTab(); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                    activeTab === 'videos' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  Videos
                </button>
                <button
                  onClick={() => { setActiveTab('guide'); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                    activeTab === 'guide' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <Brain className="w-4 h-4" />
                  Guide
                </button>
                <button
                  onClick={() => { setActiveTab('upload'); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-sm col-span-2 ${
                    activeTab === 'upload' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Upload Material
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-4 md:p-8">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Upload Study Material</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Upload PDF or Text Document
                    </label>
                    <div className="border-2 border-dashed border-indigo-300 rounded-xl p-6 md:p-8 text-center hover:border-indigo-500 transition-colors">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all w-full md:w-auto"
                      >
                        Choose File
                      </button>
                      <p className="text-sm text-gray-500 mt-3">
                        Supports PDF, TXT files
                      </p>
                      {studyMaterial && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-green-700 font-medium text-sm">✓ {studyMaterial.name} uploaded!</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Add YouTube Videos
                    </label>
                    <button
                      onClick={addVideoLink}
                      className="w-full border-2 border-indigo-300 rounded-xl p-4 text-indigo-600 font-medium hover:bg-indigo-50 transition-colors"
                    >
                      + Add YouTube Video
                    </button>
                    {videoLinks.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {videoLinks.map((video, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Video className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                            <span className="text-sm text-gray-700 flex-1 truncate">{video.url}</span>
                            <button
                              onClick={() => setVideoLinks(prev => prev.filter((_, i) => i !== idx))}
                              className="text-red-500 text-sm hover:text-red-700 flex-shrink-0"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={generateAudioDialogue}
                      disabled={isGeneratingAudio || !studyMaterial}
                      className="flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 transition-all"
                    >
                      {isGeneratingAudio ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Mic className="w-5 h-5" />
                          Generate Audio
                        </>
                      )}
                    </button>
                    <button
                      onClick={generateStudyGuide}
                      disabled={isGeneratingGuide || !studyMaterial}
                      className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 transition-all"
                    >
                      {isGeneratingGuide ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Brain className="w-5 h-5" />
                          Generate Guide
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-[calc(100vh-180px)] md:h-[calc(100vh-200px)] flex flex-col">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 md:p-5 text-white">
                    <h2 className="font-semibold flex items-center gap-2 text-base md:text-lg">
                      <MessageSquare className="w-5 h-5" />
                      AI Tutor Chat
                    </h2>
                    <p className="text-xs md:text-sm opacity-90 mt-1">
                      {studyMaterial ? `Studying: ${studyMaterial.name}` : 'Upload material to start'}
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                    {messages.length === 0 && (
                      <div className="text-center py-8 md:py-12">
                        <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                          <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-blue-600" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                          Your AI Study Assistant
                        </h3>
                        <p className="text-sm md:text-base text-gray-600 mb-6 px-4">
                          {studyMaterial 
                            ? "Ask me anything about your material!"
                            : "Upload study material to begin"}
                        </p>
                        {studyMaterial && (
                          <div className="text-left max-w-md mx-auto space-y-2 px-4">
                            <p className="text-sm font-medium text-gray-700 mb-3">Try asking:</p>
                            {suggestedQuestions.map((q, i) => (
                              <button
                                key={i}
                                onClick={() => setInput(q)}
                                className="block w-full text-left p-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg text-sm text-gray-700 transition-all shadow-sm"
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] md:max-w-[80%] rounded-2xl px-4 py-3 shadow-md ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-2xl px-5 py-3 shadow-md">
                          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="border-t border-gray-200 p-3 md:p-4 bg-gray-50">
                    <div className="flex gap-2 md:gap-3">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={studyMaterial ? "Ask anything..." : "Upload material first..."}
                        disabled={!studyMaterial}
                        className="flex-1 px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!input.trim() || isLoading || !studyMaterial}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 md:p-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4 lg:block hidden">
                <div className="bg-white rounded-2xl shadow-xl p-5">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    Material
                  </h3>
                  {studyMaterial ? (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <p className="text-sm font-medium text-green-800">{studyMaterial.name}</p>
                      <p className="text-xs text-green-600 mt-1">Ready</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-sm text-gray-600">None uploaded</p>
                      <button
                        onClick={() => setActiveTab('upload')}
                        className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        → Upload now
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-5 text-white">
                  <h3 className="font-semibold mb-3">📚 Features</h3>
                  <ul className="text-sm space-y-2 opacity-90">
                    <li>• AI Chat Tutor</li>
                    <li>• Audio Dialogues</li>
                    <li>• Video Summaries</li>
                    <li>• Study Guides</li>
                    <li>• Practice Questions</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Audio Dialogue Tab */}
          {activeTab === 'audio' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-4 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Mic className="w-8 h-8 text-purple-600" />
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">Audio Dialogue Mode</h2>
                </div>
                
                {audioDialogue ? (
                  <div className="space-y-6">
                    {/* Audio Controls Card */}
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 md:p-6 border border-purple-200">
                      <div className="flex items-center gap-2 mb-4">
                        <PlayCircle className="w-6 h-6 text-purple-600" />
                        <h3 className="font-semibold text-gray-800">Teacher-Student Dialogue</h3>
                      </div>
                      
                      {/* Audio Controls */}
                      <div className="flex flex-wrap gap-3 justify-center">
                        <button
                          onClick={playAudio}
                          disabled={isPlaying}
                          className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 transition-all"
                        >
                          <Play className="w-5 h-5" />
                          {isPaused ? 'Resume' : 'Play'}
                        </button>
                        <button
                          onClick={pauseAudio}
                          disabled={!isPlaying}
                          className="flex items-center gap-2 bg-yellow-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-yellow-700 disabled:opacity-50 transition-all"
                        >
                          <Pause className="w-5 h-5" />
                          Pause
                        </button>
                        <button
                          onClick={stopAudio}
                          disabled={!isPlaying && !isPaused}
                          className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 transition-all"
                        >
                          <Square className="w-5 h-5" />
                          Stop
                        </button>
                      </div>
                    </div>

                    {/* Dialogue Transcript Card */}
                    <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-lg">
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-600" />
                        Dialogue Transcript
                      </h4>
                      
                      <div 
                        className="space-y-3 text-sm md:text-base max-h-[500px] overflow-y-auto pr-2 dialogue-scrollbar"
                        style={{
                          scrollbarWidth: 'thin',
                          scrollbarColor: '#a78bfa #f1f1f1'
                        }}
                      >
                        {audioDialogue.split('\n').filter(line => line.trim()).map((line, idx) => {
                          if (line.startsWith('Teacher:')) {
                            return (
                              <div 
                                key={idx} 
                                className="flex gap-3 items-start opacity-0" 
                                style={{
                                  animation: 'fadeIn 0.3s ease-out forwards',
                                  animationDelay: `${idx * 0.05}s`
                                }}
                              >
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl shadow-md">
                                  👨‍🏫
                                </div>
                                <div className="flex-1 bg-white p-4 rounded-2xl rounded-tl-none shadow-md border border-blue-100 hover:shadow-lg transition-shadow">
                                  <p className="font-semibold text-blue-700 text-xs mb-1.5">Teacher</p>
                                  <p className="text-gray-800 leading-relaxed">{line.replace('Teacher:', '').trim()}</p>
                                </div>
                              </div>
                            );
                          } else if (line.startsWith('Student:')) {
                            return (
                              <div 
                                key={idx} 
                                className="flex gap-3 items-start flex-row-reverse opacity-0" 
                                style={{
                                  animation: 'fadeIn 0.3s ease-out forwards',
                                  animationDelay: `${idx * 0.05}s`
                                }}
                              >
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xl shadow-md">
                                  👨‍🎓
                                </div>
                                <div className="flex-1 bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-2xl rounded-tr-none shadow-md border border-green-200 hover:shadow-lg transition-shadow">
                                  <p className="font-semibold text-green-700 text-xs mb-1.5 text-right">Student</p>
                                  <p className="text-gray-800 leading-relaxed">{line.replace('Student:', '').trim()}</p>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-sm text-blue-800">
                        💡 <strong>Tip:</strong> Click Play to listen to the dialogue with text-to-speech. Use Pause to stop temporarily or Stop to end playback.
                      </p>
                    </div>
                    
                    <button
                      onClick={generateAudioDialogue}
                      disabled={isGeneratingAudio}
                      className="w-full bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {isGeneratingAudio ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Regenerating...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5" />
                          Regenerate Dialogue
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-purple-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mic className="w-12 h-12 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Audio Dialogue Yet</h3>
                    <p className="text-gray-600 mb-6">
                      {studyMaterial 
                        ? "Generate a teacher-student audio dialogue script"
                        : "Upload study material first"}
                    </p>
                    {studyMaterial ? (
                      <button
                        onClick={generateAudioDialogue}
                        disabled={isGeneratingAudio}
                        className="bg-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 transition-all inline-flex items-center gap-2"
                      >
                        {isGeneratingAudio ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Mic className="w-5 h-5" />
                            Generate Audio Dialogue
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveTab('upload')}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-all"
                      >
                        Upload Material
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Videos Tab */}
          {activeTab === 'videos' && (
            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-4 md:p-8">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Video Library & Analysis</h2>
                
                {videoLinks.length === 0 ? (
                  <div className="text-center py-12">
                    <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No videos added yet</p>
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all"
                    >
                      Add Videos
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {videoLinks.map((video, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg group bg-black">
                            <img
                              src={video.thumbnail}
                              alt="Video thumbnail"
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all flex items-center justify-center">
                              <a
                                href={video.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white/90 backdrop-blur p-4 rounded-full hover:scale-110 transition-transform shadow-xl"
                              >
                                <PlayCircle className="w-10 h-10 text-indigo-600" />
                              </a>
                            </div>
                          </div>
                          
                          <div className="md:col-span-2 space-y-3">
                            <h3 className="font-semibold text-gray-800">{video.title}</h3>
                            <p className="text-sm text-gray-600 truncate">{video.url}</p>
                            
                            <button
                              onClick={() => analyzeVideo(video.url, idx)}
                              disabled={loadingVideoId === idx}
                              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                              {loadingVideoId === idx ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Analyzing...
                                </>
                              ) : (
                                <>
                                  <Brain className="w-4 h-4" />
                                  Analyze Video
                                </>
                              )}
                            </button>
                            
                            {videoTranscripts[idx] && (
                              <div className="mt-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 md:p-6 max-h-96 overflow-y-auto">
                                <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2 text-base">
                                  <FileText className="w-5 h-5" />
                                  Analysis Result:
                                </h4>
                                <div className="prose prose-sm max-w-none">
                                  {videoTranscripts[idx].split('\n').map((line, lineIdx) => {
                                    const trimmedLine = line.trim();
                                    
                                    // Section headers (** text **)
                                    if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
                                      const text = trimmedLine.replace(/\*\*/g, '');
                                      return (
                                        <h3 key={lineIdx} className="text-lg font-bold text-blue-800 mt-4 mb-2">
                                          {text}
                                        </h3>
                                      );
                                    }
                                    
                                    // Numbered sections (1., 2., etc)
                                    if (/^\d+\.\s+\*\*/.test(trimmedLine)) {
                                      const text = trimmedLine.replace(/\*\*/g, '');
                                      return (
                                        <h4 key={lineIdx} className="text-base font-semibold text-blue-700 mt-3 mb-2">
                                          {text}
                                        </h4>
                                      );
                                    }
                                    
                                    // Bullet points (* text)
                                    if (trimmedLine.startsWith('*') && trimmedLine.length > 2) {
                                      const text = trimmedLine.substring(1).trim();
                                      // Handle bold within bullets (**text**)
                                      const parts = text.split(/(\*\*.*?\*\*)/g);
                                      return (
                                        <div key={lineIdx} className="flex gap-2 mb-2 ml-4">
                                          <span className="text-blue-600 font-bold">•</span>
                                          <span className="text-gray-800 text-sm leading-relaxed">
                                            {parts.map((part, i) => 
                                              part.startsWith('**') && part.endsWith('**') 
                                                ? <strong key={i} className="font-semibold text-gray-900">{part.replace(/\*\*/g, '')}</strong>
                                                : part
                                            )}
                                          </span>
                                        </div>
                                      );
                                    }
                                    
                                    // Horizontal rules (---)
                                    if (trimmedLine === '---') {
                                      return <hr key={lineIdx} className="my-4 border-blue-200" />;
                                    }
                                    
                                    // Regular paragraphs
                                    if (trimmedLine && !trimmedLine.startsWith('*')) {
                                      return (
                                        <p key={lineIdx} className="text-sm text-gray-700 mb-2 leading-relaxed">
                                          {trimmedLine}
                                        </p>
                                      );
                                    }
                                    
                                    // Empty lines for spacing
                                    return <div key={lineIdx} className="h-2" />;
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {videoLinks.length > 0 && (
                  <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 md:p-6 border border-blue-200">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                      Video Study Tips
                    </h3>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li>• Watch videos in order for best understanding</li>
                      <li>• Use AI analysis to get key concepts and summaries</li>
                      <li>• Ask the AI chat questions about video content</li>
                      <li>• Revisit difficult sections multiple times</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Study Guide Tab */}
          {activeTab === 'guide' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-4 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Brain className="w-8 h-8 text-green-600" />
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">Study Guide</h2>
                </div>
                
                {studyGuide ? (
                  <div className="space-y-6">
                    {studyGuide && studyGuide.key_concepts ? (
                      <div className="space-y-6">
                        {Array.isArray(studyGuide.key_concepts) && (
                          <section>
                            <h3 className="text-lg font-bold text-green-700 mb-2">🔑 Key Concepts</h3>
                            <ul className="list-disc pl-6 space-y-1">
                              {studyGuide.key_concepts.map((item, i) => (
                                <li key={i} className="text-gray-700">{item}</li>
                              ))}
                            </ul>
                          </section>
                        )}

                        {Array.isArray(studyGuide.exam_tips) && (
                          <section>
                            <h3 className="text-lg font-bold text-green-700 mb-2">🎯 Exam Tips</h3>
                            <ul className="list-disc pl-6 space-y-1">
                              {studyGuide.exam_tips.map((tip, i) => (
                                <li key={i} className="text-gray-700">{tip}</li>
                              ))}
                            </ul>
                          </section>
                        )}  

                        {Array.isArray(studyGuide.practice_questions) && (
                          <section>
                            <h3 className="text-lg font-bold text-green-700 mb-2">📝 Practice Questions</h3>
                            <ol className="list-decimal pl-6 space-y-2">
                              {studyGuide.practice_questions.map((q, i) => (
                                <li key={i} className="text-gray-700">{q}</li>
                              ))}
                            </ol>
                          </section>
                        )}  
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap text-gray-800 bg-gray-50 p-4 rounded-lg">
                        {studyGuide.raw_text || JSON.stringify(studyGuide, null, 2)}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={generateStudyGuide}
                        disabled={isGeneratingGuide}
                        className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                      >
                        {isGeneratingGuide ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Regenerating...
                          </>
                        ) : (
                          <>
                            <Zap className="w-5 h-5" />
                            Regenerate Guide
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          const element = document.createElement('a');
                          const file = new Blob(
                            [JSON.stringify(studyGuide, null, 2)], 
                            {type: 'application/json'});
                          element.href = URL.createObjectURL(file);
                          element.download = 'study-guide.json';
                          element.click();
                        }}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                      >
                        <Download className="w-5 h-5" />
                        Download Guide
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Brain className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Study Guide Yet</h3>
                    <p className="text-gray-600 mb-6">
                      {studyMaterial 
                        ? "Generate a comprehensive study guide with key concepts, tips, and practice questions"
                        : "Upload study material first"}
                    </p>
                    {studyMaterial ? (
                      <button
                        onClick={generateStudyGuide}
                        disabled={isGeneratingGuide}
                        className="bg-green-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 transition-all inline-flex items-center gap-2"
                      >
                        {isGeneratingGuide ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Brain className="w-5 h-5" />
                            Generate Study Guide
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveTab('upload')}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-all"
                      >
                        Upload Material
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-40">
          <div className="flex justify-around items-center max-w-lg mx-auto">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg ${
                activeTab === 'chat' ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs">Chat</span>
            </button>
            <button
              onClick={() => setActiveTab('audio')}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg ${
                activeTab === 'audio' ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <Mic className="w-5 h-5" />
              <span className="text-xs">Audio</span>
            </button>
            <button
              onClick={openVideosTab}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg ${
                activeTab === 'videos' ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <Video className="w-5 h-5" />
              <span className="text-xs">Videos</span>
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg ${
                activeTab === 'guide' ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <Brain className="w-5 h-5" />
              <span className="text-xs">Guide</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg ${
                activeTab === 'upload' ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <Upload className="w-5 h-5" />
              <span className="text-xs">Upload</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotebookLMStudyTool;