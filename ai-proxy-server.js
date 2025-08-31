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

// Demo/test endpoint that doesn't require real API key
app.post('/api/demo', async (req, res) => {
    const { prompt } = req.body;
    console.log('Demo API called with prompt:', prompt.substring(0, 100) + '...');
    
    // Simulate AI response for testing
    const demoResponse = `## Executive Summary (Demo Mode)

**Note: This is a simulated response for testing. Configure a real API key for actual AI analysis.**

### Executive Overview
Based on the RAID items provided, the portfolio shows a balanced distribution of risks, assumptions, issues, and dependencies. Key concerns include resource allocation and timeline management.

### Risk Assessment
- **Critical Risks**: 2 high-priority items requiring immediate attention
- **Medium Risks**: 3 items for monitoring
- **Low Risks**: 1 item tracked for awareness

### Priority Breakdown
- High Priority: 33% of total items
- Medium Priority: 50% of total items  
- Low Priority: 17% of total items

### Strategic Recommendations
1. Focus on high-priority risk mitigation
2. Review resource allocation for critical workstreams
3. Establish weekly review cadence for priority items
4. Update risk register with latest assessments

### Next Steps
- Schedule executive review meeting
- Assign risk owners for unassigned items
- Update mitigation strategies for high-priority risks

*This is a demo response. Configure your AI provider API key in Settings for real analysis.*`;
    
    res.json({
        choices: [{
            message: {
                content: demoResponse
            }
        }]
    });
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