import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import toast from "react-hot-toast";

const Upload = () => {
  const [resume, setResume] = useState(null);
  const [jd, setJD] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpload = async (file, type) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    try {
      setLoading(true);
      const { data } = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(`${type.toUpperCase()} uploaded successfully!`);
      return data.document;
    } catch (err) {
      console.error(err);
      toast.error(`Failed to upload ${type}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resume || !jd) {
      toast.error("Please select both files!");
      return;
    }

    const resumeDoc = await handleUpload(resume, "resume");
    const jdDoc = await handleUpload(jd, "jd");

    if (resumeDoc && jdDoc) {
      navigate("/chat");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0F172A] p-6 antialiased">
      {/* Step Header */}
      <div className="text-center mb-10 max-w-2xl space-y-3 animate-in fade-in slide-in-from-top-4 duration-1000">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Step 1: Your Interview Profile
        </h1>
        <p className="text-slate-400 text-lg">
          Upload your documents to help the AI tailor your interview experience.
        </p>
      </div>

      <div className="midnight-card w-full max-w-xl p-8 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Resume Upload Zone */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest ml-1">
              Resume (PDF)
            </label>
            <label className={`flex flex-col items-center justify-center w-full h-32 midnight-input border-dashed border-2 cursor-pointer transition-all ${resume ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700 hover:border-indigo-500/50'}`}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className={`w-8 h-8 mb-3 ${resume ? 'text-emerald-400' : 'text-slate-500'}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
                <p className="text-sm text-slate-300">
                  {resume ? <span className="font-semibold text-emerald-400">{resume.name}</span> : <span className="font-semibold">Click to upload resume</span>}
                </p>
              </div>
              <input 
                type="file" 
                accept="application/pdf" 
                className="hidden" 
                onChange={(e) => setResume(e.target.files[0])} 
              />
            </label>
          </div>

          {/* JD Upload Zone */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest ml-1">
              Job Description (PDF)
            </label>
            <label className={`flex flex-col items-center justify-center w-full h-32 midnight-input border-dashed border-2 cursor-pointer transition-all ${jd ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700 hover:border-indigo-500/50'}`}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className={`w-8 h-8 mb-3 ${jd ? 'text-emerald-400' : 'text-slate-500'}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
                <p className="text-sm text-slate-300">
                  {jd ? <span className="font-semibold text-emerald-400">{jd.name}</span> : <span className="font-semibold">Click to upload JD</span>}
                </p>
              </div>
              <input 
                type="file" 
                accept="application/pdf" 
                className="hidden" 
                onChange={(e) => setJD(e.target.files[0])} 
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full midnight-button-primary mt-4 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>Processing...</span>
              </>
            ) : (
              <span>Proceed to Interview</span>
            )}
          </button>
        </form>
      </div>
      
      <p className="mt-10 text-slate-500 text-xs text-center max-w-sm">
        We only support PDF files. Your documents are securely processed and used only for your interview simulation.
      </p>
    </div>
  );
};

export default Upload;
