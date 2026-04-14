import logging
import sys
from pathlib import Path

# Create logs directory if it doesn't exist
log_dir = Path("logs")
log_dir.mkdir(exist_ok=True)

# Configure logging format
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

# Create logger
logger = logging.getLogger("multi_agent_ai")
logger.setLevel(logging.INFO)

# Console handler
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.INFO)
console_formatter = logging.Formatter(LOG_FORMAT, DATE_FORMAT)
console_handler.setFormatter(console_formatter)

# File handler
file_handler = logging.FileHandler(log_dir / "app.log")
file_handler.setLevel(logging.INFO)
file_formatter = logging.Formatter(LOG_FORMAT, DATE_FORMAT)
file_handler.setFormatter(file_formatter)

# Error file handler
error_handler = logging.FileHandler(log_dir / "error.log")
error_handler.setLevel(logging.ERROR)
error_formatter = logging.Formatter(LOG_FORMAT, DATE_FORMAT)
error_handler.setFormatter(error_formatter)

# Add handlers
logger.addHandler(console_handler)
logger.addHandler(file_handler)
logger.addHandler(error_handler)

def get_logger(name: str = None):
    if name:
        return logging.getLogger(f"multi_agent_ai.{name}")
    return logger
