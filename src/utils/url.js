let apiUrl;
let baseApi;
let baseFrontendUrl;

const isServer = typeof window === "undefined";
const currentDomain = isServer ? "" : window.location.hostname;

// Static assignment for environment variables to ensure they are picked up by bundlers (Next.js/CRA)
const envApiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.REACT_APP_API_URL;
const envBaseApi = process.env.NEXT_PUBLIC_BASE_API || process.env.REACT_APP_BASE_API;

console.log("DEBUG: Env variables from process.env:", {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  NEXT_PUBLIC_BASE_API: process.env.NEXT_PUBLIC_BASE_API,
  REACT_APP_BASE_API: process.env.REACT_APP_BASE_API
});

const defaultApiUrl = "https://chooseyourtherapist.in/api";
const defaultBaseApi = "https://chooseyourtherapist.in";

// Helper to remove trailing slash
const removeTrailingSlash = (str) => {
  if (typeof str !== "string") return str;
  return str.endsWith("/") ? str.slice(0, -1) : str;
};

// Determine the raw URLs
let rawApiUrl = (envApiUrl && envApiUrl !== "undefined" && envApiUrl !== "") ? envApiUrl : defaultApiUrl;
let rawBaseApi = (envBaseApi && envBaseApi !== "undefined" && envBaseApi !== "") ? envBaseApi : defaultBaseApi;

// Force live API if env is not set correctly or if we want to ensure it works on local
if (currentDomain === "localhost" || currentDomain === "127.0.0.1") {
  baseFrontendUrl = "http://localhost:3000";
  
  // Try to use a relative URL or direct localhost if backend is also on 3000
  // If you are running the backend separately on 4000:
  rawApiUrl = "http://localhost:4000/api";
  rawBaseApi = "http://localhost:4000";
  
  // BUT if you want to use the LIVE API from local, we must use the correct reachable domain
  // Since api.chooseyourtherapist.in is failing, try main domain with /api
  // Note: This only works if the backend is configured to respond on the same domain
  // rawApiUrl = "https://chooseyourtherapist.in/api";
  // rawBaseApi = "https://chooseyourtherapist.in";
} else {
  baseFrontendUrl = "https://chooseyourtherapist.in";
}

apiUrl = removeTrailingSlash(rawApiUrl);
baseApi = removeTrailingSlash(rawBaseApi);

console.log("DEBUG: Final API Configuration:", { 
  apiUrl, 
  baseApi, 
  currentDomain,
  isServer
});

if (typeof window !== 'undefined') {
  window.API_CONFIG = { apiUrl, baseApi, currentDomain };
}

export const defaultProfile =
  "https://e7.pngegg.com/pngimages/753/432/png-clipart-user-profile-2018-in-sight-user-conference-expo-business-default-business-angle-service-thumbnail.png";

