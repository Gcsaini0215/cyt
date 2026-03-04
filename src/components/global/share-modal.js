import React from "react";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  IconButton, 
  Typography, 
  Box,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { X } from "lucide-react";
import SocialShare from "./social-share";

const ShareModal = ({ open, onClose, url, title, description }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 4,
          padding: 1,
          maxWidth: 450,
          width: '100%'
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 800, color: '#1e293b' }}>
          Share this Profile
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <X size={24} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ borderBottom: 'none', px: 3, py: 4 }}>
        <Typography variant="body1" sx={{ mb: 3, color: '#64748b' }}>
          Spread the word and help someone connect with the right mental health support.
        </Typography>
        <SocialShare 
          url={url} 
          title={title} 
          description={description} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
