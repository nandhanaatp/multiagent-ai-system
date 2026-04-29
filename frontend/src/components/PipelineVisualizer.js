import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Search, Activity, UserCheck, Lock } from 'lucide-react';
import './PipelineVisualizer.css';

const GOVERNANCE_STAGES = [
  { id: 'analysis', label: 'Semantic Analysis', icon: Search },
  { id: 'risk', label: 'Risk Assessment', icon: Activity },
  { id: 'adversarial', label: 'Adversarial Defense', icon: Lock },
  { id: 'governance', label: 'Policy Governance', icon: Shield },
  { id: 'explanation', label: 'Reasoning Engine', icon: Zap }
];

const PROBLEM_SOLVING_STAGES = [
  { id: 'decompose', label: 'Task Decomposition', icon: Search },
  { id: 'research', label: 'Knowledge Retrieval', icon: Activity },
  { id: 'execution', label: 'Solution Generation', icon: Zap },
  { id: 'validation', label: 'Quality Assurance', icon: UserCheck }
];

const PipelineVisualizer = ({ mode }) => {
  const [activeStage, setActiveStage] = useState(0);
  const stages = mode === 'governance' ? GOVERNANCE_STAGES : PROBLEM_SOLVING_STAGES;

  useEffect(() => {
    const stageDuration = 2500; // Simulated time per agent
    const interval = setInterval(() => {
      setActiveStage(prev => (prev < stages.length - 1 ? prev + 1 : prev));
    }, stageDuration);
    
    return () => clearInterval(interval);
  }, [stages.length]);

  return (
    <div className="pipeline-container">
      {/* Background Glow */}
      <div className="pipeline-glow-bg" />
      
      <div className="pipeline-header">
        <h3 className="pipeline-title">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Zap />
          </motion.div>
          Live Agent Orchestration
        </h3>
        <p className="pipeline-subtitle">
          {mode === 'governance' ? 'Analyzing risk vectors...' : 'Synthesizing solution...'}
        </p>
      </div>

      <div className="pipeline-track-wrapper">
        {/* Connecting Lines */}
        <div className="pipeline-bg-line" />
        <div 
          className="pipeline-active-line"
          style={{ width: `calc(${(activeStage / (stages.length - 1)) * 100}% - 20px)` }}
        />

        {stages.map((stage, idx) => {
          const isActive = idx === activeStage;
          const isPast = idx < activeStage;
          const Icon = stage.icon;

          return (
            <div key={stage.id} className="pipeline-stage">
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.2 : 1,
                  backgroundColor: isPast ? '#3b82f6' : isActive ? '#1e40af' : '#1e293b',
                  borderColor: isActive ? '#60a5fa' : isPast ? '#3b82f6' : '#334155',
                }}
                className="pipeline-icon-circle"
                style={{
                  boxShadow: isActive ? '0 10px 15px -3px rgba(59, 130, 246, 0.5)' : 'none'
                }}
              >
                <Icon 
                  style={{ color: isPast || isActive ? '#ffffff' : '#64748b' }}
                />
              </motion.div>
              
              <span 
                className="pipeline-label"
                style={{ color: isActive ? '#60a5fa' : isPast ? '#cbd5e1' : '#64748b' }}
              >
                {stage.label}
              </span>

              {isActive && (
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pipeline-processing-badge"
                >
                  Processing...
                </motion.span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PipelineVisualizer;
