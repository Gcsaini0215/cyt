import ImageTag from "../../utils/image-tag";
import { imagePath } from "../../utils/url";
import { Box, Typography } from "@mui/material";
import { useMediaQueryClient } from "../../hooks/useMediaQueryClient";

export default function ProfileCheckoutCard({ pageData }) {
  const isMobile = useMediaQueryClient("sm");
  
  return (
    <div className="mini-therapist-card" style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: 'center',
      gap: isMobile ? '15px' : '20px',
      padding: isMobile ? '25px 20px' : '20px',
      background: '#ffffff',
      borderRadius: '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
      textAlign: isMobile ? 'center' : 'left'
    }}>
      <div className="mini-card-img-wrapper" style={{ 
        position: 'relative', 
        flexShrink: 0,
        width: isMobile ? "100px" : "90px", 
        height: isMobile ? "100px" : "90px" 
      }}>
        <ImageTag
          alt={pageData.user.name}
          src={`${imagePath}/${pageData.user.profile}`}
          className="mini-card-img"
          style={{ 
            width: isMobile ? "100px" : "90px", 
            height: isMobile ? "100px" : "90px", 
            borderRadius: "50%", 
            objectFit: "cover",
            border: '4px solid #f0fdf4',
            display: 'block',
            boxShadow: '0 4px 10px rgba(34, 135, 86, 0.1)'
          }}
        />
        <div className="verified-badge" style={{
          position: 'absolute',
          bottom: isMobile ? '5px' : '5px',
          right: isMobile ? '5px' : '5px',
          background: '#228756',
          color: '#fff',
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          border: '2px solid #fff',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }}>
          <i className="feather-check"></i>
        </div>
      </div>
      
      <div className="mini-card-info" style={{ width: '100%' }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: isMobile ? 'center' : 'flex-start',
          gap: 1, 
          mb: 0.5 
        }}>
          <h4 className="mini-card-name" style={{
            fontSize: isMobile ? '1.5rem' : '1.75rem',
            fontWeight: 900,
            color: '#1e293b',
            margin: 0,
            lineHeight: 1.2
          }}>
            {pageData.user.name}
          </h4>
          <i className="feather-check-circle" style={{ color: '#228756', fontSize: '20px' }}></i>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: isMobile ? 'center' : 'flex-start',
          gap: 1.5, 
          mb: 1.5 
        }}>
          <Typography sx={{
            fontSize: '13px',
            color: '#228756',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.8px'
          }}>
            {pageData.profile_type}
          </Typography>
          <Box sx={{ width: '4px', height: '4px', borderRadius: '50%', bgcolor: '#cbd5e1' }} />
          <Typography sx={{
            fontSize: '13px',
            color: '#475569',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}>
            <i className="feather-map-pin" style={{ fontSize: '13px' }}></i>
            {pageData.state || "India"}
          </Typography>
        </Box>
        
        <Box sx={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: isMobile ? 'center' : 'flex-start',
          gap: 1,
          bgcolor: 'rgba(34, 135, 86, 0.06)',
          px: 2,
          py: 0.8,
          borderRadius: '12px',
          border: '1px solid rgba(34, 135, 86, 0.1)'
        }}>
          <i className="feather-award" style={{ color: '#228756', fontSize: '16px' }}></i>
          <Typography sx={{
            fontSize: '13px',
            color: '#1e293b',
            fontWeight: 700
          }}>
            {pageData.year_of_exp} Experience
          </Typography>
        </Box>
      </div>
    </div>
  );
}
