import MainLayout from "../components/therapists/main-layout";
import Profile from "../components/therapists/settings/profile";
import Availability from "../components/therapists/settings/availability";
import PaymentDetails from "../components/therapists/settings/payment-details";
import React, { useState } from "react";
import TherapistFees from "../components/therapists/settings/therapist-fees";
import ServicesAndExperties from "../components/therapists/settings/services-and-experties";
import useTherapistStore from "../store/therapistStore";
import { useMediaQueryClient } from "../hooks/useMediaQueryClient";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ImageTag from "../utils/image-tag";
import { defaultProfile, imagePath } from "../utils/url";
import Link from "next/link";

export default function ProfileSettings() {
  const isMobile = useMediaQueryClient("sm");
  const { therapistInfo, fetchTherapistInfo, profileSet } = useTherapistStore();
  const [tab, setTab] = React.useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);

  const isEmpty = React.useCallback(() => {
    return !therapistInfo?.user?.email;
  }, [therapistInfo]);

  React.useEffect(() => {
    if (isEmpty()) {
      fetchTherapistInfo();
    }
  }, [fetchTherapistInfo, isEmpty]);

  const TABS = [
    { id: 0, label: "Profile" },
    { id: 2, label: "Offerings" },
    { id: 3, label: "Availability" },
    { id: 4, label: "Fees" },
    { id: 5, label: "Payments" },
  ];

  return (
    <MainLayout>
      <div className="stg-shell">
        <style suppressHydrationWarning>{`
          .stg-shell { background: #fff; border-radius: 6px; border-top: 3px solid #c9962c;
            box-shadow: 0 4px 20px rgba(15,61,36,0.08); overflow: hidden; margin-bottom: 32px; }
          .stg-head { padding: 22px 26px; display: flex; align-items: flex-start; justify-content: space-between;
            gap: 16px; border-bottom: 1px solid #ecefec; }
          .stg-title { font-family: Georgia, "Times New Roman", serif; font-weight: 700; font-size: 22px;
            color: #122019; margin: 0 0 4px; letter-spacing: -0.2px; }
          .stg-sub { font-size: 12.5px; color: #8a978f; margin: 0; }
          .stg-badge { font-size: 10.5px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;
            padding: 3px 9px; border-radius: 20px; display: inline-flex; align-items: center; gap: 5px; margin-left: 10px;
            vertical-align: middle; }
          .stg-badge.incomplete { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
          .stg-badge.complete { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
          .stg-preview-btn { display: inline-flex; align-items: center; gap: 7px; height: 38px; padding: 0 16px;
            border-radius: 4px; border: 1.5px solid #0f3d24; background: #fff; color: #0f3d24;
            font-size: 12.5px; font-weight: 700; cursor: pointer; transition: all 0.2s; flex-shrink: 0; }
          .stg-preview-btn:hover { background: #0f3d24; color: #fff; }
          .stg-preview-icon { width: 38px; height: 38px; border-radius: 4px; border: 1.5px solid #0f3d24;
            background: #fff; color: #0f3d24; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

          .stg-tabbar { display: flex; overflow-x: auto; padding: 0 26px; gap: 26px; border-bottom: 1px solid #ecefec;
            -ms-overflow-style: none; scrollbar-width: none; background: #fbfaf7; }
          .stg-tabbar::-webkit-scrollbar { display: none; }
          .stg-tab-btn { background: none; border: none; cursor: pointer; padding: 13px 2px; margin: 0;
            font-size: 12.5px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;
            color: #8a978f; border-bottom: 2.5px solid transparent; transition: color 0.2s, border-color 0.2s;
            white-space: nowrap; }
          .stg-tab-btn:hover { color: #0f3d24; }
          .stg-tab-btn.active { color: #0f3d24; border-bottom-color: #c9962c; }

          .stg-body { padding: 26px; }

          /* ── Consistent field styling wherever the shared theme classes are used ── */
          .stg-body .rbt-form-group { margin-bottom: 18px; }
          .stg-body .rbt-form-group label {
            font-size: 11px; font-weight: 700; color: #5b6b62; text-transform: uppercase;
            letter-spacing: 0.6px; margin-bottom: 7px; display: block;
          }
          .stg-body .rbt-form-group input:not([type="file"]),
          .stg-body .rbt-form-group select,
          .stg-body .rbt-form-group textarea {
            border: 1.5px solid #dbe3df !important; border-radius: 4px !important;
            font-size: 14px; color: #122019; transition: border-color 0.2s, box-shadow 0.2s;
          }
          .stg-body .rbt-form-group input:not([type="file"]):focus,
          .stg-body .rbt-form-group select:focus,
          .stg-body .rbt-form-group textarea:focus {
            border-color: #0f3d24 !important; box-shadow: 0 0 0 3px rgba(15,61,36,0.08); outline: none;
          }
          .stg-body .rbt-btn.btn-gradient { background: #0f3d24 !important; border-radius: 4px !important;
            box-shadow: none !important; transition: background 0.2s, transform 0.2s; }
          .stg-body .rbt-btn.btn-gradient:hover { background: #16512f !important; transform: translateY(-1px); }

          @media (max-width: 767px) {
            .stg-head { padding: 16px 16px; flex-direction: column; }
            .stg-tabbar { padding: 0 16px; gap: 18px; }
            .stg-body { padding: 16px; }
            .stg-title { font-size: 18px; }
          }
        `}</style>

        <div className="stg-head">
          <div>
            <h1 className="stg-title">
              Settings
              <span className={`stg-badge ${profileSet ? "complete" : "incomplete"}`}>
                {profileSet ? "✓ Complete" : "Incomplete"}
              </span>
            </h1>
            <p className="stg-sub">Manage how your public profile appears to clients.</p>
          </div>
          {isMobile ? (
            <button className="stg-preview-icon" onClick={() => setPreviewOpen(true)} title="Preview Profile">
              <i className="feather-eye" style={{ fontSize: 18 }}></i>
            </button>
          ) : (
            <button className="stg-preview-btn" onClick={() => setPreviewOpen(true)}>
              <i className="feather-eye" style={{ fontSize: 14 }}></i> Preview Profile
            </button>
          )}
        </div>

        <div className="stg-tabbar">
          {TABS.map(t => (
            <button key={t.id} className={`stg-tab-btn ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="stg-body tab-content">
          {tab === 0 && <Profile />}
          {tab === 2 && <ServicesAndExperties />}
          {tab === 3 && <Availability />}
          {tab === 4 && <TherapistFees />}
          {tab === 5 && <PaymentDetails />}
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
              <Link className="rbt-btn btn-gradient w-100 text-center" href="#" onClick={(e) => e.preventDefault()}>
                Book Appointment
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
