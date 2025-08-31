// AI Proxy Integration for RAIDMASTER
// This script fixes CORS issues by routing AI API calls through a local proxy server

(function() {
    // Check if we're running through the proxy server
    const USE_PROXY = true; // Set to true when proxy server is available
    const PROXY_URL = window.location.protocol + '//' + window.location.hostname + ':3001';
    
    // Override the callAI function to use proxy
    if (typeof window.callAI !== 'undefined') {
        const originalCallAI = window.callAI;
        
        window.callAI = async function(prompt) {
            // If not using proxy, fall back to original implementation
            if (!USE_PROXY) {
                return originalCallAI.call(this, prompt);
            }
            
            const provider = window.aiProviders[window.aiConfig.provider];
            const apiKey = window.apiKeys[window.aiConfig.provider];
            
            if (!provider || !apiKey) {
                throw new Error(`Provider ${window.aiConfig.provider} or API key not configured`);
            }
            
            try {
                // Check if proxy server is available
                const healthCheck = await fetch(`${PROXY_URL}/health`).catch(() => null);
                
                if (!healthCheck || !healthCheck.ok) {
                    console.warn('AI Proxy server not available, falling back to direct API calls');
                    return originalCallAI.call(this, prompt);
                }
                
                // Prepare the proxy request
                let headers = {};
                let requestBody = {};
                let endpoint = provider.endpoint;
                
                // Build request based on provider
                if (window.aiConfig.provider === 'OpenAI') {
                    headers = {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    };
                    requestBody = {
                        model: window.aiConfig.model,
                        messages: [{ role: 'user', content: prompt }],
                        max_tokens: 4000,
                        temperature: 0.1
                    };
                } else if (window.aiConfig.provider === 'Anthropic') {
                    headers = {
                        'x-api-key': apiKey,
                        'Content-Type': 'application/json',
                        'anthropic-version': '2023-06-01'
                    };
                    requestBody = {
                        model: window.aiConfig.model,
                        max_tokens: 4000,
                        messages: [{ role: 'user', content: prompt }],
                        temperature: 0.1
                    };
                } else if (window.aiConfig.provider === 'Gemini') {
                    endpoint = provider.endpoint.replace('{model}', window.aiConfig.model);
                    endpoint += `?key=${apiKey}`;
                    headers = {
                        'Content-Type': 'application/json'
                    };
                    requestBody = {
                        contents: [{
                            parts: [{ text: prompt }]
                        }],
                        generationConfig: {
                            maxOutputTokens: 4000,
                            temperature: 0.1
                        }
                    };
                }
                
                // Make request through proxy
                const response = await fetch(`${PROXY_URL}/api/ai-proxy`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        provider: window.aiConfig.provider,
                        endpoint: endpoint,
                        headers: headers,
                        body: requestBody
                    })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`API call failed: ${errorData.message || response.statusText}`);
                }
                
                const data = await response.json();
                
                // Extract response based on provider
                let content = '';
                if (window.aiConfig.provider === 'OpenAI') {
                    content = data.choices[0].message.content;
                } else if (window.aiConfig.provider === 'Anthropic') {
                    content = data.content[0].text;
                } else if (window.aiConfig.provider === 'Gemini') {
                    content = data.candidates[0].content.parts[0].text;
                }
                
                return content;
                
            } catch (error) {
                console.error('AI Proxy call failed:', error);
                // If proxy fails, try direct call
                if (error.message !== 'CORS_ERROR') {
                    console.log('Falling back to direct API call');
                    return originalCallAI.call(this, prompt);
                }
                throw error;
            }
        };
    }
    
    // Add visual indicator that proxy is available
    function addProxyIndicator() {
        const checkProxyStatus = async () => {
            try {
                const response = await fetch(`${PROXY_URL}/health`);
                if (response.ok) {
                    const existingIndicator = document.getElementById('ai-proxy-indicator');
                    if (!existingIndicator) {
                        const indicator = document.createElement('div');
                        indicator.id = 'ai-proxy-indicator';
                        indicator.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs shadow-lg z-40';
                        indicator.innerHTML = '✅ AI Proxy Active';
                        document.body.appendChild(indicator);
                        
                        // Auto-hide after 5 seconds
                        setTimeout(() => {
                            indicator.style.opacity = '0.3';
                        }, 5000);
                    }
                    return true;
                }
            } catch (error) {
                // Proxy not available
            }
            return false;
        };
        
        // Check on load
        checkProxyStatus();
        
        // Recheck periodically
        setInterval(checkProxyStatus, 30000); // Check every 30 seconds
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addProxyIndicator);
    } else {
        addProxyIndicator();
    }
})();