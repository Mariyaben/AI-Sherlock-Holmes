import os
import google.generativeai as genai
from langchain.prompts import PromptTemplate
from datetime import datetime
import chromadb

from utils.config import Config
from utils.logger import get_logger
from services.retrieval import retrieve_documents
from services.memory_service import MemoryService

logger = get_logger(__name__)

class ChatService:
    """Service class for handling chat interactions with Sherlock Holmes AI."""
    
    def __init__(self):
        """Initialize the chat service."""
        self.config = Config()
        self.memory_service = MemoryService()
        self._initialize_chroma()
        self._initialize_gemini()
        self._load_sherlock_prompt()
    
    def _initialize_chroma(self):
        """Initialize ChromaDB client and collections."""
        try:
            self.chroma_client = chromadb.PersistentClient(path=self.config.CHROMA_DB_PATH)
            self.case_collection = self.chroma_client.get_or_create_collection("case_data")
            self.memory_collection = self.chroma_client.get_or_create_collection("chat_memory")
            logger.info("ChromaDB initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing ChromaDB: {str(e)}")
            raise
    
    def _initialize_gemini(self):
        """Initialize Google Gemini model."""
        try:
            genai.configure(api_key=self.config.GOOGLE_API_KEY)
            self.llm = genai.GenerativeModel(self.config.GEMINI_MODEL)
            logger.info("Google Gemini initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing Gemini: {str(e)}")
            raise
    
    def _load_sherlock_prompt(self):
        """Load the Sherlock Holmes prompt template."""
        try:
            prompt_file = "src/templates/sherlock_prompt.txt"
            with open(prompt_file, "r", encoding="utf-8") as file:
                sherlock_prompt_template = file.read()
            
            self.prompt_template = PromptTemplate(
                template=sherlock_prompt_template,
                input_variables=["query", "memory_context", "case_context", "session_context"]
            )
            logger.info("Sherlock prompt template loaded successfully")
        except Exception as e:
            logger.error(f"Error loading prompt template: {str(e)}")
            raise
    
    def get_case_collection(self):
        """Get the case collection for external access."""
        return self.case_collection
    
    def get_memory_collection(self):
        """Get the memory collection for external access."""
        return self.memory_collection
    
    def process_message(self, message, session_id, user_context=None):
        """Process a user message and return Sherlock's response."""
        try:
            logger.info(f"Processing message for session {session_id}")
            
            # Get relevant memory context
            memory_context = self.memory_service.retrieve_memory(
                session_id, message, limit=self.config.MEMORY_RETRIEVAL_LIMIT
            )
            
            # Get relevant case context
            case_context = retrieve_documents(
                self.case_collection, message, k=5
            )
            
            # Build session context
            session_context = self._build_session_context(session_id, user_context)
            
            # Generate the final prompt
            final_prompt = self.prompt_template.format(
                query=message,
                memory_context=memory_context,
                case_context="\n".join(case_context),
                session_context=session_context
            )
            
            # Generate response from Gemini
            response = self.llm.generate_content(final_prompt)
            response_text = response.text
            
            # Store the conversation in memory
            self.memory_service.store_conversation(
                session_id=session_id,
                user_message=message,
                assistant_response=response_text,
                context={
                    'case_context': case_context,
                    'memory_context': memory_context,
                    'timestamp': datetime.utcnow().isoformat()
                }
            )
            
            logger.info(f"Successfully processed message for session {session_id}")
            return response_text
            
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")
            raise
    
    def _build_session_context(self, session_id, user_context):
        """Build session-specific context information."""
        context_parts = []
        
        # Add session information
        context_parts.append(f"Session ID: {session_id}")
        
        # Add user context if provided
        if user_context:
            for key, value in user_context.items():
                context_parts.append(f"{key.title()}: {value}")
        
        # Add timestamp
        context_parts.append(f"Current Time: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}")
        
        return "\n".join(context_parts)
    
    def get_session_summary(self, session_id):
        """Get a summary of the conversation session."""
        try:
            return self.memory_service.get_session_summary(session_id)
        except Exception as e:
            logger.error(f"Error getting session summary: {str(e)}")
            return None
    
    def clear_session(self, session_id):
        """Clear all data for a specific session."""
        try:
            self.memory_service.clear_session(session_id)
            logger.info(f"Session {session_id} cleared successfully")
        except Exception as e:
            logger.error(f"Error clearing session: {str(e)}")
            raise
