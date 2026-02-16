let apiUrl;
let baseApi;
let baseFrontendUrl;

const isServer = typeof window === "undefined";
const currentDomain = isServer ? "" : window.location.hostname;

if (currentDomain === "localhost" || currentDomain === "127.0.0.1") {
  apiUrl = "https://api.chooseyourtherapist.in/api";
  baseApi = "https://api.chooseyourtherapist.in";
  baseFrontendUrl = "http://localhost:3000/";
} else {
  apiUrl = "https://api.chooseyourtherapist.in/api";
  baseApi = "https://api.chooseyourtherapist.in";
  baseFrontendUrl = "https://chooseyourtherapist.in/";
}

export const defaultProfile =
  "https://e7.pngegg.com/pngimages/753/432/png-clipart-user-profile-2018-in-sight-user-conference-expo-business-default-business-angle-service-thumbnail.png";

export const frontendUrl = baseFrontendUrl;
export const imagePath = `${baseApi}/uploads/images`;
export const loginUrl = `${apiUrl}/login`;
export const threapistRegistrationUrl = `${apiUrl}/therapist-registeration`;
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
