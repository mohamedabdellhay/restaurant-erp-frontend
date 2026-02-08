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
    <div className="landing-page-container min-h-screen text-text-primary bg-bg-base">
      <div className="landing-page-content">
        <Navbar />
        <div className="px-4 sm:px-6 lg:px-8">
          <Hero />
          <Features />
          <Pricing onSelectPlan={handleSelectPlan} />
        </div>
      </div>

      {/* Footer - This will now be full width */}
      <footer className="bg-bg-card border-t border-border-color py-12">
        <div className="landing-page-content px-4 sm:px-6 lg:px-8 text-center text-text-secondary">
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
  );
};

export default LandingPage;
