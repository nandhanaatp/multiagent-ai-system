from sqlalchemy import Column, Integer, String, Text, ForeignKey, DECIMAL, Float, TIMESTAMP
from sqlalchemy.orm import relationship
from database.database import Base

class Query(Base):
    __tablename__ = "queries"

    query_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    query_text = Column(Text)
    query_type = Column(String(50))
    status = Column(String(30))


class Task(Base):
    __tablename__ = "tasks"

    task_id = Column(Integer, primary_key=True, index=True)
    query_id = Column(Integer, ForeignKey("queries.query_id"))
    agent_id = Column(Integer)
    task_description = Column(Text)
    priority = Column(Integer)
    status = Column(String(30))


class Response(Base):
    __tablename__ = "responses"

    response_id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.task_id"))
    response_text = Column(Text)
    confidence_score = Column(DECIMAL)
    execution_time = Column(Float)


class Explanation(Base):
    __tablename__ = "explanations"

    explanation_id = Column(Integer, primary_key=True, index=True)
    query_id = Column(Integer, ForeignKey("queries.query_id"))
    explanation_text = Column(Text)