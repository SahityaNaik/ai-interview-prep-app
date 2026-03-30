import { useState, useEffect } from "react";
import api from "../api";
import toast from "react-hot-toast";

export default function Chat() {
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch 3 questions on load
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data } = await api.post("/chat/start");
        const qList = data.questions
          .split(/\n/)
          .map((q) => q.replace(/^\d+\.\s*/, "").trim())
          .filter((q) => q.length > 0);
        setQuestions(qList);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch questions");
      }
    };
    fetchQuestions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;

    const question = questions[currentQ];
    setChatHistory((prev) => [...prev, { role: "You", content: answer }]);
    setAnswer("");
    setLoading(true);

    try {
      const { data } = await api.post("/chat/query", { question, answer });

      setChatHistory((prev) => [
        ...prev,
        { role: "AI", content: data.response },
      ]);

      // Add a short delay before moving to next question
      if (currentQ < questions.length - 1) {
        setTimeout(() => setCurrentQ((prev) => prev + 1), 1000);
      } else {
        // For the last question, delay the completion message too
        setTimeout(() => setCurrentQ(questions.length), 1500);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to get AI feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col p-6 antialiased">
      {/* Header / Status Bar */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          AI Interview In Progress
        </h2>
        
        {questions.length > 0 && currentQ < questions.length && (
          <div className="flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Step {currentQ + 1} of {questions.length}
            </span>
          </div>
        )}
      </div>

      {questions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
           <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
           <p className="text-slate-400">Preparing your AI interviewer...</p>
        </div>
      ) : currentQ >= questions.length ? (
        <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
           <div className="midnight-card p-12 text-center max-w-md">
              <span className="text-6xl mb-6 block">🎉</span>
              <h3 className="text-2xl font-bold text-white mb-4">Interview Completed!</h3>
              <p className="text-slate-400 mb-8">
                You've successfully finished all the questions. Review your feedback in the chat history below.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="midnight-button-primary w-full"
              >
                Restart Session
              </button>
           </div>
        </div>
      ) : (
        <div className="w-full max-w-6xl mx-auto flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 mb-4 overflow-hidden">
          
          {/* Left Column: Focused Question Card */}
          <div className="lg:col-span-1 space-y-6 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="midnight-card p-6 h-full border-indigo-500/30 flex flex-col">
              <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-2 block">
                Active Question
              </span>
              <p className="text-lg font-medium text-white leading-relaxed">
                "{questions[currentQ]}"
              </p>
              
              <div className="mt-auto pt-6 border-t border-slate-800">
                 <p className="text-slate-500 text-sm italic">
                    Tip: Use the STAR method to structure your answer for the best result.
                 </p>
              </div>
            </div>
          </div>

          {/* Right Column: Chat History */}
          <div className="lg:col-span-3 flex flex-col midnight-card h-full animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {chatHistory.length === 0 && (
                <div className="h-full flex items-center justify-center text-slate-500 italic text-sm">
                  Waiting for your response...
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.role === "You" ? "justify-end" : "justify-start"
                  } animate-in fade-in slide-in-from-bottom-2 duration-300`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl ${
                      msg.role === "You"
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                        : "bg-[#0F172A] border border-slate-800 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${
                        msg.role === "You" ? "text-indigo-200" : "text-emerald-400"
                      }`}>
                        {msg.role}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-150"></div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-300"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input form */}
            <div className="p-4 bg-slate-900/50 border-t border-slate-800">
              <form onSubmit={handleSubmit} className="flex space-x-3">
                <input
                  type="text"
                  className="flex-1 midnight-input !bg-slate-950"
                  placeholder="Type your answer here..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="submit"
                  className="midnight-button-primary !py-2 px-6 flex items-center justify-center disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "Thinking..." : "Send"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
