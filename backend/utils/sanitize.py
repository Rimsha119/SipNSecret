"""Input sanitization utilities for XSS and injection prevention"""

import html
import re
from typing import Any

def sanitize_string(text: str, max_length: int = 10000) -> str:
    """Sanitize string input to prevent XSS attacks
    
    Args:
        text: Input string to sanitize
        max_length: Maximum allowed length
        
    Returns:
        Sanitized string
    """
    if not isinstance(text, str):
        return ""
    
    # Truncate if too long
    text = text[:max_length]
    
    # HTML escape special characters
    text = html.escape(text)
    
    # Remove potentially dangerous characters
    text = text.replace('\x00', '')  # Null byte
    text = text.replace('\x1a', '')  # EOF
    
    return text.strip()

def sanitize_email(email: str) -> str:
    """Sanitize and validate email
    
    Args:
        email: Email string to sanitize
        
    Returns:
        Sanitized email or empty string if invalid
    """
    if not isinstance(email, str):
        return ""
    
    email = email.strip().lower()
    
    # Basic email regex
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        return ""
    
    return sanitize_string(email, max_length=254)

def sanitize_pseudonym(pseudonym: str) -> str:
    """Sanitize pseudonym/username
    
    Args:
        pseudonym: Pseudonym to sanitize
        
    Returns:
        Sanitized pseudonym
    """
    if not isinstance(pseudonym, str):
        return ""
    
    pseudonym = pseudonym.strip()
    
    # Allow alphanumeric, underscores, hyphens
    # Length 3-20 characters
    if not re.match(r'^[a-zA-Z0-9_-]{3,20}$', pseudonym):
        return ""
    
    return sanitize_string(pseudonym, max_length=20)

def sanitize_text(text: str, max_length: int = 500) -> str:
    """Sanitize general text input (for rumor text, etc)
    
    Args:
        text: Text to sanitize
        max_length: Maximum length (default 500 for summaries, 10000 for full text)
        
    Returns:
        Sanitized text
    """
    return sanitize_string(text, max_length=max_length)

def sanitize_category(category: str) -> str:
    """Sanitize category input
    
    Args:
        category: Category string
        
    Returns:
        Sanitized category
    """
    if not isinstance(category, str):
        return ""
    
    category = category.strip()
    
    # Allowed categories
    allowed = {
        'academic', 'social', 'events', 'policies', 
        'technology', 'health', 'other'
    }
    
    category_lower = category.lower()
    if category_lower not in allowed:
        return "other"
    
    return category_lower

def sanitize_dict(data: dict, schema: dict = None) -> dict:
    """Sanitize dictionary input based on optional schema
    
    Args:
        data: Dictionary to sanitize
        schema: Optional dict with field names as keys and sanitization functions as values
               Example: {'text': lambda x: sanitize_text(x, 500), 'email': sanitize_email}
        
    Returns:
        Sanitized dictionary
    """
    if not isinstance(data, dict):
        return {}
    
    sanitized = {}
    
    for key, value in data.items():
        # Skip None values
        if value is None:
            continue
        
        # Use schema if provided
        if schema and key in schema:
            try:
                sanitized[key] = schema[key](value)
            except Exception as e:
                # Log but don't include problematic value
                continue
        else:
            # Default: sanitize strings, pass through numbers/bools
            if isinstance(value, str):
                sanitized[key] = sanitize_string(value)
            elif isinstance(value, (int, float, bool)):
                sanitized[key] = value
    
    return sanitized
