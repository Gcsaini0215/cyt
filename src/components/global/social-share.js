import React, { useState } from "react";
import { 
  Box, 
  Stack, 
  IconButton, 
  Tooltip, 
  Typography,
  Snackbar,
  Alert
} from "@mui/material";
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Link as LinkIcon,
  MessageCircle, // For WhatsApp
  Send // For Telegram
} from "lucide-react";

const SocialShare = ({ url, title, description }) => {
  const [open, setOpen] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || "");

  const shareLinks = [
    {
      name: "Facebook",
      icon: <Facebook size={20} />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: "#1877F2"
    },
    {
      name: "Twitter",
      icon: <Twitter size={20} />,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: "#1DA1F2"
    },
    {
      name: "LinkedIn",
      icon: <Linkedin size={20} />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: "#0A66C2"
    },
    {
      name: "WhatsApp",
      icon: <MessageCircle size={20} />,
      url: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      color: "#25D366"
    },
    {
      name: "Telegram",
      icon: <Send size={20} />,
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      color: "#0088CC"
    }
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setOpen(true);
  };

  return (
    <Box sx={{ mt: 1, mb: 1 }}>
      <Stack direction="row" spacing={1.2} alignItems="center" flexWrap="wrap">
        {shareLinks.map((link) => (
          <Tooltip key={link.name} title={`Share on ${link.name}`} arrow>
            <IconButton
              component="a"
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                width: 36,
                height: 36,
                backgroundColor: link.color,
                color: "#fff",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: `0 4px 10px ${link.color}33`,
                "& .lucide": { strokeWidth: 2.5 },
                "&:hover": {
                  backgroundColor: link.color,
                  transform: "translateY(-4px) scale(1.1)",
                  boxShadow: `0 8px 16px ${link.color}55`,
                  opacity: 0.95
                }
              }}
            >
              {React.cloneElement(link.icon, { size: 18 })}
            </IconButton>
          </Tooltip>
        ))}
        
        <Tooltip title="Copy Link" arrow>
          <IconButton
            onClick={copyToClipboard}
            sx={{
              width: 36,
              height: 36,
              backgroundColor: "#475569",
              color: "#fff",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: '0 4px 10px rgba(71, 85, 105, 0.2)',
              "&:hover": {
                backgroundColor: "#334155",
                transform: "translateY(-4px) scale(1.1)",
                boxShadow: '0 8px 16px rgba(71, 85, 105, 0.3)',
                opacity: 0.95
              }
            }}
          >
            <LinkIcon size={18} />
          </IconButton>
        </Tooltip>
      </Stack>

      <Snackbar 
        open={open} 
        autoHideDuration={3000} 
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpen(false)} severity="success" sx={{ width: '100%' }}>
          Link copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SocialShare;
