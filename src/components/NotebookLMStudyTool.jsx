import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, MessageSquare, Video, Send, Loader2, PlayCircle, FileText, Sparkles, Upload, Mic, Download, Brain, List, Zap, CheckCircle2, Menu, X, ArrowLeft } from 'lucide-react';


const NotebookLMStudyTool = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [studyMaterial, setStudyMaterial] = useState(null);
  const [videoLinks, setVideoLinks] = useState([]);
  const [audioDialogue, setAudioDialogue] = useState(null);
  const [studyGuide, setStudyGuide] = useState(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  

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
  
      const res = await fetch("http://127.0.0.1:8000/upload-pdf", {
        method: "POST",
        body: formData,
      });
  
      const data = await res.json();
  
      
      setMessages([
        {
          role: "assistant",
          content: data.summary,
        },
      ]);
  
      // auto chat tab pe le jao
      setActiveTab("chat");
  
    } catch (error) {
      console.error("PDF upload failed:", error);
      alert("PDF upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  const addVideoLink = () => {
    const link = prompt('Enter YouTube video URL:');
    if (link && link.trim()) {
      let videoId = '';
      
      if (link.includes('youtu.be/')) {
        videoId = link.split('youtu.be/')[1].split('?')[0];
      } else if (link.includes('youtube.com/watch')) {
        videoId = link.split('v=')[1]?.split('&')[0];
      }
      
      if (videoId) {
        setVideoLinks(prev => [...prev, {
          url: link,
          id: videoId,
          title: `Video ${prev.length + 1}`,
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        }]);
      }
    }
  };

  const generateAudioDialogue = async () => {
    if (!studyMaterial) {
      alert('Please upload study material first!');
      return;
    }

    setIsGeneratingAudio(true);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are creating a realistic teacher-student audio dialogue script about the study material. Create an engaging 2-minute conversation where:
- The teacher explains key concepts
- The student asks clarifying questions
- Use simple, conversational language
- Include 4-5 exchanges
- Make it sound natural and educational

Format as:
Teacher: [dialogue]
Student: [question]
Teacher: [response]
etc.`,
          messages: [
            { 
              role: "user", 
              content: `Create an engaging teacher-student dialogue about: ${studyMaterial.name}. Make it educational but conversational.` 
            }
          ],
        })
      });

      const data = await response.json();
      setAudioDialogue(data.content[0].text);
      setActiveTab('audio');
    } catch (error) {
      console.error('Error generating audio:', error);
      alert('Failed to generate audio dialogue. Please try again.');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const generateStudyGuide = async () => {
    if (!studyMaterial) {
      alert('Please upload study material first!');
      return;
    }

    setIsGeneratingGuide(true);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `Create a comprehensive study guide with:
1. Key Concepts (3-5 main points)
2. Quick Summary (2-3 sentences)
3. Exam Tips (3-4 practical tips)
4. Practice Questions (3 questions)
5. Memory Techniques

Format in clear sections with bullet points.`,
          messages: [
            { 
              role: "user", 
              content: `Create a study guide for: ${studyMaterial.name}` 
            }
          ],
        })
      });

      const data = await response.json();
      setStudyGuide(data.content[0].text);
      setActiveTab('guide');
    } catch (error) {
      console.error('Error generating guide:', error);
      alert('Failed to generate study guide. Please try again.');
    } finally {
      setIsGeneratingGuide(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
  
    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
  
    try {
      const response = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userMessage.content,
        }),
      });
  
      const data = await response.json();
  
      if (data.answer) {
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: data.answer },
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
          content: "❌ AI couldn’t answer. Please try again.",
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-indigo-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Back to landing page"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-700" />
                </button> 
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
                onClick={() => setActiveTab('videos')}
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
                onClick={() => { setActiveTab('videos'); setMobileMenuOpen(false); }}
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

                {studyMaterial && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={generateAudioDialogue}
                      disabled={isGeneratingAudio}
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
                      disabled={isGeneratingGuide}
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
                )}
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
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 md:p-6 border border-purple-200">
                    <div className="flex items-center gap-2 mb-4">
                      <PlayCircle className="w-6 h-6 text-purple-600" />
                      <h3 className="font-semibold text-gray-800">Teacher-Student Dialogue</h3>
                    </div>
                    <div className="space-y-4 text-sm md:text-base">
                      {audioDialogue.split('\n').map((line, idx) => {
                        if (line.startsWith('Teacher:')) {
                          return (
                            <div key={idx} className="bg-white p-4 rounded-lg shadow-sm">
                              <p className="font-semibold text-blue-600 mb-2">👨‍🏫 Teacher</p>
                              <p className="text-gray-700">{line.replace('Teacher:', '').trim()}</p>
                            </div>
                          );
                        } else if (line.startsWith('Student:')) {
                          return (
                            <div key={idx} className="bg-white p-4 rounded-lg shadow-sm">
                              <p className="font-semibold text-green-600 mb-2">👨‍🎓 Student</p>
                              <p className="text-gray-700">{line.replace('Student:', '').trim()}</p>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Tip:</strong> This simulates a natural teacher-student conversation. In a full implementation, this would be converted to audio using text-to-speech services.
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
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Video Library & Summaries</h2>
              
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {videoLinks.map((video, idx) => (
                    <div key={idx} className="group">
                      <div className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all">
                        <img
                          src={video.thumbnail}
                          alt="Video thumbnail"
                          className="w-full aspect-video object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white text-indigo-600 p-3 md:p-4 rounded-full hover:scale-110 transition-transform shadow-lg"
                          >
                            <PlayCircle className="w-6 h-6 md:w-8 md:h-8" />
                          </a>
                        </div>
                      </div>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2">{video.title}</p>
                        <p className="text-xs text-gray-500">Click to watch on YouTube</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {videoLinks.length > 0 && (
                <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 md:p-6 border border-blue-200">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    Video Overview Tips
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Watch videos in order for best understanding</li>
                    <li>• Take notes on key concepts while watching</li>
                    <li>• Use the AI chat to ask questions about video content</li>
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
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 md:p-6 border border-green-200">
                    <div className="prose prose-sm md:prose max-w-none">
                      <div className="whitespace-pre-wrap text-sm md:text-base text-gray-800 leading-relaxed">
                        {studyGuide}
                      </div>
                    </div>
                  </div>
                  
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
                        const file = new Blob([studyGuide], {type: 'text/plain'});
                        element.href = URL.createObjectURL(file);
                        element.download = 'study-guide.txt';
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

      {/* Mobile Bottom Navigation (Optional) */}
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
            onClick={() => setActiveTab('videos')}
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
  );
};

export default NotebookLMStudyTool;