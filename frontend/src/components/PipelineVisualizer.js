import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Search, Activity, UserCheck, Lock } from 'lucide-react';

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
    <div className="w-full max-w-4xl mx-auto my-8 p-8 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 pointer-events-none" />
      
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-slate-100 flex items-center justify-center gap-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Zap className="w-5 h-5 text-blue-400" />
          </motion.div>
          Live Agent Orchestration
        </h3>
        <p className="text-slate-400 text-sm mt-2">
          {mode === 'governance' ? 'Analyzing risk vectors...' : 'Synthesizing solution...'}
        </p>
      </div>

      <div className="relative flex justify-between items-center px-4">
        {/* Connecting Lines */}
        <div className="absolute left-10 right-10 top-6 h-1 bg-slate-800 -z-10" />
        <div 
          className="absolute left-10 top-6 h-1 bg-blue-500 -z-10 transition-all duration-1000 ease-in-out"
          style={{ width: `calc(${(activeStage / (stages.length - 1)) * 100}% - 20px)` }}
        />

        {stages.map((stage, idx) => {
          const isActive = idx === activeStage;
          const isPast = idx < activeStage;
          const Icon = stage.icon;

          return (
            <div key={stage.id} className="flex flex-col items-center relative z-10 w-24">
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.2 : 1,
                  backgroundColor: isPast ? '#3b82f6' : isActive ? '#1e40af' : '#1e293b',
                  borderColor: isActive ? '#60a5fa' : isPast ? '#3b82f6' : '#334155',
                }}
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-lg mb-3
                  ${isActive ? 'shadow-blue-500/50' : ''}`}
              >
                <Icon 
                  className={`w-5 h-5 ${isPast || isActive ? 'text-white' : 'text-slate-500'}`} 
                />
              </motion.div>
              
              <span className={`text-xs font-semibold text-center leading-tight
                ${isActive ? 'text-blue-400' : isPast ? 'text-slate-300' : 'text-slate-500'}`}
              >
                {stage.label}
              </span>

              {isActive && (
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-6 text-[10px] text-blue-400 font-medium whitespace-nowrap bg-blue-900/30 px-2 py-0.5 rounded-full"
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
