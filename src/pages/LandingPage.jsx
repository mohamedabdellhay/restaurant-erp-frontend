import React, { useState } from "react";
import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import Pricing from "../components/landing/Pricing";
import RegistrationForm from "../components/landing/RegistrationForm";

const LandingPage = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
  };

  const handleCloseModal = () => {
    setSelectedPlan(null);
  };

  return (
    <>
      <style>{`
        /* Landing Page Internal CSS */
        .landing-page-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow-x: hidden;
        }

        .landing-page-content {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        /* Footer Styles */
        .landing-footer {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          padding: 3rem 0;
          margin-top: 4rem;
        }

        .landing-footer-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          text-align: center;
        }

        .landing-footer-content p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.875rem;
          margin: 0;
          font-weight: 400;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .landing-page-content {
            padding: 0 1rem;
          }
          
          .landing-footer-content {
            padding: 0 1rem;
          }
        }

        @media (max-width: 640px) {
          .landing-footer {
            padding: 2rem 0;
            margin-top: 2rem;
          }
        }

        /* Animation Classes */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }

        /* RTL Support */
        [dir="rtl"] .landing-page-content {
          direction: rtl;
        }

        [dir="rtl"] .landing-footer-content {
          direction: rtl;
        }
      `}</style>

      <div className="landing-page-container">
        <div className="landing-page-content">
          <Navbar />
          <div style={{ padding: "0 2rem" }}>
            <Hero />
            <Features />
            <Pricing onSelectPlan={handleSelectPlan} />
          </div>
        </div>

        {/* Footer */}
        <footer className="landing-footer">
          <div className="landing-footer-content">
            <p>
              &copy; {new Date().getFullYear()} RestaurantERP. All rights
              reserved.
            </p>
          </div>
        </footer>

        {selectedPlan && (
          <RegistrationForm
            selectedPlan={selectedPlan}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </>
  );
};

export default LandingPage;
