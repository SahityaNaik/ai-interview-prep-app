import { useState } from "react";
import api from "../api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/signup";
      const { data } = await api.post(endpoint, { email, password });
      localStorage.setItem("token", data.token);
      toast.success(isLogin ? "Login successful!" : "Signup successful!");
      navigate("/upload");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0F172A] p-6 antialiased">
      {/* Hero Branding Section */}
      <div className="text-center mb-10 max-w-4xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-1000">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Master Your Next Career Move
        </h1>
        <p className="text-slate-400 text-lg">
          Simulate real-world job interviews and get personalized AI feedback based on your resume.
        </p>
      </div>

      <div className="midnight-card w-full max-w-md p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h2 className="text-2xl font-semibold text-white mb-8 text-center">
          {isLogin ? "Welcome Back" : "Create Your Account"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full midnight-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full midnight-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full midnight-button-primary mt-4"
          >
            {isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div className="relative mt-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-800"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#1E293B] px-2 text-slate-500">OR</span>
          </div>
        </div>

        <p className="text-center text-slate-400 text-sm mt-8">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Create an account" : "Sign in here"}
          </button>
        </p>
      </div>
      
      <p className="mt-8 text-slate-500 text-xs">
        &copy; 2026 AI-Powered Interview Prep
      </p>
    </div>
  );
};

export default Signup;
