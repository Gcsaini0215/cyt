import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ModalComponent from "../therapists/Modal/Modal-component";
const {
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
} = require("@mui/material");

export default function PaymentSuccessModal({ open, onClose, navigateTo = "/" }) {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const [timeLeft, setTimeLeft] = useState(15);
  const router = useRouter();
  const handleNavigate = () => {
    router.push(navigateTo);
  };

  useEffect(() => {
    let countdown;
    let redirectTimer;

    if (open) {
      countdown = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev > 0) return prev - 1;
          return 0;
        });
      }, 1000);

      redirectTimer = setTimeout(() => {
        router.push("/");
      }, 15000);
    }

    return () => {
      clearInterval(countdown);
      clearTimeout(redirectTimer);
    };
  }, [open, router]);

  return (
    <ModalComponent open={open} onClose={(event, reason) => {
      if (reason === "backdropClick" || reason === "escapeKeyDown") {
        return;
      }
      onClose(event, reason);
    }} width={isMobile ? "90%" : isTablet ? "80%" : "50%"} content={
      <>
        <DialogTitle>
          <h5 className="price-title" style={{ fontSize: "16px" }}>
            Payment Received🎉
          </h5>{" "}
        </DialogTitle>
        <DialogContent>
          <h6 className="price-title" style={{ fontSize: "16px" }}>
            Your payment has been successfully processed. Thank you!
          </h6>
          <h6 className="price-title" style={{ fontSize: "16px" }}>
            Redirecting to home in {timeLeft} seconds...
          </h6>
        </DialogContent>
        <DialogActions>
          <button
            className="rbt-btn btn-gradient hover-icon-reverse"
            onClick={handleNavigate}
          >
            <span className="icon-reverse-wrapper">
              <span className="btn-text">OK</span>
              <span className="btn-icon">
              </span>
              <span className="btn-icon">
                <i className="feather-arrow-right"></i>
              </span>
            </span>
          </button>
        </DialogActions></>
    } />
  );
}
