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
    const base = { color: "#0f3d24", bg: "#f0fdf4" };
    switch (service) {
      case "Individual Counselling": return { icon: <PersonIcon sx={{ fontSize: 22 }} />, ...base, desc: "One-on-one personal sessions" };
      case "Couple Counselling": return { icon: <PeopleIcon sx={{ fontSize: 22 }} />, ...base, desc: "Relationship & couples therapy" };
      case "Teen Counselling": return { icon: <ChildCareIcon sx={{ fontSize: 22 }} />, ...base, desc: "Youth & adolescent support" };
      case "Diagnosis": return { icon: <PsychologyIcon sx={{ fontSize: 22 }} />, ...base, desc: "Clinical assessment & diagnosis" };
      case "Workshops/Training": return { icon: <GroupsIcon sx={{ fontSize: 22 }} />, ...base, desc: "Group sessions & workshops" };
      default: return { icon: <CheckCircleIcon sx={{ fontSize: 22 }} />, color: "#5b6b62", bg: "#fbfaf7", desc: "" };
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
            <Typography sx={{
              fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700, fontSize: 19,
              color: '#122019', mb: 2, pb: 1.25, borderBottom: '1.5px solid #ecefec',
            }}>
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
                        p: "14px 16px",
                        cursor: 'pointer',
                        borderRadius: '6px',
                        border: '1.5px solid',
                        borderColor: isSelected ? config.color : '#dbe3df',
                        background: isSelected ? config.bg : '#fff',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        position: 'relative',
                        '&:hover': {
                          borderColor: config.color,
                          background: config.bg,
                        }
                      }}
                    >
                      {/* Icon box */}
                      <Box sx={{
                        width: 38,
                        height: 38,
                        borderRadius: '4px',
                        background: isSelected ? config.color : config.bg,
                        color: isSelected ? '#fff' : config.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.2s'
                      }}>
                        {config.icon}
                      </Box>

                      {/* Text */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '13.5px', fontWeight: 700, color: isSelected ? config.color : '#122019', lineHeight: 1.2 }}>
                          {service}
                        </Typography>
                        <Typography sx={{ fontSize: '11px', color: '#8a978f', mt: 0.3, fontWeight: 500 }}>
                          {config.desc}
                        </Typography>
                      </Box>

                      {/* Checkmark */}
                      {isSelected && (
                        <CheckCircleIcon sx={{ color: '#c9962c', fontSize: 18, flexShrink: 0 }} />
                      )}
                    </Box>
                  </div>
                );
              })}
            </div>
          </Box>
        </div>

        <div className="col-12 mt--20">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1, pb: 1.25, borderBottom: '1.5px solid #ecefec' }}>
            <Typography sx={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700, fontSize: 19, color: '#122019' }}>
              Your Area of Expertise
            </Typography>
            {selectedExpertise.length > 0 && (
              <Chip
                label={`${selectedExpertise.length} selected`}
                size="small"
                sx={{ background: '#0f3d24', color: '#fff', fontWeight: 700, fontSize: '11px', borderRadius: '4px' }}
              />
            )}
          </Box>

          {/* Category Tabs */}
          <Box sx={{ borderBottom: '1px solid #ecefec', mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(_, val) => setActiveTab(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: '40px',
                '& .MuiTab-root': {
                  fontWeight: 700,
                  fontSize: '11.5px',
                  letterSpacing: '0.4px',
                  textTransform: 'uppercase',
                  color: '#8a978f',
                  minHeight: '40px',
                  px: 1.5,
                },
                '& .Mui-selected': { color: '#0f3d24 !important' },
                '& .MuiTabs-indicator': { background: '#c9962c', height: '2.5px' }
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
                            background: '#f0fdf4',
                            color: '#0f3d24',
                            border: '1px solid #c8ddd0',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 800,
                            px: 0.7,
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
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, minHeight: 80 }}>
            {categories[activeTab]?.list.map((item) => {
              const isSelected = selectedExpertise.includes(item);
              return (
                <Chip
                  key={item}
                  label={item}
                  onClick={() => handleExpertiseChange(item)}
                  sx={{
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '12.5px',
                    background: isSelected ? '#0f3d24' : '#fff',
                    color: isSelected ? '#fff' : '#374b40',
                    border: '1.5px solid',
                    borderColor: isSelected ? '#0f3d24' : '#dbe3df',
                    transition: 'all 0.2s',
                    height: '32px',
                    '& .MuiChip-label': { px: 1.4 },
                    '&:hover': {
                      background: isSelected ? '#16512f' : '#f0fdf4',
                      borderColor: '#0f3d24',
                      color: isSelected ? '#fff' : '#0f3d24'
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
