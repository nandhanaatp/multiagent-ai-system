from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from orchestration.orchestrator import Orchestrator
from database.database import engine, get_db, Base
from models import Query, Task, Response, Explanation

# Create FastAPI app
app = FastAPI()

# CORS configuration (important for React frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize orchestrator
orchestrator = Orchestrator()


# Input schema
class InputData(BaseModel):
    problem_description: str
    parameters: dict


# Main API endpoint
@app.post("/process")
def process_input(data: InputData, db: Session = Depends(get_db)):

    # 1️⃣ Store Query
    new_query = Query(
        user_id=1,
        query_text=data.problem_description,
        status="Processing"
    )
    db.add(new_query)
    db.commit()
    db.refresh(new_query)

    # 2️⃣ Run Multi-Agent Orchestrator
    result = orchestrator.process({
        "problem_description": data.problem_description,
        "parameters": data.parameters
    })

    # 3️⃣ Store Explanation
    explanation = Explanation(
        query_id=new_query.query_id,
        explanation_text=result["explanation"]
    )
    db.add(explanation)

    # 4️⃣ Store Tasks and Responses
    for agent_output in [
        result["analysis_output"],
        result["risk_output"],
        result["governance_output"]
    ]:

        task = Task(
            query_id=new_query.query_id,
            agent_id=1,
            task_description=agent_output["agent"],
            status="Completed"
        )

        db.add(task)
        db.commit()
        db.refresh(task)

        response = Response(
            task_id=task.task_id,
            response_text=str(agent_output)
        )

        db.add(response)

    db.commit()

    # 5️⃣ Return result to frontend
    return result