import "./App.css";
import "./index.css";
import { Route, Routes } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useEffect, lazy } from "react";
import useTherapistStore from "./store/therapistStore";
import useUserStore from "./store/userStore";
import { getDecodedToken, getToken, removeToken } from "./utils/jwt";
import TherapistProtectedRoute from "./utils/therapistProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CookieConsent from "./components/global/cookie-consent";
const Login = lazy(() => import("./components/legacy-pages/login"));
const HomePage = lazy(() => import("./pages/index"));
const NotFoundPage = lazy(() => import("./pages/notfound"));
const ProtectedRoute = lazy(() => import("./pages/protectedroute"));
const AboutUs = lazy(() => import("./pages/about-us"));
const Services = lazy(() => import("./pages/services/[id]"));
const ContactUs = lazy(() => import("./pages/contact-us"));
const JoinUs = lazy(() => import("./pages/join-us"));
const Plans = lazy(() => import("./pages/plans"));
const FaqPage = lazy(() => import("./pages/faqs"));
const Blogs = lazy(() => import("./pages/blogs"));
const UserDashboard = lazy(() => import("./pages/my-dashboard"));
const ViewProfile = lazy(() => import("./pages/view-profile/[id]"));
const TherapistRegistration = lazy(() => import("./pages/therapist-registration"));
const Register = lazy(() => import("./pages/register"));
const Success = lazy(() => import("./pages/success"));
const TherapistDashboard = lazy(() => import("./pages/therapist-dashboard"));
const ProfileSettings = lazy(() => import("./pages/settings"));
const ClientSettings = lazy(() => import("./pages/my-settings"));
const AllWorkshop = lazy(() => import("./pages/allworkshop"));
const ViewAllTherapist = lazy(() => import("./pages/view-all-therapist"));
const CreateWorkshopPage = lazy(() => import("./pages/create-workshop"));
const Workshops = lazy(() => import("./pages/workshops"));
const UpdateWorkshopPage = lazy(() => import("./pages/update-workshop/[id]"));
const WrokshopDetailPage = lazy(() => import("./pages/workshop-detail/[id]"));
const Forgotpassword = lazy(() => import("./pages/forgot-password"));
const FavriouteTherapistPage = lazy(() => import("./pages/client/favrioute-therapits"));
const TherapistCheckoutPage = lazy(() => import("./pages/therapist-checkout/[id]"));
const PrivacyPolicy = lazy(() => import("./pages/privacy-policy"));
const TermsCondition = lazy(() => import("./pages/terms-conditions"));
const CancellationPolicy = lazy(() => import("./pages/cancellation-policy"));
const PaymentPendingPage = lazy(() => import("./pages/payment-pending/[id]"));
const MyBookingsPage = lazy(() => import("./pages/client/my-bookings"));
const SerivcePage = lazy(() => import("./pages/service-page"));
const WorkshopBookingPage = lazy(() => import("./pages/workshop-booking/[id]"));
const PaymentWorkshopPage = lazy(() => import("./pages/payment-workshop/[id]"));
const MyWorkshopBookingsPage = lazy(() => import("./pages/client/my-workshop-bookings"));
const CoupansPage = lazy(() => import("./pages/coupons"));
const CreateCoupanPage = lazy(() => import("./pages/coupon/create"));
const UpdateCoupanPage = lazy(() => import("./pages/coupon/update/[id]"));
const AppointmentsPage = lazy(() => import("./pages/appointments"));
const ComingSoon = lazy(() => import("./pages/coming-soon"));
const TherapyBooking = lazy(() => import("./pages/therapy-booking"));
const MindMatters = lazy(() => import("./pages/mind-matters"));
const HowItWorks = lazy(() => import("./pages/how-it-works"));
const EmergencySupport = lazy(() => import("./pages/emergency-support"));
const MentorshipForStudents = lazy(() => import("./pages/mentorship-for-students"));
const SupervisionDetails = lazy(() => import("./pages/supervision-details"));
const AIChat = lazy(() => import("./pages/ai-chat"));
const AIAffirmation = lazy(() => import("./pages/ai-affirmation"));
const AddressSelectionPage = lazy(() => import("./pages/address-selection"));
const BlogDetails = lazy(() => import("./pages/blog-details"));
const Invoices = lazy(() => import("./pages/therapists/invoices"));
const Reviews = lazy(() => import("./pages/therapists/reviews"));
const TherapistBlogsPage = lazy(() => import("./pages/therapist-blogs"));
const TherapistAIBlogPage = lazy(() => import("./pages/therapist-ai-blog"));
const Notifications = lazy(() => import("./pages/therapists/notifications"));
const TherapistChangePassword = lazy(() => import("./pages/therapists/change-password"));
const ClinicPatientsPage = lazy(() => import("./pages/clinic-patients"));
const AddOfflineClientPage = lazy(() => import("./pages/add-offline-client"));
const ClientChangePassword = lazy(() => import("./pages/client/change-password"));
const StartHealing = lazy(() => import("./pages/starthealing"));
const NotAuthorizedPage = lazy(() => import("./pages/not-authorized"));
const theme = createTheme();

