import React, { useState } from "react";
import {
  services,
  dailyLiftIssuesList,
  therapyoptionlist,
  diagnoseslist,
  relationshipIssuesList,
} from "../../../utils/static-lists";

import { updateServiceExpertiesUrl } from "../../../utils/url";
import { postData } from "../../../utils/actions";
import FormMessage from "../../global/form-message";
import FormProgressBar from "../../global/form-progressbar";
import useTherapistStore from "../../../store/therapistStore";
import { Typography, Box, Chip, Tabs, Tab } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import PeopleIcon from "@mui/icons-material/People";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import PsychologyIcon from "@mui/icons-material/Psychology";
import GroupsIcon from "@mui/icons-material/Groups";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function ServicesAndExperties({ onSuccess }) {
  const { therapistInfo, setInfo } = useTherapistStore();
  const [loading, setLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedExpertise, setSelectedExpertise] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  React.useEffect(() => {
    if (!hasInitialized && therapistInfo?.user?.email) {
      if (therapistInfo.services) {
        setSelectedServices(therapistInfo.services.split(",").map((item) => item.trim()));
      }
      if (therapistInfo.experties) {
        setSelectedExpertise(therapistInfo.experties.split(",").map((item) => item.trim()));
      }
      setHasInitialized(true);
    }
  }, [therapistInfo?.user?.email, therapistInfo.services, therapistInfo.experties, hasInitialized]);

  const handleServiceChange = (service) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const handleExpertiseChange = (expertise) => {
    setSelectedExpertise((prev) =>
      prev.includes(expertise)
        ? prev.filter((e) => e !== expertise)
        : [...prev, expertise]
    );
  };

  const handleSubmit = async () => {
    const reqData = {
      services: selectedServices.join(", "),
      experties: selectedExpertise.join(", "),
    };

    try {
      setError("");
      setSuccess("");
      setLoading(true);
      const response = await postData(updateServiceExpertiesUrl, reqData);
      if (response.status) {
        setSuccess(response.message);
        setInfo("services", reqData.services);
        setInfo("experties", reqData.experties);
        setError("");
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError("Something went wrong");
      }
    } catch (error) {
      setError(error?.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  const getServiceConfig = (service) => {
    switch (service) {
      case "Individual Counselling": return { icon: <PersonIcon sx={{ fontSize: 26 }} />, color: "#6366f1", bg: "#eef2ff", desc: "One-on-one personal sessions" };
      case "Couple Counselling": return { icon: <PeopleIcon sx={{ fontSize: 26 }} />, color: "#ec4899", bg: "#fdf2f8", desc: "Relationship & couples therapy" };
      case "Teen Counselling": return { icon: <ChildCareIcon sx={{ fontSize: 26 }} />, color: "#f59e0b", bg: "#fffbeb", desc: "Youth & adolescent support" };
      case "Diagnosis": return { icon: <PsychologyIcon sx={{ fontSize: 26 }} />, color: "#0ea5e9", bg: "#f0f9ff", desc: "Clinical assessment & diagnosis" };
      case "Workshops/Training": return { icon: <GroupsIcon sx={{ fontSize: 26 }} />, color: "#10b981", bg: "#f0fdf4", desc: "Group sessions & workshops" };
      default: return { icon: <CheckCircleIcon sx={{ fontSize: 26 }} />, color: "#64748b", bg: "#f8fafc", desc: "" };
    }
  };

  const categories = [
    { title: "Daily Life Issues", list: dailyLiftIssuesList },
    { title: "Therapy Options", list: therapyoptionlist },
    { title: "Diagnoses", list: diagnoseslist },
    { title: "Relationship Issues", list: relationshipIssuesList },
  ];

  return (
    <div className="rbt-dashboard-content-wrapper">
      <div className="rbt-profile-row rbt-default-form row row--15">
        <div className="col-12">
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, color: '#1e293b' }}>
              What services do you offer?
            </Typography>
            <div className="row g-3">
              {services.map((service) => {
                const isSelected = selectedServices.includes(service);
                const config = getServiceConfig(service);
                return (
                  <div key={service} className="col-lg-4 col-md-6 col-12">
                    <Box
                      onClick={() => handleServiceChange(service)}
                      sx={{
                        p: "16px 20px",
                        cursor: 'pointer',
                        borderRadius: '14px',
                        border: '2px solid',
                        borderColor: isSelected ? config.color : '#f1f5f9',
                        background: isSelected ? config.bg : '#fff',
                        transition: 'all 0.25s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        position: 'relative',
                        boxShadow: isSelected ? `0 4px 16px ${config.color}22` : '0 1px 4px rgba(0,0,0,0.04)',
                        '&:hover': {
                          borderColor: config.color,
                          boxShadow: `0 6px 20px ${config.color}22`,
                          transform: 'translateY(-2px)',
                        }
                      }}
                    >
                      {/* Icon box */}
                      <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '12px',
                        background: isSelected ? config.color : config.bg,
                        color: isSelected ? '#fff' : config.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.25s ease'
                      }}>
                        {config.icon}
                      </Box>

                      {/* Text */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '15px', fontWeight: 700, color: isSelected ? config.color : '#1e293b', lineHeight: 1.2 }}>
                          {service}
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: '#94a3b8', mt: 0.3, fontWeight: 500 }}>
                          {config.desc}
                        </Typography>
                      </Box>

                      {/* Checkmark */}
                      {isSelected && (
                        <CheckCircleIcon sx={{ color: config.color, fontSize: 22, flexShrink: 0 }} />
                      )}
                    </Box>
                  </div>
                );
              })}
            </div>
          </Box>
        </div>

        <div className="col-12 mt--20">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>
              Your Area of Expertise
            </Typography>
            {selectedExpertise.length > 0 && (
              <Chip
                label={`${selectedExpertise.length} selected`}
                size="small"
                sx={{ background: '#2ecc71', color: '#fff', fontWeight: 700, fontSize: '12px' }}
              />
            )}
          </Box>

          {/* Category Tabs */}
          <Box sx={{ borderBottom: '2px solid #f1f5f9', mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(_, val) => setActiveTab(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: '44px',
                '& .MuiTab-root': {
                  fontWeight: 700,
                  fontSize: '13px',
                  color: '#64748b',
                  minHeight: '44px',
                  textTransform: 'none',
                  px: 2,
                },
                '& .Mui-selected': { color: '#2ecc71 !important' },
                '& .MuiTabs-indicator': { background: '#2ecc71', height: '3px', borderRadius: '3px' }
              }}
            >
              {categories.map((cat, idx) => {
                const count = cat.list.filter(i => selectedExpertise.includes(i)).length;
                return (
                  <Tab
                    key={cat.title}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        {cat.title}
                        {count > 0 && (
                          <Box sx={{
                            background: '#2ecc71',
                            color: '#fff',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 800,
                            px: 0.8,
                            py: 0.1,
                            lineHeight: 1.6
                          }}>
                            {count}
                          </Box>
                        )}
                      </Box>
                    }
                  />
                );
              })}
            </Tabs>
          </Box>

          {/* Chips for active tab */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2, minHeight: 80 }}>
            {categories[activeTab]?.list.map((item) => {
              const isSelected = selectedExpertise.includes(item);
              return (
                <Chip
                  key={item}
                  label={item}
                  onClick={() => handleExpertiseChange(item)}
                  sx={{
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '13px',
                    background: isSelected ? '#2ecc71' : '#fff',
                    color: isSelected ? '#fff' : '#475569',
                    border: '1.5px solid',
                    borderColor: isSelected ? '#2ecc71' : '#e2e8f0',
                    transition: 'all 0.2s',
                    height: '36px',
                    '& .MuiChip-label': { px: 1.5 },
                    '&:hover': {
                      background: isSelected ? '#27ae60' : '#f0fdf4',
                      borderColor: '#2ecc71',
                      color: isSelected ? '#fff' : '#2ecc71'
                    }
                  }}
                />
              );
            })}
          </Box>
        </div>

        <div className="col-12 mt--30">
          <FormMessage error={error} success={success} />
          {loading && <FormProgressBar />}
          <div className="rbt-form-group">
            <button
              className="rbt-btn btn-gradient submit-btn"
              onClick={handleSubmit}
              style={{ padding: "0 40px", height: "52px", borderRadius: "12px", fontWeight: "600" }}
            >
              Save Offerings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
