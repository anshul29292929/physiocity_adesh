import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Lenis from '@studio-freight/lenis';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'quill/dist/quill.snow.css';

// Newp Components & Pages
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Faculty from "./components/Faculty";
import Events from "./components/Events";
import Blog from "./components/Blog";
import Resources from "./components/Resources";
import Testimonials from "./components/Testimonials";
import Collaboration from "./components/Collaboration";
import VolunteerCTA from "./components/VolunteerCTA";
import VolunteerPage from "./pages/VolunteerPage";
import BlogList from "./pages/BlogList";
import BlogDetail from "./pages/BlogDetail";
import CreateBlog from "./pages/CreateBlog";
import MyBlogs from "./pages/MyBlogs";
import FacultyPage from "./pages/FacultyPage";
import BlogManagement from "./pages/ims/admin/BlogManagement";
import QuestionBank from "./pages/ims/admin/QuestionBank";
import EditQuestion from "./pages/ims/admin/EditQuestion";
import QuizSettings from "./pages/ims/admin/QuizSettings";
import AdminAnalytics from "./pages/ims/admin/AdminAnalytics";
import ManageQuizzes from "./pages/ims/admin/ManageQuizzes";
import EditQuizForm from "./pages/ims/admin/EditQuizForm";
import Certificates from "./pages/ims/admin/Certificates";
import AdminSettings from "./pages/ims/admin/AdminSettings";
import ManageUsers from "./pages/ims/admin/ManageUsers";

import StudentLogin from "./pages/StudentLogin";

// IMS Components & Pages (Ported)
import { AppContextProvider } from "./context/AppContext";
import Admin from "./pages/ims/admin/Admin";
import AdminDashboard from "./pages/ims/admin/Dashboard";
import AddCourse from "./pages/ims/admin/AddCourse";
import MyCourses from "./pages/ims/admin/MyCourses";
import EditCourse from "./pages/ims/admin/EditCourse";
import StudentsEnrolled from "./pages/ims/admin/StudentsEnrolled";
import CourseDetails from "./pages/ims/student/CourseDetails";
import CoursesList from "./pages/ims/student/CoursesList";
import Player from "./pages/ims/student/Player";
import MyEnrollments from "./pages/ims/student/MyEnrollments";
import { QuizContextProvider } from "./context/QuizContext";
import QuizPage from "./pages/ims/student/QuizPage";
import TakeQuizPage from "./pages/ims/student/TakeQuizPage";
import StudentDashboard from "./pages/ims/student/Dashboard";
import RevisionPage from "./pages/ims/student/RevisionPage";
import VerifyCertificate from "./pages/ims/student/VerifyCertificate";
import QuizResultPage from "./pages/ims/student/QuizResultPage";
import QuizReviewPage from "./pages/ims/student/QuizReviewPage";
import AboutAcademy from "./pages/AboutAcademy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Support from "./pages/Support";
import PaymentSuccess from "./pages/ims/student/PaymentSuccess";
import QuizSubmissions from "./pages/ims/admin/QuizSubmissions";
import AllQuizSubmissions from "./pages/ims/admin/AllQuizSubmissions";
import EventsPage from "./pages/EventsPage";
import EventDetail from "./pages/EventDetail";
import AdminEvents from "./pages/ims/admin/AdminEvents";
import EventEnrollments from "./pages/ims/admin/EventEnrollments";
import Status from "./pages/Status";

import SmoothScroll from './components/SmoothScroll.jsx';
import Preloader from './components/Preloader.jsx';
import ClickSpark from './components/ClickSpark.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import { AnimatePresence } from "framer-motion";
import ManageReviews from './pages/ims/admin/ManageReviews.jsx';
import ManageFaculty from './pages/ims/admin/ManageFaculty.jsx';

const LandingPage = ({ loading }) => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero startAnimation={!loading} />
      <Faculty />
      <Events />
      <Collaboration />
      <Blog />
      <Testimonials />
      <VolunteerCTA />
      <Footer />
    </div>
  );
};

