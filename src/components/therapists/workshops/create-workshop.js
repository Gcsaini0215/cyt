import {
  allTimes,
  eventDuration,
  languageSpoken,
  WorkshopCategory,
} from "../../../utils/static-lists";
import React, { useState, useRef, useEffect } from "react";
import { postFormData } from "../../../utils/actions";
import FormMessage from "../../global/form-message";
import FormProgressBar from "../../global/form-progressbar";
import { createWorkshopUrl } from "../../../utils/url";
import { useRouter } from "next/router";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

export default function CreateWorkshop() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const filePdfRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [pdf, setPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [minDate, setMinDate] = useState("");
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
    ],
  };
  const [info, setInfo] = useState({
    title: "",
    short_desc: "",
    level: "",
    language: "",
    event_date: "",
    event_end_date: "",
    mrp: "",
    price: "",
    desc: "",
    category: "",
    event_duration: "",
    event_time: "",
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

  const handlePdfUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPdf(file);
    }
  };

  const handleTitle = (event) => {
    const inputText = event.target.value;
    const words = inputText.trim().split(/\s+/);

    if (words.length <= 20) {
      setInfo((prevInfo) => ({
        ...prevInfo,
        ["title"]: inputText,
      }));
    }
  };

  const handleShortDesc = (event) => {
    const inputText = event.target.value;
    const words = inputText.trim().split(/\s+/);

    if (words.length <= 50) {
      setInfo((prevInfo) => ({
        ...prevInfo,
        ["short_desc"]: inputText,
      }));
    }
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (info.title === "") {
      setError("Please enter title.");
      return;
    } else if (info.short_desc.length < 10) {
      setError("Please enter short descrtiption.");
      return;
    } else if (info.mrp === "") {
      setError("Please enter MRP.");
      return;
    } else if (info.price === "") {
      setError("Please enter price.");
      return;
    } else if (info.desc.length < 20) {
      setError("Please enter description.");
      return;
    } else if (info.level === "") {
      setError("Please select level.");
      return;
    } else if (info.language === "") {
      setError("Please select language.");
      return;
    } else if (info.event_date === "") {
      setError("Please select event date.");
      return;
    }
    else if (info.event_end_date === "") {
      setError("Please select event end date.");
      return;
    } else if (selectedImage === null) {
      setError("Please select image.");
      return;
    } else if (pdf === null) {
      setError("Please select content pdf.");
      return;
    } else if (info.category === "") {
      setError("Please select category.");
      return;
    } else if (info.event_time === "") {
      setError("Please enter event time.");
      return;
    } else if (info.duration === "") {
      setError("Please enter duration.");
      return;
    } else {
      setError("");
      setLoading(true);
      const formData = new FormData();
      formData.append("image", selectedImage);
      formData.append("pdf", pdf);
      formData.append("title", info.title);
      formData.append("short_desc", info.short_desc);
      formData.append("level", info.level);
      formData.append("language", info.language);
      formData.append("event_date", info.event_date);
      formData.append("event_end_date", info.event_end_date);
      formData.append("event_time", info.event_time);
      formData.append("duration", info.event_duration);
      formData.append("mrp", info.mrp);
      formData.append("price", info.price);
      formData.append("category", info.category);
      formData.append("desc", info.desc);

      try {
        const response = await postFormData(createWorkshopUrl, formData);
        if (response.status) {
          setSuccess(response.message);
          setError("");
          router.push("/workshops");
        } else {
          setError("Something went wrong");
        }
      } catch (error) {
        setError(error.response.data.message);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setMinDate(today);
  }, []);
  console.log("category", info);
  const selectStyle = { lineHeight: "20px", height: "50px" };
  return (
    <div
      className="tab-pane fade active show"
      id="profile"
      role="tabpanel"
      aria-labelledby="profile-tab"
    >
      <div className="rbt-profile-row rbt-default-form row row--15">
        <div className="col-12">
          <div className="rbt-form-group">
            <label htmlFor="title">Title(Maximum 20 words)</label>
            <input
              id="title"
              type="text"
              name="title"
              value={info.title}
              onChange={handleTitle}
            />
          </div>
        </div>
        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          <div className="rbt-form-group">
            <label htmlFor="gender">Select Level</label>
            <select
              id="gender"
              style={selectStyle}
              value={info.level}
              name="level"
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="Basic">Basic Level</option>
              <option value="Medium">Medium Level</option>
              <option value="High">High Level</option>
            </select>
          </div>
        </div>
        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          <div className="rbt-form-group">
            <label htmlFor="category">Select Category</label>
            <select
              id="category"
              style={selectStyle}
              value={info.category}
              name="category"
              onChange={handleChange}
            >
              <option value={""}>Select Category</option>
              {WorkshopCategory.map((item) => {
                return (
                  <option value={item} key={item}>
                    {item}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
        <div className="col-12 mt--15">
          <div className="rbt-form-group">
            <label htmlFor="desc">Short Description</label>
            <textarea
              id="desc"
              cols="20"
              rows="2"
              value={info.short_desc}
              onChange={handleShortDesc}
              style={{ resize: "none" }}
            ></textarea>
          </div>
        </div>

        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          <div className="rbt-form-group">
            <label htmlFor="language">Select Language</label>
            <select
              id="language"
              style={selectStyle}
              value={info.language}
              name="language"
              onChange={handleChange}
            >
              <option value="">Select</option>
              {languageSpoken.map((item) => {
                return (
                  <option value={item.value} key={item.value}>
                    {item.value}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          <div className="rbt-form-group">
            <label htmlFor="event-date">Event Start Date</label>
            <input
              id="event-date"
              type="date"
              name="event_date"
              value={info.event_date}
              min={minDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          <div className="rbt-form-group">
            <label htmlFor="event-date">Event End Date</label>
            <input
              id="event-end-date"
              type="date"
              name="event_end_date"
              value={info.event_end_date}
              min={minDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          <div className="rbt-form-group">
            <label htmlFor="event-time">Start Time</label>
            <select
              style={selectStyle}
              value={info.event_time}
              name="event_time"
              onChange={handleChange}
            >
              <option value="">Select Time &nbsp;&nbsp;</option>
              {allTimes.map((timeOption) => (
                <option key={timeOption} value={timeOption}>
                  {timeOption}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          <div className="rbt-form-group">
            <label htmlFor="event_duration">Duration</label>
            <select
              id="event_duration"
              style={selectStyle}
              value={info.event_duration}
              name="event_duration"
              onChange={handleChange}
            >
              <option value="">Select</option>
              {eventDuration.map((item) => {
                return (
                  <option value={item} key={item}>
                    {item}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
        <div className="col-lg-6 col-md-6 col-sm-6 col-12 mt--15">
          <div className="rbt-form-group">
            <label htmlFor="mrp">Set MRP</label>
            <input
              id="mrp"
              type="tel"
              value={info.mrp}
              name="mrp"
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="col-lg-6 col-md-6 col-sm-6 col-12 mt--15">
          <div className="rbt-form-group">
            <label htmlFor="price">Discounted Price</label>
            <input
              id="price"
              type="tel"
              value={info.price}
              name="price"
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          <div className="rbt-form-group">
            <label htmlFor="content-pdf">Upload Broucher (only PDF)</label>
            <input
              id="content-pdf"
              type="file"
              style={selectStyle}
              ref={filePdfRef}
              accept="application/pdf"
              onChange={handlePdfUpload}
            />
          </div>
        </div>

        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          <div className="rbt-form-group">
            <label htmlFor="workshop-image">Upload Cover Image (800 x 620 PX)</label>
            <input
              id="workshop-image"
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
            <label htmlFor="desc">Overview</label>
            <CKEditor
              editor={ClassicEditor}
              data={info.desc}
              config={editorConfiguration}
              onChange={(event, editor) => {
                const data = editor.getData();
                setInfo({
                  ...info,
                  desc: data,
                });
              }}
            />
          </div>
        </div>

        <div className="mt--20">
          <FormMessage error={error} success={success} />
        </div>
        <div className="col-12 mt--20">
          <div className="rbt-form-group">
            {loading ? (
              <FormProgressBar />
            ) : (
              <button className="rbt-btn btn-gradient" onClick={handleSubmit}>
                Save
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
