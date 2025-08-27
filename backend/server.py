import os
import json
import asyncio
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from emergentintegrations.llm.chat import LlmChat, UserMessage
import aiohttp
import time

# Load environment variables
load_dotenv()

app = FastAPI(title="RAIDMASTER Multi-AI API", version="2.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (replace with database in production)
raid_items_db = []
ai_providers_db = []
upload_files_db = []

# Models
class RAIDItem(BaseModel):
    id: Optional[str] = None
    type: str  # Risk, Assumption, Issue, Dependency
    title: str
    description: str
    status: str
    priority: str
    impact: str  # Low, Medium, High, Critical
    likelihood: str  # Low, Medium, High
    severityScore: Optional[int] = None
    workstream: str
    owner: str
    dueDate: Optional[str] = None
    targetDate: Optional[str] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None
    history: Optional[List[Dict[str, Any]]] = []
    ai: Optional[Dict[str, Any]] = None
    attachments: Optional[List[str]] = []
    governanceTags: Optional[List[str]] = []
    references: Optional[List[str]] = []

class RAIDItemCreate(BaseModel):
    type: str
    title: str
    description: str
    status: str = "Open"
    priority: str = "P2"
    impact: str = "Medium"
    likelihood: str = "Medium"
    workstream: str
    owner: str
    dueDate: Optional[str] = None
    targetDate: Optional[str] = None
    governanceTags: Optional[List[str]] = []
    references: Optional[List[str]] = []

class RAIDItemUpdate(BaseModel):
    type: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    impact: Optional[str] = None
    likelihood: Optional[str] = None
    workstream: Optional[str] = None
    owner: Optional[str] = None
    dueDate: Optional[str] = None
    targetDate: Optional[str] = None
    governanceTags: Optional[List[str]] = None
    references: Optional[List[str]] = None
    ai: Optional[Dict[str, Any]] = None

class AIProvider(BaseModel):
    id: str
    name: str
    provider: str  # "openai", "anthropic", "gemini"
    model: str
    api_key: str
    enabled: bool = True
    created_at: Optional[str] = None
    last_validated: Optional[str] = None
    status: Optional[str] = "unknown"  # "active", "invalid", "error", "unknown"

class AIAnalysisRequest(BaseModel):
    item: RAIDItem
    analysisType: str = "analysis"  # "analysis" or "validation"
    provider_id: Optional[str] = None  # If None, use default/best available

class AIValidationRequest(BaseModel):
    provider: AIProvider
    test_prompt: Optional[str] = "Hello, this is a test. Please respond with 'API connection successful.'"

class AIValidationResponse(BaseModel):
    valid: bool
    status: str
    message: str
    response_time: Optional[float] = None
    model_info: Optional[Dict[str, Any]] = None

class AIAnalysisResponse(BaseModel):
    analysis: str
    suggestedPriority: str
    suggestedStatus: Optional[str] = None
    confidence: float
    flags: List[Dict[str, Any]]
    provider_used: str
    response_time: float

# AI Provider Management
class MultiAIManager:
    def __init__(self):
        self.providers: Dict[str, AIProvider] = {}
        self.load_default_providers()
    
    def load_default_providers(self):
        """Load default providers from environment variables"""
        emergent_key = os.getenv("EMERGENT_LLM_KEY")
        if emergent_key:
            # Add Emergent providers as defaults
            default_providers = [
                AIProvider(
                    id="openai_gpt5",
                    name="OpenAI GPT-5",
                    provider="openai",
                    model="gpt-5",
                    api_key=emergent_key,
                    enabled=True,
                    status="unknown"
                ),
                AIProvider(
                    id="claude_opus4",
                    name="Claude Opus 4.1",
                    provider="anthropic", 
                    model="claude-4-opus-20250514",
                    api_key=emergent_key,
                    enabled=True,
                    status="unknown"
                ),
                AIProvider(
                    id="gemini_25",
                    name="Gemini 2.5 Pro",
                    provider="gemini",
                    model="gemini-2.5-pro",
                    api_key=emergent_key,
                    enabled=True,
                    status="unknown"
                )
            ]
            
            for provider in default_providers:
                self.providers[provider.id] = provider
    
    async def validate_provider(self, provider: AIProvider) -> AIValidationResponse:
        """Validate an AI provider's API key and model"""
        start_time = time.time()
        
        try:
            # Create LLM chat instance
            chat = LlmChat(
                api_key=provider.api_key,
                session_id=f"validation-{provider.id}-{int(time.time())}",
                system_message="You are a helpful AI assistant for API validation."
            ).with_model(provider.provider, provider.model)
            
            # Test with a simple message
            test_message = UserMessage(text="Please respond with exactly: 'API connection successful'")
            response = await chat.send_message(test_message)
            
            response_time = time.time() - start_time
            
            if "API connection successful" in response or "successful" in response.lower():
                # Update provider status
                provider.status = "active"
                provider.last_validated = time.strftime('%Y-%m-%d %H:%M:%S')
                
                return AIValidationResponse(
                    valid=True,
                    status="active",
                    message="API key and model validated successfully",
                    response_time=round(response_time, 2),
                    model_info={
                        "provider": provider.provider,
                        "model": provider.model,
                        "response_length": len(response)
                    }
                )
            else:
                provider.status = "error"
                return AIValidationResponse(
                    valid=False,
                    status="error",
                    message="Unexpected response from API",
                    response_time=round(response_time, 2)
                )
                
        except Exception as e:
            provider.status = "invalid"
            error_msg = str(e)
            
            # Classify error types
            if "unauthorized" in error_msg.lower() or "invalid" in error_msg.lower():
                status = "invalid_key"
                message = "Invalid API key"
            elif "not found" in error_msg.lower() or "model" in error_msg.lower():
                status = "invalid_model"
                message = f"Model '{provider.model}' not found or not accessible"
            else:
                status = "connection_error"
                message = f"Connection failed: {error_msg[:100]}"
            
            return AIValidationResponse(
                valid=False,
                status=status,
                message=message,
                response_time=round(time.time() - start_time, 2)
            )
    
    async def analyze_with_provider(self, item: RAIDItem, provider: AIProvider, analysis_type: str = "analysis") -> AIAnalysisResponse:
        """Analyze RAID item using specific provider"""
        start_time = time.time()
        
        try:
            # Create LLM chat instance
            chat = LlmChat(
                api_key=provider.api_key,
                session_id=f"raid-analysis-{item.id}-{int(time.time())}",
                system_message=self._get_system_message(analysis_type)
            ).with_model(provider.provider, provider.model)
            
            # Build analysis prompt
            prompt = self._build_analysis_prompt(item, analysis_type)
            
            # Send message
            user_message = UserMessage(text=prompt)
            response = await chat.send_message(user_message)
            
            response_time = time.time() - start_time
            
            # Parse response
            analysis_result = self._parse_ai_response(response, analysis_type)
            
            return AIAnalysisResponse(
                analysis=analysis_result.analysis,
                suggestedPriority=analysis_result.suggestedPriority,
                suggestedStatus=analysis_result.suggestedStatus,
                confidence=analysis_result.confidence,
                flags=analysis_result.flags,
                provider_used=f"{provider.name} ({provider.model})",
                response_time=round(response_time, 2)
            )
            
        except Exception as e:
            # Return fallback response on error
            return AIAnalysisResponse(
                analysis=f"Analysis failed with {provider.name}: {str(e)[:100]}",
                suggestedPriority=item.priority,
                suggestedStatus=item.status,
                confidence=0.0,
                flags=[{
                    "code": "PROVIDER_ERROR",
                    "message": f"Error using {provider.name}: {str(e)[:50]}",
                    "severity": "high"
                }],
                provider_used=f"{provider.name} (Error)",
                response_time=round(time.time() - start_time, 2)
            )
    
    async def get_best_provider(self) -> Optional[AIProvider]:
        """Get the best available provider (active and fastest)"""
        active_providers = [p for p in self.providers.values() if p.enabled and p.status == "active"]
        if not active_providers:
            return None
        
        # Return first active provider (could be enhanced with performance metrics)
        return active_providers[0]
    
    def _get_system_message(self, analysis_type: str) -> str:
        """Get system message based on analysis type"""
        if analysis_type == "validation":
            return """You are an expert RAID (Risks, Assumptions, Issues, Dependencies) data quality validator. 
            Your job is to validate RAID items for completeness, clarity, and data quality issues.
            Focus on identifying missing information, ambiguous language, and inconsistencies."""
        else:
            return """You are an expert RAID (Risks, Assumptions, Issues, Dependencies) analyst. 
            Analyze items carefully and provide clear, actionable recommendations for priority and status.
            Consider impact, likelihood, and business context in your analysis."""
    
    def _build_analysis_prompt(self, item: RAIDItem, analysis_type: str) -> str:
        """Build analysis prompt"""
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
    
    def _parse_ai_response(self, response: str, analysis_type: str):
        """Parse AI response into structured format"""
        try:
            # Extract JSON from response
            start = response.find('{')
            end = response.rfind('}') + 1
            
            if start >= 0 and end > start:
                json_str = response[start:end]
                data = json.loads(json_str)
                
                class ParsedResponse:
                    def __init__(self, data):
                        self.analysis = data.get("analysis", "Analysis completed")
                        self.suggestedPriority = data.get("suggestedPriority", "P2")
                        self.suggestedStatus = data.get("suggestedStatus")
                        self.confidence = float(data.get("confidence", 0.75))
                        self.flags = data.get("flags", [])
                
                return ParsedResponse(data)
            else:
                # Fallback parsing
                class FallbackResponse:
                    def __init__(self, response_text):
                        self.analysis = response_text[:200] + "..." if len(response_text) > 200 else response_text
                        self.suggestedPriority = "P2"
                        self.suggestedStatus = None
                        self.confidence = 0.5
                        self.flags = []
                
                return FallbackResponse(response)
                
        except Exception as e:
            class ErrorResponse:
                def __init__(self, error):
                    self.analysis = f"Error parsing response: {str(error)}"
                    self.suggestedPriority = "P2"
                    self.suggestedStatus = None
                    self.confidence = 0.0
                    self.flags = [{"code": "PARSE_ERROR", "message": str(error), "severity": "medium"}]
            
            return ErrorResponse(e)

# Initialize AI Manager
ai_manager = MultiAIManager()

# API Endpoints
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy", 
        "service": "RAIDMASTER Multi-AI API",
        "providers_count": len(ai_manager.providers),
        "active_providers": len([p for p in ai_manager.providers.values() if p.status == "active"])
    }

