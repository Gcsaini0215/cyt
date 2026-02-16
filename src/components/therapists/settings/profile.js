import {
  EducationList,
  ExpList,
  languageSpoken,
  sessionFormatsList,
  stateList,
} from "../../../utils/static-lists";
import React, { useState, useRef } from "react";
import { defaultProfile, imagePath, updateTherapistProfileUrl } from "../../../utils/url";
import ImageTag from "../../../utils/image-tag";
import { postFormData } from "../../../utils/actions";
import FormMessage from "../../global/form-message";
import FormProgressBar from "../../global/form-progressbar";
import useTherapistStore from "../../../store/therapistStore";
import useMediaQuery from "@mui/material/useMediaQuery";
import Select from "react-select";
export default function Profile() {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const { therapistInfo, setInfo, setSessionFormats } = useTherapistStore();
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleLanguageSelect = (selectedOptions) => {
    if (!selectedOptions) {
      setInfo("language_spoken", []);
      return;
    }
    if (selectedOptions.length > 2) {
      selectedOptions = selectedOptions.slice(0, 2);
    }
    const formattedOptions = selectedOptions.map((option) => {
      // Check if the option is an object with value and label properties
      if (typeof option === "object" && option !== null) {
        return {
          value: option.value.trim(),
          label: option.label.trim(),
        };
      }
      // If the option is a string
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
        setError(error.response.data.message);
      }
      setLoading(false);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current.click();
  };

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: "#e1deee",
      boxShadow: "none",
      borderRadius: "7px", // Add border radius
      height: "50px", // Set height
      minHeight: "50px", // Ensure the minimum height is also 50px
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: "50px", // Set the height of the value container
      padding: "0 6px",
    }),
    input: (provided) => ({
      ...provided,
      margin: "0", // Remove any margins
      padding: "0", // Remove any paddings
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: "50px", // Set the height of the indicators container
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
      zIndex: 9999, // Ensure dropdown menu is on top
    }),
  };

  const selectStyle = { lineHeight: "20px", height: "50px" };
  return (
    <div
      className="tab-pane fade active show"
      id="profile"
      role="tabpanel"
      aria-labelledby="profile-tab"
    >
      <div
        className="rbt-dashboard-content-wrapper"
        style={{ marginTop: isMobile ? 60 : 0 }}
      >
        <div
          className="tutor-bg-photo bg_image bg_image_dash"
          style={{ height: 200 }}
        ></div>
        <div className="rbt-tutor-information">
          <div className="rbt-tutor-information-left">
            <div className="thumbnail rbt-avatars size-lg position-relative">
              <ImageTag
                alt={therapistInfo.user.name || "Default Name"}
                style={{
                  height: 120,
                  width: 120,
                  borderRadius: "50%",
                  objectFit: "cover", // Ensures the image scales properly
                  backgroundColor: "#ccc",
                }}
                src={previewImage ?? `${imagePath}/${therapistInfo.user.profile}` ?? defaultProfile}
              />
              <div className="rbt-edit-photo-inner">
                <button
                  className="rbt-edit-photo"
                  title="Upload Photo"
                  onClick={handleImageUpload}
                >
                  <i className="feather-camera"></i>
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
            <div className="tutor-content">
              <h5 className="title">
                {therapistInfo.user.name} &nbsp;
                {therapistInfo.profile_code !== "" ? (
                  <span style={{ fontSize: 15 }}>
                    ({therapistInfo.profile_code})
                  </span>
                ) : (
                  <span></span>
                )}
              </h5>
              <div className="rbt-review">
                <h6 className="title">{therapistInfo.user.email}</h6>
              </div>
              <div className="rbt-review">
                <h6 className="title">{therapistInfo.profile_type}</h6>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="rbt-profile-row rbt-default-form row row--15">
        <div className="col-lg-6 col-md-6 col-sm-12 col-12  mb--15">
          <div className="rbt-form-group">
            <label htmlFor="Language Spoken(Select any 2)">
              Language(Select any 2)
            </label>
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
              {stateList.map((item) => {
                return (
                  <option key={item === "Select" ? "" : item} value={item}>
                    {item}
                  </option>
                );
              })}
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
              {ExpList.map((item) => {
                return (
                  <option value={item === "Select" ? "" : item} key={item}>
                    {item}
                  </option>
                );
              })}
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
              {EducationList.map((item) => {
                return (
                  <option value={item === "Select" ? "" : item} key={item}>
                    {item}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
        {therapistInfo.othEducation && (
          <div className="col-lg-6 col-md-6 col-sm-6 col-12">
            <div className="rbt-form-group">
              <label htmlFor="licensenumber">Education</label>
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
            <label htmlFor="session">Session Formats</label>
            <div className="row">
              {sessionFormatsList.map((item) => {
                return (
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
                );
              })}
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
        <FormMessage error={error} success={success} />
        <div className="col-12 mt--20">
          <div className="rbt-form-group">
            {loading ? (
              <FormProgressBar />
            ) : (
              <button className="rbt-btn btn-gradient" onClick={handleSubmit}>
                Update
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
