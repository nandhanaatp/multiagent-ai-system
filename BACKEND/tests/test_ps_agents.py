import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from unittest.mock import patch
from agents.task_decomposer_agent import TaskDecomposerAgent
from agents.research_agent import ResearchAgent
from agents.execution_agent import ExecutionAgent
from agents.validation_agent import ValidationAgent


# ── TaskDecomposerAgent ────────────────────────────────────────────────────────

class TestTaskDecomposerAgent:

    def setup_method(self):
        self.agent = TaskDecomposerAgent()
        self.problem = "Build a REST API for a todo application"

    def _mock_llm(self, complexity="MEDIUM", subtasks=None):
        return {
            "subtasks": subtasks or ["Design endpoints", "Implement logic", "Write tests"],
            "complexity": complexity,
            "reason": "Standard API development task"
        }

    def test_returns_required_keys(self):
        with patch.object(self.agent, "_call_llm", return_value=self._mock_llm()):
            result = self.agent.analyze(self.problem)
        for key in ["agent", "score", "decision", "reason", "subtasks"]:
            assert key in result

    def test_agent_name(self):
        with patch.object(self.agent, "_call_llm", return_value=self._mock_llm()):
            result = self.agent.analyze(self.problem)
        assert result["agent"] == "TaskDecomposerAgent"

    def test_low_complexity_score(self):
        with patch.object(self.agent, "_call_llm", return_value=self._mock_llm("LOW")):
            result = self.agent.analyze(self.problem)
        assert result["score"] == 3.0
        assert result["decision"] == "LOW"

    def test_medium_complexity_score(self):
        with patch.object(self.agent, "_call_llm", return_value=self._mock_llm("MEDIUM")):
            result = self.agent.analyze(self.problem)
        assert result["score"] == 6.0
        assert result["decision"] == "MEDIUM"

    def test_high_complexity_score(self):
        with patch.object(self.agent, "_call_llm", return_value=self._mock_llm("HIGH")):
            result = self.agent.analyze(self.problem)
        assert result["score"] == 9.0
        assert result["decision"] == "HIGH"

    def test_subtasks_returned(self):
        subtasks = ["Step A", "Step B", "Step C"]
        with patch.object(self.agent, "_call_llm", return_value=self._mock_llm(subtasks=subtasks)):
            result = self.agent.analyze(self.problem)
        assert result["subtasks"] == subtasks

    def test_empty_description_raises(self):
        with pytest.raises(ValueError):
            self.agent.analyze("")

    def test_whitespace_description_raises(self):
        with pytest.raises(ValueError):
            self.agent.analyze("   ")

    def test_unknown_complexity_defaults_to_medium_score(self):
        with patch.object(self.agent, "_call_llm", return_value=self._mock_llm("UNKNOWN")):
            result = self.agent.analyze(self.problem)
        assert result["score"] == 6.0


# ── ResearchAgent ──────────────────────────────────────────────────────────────

class TestResearchAgent:

    def setup_method(self):
        self.agent = ResearchAgent()
        self.problem = "How to optimize database query performance"

    def _mock_llm(self, findings=None):
        return {
            "findings": findings or ["Use indexes", "Avoid N+1 queries", "Cache results"],
            "context": "Database optimization is critical for scalable applications",
            "references": ["SQL indexing", "Query planning"],
            "reason": "Research completed successfully"
        }

    def test_returns_required_keys(self):
        with patch.object(self.agent, "_call_llm", return_value=self._mock_llm()):
            result = self.agent.analyze(self.problem)
        for key in ["agent", "score", "decision", "reason", "findings", "context", "references"]:
            assert key in result

    def test_agent_name(self):
        with patch.object(self.agent, "_call_llm", return_value=self._mock_llm()):
            result = self.agent.analyze(self.problem)
        assert result["agent"] == "ResearchAgent"

    def test_decision_always_researched(self):
        with patch.object(self.agent, "_call_llm", return_value=self._mock_llm()):
            result = self.agent.analyze(self.problem)
        assert result["decision"] == "RESEARCHED"

    def test_score_based_on_findings_count(self):
        with patch.object(self.agent, "_call_llm", return_value=self._mock_llm(findings=["f1", "f2"])):
            result = self.agent.analyze(self.problem)
        assert result["score"] == 4.0  # 2 findings * 2.0

    def test_score_capped_at_10(self):
        findings = ["f1", "f2", "f3", "f4", "f5", "f6"]  # 6 * 2 = 12 → capped at 10
        with patch.object(self.agent, "_call_llm", return_value=self._mock_llm(findings=findings)):
            result = self.agent.analyze(self.problem)
        assert result["score"] == 10.0

    def test_subtasks_passed_to_llm(self):
        subtasks = ["subtask1", "subtask2"]
        with patch.object(self.agent, "_call_llm", return_value=self._mock_llm()) as mock:
            self.agent.analyze(self.problem, {"subtasks": subtasks})
            mock.assert_called_once_with(self.problem, subtasks)

    def test_empty_description_raises(self):
        with pytest.raises(ValueError):
            self.agent.analyze("")

    def test_findings_and_context_returned(self):
        with patch.object(self.agent, "_call_llm", return_value=self._mock_llm()):
            result = self.agent.analyze(self.problem)
        assert len(result["findings"]) == 3
        assert "Database optimization" in result["context"]


# ── ExecutionAgent ─────────────────────────────────────────────────────────────