@app.get("/api/ai/providers")
async def get_providers():
    """Get all AI providers"""
    providers_list = []
    for provider in ai_manager.providers.values():
        # Don't expose the full API key, just show masked version
        masked_key = provider.api_key[:8] + "..." + provider.api_key[-4:] if provider.api_key else "Not set"
        providers_list.append({
            "id": provider.id,
            "name": provider.name,
            "provider": provider.provider,
            "model": provider.model,
            "api_key_masked": masked_key,
            "enabled": provider.enabled,
            "status": provider.status,
            "last_validated": provider.last_validated,
            "created_at": provider.created_at
        })
    
    return {"providers": providers_list}

@app.post("/api/ai/providers")
async def add_provider(provider: AIProvider):
    """Add new AI provider"""
    # Generate ID if not provided
    if not provider.id:
        provider.id = f"{provider.provider}_{provider.model}_{int(time.time())}"
    
    # Set creation time
    provider.created_at = time.strftime('%Y-%m-%d %H:%M:%S')
    
    # Add to manager
    ai_manager.providers[provider.id] = provider
    
    return {"message": "Provider added successfully", "provider_id": provider.id}

@app.put("/api/ai/providers/{provider_id}")
async def update_provider(provider_id: str, updated_provider: AIProvider):
    """Update existing AI provider"""
    if provider_id not in ai_manager.providers:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    # Preserve original creation time and ID
    original_provider = ai_manager.providers[provider_id]
    updated_provider.id = provider_id
    updated_provider.created_at = original_provider.created_at
    
    # Update provider
    ai_manager.providers[provider_id] = updated_provider
    
    return {"message": "Provider updated successfully"}

