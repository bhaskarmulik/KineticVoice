from fastapi import FastAPI, APIRouter, UploadFile, File, Header, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
from groq import Groq
import tempfile
import json


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Groq client setup
EMERGENT_LLM_KEY = os.getenv('EMERGENT_LLM_KEY', 'sk-emergent-94c85C89dDcC5A91fF')

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class Location(BaseModel):
    latitude: float
    longitude: float
    timestamp: int
    accuracy: Optional[float] = None

class Activity(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # walk, run
    status: str  # idle, active, paused, completed
    name: Optional[str] = None
    startTime: int
    endTime: Optional[int] = None
    duration: int  # seconds
    distance: float  # meters
    avgPace: Optional[float] = None  # min/km
    locations: List[Dict[str, Any]] = []
    aiInsight: Optional[str] = None
    createdAt: int

class ActivityCreate(BaseModel):
    type: str
    startTime: int
    locations: List[Dict[str, Any]] = []

class VoiceParseRequest(BaseModel):
    text: str
    context: str

class VoiceCommand(BaseModel):
    text: str
    intent: str
    confidence: float
    data: Optional[Dict[str, Any]] = None


# Activity Endpoints
@api_router.post("/activities", response_model=Activity)
async def create_activity(activity: ActivityCreate):
    """Create a new activity"""
    activity_dict = activity.dict()
    activity_obj = Activity(
        **activity_dict,
        status='active',
        duration=0,
        distance=0,
        createdAt=int(datetime.utcnow().timestamp() * 1000)
    )
    await db.activities.insert_one(activity_obj.dict())
    return activity_obj

@api_router.get("/activities", response_model=List[Activity])
async def get_activities(limit: int = 100):
    """Get all activities"""
    activities = await db.activities.find(
        {"status": "completed"}
    ).sort("createdAt", -1).limit(limit).to_list(limit)
    return [Activity(**activity) for activity in activities]

@api_router.get("/activities/{activity_id}", response_model=Activity)
async def get_activity(activity_id: str):
    """Get a specific activity"""
    activity = await db.activities.find_one({"id": activity_id})
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return Activity(**activity)

@api_router.put("/activities/{activity_id}", response_model=Activity)
async def update_activity(activity_id: str, activity: Activity):
    """Update an activity"""
    await db.activities.update_one(
        {"id": activity_id},
        {"$set": activity.dict()}
    )
    return activity

@api_router.delete("/activities/{activity_id}")
async def delete_activity(activity_id: str):
    """Delete an activity"""
    result = await db.activities.delete_one({"id": activity_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Activity not found")
    return {"message": "Activity deleted"}


# Voice Endpoints
@api_router.post("/voice/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    x_groq_key: Optional[str] = Header(None)
):
    """Transcribe audio using Groq Whisper"""
    try:
        # Use provided key or fallback to default
        api_key = x_groq_key or EMERGENT_LLM_KEY
        groq_client = Groq(api_key=api_key)
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.m4a') as tmp_file:
            content = await audio.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        # Transcribe audio
        with open(tmp_file_path, 'rb') as audio_file:
            transcription = groq_client.audio.transcriptions.create(
                file=audio_file,
                model="whisper-large-v3",
                response_format="text"
            )
        
        # Clean up temp file
        os.unlink(tmp_file_path)
        
        return {"text": transcription}
    
    except Exception as e:
        logging.error(f"Transcription error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")


@api_router.post("/voice/parse", response_model=VoiceCommand)
async def parse_voice_command(
    request: VoiceParseRequest,
    x_groq_key: Optional[str] = Header(None)
):
    """Parse voice command and extract intent"""
    try:
        # Use provided key or fallback to default
        api_key = x_groq_key or EMERGENT_LLM_KEY
        groq_client = Groq(api_key=api_key)
        
        system_prompt = """You are a fitness tracking assistant. Parse voice commands and extract the intent.
        
Valid intents:
- START_ACTIVITY: User wants to start tracking (walk or run)
- PAUSE_ACTIVITY: User wants to pause current tracking
- RESUME_ACTIVITY: User wants to resume paused tracking
- STOP_ACTIVITY: User wants to stop and save activity
- QUERY_STATUS: User is asking about their current progress
- MARK_SEGMENT: User wants to mark a specific segment (sprint, hill, etc.)
- UNKNOWN: Cannot determine intent

Respond with JSON only in this format:
{
  "intent": "INTENT_NAME",
  "confidence": 0.95,
  "data": {"activityType": "run"} // optional additional data
}

Current context: """ + request.context
        
        # Call Groq LLM
        completion = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.text}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=200
        )
        
        # Parse response
        response_text = completion.choices[0].message.content
        parsed = json.loads(response_text)
        
        return VoiceCommand(
            text=request.text,
            intent=parsed.get("intent", "UNKNOWN"),
            confidence=parsed.get("confidence", 0.0),
            data=parsed.get("data")
        )
    
    except Exception as e:
        logging.error(f"Command parsing error: {str(e)}")
        # Fallback to simple rule-based parsing
        return parse_command_fallback(request.text)


def parse_command_fallback(text: str) -> VoiceCommand:
    """Simple rule-based command parsing fallback"""
    text_lower = text.lower()
    
    if any(word in text_lower for word in ['start', 'begin', 'go']):
        activity_type = 'run' if 'run' in text_lower else 'walk'
        return VoiceCommand(
            text=text,
            intent='START_ACTIVITY',
            confidence=0.8,
            data={'activityType': activity_type}
        )
    elif any(word in text_lower for word in ['pause', 'hold', 'wait']):
        return VoiceCommand(
            text=text,
            intent='PAUSE_ACTIVITY',
            confidence=0.9,
            data=None
        )
    elif any(word in text_lower for word in ['resume', 'continue', 'restart']):
        return VoiceCommand(
            text=text,
            intent='RESUME_ACTIVITY',
            confidence=0.9,
            data=None
        )
    elif any(word in text_lower for word in ['stop', 'finish', 'done', 'end']):
        return VoiceCommand(
            text=text,
            intent='STOP_ACTIVITY',
            confidence=0.9,
            data=None
        )
    elif any(word in text_lower for word in ['how', 'status', 'progress', 'doing']):
        return VoiceCommand(
            text=text,
            intent='QUERY_STATUS',
            confidence=0.7,
            data=None
        )
    else:
        return VoiceCommand(
            text=text,
            intent='UNKNOWN',
            confidence=0.3,
            data=None
        )


@api_router.post("/activities/{activity_id}/insights")
async def generate_insights(
    activity_id: str,
    x_groq_key: Optional[str] = Header(None)
):
    """Generate AI insights for an activity"""
    try:
        # Get activity
        activity = await db.activities.find_one({"id": activity_id})
        if not activity:
            raise HTTPException(status_code=404, detail="Activity not found")
        
        # Use provided key or fallback to default
        api_key = x_groq_key or EMERGENT_LLM_KEY
        groq_client = Groq(api_key=api_key)
        
        # Create prompt
        distance_km = activity['distance'] / 1000
        duration_min = activity['duration'] / 60
        pace = activity.get('avgPace', 0)
        
        prompt = f"""Analyze this fitness activity and provide a brief, motivating insight:

Activity Type: {activity['type']}
Distance: {distance_km:.2f} km
Duration: {duration_min:.1f} minutes
Average Pace: {pace:.2f} min/km

Provide a 2-3 sentence insight that is encouraging and highlights performance."""
        
        # Generate insight
        completion = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a supportive fitness coach."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=150
        )
        
        insight = completion.choices[0].message.content
        
        # Update activity with insight
        await db.activities.update_one(
            {"id": activity_id},
            {"$set": {"aiInsight": insight}}
        )
        
        return {"insight": insight}
    
    except Exception as e:
        logging.error(f"Insight generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate insight: {str(e)}")


# Health check
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "kinetic-voice-api"}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
