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
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Upload Documents
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Resume (PDF)</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setResume(e.target.files[0])}
              className="w-full"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Job Description (PDF)
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setJD(e.target.files[0])}
              className="w-full"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            {loading ? "Uploading..." : "Proceed to Chat"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Upload;
