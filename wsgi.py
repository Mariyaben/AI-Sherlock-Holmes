#!/usr/bin/env python3
"""
WSGI entry point for production deployment.
This file is used by Gunicorn and other WSGI servers.
"""

import os
import sys
from pathlib import Path

# Add src directory to Python path
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))

from src.app import app, initialize_data
from src.utils.config import Config
from src.utils.logger import get_logger

# Initialize logger
logger = get_logger(__name__)

def initialize_app():
    """Initialize the application for production."""
    try:
        logger.info("Initializing Sherlock Holmes AI for production...")
        
        # Validate configuration
        Config.validate_config()
        logger.info("Configuration validated successfully")
        
        # Initialize data
        with app.app_context():
            initialize_data()
        
        logger.info("Production initialization completed successfully")
        return app
        
    except Exception as e:
        logger.error(f"Failed to initialize application: {str(e)}")
        raise

# Initialize the application
application = initialize_app()

if __name__ == "__main__":
    # This is for development only
    application.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=Config.DEBUG
    )
