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
      setCurrentQ((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to get AI feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 p-6">
      <h2 className="text-3xl font-bold mb-6 text-indigo-700">AI Interview</h2>

      {questions.length === 0 ? (
        <p>Loading questions...</p>
      ) : currentQ >= questions.length ? (
        <p className="text-green-600 font-medium text-lg">
          🎉 All questions completed!
        </p>
      ) : (
        <div className="w-full max-w-3xl bg-white p-6 rounded-2xl shadow-lg flex flex-col h-[80vh]">
          {/* Question */}
          <div className="mb-4 border-b pb-3">
            <p className="font-semibold text-lg">
              <span className="text-indigo-600">Q{currentQ + 1}:</span>{" "}
              {questions[currentQ]}
            </p>
          </div>

          {/* Chat history */}
          <div className="flex-1 space-y-3 overflow-y-auto border rounded-xl p-4 bg-gray-50 shadow-inner">
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "You" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                    msg.role === "You"
                      ? "bg-indigo-100 text-right"
                      : "bg-green-100 text-left"
                  }`}
                >
                  <strong>{msg.role}:</strong> {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* Input form */}
          <form
            onSubmit={handleSubmit}
            className="mt-4 flex space-x-3 border-t pt-4 sticky bottom-0 bg-white"
          >
            <input
              type="text"
              className="flex-1 border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Type your answer..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={loading}
              required
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-5 py-2 rounded-xl hover:bg-indigo-700 transition disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Thinking..." : "Send"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
