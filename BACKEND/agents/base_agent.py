from abc import ABC, abstractmethod
from typing import Any, Dict

class BaseAgent(ABC):
    """
    Abstract base class for all AI agents.
    Enforces a common interface for initializing and executing agent logic.
    """
    
    @abstractmethod
    def analyze(self, problem_description: str, parameters: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Analyze the problem description and parameters to return a structured response.
        
        Args:
            problem_description (str): The text description of the issue.
            parameters (Dict[str, Any], optional): Additional contextual parameters.
            
        Returns:
            Dict[str, Any]: A dictionary containing the agent's findings, score, decision, and reasoning.
        """
        pass
