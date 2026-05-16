import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/Authcontext";
import SnakeGameOverlay from "./components/SnakeGameOverlay";

// --- COMPONENTS ---
import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import ChatBot from "./components/ChatBot";
import AIGuard from "./pages/AIGuard";

// --- LAYOUTS ---
import PatientLayout from "./layouts/PatientLayout";
import NutritionistLayout from "./layouts/NutritionistLayout";

// --- PATIENT PAGES ---
import ProfileInfoPage from "./pages/patient/Profileinfopage";
import ProfileChatPage from "./pages/patient/Profilechatpage";
import ProfileProgressPage from "./pages/patient/ProgressPage";
import ProfileNotifsPage from "./pages/patient/NotifsPage";
import MoodPage from "./pages/patient/MoodPage";
import Sessionspage from "./pages/patient/Sessionspage" 
import ProfilePlanPage from "./pages/patient/ProfilePlanPage";
import ReviewPage from "./pages/patient/ReviewPage";

// --- NUTRITIONIST PAGES ---
import OverviewPage from "./pages/nutrition/OverviewPage";
import PatientsPage from "./pages/nutrition/PatientsPage";
import NutritionPlansPage from "./pages/nutrition/PlansPage";
import ConsultationsPage from "./pages/nutrition/ConsultationsPage";
import ChatPage from "./pages/nutrition/ChatPage";
import NutritionProfilePage from "./pages/nutrition/ProfilePage";
import PostsPage from "./pages/nutrition/CreatePostPage";
import NutritionNotifsPage from "./pages/nutrition/NotifsPage";

// --- SETUP PAGES ---
import StripeRedirect from "./pages/nutrition/StripeRedirect";
import PatientSetup from "./pages/Patientsetup";
import CreateResumePage from "./pages/CreateResumePage";
import StripeSuccess from "./pages/StripeSuccess";

// --- PUBLIC PAGES ---
import Login from "./pages/Login";
import SignupPage from "./pages/SignupPage";
import BlogsPage from "./pages/BlogsPage";
import AboutPage from "./pages/AboutPage";
import PrivacyPage from "./pages/PrivacyPag";
import Specialists from "./pages/Specialists";
import OurSpecialists from "./pages/OurSpecialists";
import AIPremiumPage from "./pages/AIPremiumPage";
import Planspage from "./pages/Planspage";
import SpecialistPlansPage from "./pages/SpecialistPlansPage";

// --- OTHER ---
import MobileScan from "./pages/MobileScan";
import CaloriesAI from "./pages/CaloriesAI";
import Payment from "./pages/Payment";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>

        {/* اللعبة تظهر فقط عند أول دخول لكل جلسة */}
        <SnakeGameOverlay />

        <Routes>

          {/* ================= PUBLIC ================= */}
          <Route
            path="/"
            element={
              <>
                <Header />
                <HeroSection />
                <Footer />
                <ChatBot />
              </>
            }
          />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route path="/blogs" element={<><BlogsPage /></>} />
          <Route path="/about" element={<><AboutPage /><Footer /></>} />
          <Route path="/privacy" element={<><PrivacyPage /><Footer /></>} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/specialists" element={<Specialists />} />
          <Route path="/our-sprcs" element={<><OurSpecialists /></>} />
          <Route path="/ai-premium" element={<><AIPremiumPage /></>} />

          <Route path="/plans" element={<><Planspage /></>} />
          <Route path="/specialist-plans" element={<SpecialistPlansPage />} />

          {/* ================= SETUP ================= */}
          <Route path="/patient-setup" element={<PatientSetup />} />
          <Route path="/resume/create" element={<CreateResumePage />} />
          <Route path="/success" element={<StripeSuccess />} />
          <Route path="/nutritionist-setup" element={<StripeRedirect />} />

          {/* ================= PATIENT ================= */}
          <Route element={<PatientLayout />}>
            <Route path="/profile" element={<ProfileInfoPage />} />
            <Route path="/profile/chat" element={<ProfileChatPage />} />
            <Route path="/profile/progress" element={<ProfileProgressPage />} />
            <Route path="/profile/notifs" element={<ProfileNotifsPage />} />
            <Route path="/profile/mood" element={<MoodPage />} />
            <Route path="/profile/sessions" element={<Sessionspage />} />
            <Route path="/scan" element={<MobileScan />} />
            
            <Route path="/profile/plan" element={<ProfilePlanPage />} />
            <Route path="/profile/review" element={<ReviewPage />} />
            <Route
              path="/calories-ai"
              element={
                <AIGuard>
                  <CaloriesAI />
                </AIGuard>
              }
            />
          </Route>

          {/* ================= NUTRITIONIST ================= */}
          <Route path="/resume" element={<NutritionistLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="patients" element={<PatientsPage />} />
            <Route path="plans" element={<NutritionPlansPage />} />
            <Route path="consultations" element={<ConsultationsPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="profile" element={<NutritionProfilePage />} />
            <Route path="notifs" element={<NutritionNotifsPage />} />
            <Route path="posts" element={<PostsPage />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;