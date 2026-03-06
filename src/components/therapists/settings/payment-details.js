import React, { useState } from "react";
import {
  getAccountDetailsUrl,
  updateAccountDetailsUrl,
} from "../../../utils/url";
import { fetchById, postData } from "../../../utils/actions";
import useTherapistStore from "../../../store/therapistStore";
import FormMessage from "../../global/form-message";
import FormProgressBar from "../../global/form-progressbar";
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Tabs, 
  Tab,
  Tooltip
} from "@mui/material";
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PersonIcon from '@mui/icons-material/Person';
import PinIcon from '@mui/icons-material/Pin';
import SecurityIcon from '@mui/icons-material/Security';
import QrCodeIcon from '@mui/icons-material/QrCode';
import InfoIcon from '@mui/icons-material/Info';

export default function PaymentDetails({ onSuccess }) {
  const { paymentStore, setPaymentStore, setMultiplePaymentStore } =
    useTherapistStore();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState(0); // 0 for Bank, 1 for UPI

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    
    // Validation logic
    if (activeTab === 0) {
      if (paymentStore.ac_name.length < 3 || paymentStore.ac_number === "" || paymentStore.ifsc.length < 4) {
        setError("Please complete all bank details");
        return;
      }
    } else {
      if (paymentStore.upi === "") {
        setError("Please enter your UPI ID");
        return;
      }
    }

    setLoading(true);
    const reqData = {
      upi: paymentStore.upi,
      ac_name: paymentStore.ac_name,
      ac_number: paymentStore.ac_number,
      ifsc: paymentStore.ifsc,
    };

    try {
      const response = await postData(updateAccountDetailsUrl, reqData);
      if (response.status) {
        setSuccess(response.message);
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

  React.useEffect(() => {
    if (!hasFetched && paymentStore.ac_name === "" && paymentStore.upi === "") {
      const getData = async () => {
        try {
          setPageLoading(true);
          const res = await fetchById(getAccountDetailsUrl);
          if (res.data && Object.keys(res.data).length > 0) {
            setMultiplePaymentStore(res.data);
            // Auto switch to UPI tab if bank is empty but UPI exists
            if (!res.data.ac_number && res.data.upi) {
              setActiveTab(1);
            }
          }
        } catch (err) {
          setError(err.message);
        }
        setPageLoading(false);
        setHasFetched(true);
      };
      getData();
    }
  }, [paymentStore.ac_name, paymentStore.upi, hasFetched]);

  const inputStyle = {
    height: 54,
    borderRadius: 14,
    paddingLeft: '45px',
    border: '2px solid #e2e8f0',
    fontSize: '16px',
    fontWeight: '700',
    background: '#fff',
    color: '#1e293b',
    width: '100%',
    transition: 'all 0.2s ease'
  };

  const labelStyle = {
    fontWeight: 800,
    fontSize: '16px',
    color: '#475569',
    marginBottom: '10px',
    display: 'block'
  };

  const iconStyle = {
    position: 'absolute',
    left: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8',
    fontSize: '20px',
    zIndex: 1
  };

  if (pageLoading) return <FormProgressBar />;

  return (
    <div className="rbt-dashboard-content-wrapper">
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: '24px', 
          border: '1px solid #f1f5f9',
          overflow: 'hidden',
          background: '#fff'
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                py: 2.5,
                fontSize: '15px',
                fontWeight: 800,
                color: '#64748b',
                textTransform: 'none',
                '&.Mui-selected': { color: '#2ecc71' }
              },
              '& .MuiTabs-indicator': { backgroundColor: '#2ecc71', height: 3 }
            }}
          >
            <Tab icon={<AccountBalanceIcon sx={{ mb: '0 !important', mr: 1 }} />} iconPosition="start" label="Bank Account" />
            <Tab icon={<QrCodeIcon sx={{ mb: '0 !important', mr: 1 }} />} iconPosition="start" label="UPI ID" />
          </Tabs>
        </Box>

        <Box sx={{ p: { xs: 3, md: 4 } }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 1, fontSize: '14px', fontWeight: 600 }}>
              <InfoIcon sx={{ color: "#1976d2", fontSize: 16 }} />
              Choose your preferred method to receive payments securely.
            </Typography>
          </Box>

          {activeTab === 0 ? (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box className="rbt-form-group mb--0">
                  <label style={labelStyle}>Account Holder Name</label>
                  <div style={{ position: 'relative' }}>
                    <PersonIcon style={iconStyle} />
                    <input
                      type="text"
                      placeholder="Enter full name"
                      style={inputStyle}
                      value={paymentStore.ac_name}
                      onChange={(e) => setPaymentStore("ac_name", e.target.value)}
                    />
                  </div>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box className="rbt-form-group mb--0">
                  <label style={labelStyle}>Account Number</label>
                  <div style={{ position: 'relative' }}>
                    <PinIcon style={iconStyle} />
                    <input
                      type="text"
                      placeholder="Enter account number"
                      style={inputStyle}
                      value={paymentStore.ac_number}
                      onChange={(e) => setPaymentStore("ac_number", e.target.value)}
                    />
                  </div>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box className="rbt-form-group mb--0">
                  <label style={labelStyle}>IFSC Code</label>
                  <div style={{ position: 'relative' }}>
                    <SecurityIcon style={iconStyle} />
                    <input
                      type="text"
                      placeholder="Enter 11-digit IFSC"
                      style={inputStyle}
                      value={paymentStore.ifsc}
                      onChange={(e) => setPaymentStore("ifsc", e.target.value)}
                    />
                  </div>
                </Box>
              </Grid>
            </Grid>
          ) : (
            <Box className="rbt-form-group mb--0">
              <label style={labelStyle}>UPI ID</label>
              <div style={{ position: 'relative' }}>
                <QrCodeIcon style={iconStyle} />
                <input
                  type="text"
                  placeholder="e.g. name@okaxis"
                  style={inputStyle}
                  value={paymentStore.upi}
                  onChange={(e) => setPaymentStore("upi", e.target.value)}
                />
              </div>
              <Typography sx={{ mt: 2, fontSize: '13px', color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <InfoIcon sx={{ fontSize: 14 }} /> Instant payouts will be sent to this ID.
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      <Box sx={{ mt: 4 }}>
        <FormMessage error={error} success={success} />
        <div className="rbt-form-group d-none">
          <button className="rbt-btn btn-gradient submit-btn" onClick={handleSubmit}>
            Update
          </button>
        </div>
        {loading && <FormProgressBar />}
      </Box>
    </div>
  );
}