class TestExecutionAgent:

    def setup_method(self):
        self.agent = ExecutionAgent()
        self.problem = "Implement user authentication system"

    def _mock_llm(self, effort="MEDIUM", steps=None):
        return {
            "solution": "Implement JWT-based authentication with bcrypt password hashing",
            "steps": steps or ["Set up user model", "Hash passwords", "Generate JWT", "Add middleware"],
            "estimated_effort": effort,
            "reason": "Standard auth implementation"
        }

    def test_returns_required_keys(self):
        with patch.object(self.agent, "_call_llm", return_value=self._mock_llm()):
            result = self.agent.analyze(self.problem)
        for key in ["agent", "score", "decision", "reason", "solution", "steps"]:
            assert key in result

    def test_agent_name(self):
        with patch.object(self.agent, "_call_llm", return_value=self._mock_llm()):
            result = self.agent.analyze(self.problem)
        assert result["agent"] == "ExecutionAgent"

    def test_low_effort_score(self):
        with patch.object(self.agent, "_call_llm", return_value=self._mock_llm("LOW")):
            result = self.agent.analyze(self.problem)
        assert result["score"] == 3.0
        assert result["decision"] == "LOW"

    def test_medium_effort_score(self):
        with patch.object(self.agent, "_call_llm", return_value=self._mock_llm("MEDIUM")):
            result = self.agent.analyze(self.problem)
        assert result["score"] == 6.0
        assert result["decision"] == "MEDIUM"

    def test_high_effort_score(self):
        with patch.object(self.agent, "_call_llm", return_value=self._mock_llm("HIGH")):
            result = self.agent.analyze(self.problem)
        assert result["score"] == 9.0
        assert result["decision"] == "HIGH"

    def test_solution_and_steps_returned(self):
        steps = ["Step 1", "Step 2", "Step 3"]
        with patch.object(self.agent, "_call_llm", return_value=self._mock_llm(steps=steps)):
            result = self.agent.analyze(self.problem)
        assert "JWT" in result["solution"]
        assert result["steps"] == steps

    def test_subtasks_and_findings_passed_to_llm(self):
        params = {"subtasks": ["t1"], "findings": ["f1"]}
        with patch.object(self.agent, "_call_llm", return_value=self._mock_llm()) as mock:
            self.agent.analyze(self.problem, params)
            mock.assert_called_once_with(self.problem, ["t1"], ["f1"])

    def test_empty_description_raises(self):
        with pytest.raises(ValueError):
            self.agent.analyze("")

    def test_defaults_used_when_no_params(self):
        with patch.object(self.agent, "_call_llm", return_value=self._mock_llm()) as mock:
            self.agent.analyze(self.problem)
            mock.assert_called_once_with(self.problem, [self.problem], [])


# ── ValidationAgent ────────────────────────────────────────────────────────────

class TestValidationAgent:

    def setup_method(self):
        self.agent = ValidationAgent()
        self.problem = "Create a login system"
        self.params = {
            "subtasks": ["Design UI", "Implement backend"],
            "solution": "Use JWT tokens with bcrypt",
            "steps": ["Hash password", "Generate token", "Validate token"]
        }

    def _mock_llm(self, verdict="APPROVED", is_complete=True, is_correct=True,
                  gaps=None, suggestions=None, confidence=8.0):
        return {
            "is_complete": is_complete,
            "is_correct": is_correct,
            "gaps": gaps or [],
            "suggestions": suggestions or [],
            "confidence_score": confidence,
            "verdict": verdict,
            "reason": "Solution looks complete and correct"
        }

    def test_returns_required_keys(self):
        with patch.object(self.agent, "_call_llm", return_value=self._mock_llm()):
            result = self.agent.analyze(self.problem, self.params)
        for key in ["agent", "score", "decision", "reason", "is_complete", "is_correct", "gaps", "suggestions"]:
            assert key in result

    def test_agent_name(self):
        with patch.object(self.agent, "_call_llm", return_value=self._mock_llm()):
            result = self.agent.analyze(self.problem, self.params)
        assert result["agent"] == "ValidationAgent"

    def test_approved_verdict(self):
        with patch.object(self.agent, "_call_llm", return_value=self._mock_llm("APPROVED")):
            result = self.agent.analyze(self.problem, self.params)
        assert result["decision"] == "APPROVED"

    def test_needs_improvement_verdict(self):
        with patch.object(self.agent, "_call_llm", return_value=self._mock_llm(
            "NEEDS_IMPROVEMENT", gaps=["Missing error handling"], suggestions=["Add try/catch"]
        )):
            result = self.agent.analyze(self.problem, self.params)
        assert result["decision"] == "NEEDS_IMPROVEMENT"
        assert len(result["gaps"]) == 1
        assert len(result["suggestions"]) == 1

    def test_rejected_verdict(self):
        with patch.object(self.agent, "_call_llm", return_value=self._mock_llm(
            "REJECTED", is_complete=False, is_correct=False, confidence=2.0
        )):
            result = self.agent.analyze(self.problem, self.params)
        assert result["decision"] == "REJECTED"
        assert result["is_complete"] is False
        assert result["is_correct"] is False

    def test_score_is_confidence_score(self):
        with patch.object(self.agent, "_call_llm", return_value=self._mock_llm(confidence=9.5)):
            result = self.agent.analyze(self.problem, self.params)
        assert result["score"] == 9.5

    def test_empty_description_raises(self):
        with pytest.raises(ValueError):
            self.agent.analyze("")

    def test_params_passed_to_llm(self):
        with patch.object(self.agent, "_call_llm", return_value=self._mock_llm()) as mock:
            self.agent.analyze(self.problem, self.params)
            mock.assert_called_once_with(
                self.problem,
                self.params["subtasks"],
                self.params["solution"],
                self.params["steps"]
            )

    def test_gaps_and_suggestions_empty_when_approved(self):
        with patch.object(self.agent, "_call_llm", return_value=self._mock_llm("APPROVED")):
            result = self.agent.analyze(self.problem, self.params)
        assert result["gaps"] == []
        assert result["suggestions"] == []
