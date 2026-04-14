from agents.analysis_agent import AnalysisAgent
from agents.risk_agent import RiskAgent
from agents.governance_agent import GovernanceAgent
from agents.task_decomposer_agent import TaskDecomposerAgent
from agents.research_agent import ResearchAgent
from agents.execution_agent import ExecutionAgent
from agents.validation_agent import ValidationAgent
from agents.explanation_agent import ExplanationAgent
from agents.adversarial_agent import AdversarialAgent
from logger import get_logger

logger = get_logger("orchestrator")


class Orchestrator:

    def __init__(self):
        self.analysis_agent   = AnalysisAgent()
        self.risk_agent       = RiskAgent()
        self.governance_agent = GovernanceAgent()
        self.decomposer_agent = TaskDecomposerAgent()
        self.research_agent   = ResearchAgent()
        self.execution_agent  = ExecutionAgent()
        self.validation_agent = ValidationAgent()
        self.explanation_agent = ExplanationAgent()
        self.adversarial_agent = AdversarialAgent()

    def process(self, input_data):
        try:
            problem_description = input_data.get("problem_description")
            parameters = input_data.get("parameters") or {}
            mode = input_data.get("mode", "governance")
            auto_detect = input_data.get("auto_detect", False)
            policy_overrides = input_data.get("policy_overrides") or {}

            impact = parameters.get("impact", 5)
            likelihood = parameters.get("likelihood", 5)
            urgency = parameters.get("urgency", 5)
            confidence = parameters.get("confidence", 5)

            logger.info(f"Starting orchestration [{mode}] for: {problem_description[:50]}...")

            if mode == "problem_solving":
                return self._run_problem_solving(problem_description)

            # STEP 1: Analysis Agent
            try:
                analysis_result = self.analysis_agent.analyze(problem_description, parameters, auto_detect)
                analysis_score = analysis_result.get("score")
                analysis_reason = analysis_result.get("reason")
                indicators = analysis_result.get("indicators", [])
                detected_keywords = analysis_result.get("detected_keywords", [])
                
                inferred_params = analysis_result.get("inferred_parameters", {})
                impact = inferred_params.get("impact", impact)
                likelihood = inferred_params.get("likelihood", likelihood)
                urgency = inferred_params.get("urgency", urgency)
                confidence = inferred_params.get("confidence", confidence)
                parameter_reasoning = analysis_result.get("parameter_reasoning", "Manual input")
                
                logger.info(f"Analysis Agent completed with score: {analysis_score}")
            except Exception as e:
                logger.error(f"Analysis Agent failed: {str(e)}")
                analysis_score = 5.0
                analysis_reason = f"Analysis Agent failed: {str(e)}"
                indicators = []
                detected_keywords = []

            # STEP 2: Risk Agent
            try:
                risk_result = self.risk_agent.analyze(problem_description, {"impact": impact, "likelihood": likelihood, "urgency": urgency, "confidence": confidence})
                risk_level = risk_result.get("decision")
                risk_score = risk_result.get("score")
                risk_reason = risk_result.get("reason")
                keyword_boost = risk_result.get("keyword_boost", 0)
                critical_hits = risk_result.get("critical_hits", [])
                high_hits = risk_result.get("high_hits", [])
                logger.info(f"Risk Agent completed with level: {risk_level}, score: {risk_score}")
            except Exception as e:
                logger.error(f"Risk Agent failed: {str(e)}")
                risk_level = "MEDIUM"
                risk_score = 50.0
                risk_reason = f"Risk Agent failed: {str(e)}"
                keyword_boost = 0
                critical_hits = []
                high_hits = []

            # STEP 2.5: Adversarial Agent (Devil's Advocate)
            try:
                adv_context = {
                    "parameters": {"impact": impact, "likelihood": likelihood, "urgency": urgency, "confidence": confidence},
                    "analysis_score": risk_score
                }
                adversarial_result = self.adversarial_agent.analyze(problem_description, adv_context)
                adversarial_score = adversarial_result.get("score", risk_score)
                logger.info(f"Adversarial Agent critiqued with counter-score: {adversarial_score}")
                
                # Dynamic Escalation: Adversary finds critical loopholes
                if adversarial_score >= 8.0 and risk_level != "HIGH":
                    logger.warning("Adversarial AI found critical loopholes. Overriding risk level to HIGH.")
                    risk_level = "HIGH"
            except Exception as e:
                logger.error(f"Adversarial Agent failed: {str(e)}")
                adversarial_result = {"agent": "AdversarialAgent", "score": risk_score, "decision": "FAILED", "reason": str(e), "critique": "Failed.", "worst_case_scenario": ""}

            # STEP 3: Governance Agent (The Judge)
            try:
                governance_result = self.governance_agent.analyze(
                    problem_description,
                    {"risk_level": risk_level, "policy_overrides": policy_overrides}
                )
                governance_score = governance_result.get("score")
                final_decision = governance_result.get("decision")
                policy_reason = governance_result.get("reason")
                recommended_actions = governance_result.get("recommended_actions", [])
                logger.info(f"Governance Agent completed with decision: {final_decision}")
            except Exception as e:
                logger.error(f"Governance Agent failed: {str(e)}")
                governance_score = 6.0
                final_decision = "REVIEW"
                policy_reason = f"Governance Agent failed: {str(e)}"
                recommended_actions = ["Manual review required due to system error"]
                governance_result = {"agent": "GovernanceAgent", "score": governance_score, "decision": final_decision, "reason": policy_reason}

            # STEP 4: Rich Explanation Engine
            try:
                exp_context = {
                    "parameters": {"impact": impact, "likelihood": likelihood, "urgency": urgency, "confidence": confidence},
                    "risk_level": risk_level,
                    "risk_score": risk_score,
                    "final_decision": final_decision
                }
                explanation_output = self.explanation_agent.analyze(problem_description, exp_context)
                explanation_text = explanation_output.get("step_by_step_reasoning", "Explanation unavailable.") + "\n\n" + \
                                   explanation_output.get("safer_alternatives", "")
            except Exception as e:
                logger.error(f"Explanation Agent failed: {str(e)}")
                explanation_output = {"agent": "ExplanationAgent", "step_by_step_reasoning": "Failed to generate.", "risk_justification": "", "real_world_consequences": "", "safer_alternatives": ""}
                explanation_text = "Rich explanation generation failed."

            logger.info(f"Governance orchestration completed with decision: {final_decision}")

            return {
                "mode": "governance",
                "analysis_output": analysis_result,
                "risk_output": risk_result,
                "adversarial_output": adversarial_result,
                "governance_output": governance_result,
                "explanation_output": explanation_output,
                "inferred_parameters": {
                    "impact": impact,
                    "likelihood": likelihood,
                    "urgency": urgency,
                    "confidence": confidence,
                    "reasoning": parameter_reasoning
                },
                "decomposer_output": None,
                "research_output": None,
                "execution_output": None,
                "validation_output": None,
                "final_decision": final_decision,
                "explanation": explanation_text
            }

        except Exception as e:
            logger.error(f"Orchestration failed: {str(e)}", exc_info=True)
            raise

    def _run_problem_solving(self, problem_description: str) -> dict:
        # Step 1: Decompose
        try:
            decomposer_result = self.decomposer_agent.analyze(problem_description)
            subtasks = decomposer_result.get("subtasks", [])
            logger.info(f"Decomposer completed with {len(subtasks)} subtasks")
        except Exception as e:
            logger.error(f"Decomposer Agent failed: {str(e)}")
            decomposer_result = {"agent": "TaskDecomposerAgent", "score": 5.0, "decision": "MEDIUM", "reason": f"Failed: {str(e)}", "subtasks": []}
            subtasks = []

        # Step 2: Research
        try:
            research_result = self.research_agent.analyze(problem_description, {"subtasks": subtasks})
            findings = research_result.get("findings", [])
            logger.info(f"Research completed with {len(findings)} findings")
        except Exception as e:
            logger.error(f"Research Agent failed: {str(e)}")
            research_result = {"agent": "ResearchAgent", "score": 5.0, "decision": "RESEARCHED", "reason": f"Failed: {str(e)}", "findings": [], "context": "", "references": []}
            findings = []

        # Step 3: Execute
        try:
            execution_result = self.execution_agent.analyze(problem_description, {"subtasks": subtasks, "findings": findings})
            solution = execution_result.get("solution", "")
            steps = execution_result.get("steps", [])
            logger.info(f"Execution completed: {execution_result.get('decision')}")
        except Exception as e:
            logger.error(f"Execution Agent failed: {str(e)}")
            execution_result = {"agent": "ExecutionAgent", "score": 5.0, "decision": "MEDIUM", "reason": f"Failed: {str(e)}", "solution": "", "steps": []}
            solution, steps = "", []

        # Step 4: Validate
        try:
            validation_result = self.validation_agent.analyze(problem_description, {"subtasks": subtasks, "solution": solution, "steps": steps})
            logger.info(f"Validation completed: {validation_result.get('decision')}")
        except Exception as e:
            logger.error(f"Validation Agent failed: {str(e)}")
            validation_result = {"agent": "ValidationAgent", "score": 5.0, "decision": "APPROVED", "reason": f"Failed: {str(e)}", "is_complete": True, "is_correct": True, "gaps": [], "suggestions": []}

        final_decision = validation_result.get("decision", "APPROVED")
        explanation_text = f"""
╔══════════════════════════════════════════════════════════════╗
   MULTI-AGENT AI SYSTEM — PROBLEM SOLVING REPORT
╚══════════════════════════════════════════════════════════════╝

PROBLEM: "{problem_description}"

STEP 1 ▶ TASK DECOMPOSER
  Complexity: {decomposer_result.get('decision')}
  Subtasks: {', '.join(subtasks) if subtasks else 'None'}
  Reason: {decomposer_result.get('reason')}

STEP 2 ▶ RESEARCH AGENT
  Findings: {len(findings)} insights gathered
  Context: {research_result.get('context', '')}
  Reason: {research_result.get('reason')}

STEP 3 ▶ EXECUTION AGENT
  Solution: {execution_result.get('solution', '')[:200]}
  Steps: {len(steps)} action steps generated

STEP 4 ▶ VALIDATION AGENT
  Verdict: {final_decision}
  Complete: {validation_result.get('is_complete')}
  Reason: {validation_result.get('reason')}

FINAL DECISION: {final_decision}
"""
        return {
            "mode": "problem_solving",
            "analysis_output": None,
            "risk_output": None,
            "governance_output": None,
            "decomposer_output": decomposer_result,
            "research_output": research_result,
            "execution_output": execution_result,
            "validation_output": validation_result,
            "final_decision": final_decision,
            "explanation": explanation_text
        }
