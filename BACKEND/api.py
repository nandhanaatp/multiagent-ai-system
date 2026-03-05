from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from orchestration.orchestrator import Orchestrator

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = Orchestrator()


@app.post("/analyze")
async def analyze(request: Request):

    data = await request.json()

    input_data = {
        "problem_description": data.get("problem_description"),
        "parameters": data.get("parameters", {})
    }

    result = orchestrator.process(input_data)

    return result


@app.get("/")
def root():
    return {"message": "Explainable Multi-Agent AI Orchestration API is running"}
