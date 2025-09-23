import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Configuration class for the Flask application."""
    
    # Basic Flask settings
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 5000))
    
    # CORS settings
    ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:8080').split(',')
    
    # ChromaDB settings
    CHROMA_DB_PATH = os.getenv('CHROMA_DB_PATH', 'chroma_db')
    
    # Google AI settings
    GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
    GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-1.5-flash')
    
    # Case data settings
    CASES_DIR = os.getenv('CASES_DIR', 'data/cases')
    
    # Memory settings
    MAX_MEMORY_ITEMS = int(os.getenv('MAX_MEMORY_ITEMS', 100))
    MEMORY_RETRIEVAL_LIMIT = int(os.getenv('MEMORY_RETRIEVAL_LIMIT', 5))
    
    # Embedding settings
    EMBEDDING_MODEL = os.getenv('EMBEDDING_MODEL', 'all-MiniLM-L6-v2')
    EMBEDDING_BATCH_SIZE = int(os.getenv('EMBEDDING_BATCH_SIZE', 100))
    
    # Logging settings
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = os.getenv('LOG_FILE', 'logs/app.log')
    
    # Rate limiting
    RATE_LIMIT_ENABLED = os.getenv('RATE_LIMIT_ENABLED', 'True').lower() == 'true'
    
    # Azure settings (for future deployment)
    AZURE_COSMOS_ENDPOINT = os.getenv('AZURE_COSMOS_ENDPOINT')
    AZURE_COSMOS_KEY = os.getenv('AZURE_COSMOS_KEY')
    AZURE_COSMOS_DATABASE = os.getenv('AZURE_COSMOS_DATABASE', 'sherlock-holmes')
    AZURE_COSMOS_CONTAINER = os.getenv('AZURE_COSMOS_CONTAINER', 'chat-sessions')
    
    @staticmethod
    def validate_config():
        """Validate that required configuration values are present."""
        required_vars = ['GOOGLE_API_KEY']
        missing_vars = []
        
        for var in required_vars:
            if not getattr(Config, var):
                missing_vars.append(var)
        
        if missing_vars:
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
        
        return True
