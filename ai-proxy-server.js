const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = 3001;

// Enable CORS for all origins (you can restrict this in production)
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'AI Proxy Server is running' });
});

// Proxy endpoint for AI API calls
app.post('/api/ai-proxy', async (req, res) => {
    const { provider, endpoint, headers, body } = req.body;
    
    console.log(`Proxying AI request to ${provider}:`, endpoint);
    
    try {
        // Make the actual API call
        const response = await axios({
            method: 'POST',
            url: endpoint,
            headers: headers,
            data: body,
            timeout: 30000 // 30 second timeout
        });
        
        // Return the response
        res.json(response.data);
    } catch (error) {
        console.error('AI Proxy Error:', error.message);
        
        if (error.response) {
            // The request was made and the server responded with a status code
            res.status(error.response.status).json({
                error: error.response.data,
                status: error.response.status,
                message: 'AI API returned an error'
            });
        } else if (error.request) {
            // The request was made but no response was received
            res.status(503).json({
                error: 'No response from AI API',
                message: 'The AI service did not respond. Please try again.'
            });
        } else {
            // Something happened in setting up the request
            res.status(500).json({
                error: 'Request setup failed',
                message: error.message
            });
        }
    }
});

// Alternative endpoint for direct API configuration
app.post('/api/:provider', async (req, res) => {
    const { provider } = req.params;
    const { apiKey, model, prompt, ...options } = req.body;
    
    let endpoint = '';
    let headers = {};
    let requestBody = {};
    
    try {
        switch (provider.toLowerCase()) {
            case 'openai':
                endpoint = 'https://api.openai.com/v1/chat/completions';
                headers = {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                };
                requestBody = {
                    model: model || 'gpt-3.5-turbo',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: options.maxTokens || 4000,
                    temperature: options.temperature || 0.1
                };
                break;
                
            case 'anthropic':
                endpoint = 'https://api.anthropic.com/v1/messages';
                headers = {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                    'anthropic-version': '2023-06-01'
                };
                requestBody = {
                    model: model || 'claude-3-haiku-20240307',
                    max_tokens: options.maxTokens || 4000,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: options.temperature || 0.1
                };
                break;
                
            case 'gemini':
                endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-pro'}:generateContent?key=${apiKey}`;
                headers = {
                    'Content-Type': 'application/json'
                };
                requestBody = {
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        maxOutputTokens: options.maxTokens || 4000,
                        temperature: options.temperature || 0.1
                    }
                };
                break;
                
            default:
                return res.status(400).json({ error: 'Unsupported provider' });
        }
        
        const response = await axios({
            method: 'POST',
            url: endpoint,
            headers: headers,
            data: requestBody,
            timeout: 30000
        });
        
        res.json(response.data);
    } catch (error) {
        console.error(`${provider} API Error:`, error.message);
        
        if (error.response) {
            res.status(error.response.status).json({
                error: error.response.data,
                status: error.response.status
            });
        } else {
            res.status(500).json({
                error: 'API call failed',
                message: error.message
            });
        }
    }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Proxy Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`AI Proxy endpoint: http://localhost:${PORT}/api/ai-proxy`);
});