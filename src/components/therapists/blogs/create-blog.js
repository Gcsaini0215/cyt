import React, { useState, useRef, useEffect } from "react";
import { postFormData } from "../../../utils/actions";
import FormMessage from "../../global/form-message";
import { createBlogUrl } from "../../../utils/url";
import { useRouter } from "next/router";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";


export default function CreateBlog() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const editorConfiguration = {
    toolbar: [
      "heading",
      "|",
      "bold",
      "italic",
      "link",
      "bulletedList",
      "numberedList",
      "blockQuote",
      "insertTable",
      "undo",
      "redo",
    ],
  };

  const [info, setInfo] = useState({
    title: "",
    short_desc: "",
    category: "",
    content: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (info.title === "") {
      setError("Please enter title.");
      return;
    } else if (info.category === "") {
      setError("Please select category.");
      return;
    } else if (info.short_desc === "") {
      setError("Please enter short description.");
      return;
    } else if (info.content.length < 50) {
      setError("Please enter detailed content (at least 50 characters).");
      return;
    } else if (selectedImage === null) {
      setError("Please select a cover image.");
      return;
    } else {
      setLoading(true);
      const formData = new FormData();
      formData.append("image", selectedImage);
      formData.append("title", info.title);
      formData.append("category", info.category);
      formData.append("short_desc", info.short_desc);
      formData.append("content", info.content);

      try {
        const response = await postFormData(createBlogUrl, formData);
        if (response.status) {
          setSuccess(response.message || "Blog created successfully!");
          setTimeout(() => {
            router.push("/therapist-dashboard");
          }, 2000);
        } else {
          setError(response.message || "Something went wrong");
        }
      } catch (error) {
        setError(error.response?.data?.message || "An error occurred");
      }
      setLoading(false);
    }
  };

  const selectStyle = { lineHeight: "20px", height: "50px" };

  return (
    <div className="rbt-profile-row rbt-default-form row row--15">
      <div className="col-12">
        <FormMessage error={error} success={success} />
      </div>
      
      <div className="col-12">
        <div className="rbt-form-group">
          <label htmlFor="title">Blog Title</label>
          <input
            id="title"
            type="text"
            name="title"
            value={info.title}
            onChange={handleChange}
            placeholder="Enter blog title"
          />
        </div>
      </div>

      <div className="col-lg-6 col-md-6 col-12">
        <div className="rbt-form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            style={selectStyle}
            value={info.category}
            name="category"
            onChange={handleChange}
          >
            <option value="">Select Category</option>
            <option value="Mental Health">Mental Health</option>
            <option value="Relationships">Relationships</option>
            <option value="Self Care">Self Care</option>
            <option value="Therapy">Therapy</option>
            <option value="Anxiety">Anxiety</option>
            <option value="Depression">Depression</option>
          </select>
        </div>
      </div>

      <div className="col-lg-6 col-md-6 col-12">
        <div className="rbt-form-group">
          <label htmlFor="blog-image">Cover Image (800 x 600 px)</label>
          <input
            id="blog-image"
            type="file"
            style={selectStyle}
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
        </div>
      </div>

      <div className="col-12">
        <div className="rbt-form-group">
          <label htmlFor="short_desc">Short Description</label>
          <textarea
            id="short_desc"
            name="short_desc"
            rows="2"
            value={info.short_desc}
            onChange={handleChange}
            placeholder="A brief summary of your blog"
            style={{ resize: "none" }}
          ></textarea>
        </div>
      </div>

      <div className="col-12">
        <div className="rbt-form-group">
          <label>Detailed Content</label>
          <div className="editor-wrapper" style={{ minHeight: "300px", border: "1px solid #ddd", borderRadius: "5px" }}>
            <CKEditor
              editor={ClassicEditor}
              config={editorConfiguration}
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
          className="rbt-btn btn-gradient hover-icon-reverse w-100"
          onClick={handleSubmit}
          disabled={loading}
        >
          <span className="icon-reverse-wrapper">
            <span className="btn-text">
              {loading ? "Publishing..." : "Publish Blog"}
            </span>
            <span className="btn-icon">
              <i className="feather-arrow-right"></i>
            </span>
            <span className="btn-icon">
              <i className="feather-arrow-right"></i>
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}
