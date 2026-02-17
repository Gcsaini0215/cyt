import {
  EducationList,
  ExpList,
  languageSpoken,
  sessionFormatsList,
  stateList,
} from "../../../utils/static-lists";
import React, { useState, useRef, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../../../utils/cropImage";
import { Dialog, DialogContent, DialogTitle, Button, Slider, Typography } from "@mui/material";
import { defaultProfile, imagePath, updateTherapistProfileUrl } from "../../../utils/url";
import ImageTag from "../../../utils/image-tag";
import { postFormData } from "../../../utils/actions";
import FormMessage from "../../global/form-message";
import FormProgressBar from "../../global/form-progressbar";
import useTherapistStore from "../../../store/therapistStore";
import useMediaQuery from "@mui/material/useMediaQuery";
import Select from "react-select";

const SkeletonLoader = () => (
  <div className="skeleton-wrapper w-100">
    <div className="skeleton-progress mb--30"></div>
    <div className="row g-5">
      <div className="col-lg-8">
        <div className="skeleton-banner mb--30"></div>
        <div className="row g-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="col-md-6 mb--15">
              <div className="skeleton-input"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <style jsx>{`
      @keyframes shimmer {
        0% { background-position: -468px 0; }
        100% { background-position: 468px 0; }
      }
      .skeleton-wrapper * {
        background: #f6f7f8;
        background-image: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%);
        background-repeat: no-repeat;
        background-size: 800px 104px;
        display: inline-block;
        position: relative;
        animation: shimmer 1.5s infinite linear forwards;
      }
      .skeleton-progress { height: 40px; width: 100%; border-radius: 8px; }
      .skeleton-banner { height: 160px; width: 100%; border-radius: 12px; }
      .skeleton-input { height: 50px; width: 100%; border-radius: 8px; }
    `}</style>
  </div>
);

export default function Profile() {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const { therapistInfo, setInfo, setSessionFormats } = useTherapistStore();
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  // Cropping State
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  const onCropComplete = useCallback((_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = useCallback(async () => {
    try {
      const croppedImageBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const file = new File([croppedImageBlob], "profile-picture.jpg", { type: "image/jpeg" });
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(croppedImageBlob));
      setIsCropModalOpen(false);
    } catch (e) {
      console.error(e);
      setError("Failed to crop image");
    }
  }, [imageToCrop, croppedAreaPixels]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // 2MB size check
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > 2) {
        setError("File size exceeds 2MB limit. Please select a smaller file.");
        event.target.value = ""; // clear input
        return;
      }

      setError("");
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageToCrop(reader.result);
        setIsCropModalOpen(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current.click();
  };

  const handleLanguageSelect = (selectedOptions) => {
    if (!selectedOptions) {
      setInfo("language_spoken", []);
      return;
    }
    if (selectedOptions.length > 2) {
      selectedOptions = selectedOptions.slice(0, 2);
    }
    const formattedOptions = selectedOptions.map((option) => {
      if (typeof option === "object" && option !== null) {
        return {
          value: option.value.trim(),
          label: option.label.trim(),
        };
      }
      return {
        value: option.trim(),
        label: option.trim(),
      };
    });

    setInfo("language_spoken", formattedOptions);
  };

  const handleSessionFormats = (event) => {
    const { value, checked } = event.target;
    const currentSessionFormats = therapistInfo.session_formats;
    let updatedSessionFormats;
    if (checked) {
      updatedSessionFormats = [...currentSessionFormats, value];
    } else {
      updatedSessionFormats = currentSessionFormats.filter((v) => v !== value);
    }
    setSessionFormats(updatedSessionFormats.join(","));
  };

  const handleEducation = (e) => {
    if (e.target.value === "Other (Please specify)") {
      setInfo("qualification", e.target.value);
      setInfo("othEducation", true);
    } else {
      setInfo("othEducation", false);
      setInfo("qualification", e.target.value);
    }
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (therapistInfo.user.name === "") {
      setError("Name can not be empty");
      return;
    } else if (therapistInfo.user.phone === "") {
      setError("Phone Number can not be empty");
      return;
    } else {
      setError("");
      setLoading(true);
      const formData = new FormData();
      formData.append("name", therapistInfo.user.name);
      formData.append("phone", therapistInfo.user.phone);
      formData.append("qualification", therapistInfo.qualification);
      formData.append("license_number", therapistInfo.license_number);
      formData.append("bio", therapistInfo.user.bio);
      formData.append("state", therapistInfo.state);
      formData.append("gender", therapistInfo.user.gender);
      formData.append("office_address", therapistInfo.office_address);
      formData.append("year_of_exp", therapistInfo.year_of_exp);
      formData.append("file", selectedImage);
      formData.append(
        "language_spoken",
        therapistInfo.language_spoken.map((option) => option.value).join(", ")
      );
      formData.append(
        "session_formats",
        therapistInfo.session_formats.join(", ")
      );
      try {
        setLoading(true);
        const response = await postFormData(
          updateTherapistProfileUrl,
          formData
        );
        if (response.status) {
          setSuccess(response.message);
          setError("");
          setSelectedImage(null);
          if (response.data.profile !== "") {
            setInfo("profile", response.data.profile);
          }
        } else {
          setError("Something went wrong");
        }
      } catch (error) {
        setError(error?.response?.data?.message || "Something went wrong");
      }
      setLoading(false);
    }
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: "#e1deee",
      boxShadow: "none",
      borderRadius: "7px",
      height: "50px",
      minHeight: "50px",
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: "50px",
      padding: "0 6px",
    }),
    input: (provided) => ({
      ...provided,
      margin: "0",
      padding: "0",
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: "50px",
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "#e0e0e0",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "black",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "red",
      ":hover": {
        backgroundColor: "darkred",
        color: "white",
      },
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
  };

  const selectStyle = { lineHeight: "20px", height: "50px" };

  if (!therapistInfo?.user?.email) {
    return <SkeletonLoader />;
  }

  return (
    <div
      className="tab-pane fade active show"
      id="profile"
      role="tabpanel"
      aria-labelledby="profile-tab"
    >
      <div
        className="rbt-dashboard-content-wrapper"
        style={{ marginTop: isMobile ? 20 : 0 }}
      >
        <div
          className="tutor-bg-photo"
          style={{ 
            height: 180, 
            background: "linear-gradient(135deg, #064e3b 0%, #065f46 100%)",
            borderRadius: "15px 15px 0 0",
            position: "relative",
            display: "flex",
            alignItems: "flex-end",
            padding: isMobile ? "0 20px 60px" : "0 30px 30px 180px"
          }}
        >
          <div className="banner-text-content">
            <h4 className="title" style={{ color: "white", marginBottom: "4px", fontWeight: "600" }}>
              {therapistInfo.user.name}
              {therapistInfo.profile_code !== "" && (
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginLeft: "10px", fontWeight: "400" }}>
                  ({therapistInfo.profile_code})
                </span>
              )}
            </h4>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px" }}>
                <i className="feather-mail mr--5"></i>{therapistInfo.user.email}
              </span>
              <span 
                className="badge" 
                style={{ 
                  backgroundColor: "rgba(255,255,255,0.2)", 
                  color: "white",
                  padding: "2px 12px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  fontWeight: "600",
                  backdropFilter: "blur(4px)"
                }}
              >
                {therapistInfo.profile_type}
              </span>
            </div>
          </div>
        </div>
        <div className="rbt-tutor-information" style={{ padding: "0 25px", position: "relative" }}>
          <div className="rbt-tutor-information-left">
            <div className="thumbnail rbt-avatars size-lg position-relative" style={{ marginTop: "-80px" }}>
              {(previewImage || (therapistInfo.user.profile && therapistInfo.user.profile !== "null")) ? (
                <ImageTag
                  alt={therapistInfo.user.name || "Profile"}
                  style={{
                    height: 130,
                    width: 130,
                    borderRadius: "12px",
                    objectFit: "cover",
                    backgroundColor: "#fff",
                    border: "4px solid #fff",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                  }}
                  src={previewImage ?? `${imagePath}/${therapistInfo.user.profile}`}
                />
              ) : (
                <div 
                  style={{
                    height: 130,
                    width: 130,
                    borderRadius: "12px",
                    backgroundColor: "#f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "4px solid #fff",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    color: "#9ca3af"
                  }}
                >
                  <i className="feather-user" style={{ fontSize: "50px" }}></i>
                </div>
              )}
              <div className="rbt-edit-photo-inner" style={{ bottom: "10px", right: "10px" }}>
                <button
                  className="rbt-edit-photo"
                  title="Upload Photo"
                  onClick={handleImageUpload}
                  style={{ 
                    backgroundColor: "#059669",
                    width: "36px",
                    height: "36px",
                    lineHeight: "36px",
                    border: "3px solid #fff",
                    borderRadius: "50%",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
                  }}
                >
                  <i className="feather-camera" style={{ fontSize: "16px", color: "#fff" }}></i>
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rbt-profile-row rbt-default-form row row--15">
        <div className="col-lg-6 col-md-6 col-sm-12 col-12 mb--15">
          <div className="rbt-form-group">
            <label>Language(Select any 2)</label>
            <Select
              isMulti
              value={therapistInfo.language_spoken}
              onChange={handleLanguageSelect}
              options={languageSpoken}
              classNamePrefix="select"
              styles={customStyles}
            />
          </div>
        </div>
        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          <div className="rbt-form-group">
            <label htmlFor="licensenumber">License Number (if any)</label>
            <input
              id="licensenumber"
              type="text"
              value={therapistInfo.license_number}
              onChange={(e) => setInfo("license_number", e.target.value)}
            />
          </div>
        </div>
        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          <div className="rbt-form-group">
            <label htmlFor="fullname">Full Name</label>
            <input
              id="fullname"
              type="text"
              value={therapistInfo.user.name}
              onChange={(e) => setInfo("user.name", e.target.value)}
            />
          </div>
        </div>
        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          <div className="rbt-form-group">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              style={selectStyle}
              value={therapistInfo.user.gender}
              onChange={(e) => setInfo("user.gender", e.target.value)}
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          <div className="rbt-form-group">
            <label htmlFor="phonenumber">Phone Number</label>
            <input
              id="phonenumber"
              type="tel"
              value={therapistInfo.user.phone}
              onChange={(e) => setInfo("user.phone", e.target.value)}
            />
          </div>
        </div>
        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          <div className="rbt-form-group">
            <label htmlFor="state">State</label>
            <select
              id="state"
              style={selectStyle}
              value={therapistInfo.state}
              onChange={(e) => setInfo("state", e.target.value)}
            >
              {stateList.map((item) => (
                <option key={item === "Select" ? "" : item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          <div className="rbt-form-group">
            <label htmlFor="office">Office Address (if Any)</label>
            <input
              id="office"
              type="text"
              value={
                therapistInfo.office_address === "null" ||
                therapistInfo.office_address === null
                  ? ""
                  : therapistInfo.office_address
              }
              onChange={(e) => setInfo("office_address", e.target.value)}
            />
          </div>
        </div>
        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          <div className="rbt-form-group">
            <label htmlFor="experience">Years of Experience</label>
            <select
              id="experience"
              style={selectStyle}
              value={therapistInfo.year_of_exp}
              onChange={(e) => setInfo("year_of_exp", e.target.value)}
            >
              {ExpList.map((item) => (
                <option value={item === "Select" ? "" : item} key={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          <div className="rbt-form-group">
            <label htmlFor="qualification">Highest Qualification</label>
            <select
              id="qualification"
              style={selectStyle}
              value={therapistInfo.qualification}
              onChange={(e) => handleEducation(e)}
            >
              {EducationList.map((item) => (
                <option value={item === "Select" ? "" : item} key={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
        {therapistInfo.othEducation && (
          <div className="col-lg-6 col-md-6 col-sm-6 col-12">
            <div className="rbt-form-group">
              <label htmlFor="Education">Education</label>
              <input
                id="Education"
                type="text"
                value={therapistInfo.qualification}
                onChange={(e) => setInfo("qualification", e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="col-lg-12 col-md-12 col-sm-12 col-12 mt--6 mb--15">
          <div className="rbt-form-group">
            <label>Session Formats</label>
            <div className="row">
              {sessionFormatsList.map((item) => (
                <div className="col-lg-3 col-md-3 col-sm-6 col-12" key={item}>
                  <p className="rbt-checkbox-wrapper mb--5">
                    <input
                      id={`session-checkbox-${item}`}
                      type="checkbox"
                      value={item}
                      checked={therapistInfo.session_formats.includes(item)}
                      onChange={handleSessionFormats}
                    />
                    <label htmlFor={`session-checkbox-${item}`}>{item}</label>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-12">
          <div className="rbt-form-group">
            <label htmlFor="bio">About Me</label>
            <textarea
              id="bio"
              cols="20"
              rows="5"
              value={therapistInfo.user.bio}
              onChange={(e) => setInfo("user.bio", e.target.value)}
            ></textarea>
          </div>
        </div>
      </div>

      <FormMessage error={error} success={success} />
      
      <div className="col-12 mt--20">
        <div className="rbt-form-group d-none">
          <button className="rbt-btn btn-gradient submit-btn" onClick={handleSubmit}>
            Update Profile
          </button>
        </div>
        {loading && <FormProgressBar />}
      </div>

      <Dialog open={isCropModalOpen} onClose={() => setIsCropModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crop Profile Picture</DialogTitle>
        <DialogContent>
          <div style={{ position: 'relative', width: '100%', height: 400, background: '#333' }}>
            <Cropper
              image={imageToCrop}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <div style={{ padding: '20px 0' }}>
            <Typography gutterBottom>Zoom</Typography>
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e, zoom) => setZoom(zoom)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button onClick={() => setIsCropModalOpen(false)}>Cancel</Button>
            <Button variant="contained" color="primary" onClick={showCroppedImage}>
              Crop & Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