export const frontendUrl = baseFrontendUrl;
export const imagePath = `${baseApi}/uploads/images`;
export const loginUrl = `${apiUrl}/login`;
export const therapistRegistrationUrl = `${apiUrl}/therapist-registeration`;
export const registerUrl = `${apiUrl}/register`;
export const sendOtpUrl = `${apiUrl}/send-otp`;
export const sendForgotPasswordOtpUrl = `${apiUrl}/send-forgot-password-otp`;
export const verifyOtpUrl = `${apiUrl}/verify-otp`;
export const resetpasswordpUrl = `${apiUrl}/reset-password`;
export const verifyOtpAndResetPasswordpUrl = `${apiUrl}/verify-otp-and-reset-password`;
export const changePasswordUrl = `${apiUrl}/change-passowrd`;
// user
export const getUserUrl = `${apiUrl}/get-user`;
export const updateUserUrl = `${apiUrl}/update-user`;
export const changeClientPasswordUrl = `${apiUrl}/change-client-passowrd`;
//Therapist
export const getTherapists = `${apiUrl}/get-therapists`;
export const getTherapist = `${apiUrl}/get-therapist`;
export const updateProfileUrl = `${apiUrl}/update-profile`;
export const updateTherapistProfileUrl = `${apiUrl}/update-therapist-profile`;
export const updateServiceExpertiesUrl = `${apiUrl}/update-service-experties`;
export const updateAccountDetailsUrl = `${apiUrl}/update-account-details`;
export const updateFeeDetailsUrl = `${apiUrl}/update-fee-details`;
export const getAccountDetailsUrl = `${apiUrl}/get-bank-details`;
export const getFeeDetailsUrl = `${apiUrl}/get-fee-details`;
export const updateAvailabilitiesUrl = `${apiUrl}/update-availability-details`;
export const getAvailabilitiesUrl = `${apiUrl}/get-availability-details`;
export const getTherapistProfiles = `${apiUrl}/get-therapists-profile`;
export const getTherapistProfile = `${apiUrl}/get-profile/`;
export const checkProfileSet = `${apiUrl}/check-profile-set`;
export const sendOtpTosubscribe = `${apiUrl}/send-otp-to-subscribe`;
export const verifyOtpTosubscribe = `${apiUrl}/verify-otp-to-subscribe`;
export const createWorkshopUrl = `${apiUrl}/create-workshop`;
export const getWorkshopsUrl = `${apiUrl}/get-workshops`;
export const getWorkshopByIdUrl = `${apiUrl}/get-workshop`;
export const getWorkshopWebUrl = `${apiUrl}/get-workshop-web`;
export const getWorkshopsWebUrl = `${apiUrl}/get-workshops-web`;
export const disableWorkshopUrl = `${apiUrl}/disable-workshop`;
export const deleteWorkshopUrl = `${apiUrl}/delete-workshop`;
export const UpdateWorkshopUrl = `${apiUrl}/update-workshop`;
export const GetDashboardDataUrl = `${apiUrl}/get-dashabord-data`;
export const createBlogUrl = `${apiUrl}/create-blog`;
export const InsertFavriouteTherapistUrl = `${apiUrl}/insert-favrioute-therapist`;
export const RemoveFavriouteTherapistUrl = `${apiUrl}/remove-favrioute-therapist`;
export const GetFavriouteTherapistUrl = `${apiUrl}/get-favrioute-therapists`;
export const GetFavriouteTherapistListUrl = `${apiUrl}/get-favrioute-therapists-list`;
export const BookTherapistUrl = `${apiUrl}/book-therapist`;
export const BookTherapistUrlAnomalously = `${apiUrl}/book-therapist-anomalously`;
export const pendingPaymentUrl = `${apiUrl}/get-payment`;
export const savePaymentUrl = `${apiUrl}/save-payment`;
export const getBookings = `${apiUrl}/get-bookings`;
export const bookWorkshopUrl = `${apiUrl}/book-workshop`;
export const getPaymentQrUrl = `${apiUrl}/get-payment-qr`;
export const getClientDashboardDataUrl = `${apiUrl}/get-client-dashboard`;
export const saveWorkshopPaymentUrl = `${apiUrl}/save-workshop-payment`;
export const GetMyWorkshopBooking = `${apiUrl}/get-my-workshop-bookings`;
export const GetCoupansUrl = `${apiUrl}/coupon/get`;
export const CreateCoupansUrl = `${apiUrl}/coupon/create`;
export const UpdateCoupansUrl = `${apiUrl}/coupon/update`;
export const DeleteCoupansUrl = `${apiUrl}/coupon/delete`;
export const ToggleCoupanStatusUrl = `${apiUrl}/coupon/status`;
export const ApplyCouponUrl = `${apiUrl}/coupon/apply`;
export const UpdatePaymentStatusUrl = `${apiUrl}/update-payment-status`;
export const StartSessionUrl = `${apiUrl}/start-session`;
export const EndSessionUrl = `${apiUrl}/end-session`;
export const SubmitConsultationUrl = `${apiUrl}/save-lead`;
export const getClinicLogsUrl = `${apiUrl}/clinic-logs`;
export const createClinicLogUrl = `${apiUrl}/clinic-logs`;
export const updateClinicLogUrl = `${apiUrl}/clinic-logs`;
export const deleteClinicLogUrl = `${apiUrl}/clinic-logs`;
