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
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, Chip } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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

  const getServiceIcon = (service) => {
    switch (service) {
      case "Individual Counselling": return <PersonIcon sx={{ fontSize: 32 }} />;
      case "Couple Counselling": return <PeopleIcon sx={{ fontSize: 32 }} />;
      case "Teen Counselling": return <ChildCareIcon sx={{ fontSize: 32 }} />;
      case "Diagnosis": return <PsychologyIcon sx={{ fontSize: 32 }} />;
      case "Workshops/Training": return <GroupsIcon sx={{ fontSize: 32 }} />;
      default: return <CheckCircleIcon sx={{ fontSize: 32 }} />;
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
                return (
                  <div key={service} className="col-lg-4 col-md-6">
                    <Box
                      onClick={() => handleServiceChange(service)}
                      sx={{
                        p: 3,
                        height: '100%',
                        cursor: 'pointer',
                        borderRadius: '16px',
                        border: '2px solid',
                        borderColor: isSelected ? '#2ecc71' : '#f1f5f9',
                        background: isSelected ? '#f0fdf4' : '#fff',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        gap: 2,
                        '&:hover': {
                          borderColor: '#2ecc71',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }
                      }}
                    >
                      <Box sx={{ 
                        color: isSelected ? '#2ecc71' : '#64748b',
                        background: isSelected ? '#fff' : '#f8fafc',
                        p: 1.5,
                        borderRadius: '12px',
                        display: 'flex'
                      }}>
                        {getServiceIcon(service)}
                      </Box>
                      <Typography sx={{ fontSize: '18px', fontWeight: 700, color: isSelected ? '#166534' : '#1e293b' }}>
                        {service}
                      </Typography>
                      {isSelected && (
                        <CheckCircleIcon sx={{ 
                          position: 'absolute', 
                          top: 10, 
                          right: 10, 
                          color: '#2ecc71',
                          fontSize: 20
                        }} />
                      )}
                    </Box>
                  </div>
                );
              })}
            </div>
          </Box>
        </div>

        <div className="col-12 mt--20">
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, color: '#1e293b' }}>
            Your Area of Expertise
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {categories.map((cat, idx) => {
              const selectedCount = cat.list.filter(item => selectedExpertise.includes(item)).length;
              return (
                <Accordion 
                  key={cat.title}
                  elevation={0}
                  sx={{
                    border: '1px solid #f1f5f9',
                    borderRadius: '16px !important',
                    '&:before': { display: 'none' },
                    overflow: 'hidden'
                  }}
                >
                  <AccordionSummary 
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ 
                      px: 3,
                      py: 1.5,
                      background: selectedCount > 0 ? '#f8fafc' : '#fff',
                      '&.Mui-expanded': { minHeight: '64px' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Typography sx={{ fontWeight: 700, color: '#1e293b', fontSize: '18px' }}>
                        {cat.title}
                      </Typography>
                      {selectedCount > 0 && (
                        <Chip 
                          label={`${selectedCount} Selected`} 
                          size="small" 
                          sx={{ 
                            background: '#2ecc71', 
                            color: '#fff', 
                            fontWeight: 700,
                            height: '20px',
                            fontSize: '11px'
                          }} 
                        />
                      )}
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 3, pt: 1 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                      {cat.list.map((item) => {
                        const isSelected = selectedExpertise.includes(item);
                        return (
                          <Chip
                            key={item}
                            label={item.split(/(?=[A-Z])/).join(" ")}
                            onClick={() => handleExpertiseChange(item)}
                            sx={{
                              p: 1.2,
                              borderRadius: '10px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: '16px',
                              background: isSelected ? '#2ecc71' : '#fff',
                              color: isSelected ? '#fff' : '#64748b',
                              border: '1px solid',
                              borderColor: isSelected ? '#2ecc71' : '#e2e8f0',
                              transition: 'all 0.2s',
                              height: 'auto',
                              '& .MuiChip-label': { px: 2, py: 1 },
                              '&:hover': {
                                background: isSelected ? '#27ae60' : '#f8fafc',
                                borderColor: isSelected ? '#27ae60' : '#2ecc71',
                                color: isSelected ? '#fff' : '#2ecc71'
                              }
                            }}
                          />
                        );
                      })}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        </div>

        <div className="col-12 mt--30">
          <FormMessage error={error} success={success} />
          <div className="rbt-form-group d-none">
             {/* Hidden button for global trigger */}
            <button className="rbt-btn btn-gradient submit-btn" onClick={handleSubmit}>
              Update
            </button>
          </div>
          {loading && <FormProgressBar />}
        </div>
      </div>
    </div>
  );
}
