from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os
import logging
from dotenv import load_dotenv
from datetime import datetime
import uuid

from services.text_processing import extract_text_from_txt
from services.embeddings import store_embeddings
from services.retrieval import retrieve_documents
from services.chat_service import ChatService
from services.memory_service import MemoryService
from utils.logger import setup_logger
from utils.config import Config

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS for frontend integration
CORS(app, origins=app.config['ALLOWED_ORIGINS'])

# Setup rate limiting
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["1000 per hour", "100 per minute"]
)
limiter.init_app(app)

# Setup logging
logger = setup_logger(__name__)

# Initialize services
chat_service = ChatService()
memory_service = MemoryService()

def load_case_data():
    """Load all case files from data/cases directory into ChromaDB."""
    try:
        cases_dir = "data/cases"
        case_data = {}
        
        for filename in os.listdir(cases_dir):
            if filename.endswith('.txt'):
                file_path = os.path.join(cases_dir, filename)
                text = extract_text_from_txt(file_path)
                case_data[filename] = text
        
        # Store embeddings in ChromaDB
        case_collection = chat_service.get_case_collection()
        store_embeddings(case_collection, case_data)
        logger.info(f"Loaded {len(case_data)} case files into ChromaDB")
        
    except Exception as e:
        logger.error(f"Error loading case data: {str(e)}")
        raise

def initialize_data():
    """Initialize ChromaDB collections and load case data on first request."""
    try:
        logger.info("Initializing Sherlock Holmes AI backend...")
        
        # Initialize ChromaDB collections
        case_collection = chat_service.get_case_collection()
        memory_collection = chat_service.get_memory_collection()
        
        # Load case data if not already loaded
        if case_collection.count() == 0:
            logger.info("Loading case data into ChromaDB...")
            load_case_data()
        
        logger.info("Backend initialization completed successfully")
    except Exception as e:
        logger.error(f"Error during initialization: {str(e)}")
        raise

# Initialize data when the app starts (only in production)
if not app.config['DEBUG']:
    with app.app_context():
        try:
            initialize_data()
        except Exception as e:
            logger.error(f"Failed to initialize app: {str(e)}")


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for monitoring."""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/chat', methods=['POST'])
@limiter.limit("10 per minute")
def chat():
    """Main chat endpoint for user interactions."""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        message = data['message'].strip()
        if not message:
            return jsonify({'error': 'Message cannot be empty'}), 400
        
        # Generate session ID if not provided
        session_id = data.get('session_id', str(uuid.uuid4()))
        
        # Get user context if provided
        user_context = data.get('context', {})
        
        logger.info(f"Processing chat message for session {session_id}: {message[:50]}...")
        
        # Process the chat message
        response = chat_service.process_message(
            message=message,
            session_id=session_id,
            user_context=user_context
        )
        
        return jsonify({
            'response': response,
            'session_id': session_id,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error processing chat message: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/chat/history/<session_id>', methods=['GET'])
@limiter.limit("100 per hour")
def get_chat_history(session_id):
    """Retrieve chat history for a specific session."""
    try:
        if not session_id:
            return jsonify({'error': 'Session ID is required'}), 400
        
        history = memory_service.get_chat_history(session_id)
        
        return jsonify({
            'session_id': session_id,
            'history': history,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error retrieving chat history: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/chat/history/<session_id>', methods=['DELETE'])
@limiter.limit("10 per hour")
def clear_chat_history(session_id):
    """Clear chat history for a specific session."""
    try:
        if not session_id:
            return jsonify({'error': 'Session ID is required'}), 400
        
        memory_service.clear_chat_history(session_id)
        
        return jsonify({
            'message': 'Chat history cleared successfully',
            'session_id': session_id,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error clearing chat history: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/cases', methods=['GET'])
@limiter.limit("100 per hour")
def get_cases():
    """Get list of available cases."""
    try:
        cases_dir = "data/cases"
        cases = []
        
        for filename in os.listdir(cases_dir):
            if filename.endswith('.txt'):
                cases.append({
                    'filename': filename,
                    'title': filename.replace('.txt', '').replace('_', ' ').title()
                })
        
        return jsonify({
            'cases': cases,
            'count': len(cases),
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error retrieving cases: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/cases/<case_name>', methods=['GET'])
@limiter.limit("50 per hour")
def get_case_content(case_name):
    """Get content of a specific case."""
    try:
        if not case_name.endswith('.txt'):
            case_name += '.txt'
        
        case_path = os.path.join("data/cases", case_name)
        
        if not os.path.exists(case_path):
            return jsonify({'error': 'Case not found'}), 404
        
        content = extract_text_from_txt(case_path)
        
        return jsonify({
            'case_name': case_name,
            'content': content[:10000] + '...' if len(content) > 10000 else content,
            'full_length': len(content),
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error retrieving case content: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/search', methods=['POST'])
@limiter.limit("20 per minute")
def search_cases():
    """Search through case content."""
    try:
        data = request.get_json()
        
        if not data or 'query' not in data:
            return jsonify({'error': 'Search query is required'}), 400
        
        query = data['query'].strip()
        if not query:
            return jsonify({'error': 'Search query cannot be empty'}), 400
        
        limit = data.get('limit', 5)
        
        # Search through case collection
        results = retrieve_documents(chat_service.get_case_collection(), query, k=limit)
        
        return jsonify({
            'query': query,
            'results': results,
            'count': len(results),
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error searching cases: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(429)
def rate_limit_exceeded(error):
    """Handle rate limit exceeded errors."""
    return jsonify({
        'error': 'Rate limit exceeded',
        'message': 'Too many requests. Please try again later.'
    }), 429

@app.errorhandler(500)
def internal_error(error):
    """Handle internal server errors."""
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Run the Flask app
    app.run(
        host=app.config['HOST'],
        port=app.config['PORT'],
        debug=app.config['DEBUG']
    )