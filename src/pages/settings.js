import MainLayout from "../components/therapists/main-layout";
import Profile from "../components/therapists/settings/profile";
import Availability from "../components/therapists/settings/availability";
import PaymentDetails from "../components/therapists/settings/payment-details";
import React, { useMemo, useState } from "react";
import TherapistFees from "../components/therapists/settings/therapist-fees";
import ServicesAndExperties from "../components/therapists/settings/services-and-experties";
import useTherapistStore from "../store/therapistStore";
import { redColor } from "../utils/colors";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ImageTag from "../utils/image-tag";
import { defaultProfile, imagePath } from "../utils/url";
import { Link } from "react-router-dom";

export default function ProfileSettings() {
  const { therapistInfo, fetchTherapistInfo, profileSet, paymentStore } = useTherapistStore();
  const [tab, setTab] = React.useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);

  const style = {
    cursor: "pointer",
  };

  const isEmpty = React.useCallback(() => {
    return !therapistInfo?.user?.email;
  }, [therapistInfo]);

  React.useEffect(() => {
    if (isEmpty()) {
      fetchTherapistInfo();
    }
  }, [fetchTherapistInfo, isEmpty]);

  const completionPercentage = useMemo(() => {
    if (!therapistInfo?.user?.email) return 0;
    const fields = [
      therapistInfo.user.name,
      therapistInfo.user.phone,
      therapistInfo.user.gender,
      therapistInfo.qualification,
      therapistInfo.state,
      therapistInfo.year_of_exp,
      therapistInfo.user.bio,
      therapistInfo.language_spoken.length > 0,
      therapistInfo.session_formats.length > 0,
      therapistInfo.availabilities.length > 0,
      therapistInfo.fees.length > 0,
      paymentStore.ac_name || paymentStore.upi,
    ];
    const completedFields = fields.filter((field) => 
      typeof field === 'boolean' ? field : (field && field !== "" && field !== "Select")
    ).length;
    return Math.round((completedFields / fields.length) * 100);
  }, [therapistInfo, paymentStore]);

  const handleGlobalUpdate = () => {
    const saveButton = document.querySelector(".tab-content .submit-btn");
    if (saveButton) {
      saveButton.click();
    }
  };

  return (
    <MainLayout>
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box mb--100">
        <div className="content">
          <div className="section-title d-flex justify-content-between align-items-center">
            <h4 className="rbt-title-style-3 mb--0">
              Settings{" "}
              {!profileSet && (
                <span style={{ fontSize: 13, color: redColor }}>
                  (Incomplete)
                </span>
              )}
            </h4>
            <button 
              className="rbt-btn btn-border btn-sm" 
              onClick={() => setPreviewOpen(true)}
            >
              <i className="feather-eye mr--5"></i> Preview Profile
            </button>
          </div>

          <div className="advance-tab-button mb--30">
            <ul
              className="nav nav-tabs tab-button-style-2 justify-content-start"
              id="settinsTab-4"
            >
              <li>
                <a
                  className={tab === 0 ? "tab-button active" : "tab-button"}
                  onClick={() => setTab(0)}
                  style={style}
                >
                  <span className="title">Profile</span>
                </a>
              </li>
              <li>
                <a
                  className={tab === 2 ? "tab-button active" : "tab-button"}
                  onClick={() => setTab(2)}
                  style={style}
                >
                  <span className="title">Offerings</span>
                </a>
              </li>
              <li>
                <a
                  className={tab === 3 ? "tab-button active" : "tab-button"}
                  onClick={() => setTab(3)}
                  style={style}
                >
                  <span className="title">Availability</span>
                </a>
              </li>
              <li>
                <a
                  className={tab === 4 ? "tab-button active" : "tab-button"}
                  onClick={() => setTab(4)}
                  style={style}
                >
                  <span className="title">Fees</span>
                </a>
              </li>
              <li>
                <a
                  className={tab === 5 ? "tab-button active" : "tab-button"}
                  onClick={() => setTab(5)}
                  style={style}
                >
                  <span className="title">Payments</span>
                </a>
              </li>
            </ul>
          </div>
          <div className="tab-content" style={{ minHeight: "400px" }}>
            {tab === 0 && <Profile />}
            {tab === 2 && <ServicesAndExperties />}
            {tab === 3 && <Availability />}
            {tab === 4 && <TherapistFees />}
            {tab === 5 && <PaymentDetails />}
          </div>
        </div>
      </div>

      <div className="settings-sticky-bar-container">
        <div className="settings-sticky-bar rbt-shadow-box">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-none d-lg-block">
              <p className="mb--0" style={{ fontSize: "14px" }}>
                <i className="feather-info text-primary mr--5"></i>
                Changes are only saved when you click the update button.
              </p>
            </div>
            <div className="action-buttons d-flex gap-3">
              <button 
                className="rbt-btn btn-gradient btn-sm" 
                onClick={handleGlobalUpdate}
              >
                Update {tab === 0 ? "Profile" : tab === 2 ? "Offerings" : tab === 3 ? "Availability" : tab === 4 ? "Fees" : "Payments"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Dialog 
        open={previewOpen} 
        onClose={() => setPreviewOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          style: { borderRadius: '15px', overflow: 'hidden' }
        }}
      >
        <DialogTitle className="d-flex justify-content-between align-items-center border-bottom">
          <span>Profile Preview</span>
          <IconButton onClick={() => setPreviewOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className="p--0">
          <div className="rbt-card variation-01 border-0">
            <div className="rbt-card-img" style={{ maxHeight: "250px", overflow: "hidden" }}>
              <ImageTag
                alt="Card"
                style={{ width: "100%", height: "auto" }}
                src={`${imagePath}/${therapistInfo.user.profile}` || defaultProfile}
              />
            </div>
            <div className="rbt-card-body p--30">
              <h4 className="rbt-card-title" style={{ fontSize: "20px", marginBottom: "15px" }}>
                {therapistInfo.user.name || "Your Name"}
              </h4>
              <ul className="rbt-meta mb--20" style={{ flexDirection: "column", gap: "8px" }}>
                <li style={{ fontSize: 15 }}>
                  <i className="feather-message-circle"></i>
                  {therapistInfo.language_spoken.length > 0 
                    ? therapistInfo.language_spoken.map(o => o.label).join(", ") 
                    : "Language"}
                </li>
                <li style={{ fontSize: 15 }}>
                  <i className="feather-award"></i>
                  {therapistInfo.year_of_exp || "0"} Year Experience
                </li>
              </ul>
              <div className="d-flex align-items-start gap-2 mb--15">
                <i className="feather-user text-primary" style={{ marginTop: "4px" }}></i>
                <span style={{ fontSize: 15 }}>{therapistInfo.qualification || "Qualification"}</span>
              </div>
              <div className="d-flex align-items-start gap-2 mb--30">
                <i className="feather-heart text-danger" style={{ marginTop: "4px" }}></i>
                <span style={{ fontSize: 14 }}>
                  {therapistInfo.session_formats.length > 0 
                    ? therapistInfo.session_formats.join(", ") 
                    : "Session Formats Not Set"}
                </span>
              </div>
              <Link className="rbt-btn btn-gradient w-100 text-center" to="#" onClick={(e) => e.preventDefault()}>
                Book Appointment
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        .settings-sticky-bar-container {
          position: fixed;
          bottom: 20px;
          right: 0;
          left: 25%;
          display: flex;
          justify-content: flex-end;
          padding: 0 4%;
          z-index: 99;
          pointer-events: none;
        }
        .settings-sticky-bar {
          pointer-events: auto;
          width: 100%;
          max-width: 800px;
          background: white;
          padding: 12px 25px;
          border-radius: 12px;
          border: 1px solid #eee;
          box-shadow: 0 10px 40px rgba(0,0,0,0.12) !important;
        }
        .tab-button-style-2 {
          border-bottom: 1px solid #e1e1e1;
          gap: 20px;
        }
        .tab-button-style-2 li a.tab-button {
          padding: 15px 5px;
          margin-right: 0;
          background: transparent !important;
          color: #6b7385 !important;
          font-weight: 600;
          font-size: 16px;
          transition: all 0.3s ease;
          position: relative;
          border: none !important;
          border-radius: 0 !important;
        }
        .tab-button-style-2 li a.tab-button:hover {
          color: #2ecc71 !important;
        }
        .tab-button-style-2 li a.tab-button.active {
          color: #2ecc71 !important;
        }
        .tab-button-style-2 li a.tab-button.active::after {
          content: "";
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 3px;
          background: #2ecc71;
          border-radius: 3px;
        }
        @media (max-width: 991px) {
          .settings-sticky-bar-container {
            left: 0;
            padding: 0 20px;
            justify-content: center;
          }
        }
      `}</style>
    </MainLayout>
  );
}
