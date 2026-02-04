import { GoogleGenerativeAI } from '@google/generative-ai';

// Khởi tạo Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Tạo text từ prompt
 * @param {string} prompt - Prompt để gửi đến AI
 * @param {object} options - Tùy chọn (temperature, maxTokens, etc.)
 * @returns {Promise<string>} - Response text
 */
export async function generateText(prompt, options = {}) {
    try {
        const model = genAI.getGenerativeModel({
            model: options.model || 'gemini-3-flash-preview',
            generationConfig: {
                temperature: options.temperature || 0.7,
                maxOutputTokens: options.maxTokens || 2000,
            }
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini AI Error:', error);
        throw new Error('Không thể tạo nội dung từ AI');
    }
}

/**
 * Tạo JSON có cấu trúc từ prompt
 * @param {string} prompt - Prompt chính
 * @param {object} schema - JSON schema mong muốn
 * @param {object} options - Tùy chọn
 * @returns {Promise<object>} - Parsed JSON object
 */
export async function generateStructuredOutput(prompt, schema, options = {}) {
    try {
        const model = genAI.getGenerativeModel({
            model: options.model || 'gemini-3-flash-preview',
            generationConfig: {
                temperature: options.temperature || 0.5,
                maxOutputTokens: options.maxTokens || 3000,
                responseMimeType: 'application/json',
                responseSchema: schema
            }
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse JSON
        return JSON.parse(text);
    } catch (error) {
        console.error('Gemini Structured Output Error:', error);
        throw new Error('Không thể tạo dữ liệu có cấu trúc từ AI');
    }
}

/**
 * Cache-aware AI call
 * @param {string} cacheKey - Key để cache
 * @param {Function} aiFunction - Function để gọi nếu không có cache
 * @param {number} ttl - Time to live (seconds)
 * @returns {Promise<any>}
 */
export async function cachedAICall(cacheKey, aiFunction, ttl = 3600) {
    // TODO: Implement caching với Redis hoặc in-memory cache
    // Hiện tại tạm thời không cache, sẽ implement sau
    return await aiFunction();
}

/**
 * Retry logic cho AI calls
 * @param {Function} fn - Function cần retry
 * @param {number} maxRetries - Số lần retry tối đa
 * @returns {Promise<any>}
 */
export async function retryAI(fn, maxRetries = 3) {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            console.warn(`AI call failed (attempt ${i + 1}/${maxRetries}):`, error.message);

            // Đợi trước khi retry (exponential backoff)
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
            }
        }
    }

    throw lastError;
}

export default { generateText, generateStructuredOutput, cachedAICall, retryAI };
