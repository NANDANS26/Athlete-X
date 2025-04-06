import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HeroSection from './components/home/HeroSection';
import Features from './components/home/Features';
import HowItWorks from './components/home/HowItWorks';
import Testimonials from './components/home/Testimonials';
import CallToAction from './components/home/CallToAction';
import Footer from './components/home/Footer';
import PrivacyPolicy from './components/home/PrivacyPolicy';
import TermsAndConditions from './components/home/terms-and-conditions';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import UserSelection from './components/home/UserSelection';
import AthleteRegistration from './components/Registration/AthleteRegistration';
import RecruiterRegistration from './components/Registration/RecruiterRegistration';
import WelcomeRecruiter from './components/Registration/WelcomeRecruiter';
import JourneyConfirmation from './components/Registration/JourneyConfirmation';
import ScheduleJourney from './components/Registration/ScheduleJourney';
import AthleteOnboarding from './components/Registration/AthleteOnboarding';
import ThankYou from './components/Registration/ThankYou';
import AthleteDashboard from './components/Athlete/AthleteDashboard';
import RecruiterDashboard from './components/Recruiter/RecruiterDashboard';
import GoogleFitCallback from './components/auth/GoogleFitCallback';
import StravaCallback from './components/auth/StravaCallback';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark text-white">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/select-role" element={<UserSelection />} />
          <Route path="/athlete-registration" element={<AthleteRegistration />} />
          <Route path="/journey-confirmation" element={<JourneyConfirmation />} />
          <Route path="/schedule-journey" element={<ScheduleJourney />} />
          <Route path="/athlete-onboarding" element={<AthleteOnboarding />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/recruiter-registration" element={<RecruiterRegistration />} />
          <Route path="/welcome-recruiter" element={<WelcomeRecruiter />} />
          <Route path="/dashboard/athlete" element={<AthleteDashboard />} />
          <Route path="/dashboard/recruiter" element={<RecruiterDashboard />} />
          <Route path="/google-fit-callback" element={<GoogleFitCallback />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/strava-callback" element={<StravaCallback />} />
          <Route path="/" element={
            <>
              <HeroSection />
              <Features />
              <HowItWorks />
              <Testimonials />
              <CallToAction />
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