@app.delete("/api/ai/providers/{provider_id}")
async def delete_provider(provider_id: str):
    """Delete AI provider"""
    if provider_id not in ai_manager.providers:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    del ai_manager.providers[provider_id]
    return {"message": "Provider deleted successfully"}

@app.post("/api/ai/providers/{provider_id}/validate")
async def validate_provider(provider_id: str):
    """Validate specific AI provider"""
    if provider_id not in ai_manager.providers:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    provider = ai_manager.providers[provider_id]
    validation_result = await ai_manager.validate_provider(provider)
    
    return validation_result

@app.post("/api/ai/providers/validate-all")
async def validate_all_providers(background_tasks: BackgroundTasks):
    """Validate all enabled providers in background"""
    enabled_providers = [p for p in ai_manager.providers.values() if p.enabled]
    
    async def validate_all():
        for provider in enabled_providers:
            await ai_manager.validate_provider(provider)
    
    background_tasks.add_task(validate_all)
    
    return {
        "message": f"Validation started for {len(enabled_providers)} providers",
        "providers_count": len(enabled_providers)
    }

@app.post("/api/analyze", response_model=AIAnalysisResponse)
async def analyze_item(request: AIAnalysisRequest):
    """Analyze RAID item with AI"""
    try:
        # Use specific provider or get best available
        if request.provider_id:
            if request.provider_id not in ai_manager.providers:
                raise HTTPException(status_code=404, detail="Provider not found")
            provider = ai_manager.providers[request.provider_id]
        else:
            provider = await ai_manager.get_best_provider()
            if not provider:
                raise HTTPException(status_code=503, detail="No active AI providers available")
        
        # Perform analysis
        result = await ai_manager.analyze_with_provider(request.item, provider, request.analysisType)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze/multi")
