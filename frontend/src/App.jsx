import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Bot, User, Send, Loader2, Menu, Plus, MessageSquare } from "lucide-react";

function App() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentChat, setCurrentChat] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Close sidebar on small screens initially
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px'; // Reset/default height
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = scrollHeight > 44 ? `${Math.min(scrollHeight, 200)}px` : '44px';
    }
  }, [prompt]);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat]);

  // Fetch history on load
  const fetchHistory = async () => {
    try {
      const res = await axios.get("http://localhost:3000/");
      setHistory(res.data);
      // Optional: Load the most recent conversation into the main view
      // if (res.data.length > 0) {
      //   setCurrentChat([{ role: 'user', content: res.data[0].prompt }, { role: 'ai', content: res.data[0].response }]);
      // }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const generateContent = async () => {
    if (!prompt.trim() || loading) return;
    
    const userPrompt = prompt.trim();
    setPrompt(""); // Clear input immediately
    
    // Optimistically add user message to chat
    const newChat = [...currentChat, { role: 'user', content: userPrompt }];
    setCurrentChat(newChat);
    
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:3000/content", {
        prompt: userPrompt
      });
      
      const aiResponse = res.data.content;
      
      // Add AI response to chat
      setCurrentChat([...newChat, { role: 'ai', content: aiResponse }]);
      
      // Refresh sidebar history
      fetchHistory();
      
    } catch (error) {
      console.error(error);
      setCurrentChat([...newChat, { role: 'ai', content: "Sorry, an error occurred while generating the response.", isError: true }]);
    } finally {
      setLoading(false);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generateContent();
    }
  };

  const startNewChat = () => {
    setCurrentChat([]);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const loadPastChat = (pastPrompt, pastResponse) => {
    setCurrentChat([
      { role: 'user', content: pastPrompt },
      { role: 'ai', content: pastResponse }
    ]);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#212121] text-gray-100 font-sans overflow-hidden selection:bg-gray-700">
      
      {/* Sidebar */}
      <div 
        className={`
          ${isSidebarOpen ? 'w-[260px] border-r border-[#303030]' : 'w-0 border-r-0'} 
          transition-all duration-300 ease-in-out
          h-full bg-[#171717] flex flex-col flex-shrink-0 overflow-hidden z-30
        `}
      >
        {/* Fixed inner container to prevent text wrapping when width animates */}
        <div className="w-[260px] flex flex-col h-full">
          {/* New Chat Button */}
          <div className="p-3">
            <button 
              onClick={startNewChat}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-[#2f2f2f] transition-colors text-sm font-medium text-gray-200"
            >
              <Plus className="w-5 h-5 text-gray-400" />
              New chat
            </button>
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto px-3 py-2">
            {history.length > 0 ? (
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Previous Generations
                </h3>
                {history.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => loadPastChat(item.prompt, item.response)}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#2f2f2f] transition-colors group flex items-start gap-3 text-sm text-gray-300"
                  >
                    <MessageSquare className="w-4 h-4 mt-0.5 text-gray-500 shrink-0" />
                    <span className="truncate flex-1">{item.prompt}</span>
                  </button>
                ))}
              </div>
            ) : (
               <div className="px-3 py-4 text-sm text-gray-500">No history yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full bg-[#212121] relative min-w-[100vw] md:min-w-0">
        
        {/* Mobile Sidebar Overlay inside Main Area */}
        {isSidebarOpen && (
          <div 
            className="absolute inset-0 bg-black/50 z-20 md:hidden animate-fade-in"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <header className="sticky top-0 z-30 flex items-center p-3 h-14 bg-[#212121]/95 backdrop-blur">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-800 text-gray-400 transition-colors mr-2 relative z-40"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="font-medium text-lg text-gray-200">Nexus AI</div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto">
          {currentChat.length === 0 ? (
            // Empty State
            <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in">
              <div className="w-16 h-16 bg-[#2f2f2f] rounded-2xl flex items-center justify-center mb-6 ring-1 ring-white/10 shadow-xl">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-100 mb-2">How can I help you today?</h2>
              <p className="text-gray-400 text-sm max-w-md">Nexus AI is ready to assist you. Ask a question or provide a prompt below to get started.</p>
            </div>
          ) : (
            // Messages List
            <div className="flex flex-col pb-6">
              {currentChat.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`px-3 sm:px-6 py-4 sm:py-6 ${msg.role === 'user' ? 'bg-[#212121]' : 'bg-[#212121]'}`}
                >
                  <div className="max-w-3xl mx-auto flex gap-3 sm:gap-6 text-[15px] sm:text-base">
                    <div className="shrink-0">
                      {msg.role === 'user' ? (
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mt-0.5">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-[#10a37f] rounded-full flex items-center justify-center mt-0.5 shadow-sm">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className={`flex-1 min-w-0 leading-relaxed ${msg.role === 'user' ? 'text-gray-200' : 'text-gray-300'}`}>
                       {msg.role === 'ai' ? (
                        msg.isError ? (
                           <span className="text-red-400">{msg.content}</span>
                        ) : (
                          // Render lines carefully
                          <div className="space-y-4">
                            {msg.content.split('\n').map((line, i) => (
                              <p key={i} className="min-h-[1rem] whitespace-pre-wrap word-break">
                                {line}
                              </p>
                            ))}
                          </div>
                        )
                       ) : (
                         <div className="whitespace-pre-wrap break-words">
                            {msg.content}
                         </div>
                       )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Processing Indicator */}
              {loading && (
                <div className="px-3 sm:px-6 py-4 sm:py-6 bg-[#212121]">
                  <div className="max-w-3xl mx-auto flex gap-3 sm:gap-6 text-[15px] sm:text-base">
                    <div className="shrink-0">
                      <div className="w-8 h-8 bg-[#10a37f] rounded-full flex items-center justify-center mt-0.5 shadow-sm">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 flex items-center h-8">
                       <div className="flex space-x-1.5 items-center">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                       </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="shrink-0 p-3 sm:p-4 bg-gradient-to-t from-[#212121] via-[#212121] to-transparent pt-4 sm:pt-8 pb-6 sm:pb-4">
          <div className="max-w-3xl mx-auto relative cursor-text">
            <div className="overflow-hidden bg-[#2f2f2f] border border-[#424242] rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.1)] focus-within:border-gray-500 focus-within:ring-1 focus-within:ring-gray-500 transition-all flex items-end">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message Nexus AI..."
                className="w-full max-h-[200px] bg-transparent text-gray-100 placeholder:text-gray-500 p-3.5 pl-4 resize-none focus:outline-none focus:ring-0 sm:text-base"
                style={{ minHeight: '44px' }}
                disabled={loading}
              />
              <button
                onClick={generateContent}
                disabled={!prompt.trim() || loading}
                className="p-3 mb-1 mr-1.5 rounded-xl bg-white text-black disabled:bg-[#3f3f3f] disabled:text-gray-500 transition-colors flex shrink-0 relative group"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5 translate-x-[-1px] translate-y-[1px]" />
                )}
                {/* Tooltip */}
                {!loading && prompt.trim() && (
                   <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1.5 px-2.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                     Send message
                   </div>
                )}
              </button>
            </div>
            
            <div className="text-center mt-3 text-xs text-gray-500">
              Nexus AI can make mistakes. Consider verifying important information.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;