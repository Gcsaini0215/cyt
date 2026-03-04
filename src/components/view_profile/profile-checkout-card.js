import ImageTag from "../../utils/image-tag";
import { imagePath } from "../../utils/url";
import { Box, Typography } from "@mui/material";

export default function ProfileCheckoutCard({ pageData }) {
  return (
    <div className="mini-therapist-card" style={{
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      padding: '20px',
      background: '#ffffff',
      borderRadius: '20px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
    }}>
      <div className="mini-card-img-wrapper" style={{ position: 'relative' }}>
        <ImageTag
          alt={pageData.user.name}
          src={`${imagePath}/${pageData.user.profile}`}
          className="mini-card-img"
          style={{ 
            width: "90px", 
            height: "90px", 
            borderRadius: "50%", 
            objectFit: "cover",
            border: '3px solid #f0fdf4'
          }}
        />
        <div className="verified-badge" style={{
          position: 'absolute',
          bottom: '5px',
          right: '5px',
          background: '#228756',
          color: '#fff',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          border: '2px solid #fff'
        }}>
          <i className="feather-check"></i>
        </div>
      </div>
      
      <div className="mini-card-info">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <h4 className="mini-card-name" style={{
            fontSize: '1.75rem',
            fontWeight: 900,
            color: '#1e293b',
            margin: 0,
            lineHeight: 1.2
          }}>
            {pageData.user.name}
          </h4>
          <i className="feather-check-circle" style={{ color: '#228756', fontSize: '20px' }}></i>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Typography sx={{
            fontSize: '14px',
            color: '#228756',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.8px'
          }}>
            {pageData.profile_type}
          </Typography>
          <Box sx={{ width: '4px', height: '4px', borderRadius: '50%', bgcolor: '#cbd5e1' }} />
          <Typography sx={{
            fontSize: '14px',
            color: '#475569',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}>
            <i className="feather-map-pin" style={{ fontSize: '14px' }}></i>
            {pageData.state || "India"}
          </Typography>
        </Box>
        
        <Box sx={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: 1,
          bgcolor: 'rgba(34, 135, 86, 0.08)',
          px: 2,
          py: 0.8,
          borderRadius: '10px',
          border: '1px solid rgba(34, 135, 86, 0.1)'
        }}>
          <i className="feather-award" style={{ color: '#228756', fontSize: '16px' }}></i>
          <Typography sx={{
            fontSize: '14px',
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