function App() {
  const { fetchTherapistInfo } = useTherapistStore();
  const { fetchUserInfo } = useUserStore();
  useEffect(() => {
    const data = getToken();

    if (data) {
      const userData = getDecodedToken();
      const currentTime = Date.now() / 1000;
      if (userData.role === 2) {
        removeToken();
      }
      else if (userData.exp < currentTime) {
        removeToken();
      } else {
        if (userData.role === 1) {
          fetchTherapistInfo();
        } else {
          fetchUserInfo();
        }
      }
    }
  }, [fetchUserInfo, fetchTherapistInfo]);
  return (
    <ThemeProvider theme={theme}>
      <>
        <div className="offcanvas-overlay"></div>
        <div className="wrapper">
          {/* <TopNav /> */}
          <div className="main-wrapper">
            {/* <Nav /> */}
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route exact path="/login" element={<Login />} />
              <Route exact path="/register" element={<Register />} />
              <Route
                exact
                path="/forgot-password"
                element={<Forgotpassword />}
              />
              <Route
                exact
                path="/therapist-registration"
                element={<TherapistRegistration />}
              />
              <Route
                path="/view-all-therapist"
                element={<ViewAllTherapist />}
              />
              <Route exact path="/auth/success" element={<Success />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/services/:id" element={<Services />} />
              <Route path="/view-profile/:id" element={<ViewProfile />} />
              <Route path="/contact-us" element={<ContactUs />} />
              <Route path="/join-us" element={<JoinUs />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/faqs" element={<FaqPage />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/blog-details/:id" element={<BlogDetails />} />
              <Route path="/all-workshop" element={<AllWorkshop />} />
              <Route path="/new-service" element={<SerivcePage />} />
              <Route path="/therapy-booking" element={<TherapyBooking />} />
              <Route path="/mind-matters" element={<MindMatters />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/emergency-support" element={<EmergencySupport />} />
              <Route path="/mentorship-for-students" element={<MentorshipForStudents />} />
              <Route path="/supervision-details" element={<SupervisionDetails />} />
              <Route path="/ai-chat" element={<AIChat />} />
              <Route path="/ai-affirmation" element={<AIAffirmation />} />
              <Route path="/address-selection" element={<AddressSelectionPage />} />
              <Route path="/start-healing" element={<StartHealing />} />
              <Route path="/not-authorized" element={<NotAuthorizedPage />} />

              <Route
                path="/workshop-detail/:id"
                element={<WrokshopDetailPage />}
              />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-conditions" element={<TermsCondition />} />
              <Route
                path="/cancellation-policy"
                element={<CancellationPolicy />}
              />
              <Route path="/notfound" element={<NotFoundPage />} />
              <Route path="*" element={<NotFoundPage />} />
              {/* client routes */}

              <Route
                path="/my-dashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/my-appointments"
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/my-settings"
                element={
                  <ProtectedRoute>
                    <ClientSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-change-password"
                element={
                  <ProtectedRoute>
                    <ClientChangePassword />
                  </ProtectedRoute>
                }
              />
              {
                <Route
                  path="/my-therapists"
                  element={
                    <ProtectedRoute>
                      <FavriouteTherapistPage />
                    </ProtectedRoute>
                  }
                />
              }

              {
                <Route
                  path="/my-bookings"
                  element={
                    <ProtectedRoute>
                      <MyBookingsPage />
                    </ProtectedRoute>
                  }
                />
              }

              {
                <Route
                  path="/my-workshop-bookings"
                  element={
                    <ProtectedRoute>
                      <MyWorkshopBookingsPage />
                    </ProtectedRoute>
                  }
                />
              }

              <Route
                path="/therapist-checkout/:id"
                element={
                  // <ProtectedRoute>
                  //   <TherapistCheckoutPage />
                  // </ProtectedRoute>
                  <TherapistCheckoutPage />
                }
              />
              <Route
                path="/workshop-booking/:id"
                element={
                  <WorkshopBookingPage />
                }
              />

              <Route
                path="/payment-pending/:id"
                element={
                  <PaymentPendingPage />
                }
              />

              <Route
                path="/workshop-pending/:id"
                element={
                  <PaymentWorkshopPage />
                }
              />

              <Route
                path="/payment-success/"
                element={
                  <ProtectedRoute>
                    <Success />
                  </ProtectedRoute>
                }
              />

              {/* therapist related routes */}
              <Route
                exact
                path="/therapist-dashboard"
                element={
                  <TherapistProtectedRoute>
                    <TherapistDashboard />
                  </TherapistProtectedRoute>
                }
              />
              <Route
                exact
                path="/settings"
                element={
                  <TherapistProtectedRoute>
                    <ProfileSettings />
                  </TherapistProtectedRoute>
                }
              />

              <Route
                exact
                path="/appointments"
                element={
                  <TherapistProtectedRoute>
                    <AppointmentsPage />
                  </TherapistProtectedRoute>
                }
              />

              <Route
                path="/invoices"
                element={
                  <TherapistProtectedRoute>
                    <Invoices />
                  </TherapistProtectedRoute>
                }
              />

              <Route
                path="/reviews"
                element={
                  <TherapistProtectedRoute>
                    <Reviews />
                  </TherapistProtectedRoute>
                }
              />
              <Route
                path="/change-password"
                element={
                  <TherapistProtectedRoute>
                    <TherapistChangePassword />
                  </TherapistProtectedRoute>
                }
              />
              <Route
                exact
                path="/notifications"
                element={
                  <TherapistProtectedRoute>
                    <Notifications />
                  </TherapistProtectedRoute>
                }
              />

              <Route
                exact
                path="/case-history"
                element={
                  <TherapistProtectedRoute>
                    <ComingSoon />
                  </TherapistProtectedRoute>
                }
              />

              <Route
                exact
                path="/workshops"
                element={
                  <TherapistProtectedRoute>
                    <Workshops />
                  </TherapistProtectedRoute>
                }
              />
              <Route
                exact
                path="/therapist-blogs"
                element={
                  <TherapistProtectedRoute>
                    <TherapistBlogsPage />
                  </TherapistProtectedRoute>
                }
              />
              <Route
                exact
                path="/therapist-ai-blog"
                element={
                  <TherapistProtectedRoute>
                    <TherapistAIBlogPage />
                  </TherapistProtectedRoute>
                }
              />
              <Route
                exact
                path="/create-workshop"
                element={
                  <TherapistProtectedRoute>
                    <CreateWorkshopPage />
                  </TherapistProtectedRoute>
                }
              />
              <Route
                exact
                path="/coupons"
                element={
                  <TherapistProtectedRoute>
                    <CoupansPage />
                  </TherapistProtectedRoute>
                }
              />
              <Route
                exact
                path="/clinic-patients"
                element={
                  <TherapistProtectedRoute>
                    <ClinicPatientsPage />
                  </TherapistProtectedRoute>
                }
              />
              <Route
                exact
                path="/add-offline-client"
                element={
                  <TherapistProtectedRoute>
                    <AddOfflineClientPage />
                  </TherapistProtectedRoute>
                }
              />
              <Route
                exact
                path="/coupon/create"
                element={
                  <TherapistProtectedRoute>
                    <CreateCoupanPage />
                  </TherapistProtectedRoute>
                }
              />
              <Route
                exact
                path="/coupon/update/:id"
                element={
                  <TherapistProtectedRoute>
                    <UpdateCoupanPage />
                  </TherapistProtectedRoute>
                }
              />
              <Route
                exact
                path="/update-workshop/:id"
                element={
                  <TherapistProtectedRoute>
                    <UpdateWorkshopPage />
                  </TherapistProtectedRoute>
                }
              />
            </Routes>
          </div>
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
        <CookieConsent />
      </>
    </ThemeProvider>
  );
}

export default App;