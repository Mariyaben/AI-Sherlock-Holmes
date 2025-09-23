#!/usr/bin/env python3
"""
Startup script for the Sherlock Holmes AI Flask backend.
This script handles initialization and starts the Flask development server.
"""

import os
import sys
from pathlib import Path

# Add src directory to Python path
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))

from app import app, initialize_data
from utils.config import Config
from utils.logger import get_logger

def main():
    """Main function to start the Flask server."""
    logger = get_logger(__name__)
    
    try:
        # Validate configuration
        Config.validate_config()
        logger.info("Configuration validated successfully")
        
        # Initialize data on first run
        with app.app_context():
            initialize_data()
        
        # Start the Flask server
        logger.info(f"Starting Sherlock Holmes AI backend on {Config.HOST}:{Config.PORT}")
        app.run(
            host=Config.HOST,
            port=Config.PORT,
            debug=Config.DEBUG,
            threaded=True
        )
        
    except Exception as e:
        logger.error(f"Failed to start server: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
