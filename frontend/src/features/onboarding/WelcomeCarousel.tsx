import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const slides = [
  {
    title: "Unify all your investments",
    description: "Aggregate Equity, Mutual Funds, Bonds and more in one powerful dashboard",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDJj7dGwE7FSPqAMrNYSS9Qpk171y73w3KR5Dq_cNZbp57jlW7qIMx6eW7JR8O7JOU7X4Y7xqWTXXjK9ZbSaGfY0s6wCImNLkslWyE1esVRXC-K5Tra0cqX7YU3VDYhBVJtPFoHA6N23GcgGM3wn1NvgNUJ9S963VZ83HCduBZ1g1kiufQZBvWH7u5crP7PfYVN1uL0ZigmznZKD8yNktuZullIFNiwxYMQGN5FVHB2R5u6BocJ7hWLZVbadPEbqQztwR4lC46j1S4"
  },
  {
    title: "Protect your wealth",
    description: "Identify scams and verify advisors instantly before you invest",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDJj7dGwE7FSPqAMrNYSS9Qpk171y73w3KR5Dq_cNZbp57jlW7qIMx6eW7JR8O7JOU7X4Y7xqWTXXjK9ZbSaGfY0s6wCImNLkslWyE1esVRXC-K5Tra0cqX7YU3VDYhBVJtPFoHA6N23GcgGM3wn1NvgNUJ9S963VZ83HCduBZ1g1kiufQZBvWH7u5crP7PfYVN1uL0ZigmznZKD8yNktuZullIFNiwxYMQGN5FVHB2R5u6BocJ7hWLZVbadPEbqQztwR4lC46j1S4" // Mock placeholder for second slide
  },
  {
    title: "Grow with confidence",
    description: "Get personalized insights and simulations to reach your goals",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDJj7dGwE7FSPqAMrNYSS9Qpk171y73w3KR5Dq_cNZbp57jlW7qIMx6eW7JR8O7JOU7X4Y7xqWTXXjK9ZbSaGfY0s6wCImNLkslWyE1esVRXC-K5Tra0cqX7YU3VDYhBVJtPFoHA6N23GcgGM3wn1NvgNUJ9S963VZ83HCduBZ1g1kiufQZBvWH7u5crP7PfYVN1uL0ZigmznZKD8yNktuZullIFNiwxYMQGN5FVHB2R5u6BocJ7hWLZVbadPEbqQztwR4lC46j1S4" // Mock placeholder for third slide
  }
];

export function WelcomeCarousel() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate('/onboarding/account-aggregator');
    }
  };

  const handleSkip = () => {
    navigate('/onboarding/account-aggregator');
  };

  return (
    <div className="bg-surface text-on-surface font-body-md h-screen w-full flex flex-col justify-between overflow-hidden">
      {/* Top Navigation / Skip */}
      <header className="w-full flex justify-end px-4 py-6 z-10 relative">
        <button 
          onClick={handleSkip}
          className="font-label-md text-on-surface-variant hover:text-primary transition-colors duration-200 min-h-[44px] px-4"
        >
          Skip
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-0">
        {/* Hero Image Container */}
        <div className="relative w-full max-w-sm aspect-square mb-8 rounded-full bg-surface-container-highest/30 flex items-center justify-center">
          {/* Decorative background blobs */}
          <div className="absolute inset-0 bg-primary-fixed/20 rounded-full blur-2xl transform -translate-y-4"></div>
          <img 
            alt="Welcome illustration"
            className="w-3/4 h-3/4 object-contain relative z-10 drop-shadow-lg" 
            src={slides[currentSlide].image}
          />
        </div>

        {/* Typography Section */}
        <div className="text-center max-w-md w-full px-4">
          <h1 className="font-display-lg-mobile text-primary mb-3">
            {slides[currentSlide].title}
          </h1>
          <p className="font-body-lg text-on-surface-variant">
            {slides[currentSlide].description}
          </p>
        </div>
      </main>

      {/* Bottom Controls */}
      <footer className="w-full px-4 pb-8 pt-4 flex flex-col gap-6 z-10 relative">
        {/* Progress Dots */}
        <div className="flex justify-center items-center gap-2">
          {slides.map((_, index) => (
            <div 
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-outline-variant'
              }`}
            ></div>
          ))}
        </div>

        {/* Primary Action */}
        <div className="w-full max-w-md mx-auto">
          <button 
            onClick={handleNext}
            className="w-full h-[56px] bg-primary text-on-primary font-label-md rounded-full shadow-sm hover:bg-primary-container hover:text-on-primary-container transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>{currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </footer>
    </div>
  );
}