async def analyze_multi_provider(request: AIAnalysisRequest):
    """Analyze item using multiple providers for comparison"""
    active_providers = [p for p in ai_manager.providers.values() if p.enabled and p.status == "active"]
    
    if not active_providers:
        raise HTTPException(status_code=503, detail="No active providers available")
    
    # Analyze with up to 3 providers concurrently
    tasks = []
    for provider in active_providers[:3]:
        task = ai_manager.analyze_with_provider(request.item, provider, request.analysisType)
        tasks.append(task)
    
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # Filter successful results
    successful_results = [r for r in results if isinstance(r, AIAnalysisResponse)]
    
    return {
        "results": successful_results,
        "providers_used": len(successful_results),
        "consensus": {
            "average_confidence": sum(r.confidence for r in successful_results) / len(successful_results) if successful_results else 0,
            "most_common_priority": max(set(r.suggestedPriority for r in successful_results), key=[r.suggestedPriority for r in successful_results].count) if successful_results else "P2"
        }
    }

@app.get("/api/ai/models")
async def get_available_models():
    """Get list of available models for each provider"""
    return {
        "openai": [
            "gpt-5", "gpt-5-mini", "gpt-4o", "gpt-4o-mini", 
            "gpt-4", "o1", "o1-mini", "o3", "o3-mini"
        ],
        "anthropic": [
            "claude-4-opus-20250514", "claude-4-sonnet-20250514",
            "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022", 
            "claude-3-5-haiku-20241022"
        ],
        "gemini": [
            "gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.0-flash", 
            "gemini-2.0-flash-lite", "gemini-1.5-pro", "gemini-1.5-flash"
        ]
    }

# ============================================================================
# RAID ITEMS CRUD ENDPOINTS
# ============================================================================

def calculate_severity_score(impact: str, likelihood: str) -> int:
    """Calculate severity score based on impact and likelihood"""
    impact_scores = {"Low": 1, "Medium": 2, "High": 3, "Critical": 4}
    likelihood_scores = {"Low": 1, "Medium": 2, "High": 3}
    
    impact_val = impact_scores.get(impact, 2)
    likelihood_val = likelihood_scores.get(likelihood, 2)
    
    return impact_val * likelihood_val

def add_history_entry(item: RAIDItem, action: str, actor: str = "System", note: str = ""):
    """Add history entry to RAID item"""
    if not item.history:
        item.history = []
    
    entry = {
        "id": str(uuid.uuid4()),
        "timestamp": datetime.utcnow().isoformat(),
        "action": action,
        "actor": actor,
        "note": note
    }
    item.history.append(entry)

@app.get("/api/raid-items")
async def get_raid_items():
    """Get all RAID items"""
    return {
        "items": raid_items_db,
        "total": len(raid_items_db)
    }

