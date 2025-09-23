import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.utils import embedding_functions

from utils.config import Config
from utils.logger import get_logger

logger = get_logger(__name__)

class MemoryService:
    """Service for managing conversation memory and context."""
    
    def __init__(self):
        """Initialize the memory service."""
        self.config = Config()
        self.chroma_client = chromadb.PersistentClient(path=self.config.CHROMA_DB_PATH)
        self.memory_collection = self.chroma_client.get_or_create_collection(
            "chat_memory",
            metadata={"hnsw:space": "cosine"}
        )
        self.session_collection = self.chroma_client.get_or_create_collection(
            "session_data",
            metadata={"hnsw:space": "cosine"}
        )
    
    def store_conversation(self, session_id: str, user_message: str, 
                          assistant_response: str, context: Dict[str, Any] = None):
        """Store a conversation turn in memory."""
        try:
            # Create conversation record
            conversation_id = f"{session_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S_%f')}"
            
            conversation_data = {
                'session_id': session_id,
                'user_message': user_message,
                'assistant_response': assistant_response,
                'timestamp': datetime.utcnow().isoformat(),
                'context': json.dumps(context or {})
            }
            
            # Store in memory collection
            self.memory_collection.add(
                ids=[conversation_id],
                documents=[f"{user_message}\n{assistant_response}"],
                metadatas=[conversation_data]
            )
            
            # Update session summary
            self._update_session_summary(session_id, user_message, assistant_response)
            
            logger.info(f"Stored conversation for session {session_id}")
            
        except Exception as e:
            logger.error(f"Error storing conversation: {str(e)}")
            raise
    
    def retrieve_memory(self, session_id: str, query: str, limit: int = 5) -> str:
        """Retrieve relevant memory for a session and query."""
        try:
            # Get recent conversations for this session
            recent_results = self.memory_collection.get(
                where={"session_id": session_id},
                limit=limit,
                include=["metadatas", "documents"]
            )
            
            # Get semantically similar conversations across all sessions
            similar_results = self.memory_collection.query(
                query_texts=[query],
                n_results=limit,
                where={"session_id": {"$ne": session_id}}  # Exclude current session
            )
            
            # Combine and format results
            memory_contexts = []
            
            # Add recent conversations
            if recent_results.get('metadatas'):
                for metadata in recent_results['metadatas']:
                    memory_contexts.append(
                        f"Previous conversation: {metadata.get('user_message', '')} "
                        f"-> {metadata.get('assistant_response', '')}"
                    )
            
            # Add similar conversations
            if similar_results.get('metadatas') and len(similar_results['metadatas']) > 0:
                for metadata in similar_results['metadatas'][0]:
                    memory_contexts.append(
                        f"Similar case: {metadata.get('user_message', '')} "
                        f"-> {metadata.get('assistant_response', '')}"
                    )
            
            return "\n".join(memory_contexts[:limit])
            
        except Exception as e:
            logger.error(f"Error retrieving memory: {str(e)}")
            return ""
    
    def get_chat_history(self, session_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get chat history for a specific session."""
        try:
            results = self.memory_collection.get(
                where={"session_id": session_id},
                limit=limit,
                include=["metadatas"]
            )
            
            history = []
            if results.get('metadatas'):
                for metadata in results['metadatas']:
                    history.append({
                        'user_message': metadata.get('user_message', ''),
                        'assistant_response': metadata.get('assistant_response', ''),
                        'timestamp': metadata.get('timestamp', ''),
                        'context': json.loads(metadata.get('context', '{}'))
                    })
            
            # Sort by timestamp (most recent first)
            history.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
            
            return history
            
        except Exception as e:
            logger.error(f"Error getting chat history: {str(e)}")
            return []
    
    def clear_chat_history(self, session_id: str):
        """Clear chat history for a specific session."""
        try:
            # Get all conversation IDs for this session
            results = self.memory_collection.get(
                where={"session_id": session_id},
                include=["metadatas"]
            )
            
            if results.get('ids'):
                # Delete all conversations for this session
                self.memory_collection.delete(ids=results['ids'])
            
            # Clear session data
            self._clear_session_data(session_id)
            
            logger.info(f"Cleared chat history for session {session_id}")
            
        except Exception as e:
            logger.error(f"Error clearing chat history: {str(e)}")
            raise
    
    def get_session_summary(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get summary information for a session."""
        try:
            results = self.session_collection.get(
                where={"session_id": session_id},
                include=["metadatas"]
            )
            
            if results.get('metadatas') and len(results['metadatas']) > 0:
                return results['metadatas'][0]
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting session summary: {str(e)}")
            return None
    
    def clear_session(self, session_id: str):
        """Clear all data for a session."""
        try:
            self.clear_chat_history(session_id)
            self._clear_session_data(session_id)
            logger.info(f"Cleared all data for session {session_id}")
        except Exception as e:
            logger.error(f"Error clearing session: {str(e)}")
            raise
    
    def _update_session_summary(self, session_id: str, user_message: str, assistant_response: str):
        """Update session summary with new conversation."""
        try:
            # Get existing summary
            existing = self.get_session_summary(session_id)
            
            if existing:
                # Update existing summary
                message_count = existing.get('message_count', 0) + 1
                last_activity = datetime.utcnow().isoformat()
                
                # Keep track of conversation topics
                topics = existing.get('topics', [])
                if len(user_message.split()) > 2:  # Simple topic extraction
                    topics.append(user_message[:50])
                
                summary_data = {
                    'session_id': session_id,
                    'message_count': message_count,
                    'last_activity': last_activity,
                    'created_at': existing.get('created_at', last_activity),
                    'topics': topics[-10:],  # Keep last 10 topics
                    'last_user_message': user_message[:100],
                    'last_assistant_response': assistant_response[:100]
                }
                
                # Update the summary
                self.session_collection.update(
                    ids=[session_id],
                    metadatas=[summary_data]
                )
            else:
                # Create new summary
                summary_data = {
                    'session_id': session_id,
                    'message_count': 1,
                    'last_activity': datetime.utcnow().isoformat(),
                    'created_at': datetime.utcnow().isoformat(),
                    'topics': [user_message[:50]] if len(user_message.split()) > 2 else [],
                    'last_user_message': user_message[:100],
                    'last_assistant_response': assistant_response[:100]
                }
                
                self.session_collection.add(
                    ids=[session_id],
                    embeddings=[[0] * 384],  # Placeholder embedding
                    metadatas=[summary_data]
                )
                
        except Exception as e:
            logger.error(f"Error updating session summary: {str(e)}")
    
    def _clear_session_data(self, session_id: str):
        """Clear session summary data."""
        try:
            results = self.session_collection.get(
                where={"session_id": session_id},
                include=["metadatas"]
            )
            
            if results.get('ids'):
                self.session_collection.delete(ids=results['ids'])
                
        except Exception as e:
            logger.error(f"Error clearing session data: {str(e)}")
    
    def cleanup_old_sessions(self, days: int = 30):
        """Clean up sessions older than specified days."""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            # Get old sessions
            results = self.session_collection.get(
                where={"last_activity": {"$lt": cutoff_date.isoformat()}},
                include=["metadatas"]
            )
            
            if results.get('metadatas'):
                old_session_ids = [metadata['session_id'] for metadata in results['metadatas']]
                
                for session_id in old_session_ids:
                    self.clear_session(session_id)
                
                logger.info(f"Cleaned up {len(old_session_ids)} old sessions")
                
        except Exception as e:
            logger.error(f"Error cleaning up old sessions: {str(e)}")