const AppContent = () => {
  const [loading, setLoading] = React.useState(() => !sessionStorage.getItem('hasLoaded'));
  const navigate = useNavigate();

  return (
    <AppContextProvider>
      <QuizContextProvider>
        <AnimatePresence>
          {loading && (
            <Preloader 
              onComplete={() => {
                setLoading(false);
                sessionStorage.setItem('hasLoaded', 'true');
              }} 
            />
          )}
        </AnimatePresence>
        <ToastContainer />
        <ClickSpark
          sparkColor='#0ea5a4'
          sparkSize={10}
          sparkRadius={15}
          sparkCount={8}
          duration={400}
        >
          <SmoothScroll>
            <ScrollToTop />
            <Routes>
              {/* Landing & High-Level Pages */}
              <Route path="/" element={<LandingPage loading={loading} />} />
              <Route path="/faculty" element={<><Navbar /><FacultyPage /><Footer /></>} />
              <Route path="/events" element={<><Navbar /><EventsPage /><Footer /></>} />
              <Route path="/events/:id" element={<><Navbar /><EventDetail /><Footer /></>} />
              <Route path="/status" element={<Status />} />
              <Route path="/blogs" element={<><Navbar /><BlogList /><Footer /></>} />
              <Route path="/blogs/:slug" element={<><Navbar /><BlogDetail /><Footer /></>} />
              <Route path="/blog/:slug" element={<><Navbar /><BlogDetail /><Footer /></>} />
              <Route path="/volunteer" element={<><Navbar /><VolunteerPage /><Footer /></>} />

              {/* Public Blog Management (if still used) */}
              <Route path="/create-blog" element={<><Navbar /><CreateBlog /><Footer /></>} />
              <Route path="/edit-blog/:id" element={<><Navbar /><CreateBlog /><Footer /></>} />
              <Route path="/my-blogs" element={<><Navbar /><MyBlogs /><Footer /></>} />

              {/* Auth routes */}
              <Route path="/login" element={<StudentLogin />} />
              <Route path="/about-academy" element={<AboutAcademy />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/support" element={<Support />} />

              {/* IMS Specific Routes (LMS) */}
              <Route path="/course/:slug" element={<><Navbar /><CourseDetails /><Footer /></>} />
              <Route path="/courses" element={<><Navbar /><CoursesList /><Footer /></>} />
              <Route path="/my-enrollments" element={<><Navbar /><MyEnrollments /><Footer /></>} />
              <Route path="/dashboard" element={<><Navbar /><StudentDashboard /><Footer /></>} />
              <Route path="/quiz" element={<><Navbar /><QuizPage /><Footer /></>} />
              <Route path="/take-quiz/:id" element={<><Navbar /><TakeQuizPage /><Footer /></>} />
              <Route path="/quiz/result/:attemptId" element={<><Navbar /><QuizResultPage /><Footer /></>} />
              <Route path="/quiz/review/:attemptId" element={<><Navbar /><QuizReviewPage /><Footer /></>} />
              <Route path="/revision" element={<><Navbar /><RevisionPage /><Footer /></>} />
              <Route path="/player/:courseId" element={<><Navbar /><Player /><Footer /></>} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/loading/my-enrollments" element={<Navigate to="/my-enrollments" />} />
              <Route path="/cert-verification/:id" element={<><Navbar /><VerifyCertificate /><Footer /></>} />
              
              {/* IMS Admin Routes */}
              <Route path='/admin' element={<Admin />}>
                <Route index element={<AdminDashboard />} />
                <Route path='add-course' element={<AddCourse />} />
                <Route path='edit-course/:id' element={<EditCourse />} />
                <Route path='my-courses' element={<MyCourses />} />
                <Route path='students-enrolled/:id' element={<StudentsEnrolled />} />
                <Route path='student-enrolled' element={<StudentsEnrolled />} />
                <Route path='blog-management' element={<BlogManagement />} />
                <Route path='manage-faculty' element={<ManageFaculty />} />
                <Route path='questions' element={<QuestionBank />} />
                <Route path='edit-question/:id' element={<EditQuestion />} />
                <Route path='add-question' element={<EditQuestion />} />
                <Route path='quiz-config' element={<QuizSettings />} />
                <Route path='quiz-analytics' element={<AdminAnalytics />} />
                <Route path='quizzes' element={<ManageQuizzes />} />
                <Route path='add-quiz' element={<EditQuizForm />} />
                <Route path='edit-quiz/:id' element={<EditQuizForm />} />
                <Route path='quiz/:quizId/submissions' element={<QuizSubmissions />} />
                <Route path='quiz-submissions' element={<AllQuizSubmissions />} />
                <Route path='certificates' element={<Certificates />} />
                <Route path='manage-reviews' element={<ManageReviews />} />
                <Route path='events' element={<AdminEvents />} />
                <Route path='event-enrollments/:id' element={<EventEnrollments />} />
                <Route path='settings' element={<AdminSettings />} />
                <Route path='manage-users' element={<ManageUsers />} />
              </Route>
            </Routes>
          </SmoothScroll>
        </ClickSpark>
      </QuizContextProvider>
    </AppContextProvider>
  );
};

const App = () => {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
};

export default App;