@app.get("/api/raid-items/{item_id}")
async def get_raid_item(item_id: str):
    """Get specific RAID item by ID"""
    item = next((item for item in raid_items_db if item["id"] == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="RAID item not found")
    return item

@app.post("/api/raid-items")
async def create_raid_item(item_data: RAIDItemCreate):
    """Create new RAID item"""
    # Generate ID and timestamps
    item_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    
    # Calculate severity score
    severity_score = calculate_severity_score(item_data.impact, item_data.likelihood)
    
    # Create new item
    new_item = RAIDItem(
        id=item_id,
        **item_data.dict(),
        severityScore=severity_score,
        createdAt=now,
        updatedAt=now,
        history=[],
        ai=None,
        attachments=[]
    )
    
    # Add creation history entry
    add_history_entry(new_item, "Item Created", "User")
    
    # Convert to dict and store
    item_dict = new_item.dict()
    raid_items_db.append(item_dict)
    
    return {
        "message": "RAID item created successfully",
        "item": item_dict
    }

@app.put("/api/raid-items/{item_id}")
async def update_raid_item(item_id: str, updates: RAIDItemUpdate):
    """Update existing RAID item"""
    # Find item
    item_index = next((i for i, item in enumerate(raid_items_db) if item["id"] == item_id), None)
    if item_index is None:
        raise HTTPException(status_code=404, detail="RAID item not found")
    
    current_item = raid_items_db[item_index]
    
    # Apply updates
    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    
    # Recalculate severity score if impact/likelihood changed
    if "impact" in update_data or "likelihood" in update_data:
        impact = update_data.get("impact", current_item.get("impact", "Medium"))
        likelihood = update_data.get("likelihood", current_item.get("likelihood", "Medium"))
        update_data["severityScore"] = calculate_severity_score(impact, likelihood)
    
    # Update timestamp
    update_data["updatedAt"] = datetime.utcnow().isoformat()
    
    # Update item
    current_item.update(update_data)
    
    # Add history entry for significant changes
    if any(k in update_data for k in ["status", "priority", "owner", "dueDate"]):
        changed_fields = [k for k in ["status", "priority", "owner", "dueDate"] if k in update_data]
        note = f"Updated: {', '.join(changed_fields)}"
        
        if not current_item.get("history"):
            current_item["history"] = []
        
        history_entry = {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat(),
            "action": "Item Updated",
            "actor": "User",
            "note": note
        }
        current_item["history"].append(history_entry)
    
    return {
        "message": "RAID item updated successfully",
        "item": current_item
    }

@app.delete("/api/raid-items/{item_id}")
async def delete_raid_item(item_id: str):
    """Delete RAID item"""
    item_index = next((i for i, item in enumerate(raid_items_db) if item["id"] == item_id), None)
    if item_index is None:
        raise HTTPException(status_code=404, detail="RAID item not found")
    
    deleted_item = raid_items_db.pop(item_index)
    
    return {
        "message": "RAID item deleted successfully",
        "deleted_item": deleted_item
    }

@app.get("/api/raid-items/stats/dashboard")
async def get_dashboard_stats():
    """Get dashboard statistics"""
    if not raid_items_db:
        return {
            "total": 0,
            "by_type": {"Risk": 0, "Issue": 0, "Assumption": 0, "Dependency": 0},
            "by_status": {},
            "by_priority": {},
            "recent_activity": 0,
            "overdue": 0
        }
    
    # Calculate statistics
    total = len(raid_items_db)
    
    by_type = {"Risk": 0, "Issue": 0, "Assumption": 0, "Dependency": 0}
    by_status = {}
    by_priority = {}
    
    for item in raid_items_db:
        # Count by type
        item_type = item.get("type", "Risk")
        if item_type in by_type:
            by_type[item_type] += 1
        
        # Count by status
        status = item.get("status", "Open")
        by_status[status] = by_status.get(status, 0) + 1
        
        # Count by priority
        priority = item.get("priority", "P2")
        by_priority[priority] = by_priority.get(priority, 0) + 1
    
    # Count recent activity (items updated in last 7 days)
    from datetime import datetime, timedelta
    week_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
    recent_activity = sum(1 for item in raid_items_db 
                         if item.get("updatedAt", "") > week_ago)
    
    # Count overdue items
    today = datetime.utcnow().isoformat()[:10]  # YYYY-MM-DD format
    overdue = sum(1 for item in raid_items_db 
                  if item.get("dueDate") and item.get("dueDate") < today 
                  and item.get("status") not in ["Closed", "Resolved"])
    
    return {
        "total": total,
        "by_type": by_type,
        "by_status": by_status,
        "by_priority": by_priority,
        "recent_activity": recent_activity,
        "overdue": overdue,
        "active_items": sum(1 for item in raid_items_db 
                           if item.get("status") in ["Open", "In Progress", "Mitigating"])
    }

# ============================================================================
# FILE UPLOAD ENDPOINTS
# ============================================================================

from fastapi import UploadFile, File
from fastapi.responses import FileResponse
import shutil

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload file for processing"""
    try:
        # Create uploads directory if it doesn't exist
        upload_dir = "/app/uploads"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        file_id = str(uuid.uuid4())
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{file_id}{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Store file metadata
        file_metadata = {
            "id": file_id,
            "original_name": file.filename,
            "filename": unique_filename,
            "path": file_path,
            "size": os.path.getsize(file_path),
            "content_type": file.content_type,
            "uploaded_at": datetime.utcnow().isoformat()
        }
        
        upload_files_db.append(file_metadata)
        
        return {
            "message": "File uploaded successfully",
            "file": file_metadata
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.get("/api/upload/{file_id}")
async def get_uploaded_file(file_id: str):
    """Get uploaded file by ID"""
    file_metadata = next((f for f in upload_files_db if f["id"] == file_id), None)
    if not file_metadata:
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        file_metadata["path"],
        filename=file_metadata["original_name"],
        media_type=file_metadata["content_type"]
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)