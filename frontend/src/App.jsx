import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Sparkles, Bot, User, Send, Loader2 } from "lucide-react";

function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  const generateContent = async () => {
    if (!prompt.trim()) return;
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:3000/content", {
        prompt: prompt
      });
      setResponse(res.data.content);
    } catch (error) {
      console.log(error);
      alert("Error generating content");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 sm:p-8 font-sans antialiased text-neutral-100 relative overflow-hidden selection:bg-purple-500/30">
      
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-6 sm:p-10 rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 transition-all duration-500">
        
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="p-3 bg-gradient-to-br from-purple-500 flex items-center justify-center to-blue-500 rounded-2xl shadow-lg ring-1 ring-white/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
            Nexus AI
          </h1>
        </div>

        <div className="space-y-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-start pt-4 pointer-events-none text-neutral-500 group-focus-within:text-purple-400 transition-colors">
              <User className="w-5 h-5" />
            </div>
            <textarea
              ref={textareaRef}
              className="w-full bg-neutral-900/60 border border-neutral-700/50 text-neutral-100 p-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all resize-none min-h-[120px] max-h-[300px] placeholder:text-neutral-500 text-base leading-relaxed"
              placeholder="What would you like to create today? Press Enter to send..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  generateContent();
                }
              }}
            />
          </div>

          <button
            onClick={generateContent}
            disabled={loading || !prompt.trim()}
            className="w-full relative overflow-hidden group bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium py-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 ring-1 ring-white/10"
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative z-10 flex items-center gap-2 font-semibold text-[17px]">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Synthesizing...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Generate Response
                </>
              )}
            </span>
          </button>

          {response && (
            <div className="mt-8 animate-fade-in-up">
              <div className="flex items-center gap-2 mb-4 text-purple-400/90 pl-1">
                <Bot className="w-5 h-5" />
                <h2 className="font-semibold tracking-wider uppercase text-xs">AI Response</h2>
              </div>
              <div className="p-6 bg-neutral-900/70 border border-neutral-700/50 rounded-2xl text-neutral-200 leading-relaxed shadow-inner backdrop-blur-md">
                {response.split('\n').map((line, i) => (
                  <p key={i} className="mb-3 last:mb-0 min-h-[1.5rem]">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;