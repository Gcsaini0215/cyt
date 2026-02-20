import React, { useState, useRef } from "react";
import { postFormData } from "../../../utils/actions";
import FormMessage from "../../global/form-message";
import { createBlogUrl } from "../../../utils/url";
import { useNavigate } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import "../workshops/editor.css";

export default function AIBlog() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const [info, setInfo] = useState({
    title: "",
    category: "Mental Health",
    short_desc: "",
    content: "",
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt for the AI.");
      return;
    }

    setGenerating(true);
    setError("");
    
    try {
      // Trying a more stable model for free tier
      const response = await fetch("https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputs: `<|system|>
You are a professional therapist and mental health writer. Write a detailed, empathetic blog post.
<|user|>
Write a professional and empathetic mental health blog post about: ${prompt}. 
The blog should have a clear Title, an Introduction, 3-4 key points, and a Conclusion. 
Format it nicely.
<|assistant|>`,
          parameters: { 
            max_new_tokens: 800,
            temperature: 0.7,
            top_p: 0.95,
            return_full_text: false
          }
        }),
      });

      const result = await response.json();
      console.log("AI Result:", result);
      
      if (result.error) {
        if (result.error.includes("currently loading")) {
          setError("AI Model is starting up. Please click 'Generate with AI' again in 10-15 seconds.");
          return;
        }
        setError(`AI Error: ${result.error}`);
        return;
      }

      let generatedText = "";
      if (Array.isArray(result)) {
        generatedText = result[0].generated_text;
      } else if (result.generated_text) {
        generatedText = result.generated_text;
      } else {
        throw new Error("Invalid response format from AI");
      }
      
      if (!generatedText) throw new Error("No content generated");

      // Extract title more intelligently
      let gTitle = "";
      let gContent = generatedText.trim();

      const titleMatch = gContent.match(/(?:Title|Topic):\s*(.*)/i);
      if (titleMatch) {
        gTitle = titleMatch[1].split('\n')[0].trim();
        gContent = gContent.replace(titleMatch[0], "").trim();
      } else {
        gTitle = prompt.charAt(0).toUpperCase() + prompt.slice(1);
      }

      setInfo({
        ...info,
        title: gTitle,
        content: gContent.replace(/\n/g, "<br/>"),
        short_desc: `An insightful piece about ${prompt}.`
      });
      
      setSuccess("AI has generated your blog content! You can now review and publish.");
    } catch (err) {
      console.error(err);
      setError("Failed to generate blog. Please try again or write manually.");
    } finally {
      setGenerating(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handlePublish = async () => {
    if (!info.title || !info.content || info.content.length < 50) {
      setError("Please ensure title and content are sufficient.");
      return;
    }
    if (!selectedImage) {
      setError("Please select a cover image.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("image", selectedImage);
    formData.append("title", info.title);
    formData.append("category", info.category);
    formData.append("short_desc", info.short_desc);
    formData.append("content", info.content);

    try {
      const response = await postFormData(createBlogUrl, formData);
      if (response.status) {
        setSuccess("Blog published successfully!");
        setTimeout(() => navigate("/therapist-dashboard"), 2000);
      } else {
        setError(response.message || "Something went wrong");
      }
    } catch (err) {
      setError("An error occurred while publishing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rbt-profile-row rbt-default-form row row--15">
      <div className="col-12">
        <FormMessage error={error} success={success} />
      </div>

      {/* AI Prompt Section */}
      <div className="col-12">
        <div className="rbt-form-group">
          <label>What should the blog be about?</label>
          <div className="input-group">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Benefits of mindfulness for anxiety"
              disabled={generating}
            />
            <button 
              className="rbt-btn btn-gradient btn-sm mt--10" 
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
            >
              {generating ? "AI is writing..." : "Generate with AI"}
            </button>
          </div>
        </div>
      </div>

      {generating && (
        <div className="col-12 text-center mt--20">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt--10">AI is crafting your blog post, please wait...</p>
        </div>
      )}

      {info.content && !generating && (
        <>
          <div className="col-12 mt--30">
            <div className="section-title">
              <h5 className="title">Preview & Edit Blog</h5>
            </div>
            <hr />
          </div>

          <div className="col-12">
            <div className="rbt-form-group">
              <label>Generated Title</label>
              <input
                type="text"
                name="title"
                value={info.title}
                onChange={handleChange}
                className="font-weight-bold"
              />
            </div>
          </div>

          <div className="col-lg-6 col-md-6 col-12">
            <div className="rbt-form-group">
              <label>Category</label>
              <select
                value={info.category}
                name="category"
                onChange={handleChange}
                style={{ lineHeight: "20px", height: "50px" }}
              >
                <option value="Mental Health">Mental Health</option>
                <option value="Relationships">Relationships</option>
                <option value="Self Care">Self Care</option>
              </select>
            </div>
          </div>

          <div className="col-lg-6 col-md-6 col-12">
            <div className="rbt-form-group">
              <label>Cover Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedImage(e.target.files[0])}
                style={{ lineHeight: "20px", height: "50px" }}
              />
            </div>
          </div>

          <div className="col-12">
            <div className="rbt-form-group">
              <label>Content</label>
              <div className="editor-wrapper">
                <CKEditor
                  editor={ClassicEditor}
                  data={info.content}
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    setInfo((prev) => ({ ...prev, content: data }));
                  }}
                />
              </div>
            </div>
          </div>

          <div className="col-12 mt--20">
            <button
              className="rbt-btn btn-gradient w-100"
              onClick={handlePublish}
              disabled={loading}
            >
              {loading ? "Publishing..." : "Publish AI Blog"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
