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
import { Dialog, DialogContent, DialogTitle, Button, Slider, Typography, Box, Grid, Paper } from "@mui/material";
import { defaultProfile, imagePath, updateTherapistProfileUrl } from "../../../utils/url";
import ImageTag from "../../../utils/image-tag";
import { postFormData } from "../../../utils/actions";
import FormMessage from "../../global/form-message";
import FormProgressBar from "../../global/form-progressbar";
import useTherapistStore from "../../../store/therapistStore";
import { useMediaQueryClient } from "../../../hooks/useMediaQueryClient";
import Select from "react-select";
import MicIcon from '@mui/icons-material/Mic';
import VideocamIcon from '@mui/icons-material/Videocam';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

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
    <style>{`
      @keyframes shimmer {
        0% { background-position: -468px 0; }
        100% { background-position: 468px 0; }
      }
      .skeleton-wrapper *:not(style) {
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
  const isMobile = useMediaQueryClient("sm");
  const { therapistInfo, setInfo, setSessionFormats } = useTherapistStore();
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

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
    setFieldErrors({});
    
    const errors = {};
    if (therapistInfo.user.name === "") {
      errors.name = "Name can not be empty";
    }
    if (therapistInfo.user.phone === "") {
      errors.phone = "Phone Number can not be empty";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
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
        style={{ marginTop: isMobile ? 16 : 0 }}
      >
        <div
          style={{
            background: "#fbfaf7",
            border: "1px solid #ecefec",
            borderLeft: "3px solid #c9962c",
            borderRadius: 6,
            position: "relative",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: "center",
            textAlign: isMobile ? "center" : "left",
            gap: isMobile ? 14 : 18,
            padding: isMobile ? "20px 16px" : "16px 22px",
            marginBottom: 22,
          }}
        >
            <div className="position-relative" style={{ flexShrink: 0 }}>
              {(previewImage || (therapistInfo.user.profile && therapistInfo.user.profile !== "null")) ? (
                <ImageTag
                  alt={therapistInfo.user.name || "Profile"}
                  style={{
                    height: isMobile ? 84 : 76,
                    width: isMobile ? 84 : 76,
                    borderRadius: 6,
                    objectFit: "cover",
                    backgroundColor: "#fff",
                    border: "1px solid #e3e8e4",
                  }}
                  src={previewImage ?? `${imagePath}/${therapistInfo.user.profile}`}
                />
              ) : (
                <div
                  style={{
                    height: isMobile ? 84 : 76,
                    width: isMobile ? 84 : 76,
                    borderRadius: 6,
                    backgroundColor: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #e3e8e4",
                    color: "#8a978f",
                  }}
                >
                  <i className="feather-user" style={{ fontSize: 30 }}></i>
                </div>
              )}
              <button
                title="Upload Photo"
                onClick={handleImageUpload}
                style={{
                  position: "absolute", bottom: -6, right: -6,
                  backgroundColor: "#0f3d24",
                  width: 26, height: 26, lineHeight: "26px",
                  border: "2px solid #fbfaf7",
                  borderRadius: "50%",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                <i className="feather-camera" style={{ fontSize: 12 }}></i>
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: isMobile ? "center" : "flex-start", gap: 4 }}>
              <h5 style={{
                margin: 0,
                fontSize: isMobile ? 18 : 19,
                color: "#122019",
                fontWeight: 800,
                fontFamily: "Georgia, 'Times New Roman', serif",
              }}>
                {therapistInfo.user.name}
              </h5>
              <span style={{ color: "#5b6b62", fontSize: 12.5, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                <i className="feather-mail"></i>{therapistInfo.user.email}
              </span>
              {therapistInfo.profile_type && (
                <span style={{
                  color: "#0f3d24", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.6px", marginTop: 2,
                }}>
                  {therapistInfo.profile_type}
                </span>
              )}
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
              onChange={(e) => {
                setInfo("user.name", e.target.value);
                if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: "" }));
              }}
            />
            {fieldErrors.name && <span className="text-danger" style={{ fontSize: "12px", marginTop: "5px", display: "block" }}>{fieldErrors.name}</span>}
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
              onChange={(e) => {
                setInfo("user.phone", e.target.value);
                if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: "" }));
              }}
            />
            {fieldErrors.phone && <span className="text-danger" style={{ fontSize: "12px", marginTop: "5px", display: "block" }}>{fieldErrors.phone}</span>}
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

        <div className="col-lg-12 col-md-12 col-sm-12 col-12 mt--6 mb--30">
          <div className="rbt-form-group">
            <label style={{ marginBottom: 10, fontWeight: 700, fontSize: 11, color: '#5b6b62', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Session Formats</label>
            <Grid container spacing={1.5}>
              {sessionFormatsList.map((item) => {
                const isSelected = therapistInfo.session_formats.includes(item);
                const theme = { main: '#0f3d24', light: '#f0fdf4' };
                const getIcon = () => {
                  const n = item.toLowerCase();
                  if (n.includes('audio')) return <MicIcon sx={{ fontSize: 22, color: isSelected ? '#fff' : theme.main }} />;
                  if (n.includes('video')) return <VideocamIcon sx={{ fontSize: 22, color: isSelected ? '#fff' : theme.main }} />;
                  if (n.includes('person') || n.includes('offline')) return <PersonIcon sx={{ fontSize: 22, color: isSelected ? '#fff' : theme.main }} />;
                  return null;
                };

                return (
                  <Grid item xs={6} md={4} key={item}>
                    <Paper
                      onClick={() => {
                        const event = { target: { value: item, checked: !isSelected } };
                        handleSessionFormats(event);
                      }}
                      elevation={0}
                      sx={{
                        p: 1.75,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        border: '1.5px solid',
                        borderColor: isSelected ? theme.main : '#dbe3df',
                        background: isSelected ? theme.light : '#fff',
                        transition: 'all 0.2s',
                        position: 'relative',
                        minHeight: '88px',
                        '&:hover': {
                          borderColor: theme.main,
                          background: theme.light,
                        }
                      }}
                    >
                      {isSelected && (
                        <CheckCircleIcon
                          sx={{
                            position: 'absolute',
                            top: 7,
                            right: 7,
                            fontSize: 15,
                            color: '#c9962c'
                          }}
                        />
                      )}
                      <Box sx={{
                        mb: 0.75,
                        width: 32,
                        height: 32,
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isSelected ? '#fff' : theme.light,
                      }}>
                        {React.cloneElement(getIcon(), {
                          sx: { ...getIcon().props.sx, fontSize: 18, color: theme.main }
                        })}
                      </Box>
                      <Typography sx={{
                        fontWeight: 700,
                        fontSize: '12.5px',
                        color: isSelected ? theme.main : '#475569',
                        textAlign: 'center'
                      }}>
                        {item}
                      </Typography>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </div>
        </div>
        <div className="col-12">
          <div className="rbt-form-group">
            <label htmlFor="bio">About Me</label>
            <textarea
              id="bio"
              cols="20"
              rows={isMobile ? 5 : 9}
              value={therapistInfo.user.bio}
              onChange={(e) => setInfo("user.bio", e.target.value)}
              style={{ resize: "vertical", overflowY: "auto" }}
            ></textarea>
          </div>
        </div>
      </div>

      <FormMessage error={error} success={success} />

      <div className="col-12 mt--20 mb--20">
        {loading && <FormProgressBar />}
        <button
          className="rbt-btn btn-gradient submit-btn"
          onClick={handleSubmit}
          style={{
            width: isMobile ? "100%" : "auto",
            padding: "0 40px",
            height: "50px",
            fontSize: "16px",
            fontWeight: "600"
          }}
        >
          Update Profile
        </button>
      </div>

      <Dialog 
        open={isCropModalOpen} 
        onClose={() => setIsCropModalOpen(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>Crop Profile Picture</DialogTitle>
        <DialogContent>
          <div style={{ position: 'relative', width: '100%', height: isMobile ? '60vh' : 400, background: '#333' }}>
            <Cropper
              image={imageToCrop}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              touchAction="none"
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
