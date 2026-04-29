import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Activity, ChevronRight, Lock } from 'lucide-react';
import './LandingPage.css';

const LandingPage = ({ onLogin, onRegister }) => {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-logo-container">
          <div className="landing-logo-icon">
            <Shield size={24} color="#ffffff" />
          </div>
          <span className="landing-logo-text">Aegis AI</span>
        </div>
        <div className="landing-nav-actions">
          <button onClick={onLogin} className="landing-btn-text">Log In</button>
          <button onClick={onRegister} className="landing-btn-primary">Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="landing-hero">
        <div className="hero-glow"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hero-content"
        >
          <div className="hero-badge">
            <span className="hero-badge-ping"></span>
            <span className="hero-badge-dot"></span>
            Enterprise Grade Multi-Agent Security
          </div>
          
          <h1 className="hero-title">
            Govern AI with <br/>
            <span className="text-gradient">Absolute Certainty.</span>
          </h1>
          
          <p className="hero-subtitle">
            Protect your organization from adversarial exploits and policy violations. 
            Our multi-agent orchestration engine analyzes, explains, and secures every LLM interaction in real-time.
          </p>

          <div className="hero-actions">
            <button onClick={onRegister} className="landing-btn-primary hero-btn-large">
              Start Free Trial <ChevronRight size={20} />
            </button>
            <button onClick={onLogin} className="landing-btn-secondary hero-btn-large">
              Sign In
            </button>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <div className="features-grid">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="feature-card"
          >
            <div className="feature-icon feature-icon-indigo">
              <Activity size={24} color="#818cf8" />
            </div>
            <h3>Live Threat Analysis</h3>
            <p>Dynamically score prompts across impact, likelihood, and urgency using dedicated risk-assessment agents.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="feature-card"
          >
            <div className="feature-icon feature-icon-purple">
              <Zap size={24} color="#c084fc" />
            </div>
            <h3>Smart Explanations</h3>
            <p>Get rich, step-by-step reasoning for every policy block, alongside automatically generated safer prompt alternatives.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="feature-card"
          >
            <div className="feature-icon feature-icon-emerald">
              <Lock size={24} color="#34d399" />
            </div>
            <h3>Adversarial Defense</h3>
            <p>A built-in "Devil's Advocate" agent stress-tests every interaction against jailbreaks and exploit vectors.</p>
          </motion.div>
        </div>
      </main>
      
      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} Aegis AI / Multi-Agent Systems. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
