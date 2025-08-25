import os
import json
import asyncio
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from emergentintegrations.llm.chat import LlmChat, UserMessage

# Load environment variables
load_dotenv()

app = FastAPI(title="RAIDMASTER AI API", version="1.0.0")

# CORS middleware for React Native
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class RAIDItem(BaseModel):
    id: str
    type: str  # Risk, Assumption, Issue, Dependency
    title: str
    description: str
    status: str
    priority: str
    impact: str  # Low, Medium, High, Critical
    likelihood: str  # Low, Medium, High
    workstream: str
    owner: str
    dueDate: Optional[str] = None

class AIAnalysisRequest(BaseModel):
    item: RAIDItem
    analysisType: str  # "analysis" or "validation"

class AIAnalysisResponse(BaseModel):
    analysis: str
    suggestedPriority: str
    suggestedStatus: Optional[str] = None
    confidence: float
    flags: List[Dict[str, Any]]

class AIBatchRequest(BaseModel):
    items: List[RAIDItem]
    analysisType: str

class AIBatchResponse(BaseModel):
    results: List[Dict[str, Any]]

# AI Analysis Service
class RAIDAIService:
    def __init__(self):
        self.api_key = os.getenv("EMERGENT_LLM_KEY")
        if not self.api_key:
            raise Exception("EMERGENT_LLM_KEY not found in environment variables")
    
    async def analyze_item(self, item: RAIDItem, analysis_type: str = "analysis") -> AIAnalysisResponse:
        """Analyze a single RAID item using AI"""
        try:
            # Create LLM chat instance
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"raid-{item.id}",
                system_message=self._get_system_message(analysis_type)
            ).with_model("openai", "gpt-4o-mini")
            
            # Prepare the analysis prompt
            prompt = self._build_prompt(item, analysis_type)
            
            # Send message to AI
            user_message = UserMessage(text=prompt)
            response = await chat.send_message(user_message)
            
            # Parse AI response
            return self._parse_ai_response(response, analysis_type)
            
        except Exception as e:
            print(f"Error in AI analysis: {str(e)}")
            return self._get_fallback_response(item)
    
    async def batch_analyze(self, items: List[RAIDItem], analysis_type: str = "analysis") -> List[Dict[str, Any]]:
        """Analyze multiple RAID items in batch"""
        results = []
        
        # Analyze items concurrently (but limit concurrency to avoid rate limits)
        semaphore = asyncio.Semaphore(3)  # Max 3 concurrent requests
        
        async def analyze_with_semaphore(item):
            async with semaphore:
                analysis = await self.analyze_item(item, analysis_type)
                return {
                    "itemId": item.id,
                    "itemTitle": item.title,
                    "analysis": analysis.analysis,
                    "suggestedPriority": analysis.suggestedPriority,
                    "suggestedStatus": analysis.suggestedStatus,
                    "confidence": analysis.confidence,
                    "flags": analysis.flags
                }
        
        tasks = [analyze_with_semaphore(item) for item in items]
        results = await asyncio.gather(*tasks)
        
        return results
    
    def _get_system_message(self, analysis_type: str) -> str:
        """Get appropriate system message based on analysis type"""
        if analysis_type == "validation":
            return """You are an expert RAID (Risks, Assumptions, Issues, Dependencies) data quality validator. 
            Your job is to validate RAID items for completeness, clarity, and data quality issues.
            Focus on identifying missing information, ambiguous language, and inconsistencies."""
        else:
            return """You are an expert RAID (Risks, Assumptions, Issues, Dependencies) analyst. 
            Analyze items carefully and provide clear, actionable recommendations for priority and status.
            Consider impact, likelihood, and business context in your analysis."""
    
    def _build_prompt(self, item: RAIDItem, analysis_type: str) -> str:
        """Build analysis prompt for the AI"""
        item_context = f"""
RAID Item Analysis:
- Type: {item.type}
- Title: {item.title}
- Description: {item.description}
- Current Status: {item.status}
- Current Priority: {item.priority}
- Impact: {item.impact}
- Likelihood: {item.likelihood}
- Workstream: {item.workstream}
- Owner: {item.owner}
- Due Date: {item.dueDate or 'Not set'}
"""
        
        if analysis_type == "validation":
            return f"""{item_context}

Please validate this RAID item for data quality issues. Check for:
1. Completeness of required fields
2. Clarity and specificity of description
3. Alignment between impact/likelihood and priority
4. Appropriateness of status for item type
5. Any missing critical information

Respond in JSON format:
{{
    "analysis": "Brief validation summary",
    "suggestedPriority": "P0|P1|P2|P3",
    "confidence": 0.85,
    "flags": [
        {{"code": "FLAG_CODE", "message": "Issue description", "severity": "low|medium|high", "field": "fieldname"}}
    ]
}}"""
        else:
            return f"""{item_context}

Based on this information, provide an analysis with recommendations. Consider:
1. Is the priority appropriate given the impact and likelihood?
2. Is the status appropriate for this type of item?
3. Are there any recommendations for mitigation or next steps?
4. What insights can you provide about this item?

Respond in JSON format:
{{
    "analysis": "Your detailed analysis and insights (2-3 sentences)",
    "suggestedPriority": "P0|P1|P2|P3", 
    "suggestedStatus": "Proposed|Open|In Progress|Mitigating|Resolved|Closed|Archived",
    "confidence": 0.85,
    "flags": [
        {{"code": "FLAG_CODE", "message": "Any concerns or recommendations", "severity": "low|medium|high"}}
    ]
}}"""
    
    def _parse_ai_response(self, response: str, analysis_type: str) -> AIAnalysisResponse:
        """Parse AI response and extract structured data"""
        try:
            # Try to extract JSON from response
            start = response.find('{')
            end = response.rfind('}') + 1
            
            if start >= 0 and end > start:
                json_str = response[start:end]
                data = json.loads(json_str)
                
                return AIAnalysisResponse(
                    analysis=data.get("analysis", "Analysis completed"),
                    suggestedPriority=data.get("suggestedPriority", "P2"),
                    suggestedStatus=data.get("suggestedStatus"),
                    confidence=float(data.get("confidence", 0.75)),
                    flags=data.get("flags", [])
                )
            else:
                # Fallback if JSON parsing fails
                return AIAnalysisResponse(
                    analysis=response[:200] + "..." if len(response) > 200 else response,
                    suggestedPriority="P2",
                    confidence=0.5,
                    flags=[]
                )
                
        except Exception as e:
            print(f"Error parsing AI response: {str(e)}")
            return self._get_fallback_response_parsed(response)
    
    def _get_fallback_response(self, item: RAIDItem) -> AIAnalysisResponse:
        """Provide fallback response when AI analysis fails"""
        return AIAnalysisResponse(
            analysis=f"Unable to complete AI analysis for this {item.type}. Please review manually.",
            suggestedPriority=item.priority,
            confidence=0.0,
            flags=[{
                "code": "AI_ERROR",
                "message": "AI analysis service unavailable",
                "severity": "medium"
            }]
        )
    
    def _get_fallback_response_parsed(self, response: str) -> AIAnalysisResponse:
        """Fallback when response parsing fails"""
        return AIAnalysisResponse(
            analysis=response[:100] + "..." if len(response) > 100 else response,
            suggestedPriority="P2",
            confidence=0.5,
            flags=[{
                "code": "PARSE_ERROR",
                "message": "Unable to parse AI response format",
                "severity": "low"
            }]
        )

# Initialize AI service
ai_service = RAIDAIService()

# API Endpoints
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "RAIDMASTER AI API"}

@app.post("/api/analyze", response_model=AIAnalysisResponse)
async def analyze_item(request: AIAnalysisRequest):
    """Analyze a single RAID item with AI"""
    try:
        result = await ai_service.analyze_item(request.item, request.analysisType)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/batch-analyze", response_model=AIBatchResponse)
async def batch_analyze_items(request: AIBatchRequest):
    """Analyze multiple RAID items in batch"""
    try:
        results = await ai_service.batch_analyze(request.items, request.analysisType)
        return AIBatchResponse(results=results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/validate", response_model=AIAnalysisResponse)
async def validate_item(request: AIAnalysisRequest):
    """Validate a RAID item for data quality"""
    try:
        # Force validation type
        result = await ai_service.analyze_item(request.item, "validation")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ai/config")
async def get_ai_config():
    """Get current AI configuration"""
    return {
        "model": "gpt-4o-mini",
        "provider": "openai",
        "available": bool(ai_service.api_key)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)