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
    <Box>
      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
        {shareLinks.map((link) => (
          <Tooltip key={link.name} title={`Share on ${link.name}`}>
            <IconButton
              component="a"
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                width: 40,
                height: 40,
                backgroundColor: "rgba(34, 135, 86, 0.1)",
                color: "#228756",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: link.color,
                  color: "#fff",
                  transform: "translateY(-3px)"
                }
              }}
            >
              {link.icon}
            </IconButton>
          </Tooltip>
        ))}
        <Tooltip title="Copy Link">
          <IconButton
            onClick={copyToClipboard}
            sx={{
              width: 40,
              height: 40,
              backgroundColor: "rgba(34, 135, 86, 0.1)",
              color: "#228756",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "#228756",
                color: "#fff",
                transform: "translateY(-3px)"
              }
            }}
          >
            <LinkIcon size={20} />
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
