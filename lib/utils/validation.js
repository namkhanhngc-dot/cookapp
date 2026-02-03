// Basic input validation

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateUsername(username) {
    // 3-20 characters, alphanumeric and underscores only
    const re = /^[a-zA-Z0-9_]{3,20}$/;
    return re.test(username);
}

function validatePassword(password) {
    // At least 6 characters
    return password && password.length >= 6;
}

function validateRecipeTitle(title) {
    return title && title.trim().length >= 3 && title.trim().length <= 200;
}

function validateRating(rating) {
    return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

// Basic content moderation (spam/offensive check)
const offensiveWords = ['spam', 'scam', 'viagra', 'casino'];
const spamPatterns = [
    /(.)\1{10,}/, // Repeated characters
    /https?:\/\/[^\s]+/gi // Multiple URLs
];

function moderateContent(text) {
    if (!text) return { valid: true };

    const lowerText = text.toLowerCase();

    // Check offensive words
    for (const word of offensiveWords) {
        if (lowerText.includes(word)) {
            return { valid: false, reason: 'Content contains prohibited words' };
        }
    }

    // Check spam patterns
    for (const pattern of spamPatterns) {
        if (pattern.test(text)) {
            return { valid: false, reason: 'Content appears to be spam' };
        }
    }

    return { valid: true };
}

function sanitizeInput(input) {
    if (!input) return '';
    return input.trim().replace(/<script[^>]*>.*?<\/script>/gi, '');
}

module.exports = {
    validateEmail,
    validateUsername,
    validatePassword,
    validateRecipeTitle,
    validateRating,
    moderateContent,
    sanitizeInput
};
