import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import toast from "react-hot-toast";

export default function Chat() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, loading]);

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
    <div className="h-screen bg-[#0F172A] text-slate-100 flex flex-col p-6 antialiased overflow-hidden">
      {/* Header / Status Bar */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between mb-4 animate-in fade-in slide-in-from-top-4 duration-500">
        <h2 className="text-lg font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          AI Interview Prep
        </h2>

        {questions.length > 0 && currentQ < questions.length && (
          <div className="flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
            <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
              Question {currentQ + 1} of {questions.length}
            </span>
          </div>
        )}
      </div>

      {questions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400">Preparing your AI interviewer...</p>
        </div>
      ) : (
        <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col space-y-4 overflow-hidden">
          {/* Top Section: Active Question OR Completion Card */}
          <div className="animate-in fade-in slide-in-from-top-4 duration-700">
            {currentQ < questions.length ? (
              <div className="midnight-card p-5 border-indigo-500/30 flex flex-col items-center text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-30"></div>
                <span className="text-indigo-400 text-[9px] font-bold uppercase tracking-[0.3em] mb-2 block">
                  Active Question
                </span>
                <h3 className="text-lg md:text-xl font-medium text-white leading-relaxed max-w-3xl">
                  {questions[currentQ]}
                </h3>
              </div>
            ) : (
              <div className="midnight-card p-4 border-emerald-500/30 bg-emerald-500/5 flex flex-col items-center text-center relative overflow-hidden translate-y-0 opacity-100 transition-all duration-700">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
                <div className="flex items-center space-x-3">
                  <span className="text-xl">🎓</span>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                    Interview Completed — Final Score:{" "}
                    {chatHistory
                      .filter((msg) => msg.role === "AI")
                      .reduce((acc, msg) => {
                        const match = msg.content.match(/Score: (\d+)\/10/);
                        return acc + (match ? parseInt(match[1]) : 0);
                      }, 0)}
                    /30
                  </h3>
                  <span className="text-xl">🏁</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Section: Immersive Chat History (Always Visible) */}
          <div className="flex-1 flex flex-col midnight-card overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
            >
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
                    className={`max-w-[85%] md:max-w-[70%] p-5 rounded-2xl ${
                      msg.role === "You"
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                        : "bg-slate-900/50 border border-slate-800 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest ${
                          msg.role === "You"
                            ? "text-indigo-200"
                            : "text-emerald-400"
                        }`}
                      >
                        {msg.role}
                      </span>
                    </div>
                    <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-150"></div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-300"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Action/Input Bar */}
            <div className="p-4 bg-slate-950/50 border-t border-slate-800 backdrop-blur-md">
              {currentQ < questions.length ? (
                <form
                  onSubmit={handleSubmit}
                  className="w-full max-w-5xl mx-auto flex items-end space-x-3"
                >
                  <textarea
                    className="flex-1 midnight-input !bg-slate-950 min-h-[44px] max-h-32 py-3 px-4 resize-none transition-all focus:min-h-[80px]"
                    placeholder="Structure your answer (e.g. STAR method)..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (answer.trim()) handleSubmit(e);
                      }
                    }}
                    disabled={loading}
                    required
                    rows={1}
                  />
                  <button
                    type="submit"
                    className="midnight-button-primary !py-3 px-8 flex items-center justify-center disabled:opacity-50 h-[44px]"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Evaluating...</span>
                      </div>
                    ) : (
                      "Send Answer"
                    )}
                  </button>
                </form>
              ) : (
                <div className="w-full max-w-5xl mx-auto flex items-center justify-between">
                  <button
                    onClick={() => navigate("/upload")}
                    className="px-6 py-2 border border-slate-700 text-slate-400 rounded-lg hover:bg-slate-800 hover:text-white transition-all text-sm font-medium"
                  >
                    ← Back to Dashboard
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="midnight-button-primary !py-2 px-10 bg-emerald-600 border-emerald-500 hover:bg-emerald-500"
                  >
                    Start New Interview
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
