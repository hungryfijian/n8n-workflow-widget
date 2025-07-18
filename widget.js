// N8N Workflow Generator Widget - WORKING CLEAN VERSION
// Focused on eliminating placeholders with verified node types
(function() {
    'use strict';

    // Widget configuration
    const WIDGET_CONFIG = {
        apiEndpoint: 'https://n8n-workflow-widget.netlify.app/.netlify/functions/claude-api',
        containerId: 'n8n-workflow-generator',
        maxFileSize: 2 * 1024 * 1024 // 2MB
    };

    // VERIFIED N8N Node Types - Only nodes that actually work
    const VERIFIED_NODES = {
        "webhook": {
            type: "n8n-nodes-base.webhook",
            name: "Webhook",
            parameters: { path: "webhook-path", responseMode: "lastNode" }
        },
        "httpRequest": {
            type: "n8n-nodes-base.httpRequest", 
            name: "HTTP Request",
            parameters: { method: "POST", url: "", authentication: "none" }
        },
        "set": {
            type: "n8n-nodes-base.set",
            name: "Set",
            parameters: { keepOnlySet: false, values: { string: [] } }
        },
        "code": {
            type: "n8n-nodes-base.code",
            name: "Code", 
            parameters: { jsCode: "return items;" }
        },
        "if": {
            type: "n8n-nodes-base.if",
            name: "IF",
            parameters: { conditions: { string: [], number: [], boolean: [] } }
        }
    };

    // Simple mapping - focus on getting working nodes
    function getCorrectNodeType(nodeName) {
        const name = nodeName.toLowerCase();
        
        if (name.includes('webhook') || name.includes('when') || name.includes('trigger')) {
            return VERIFIED_NODES.webhook;
        }
        if (name.includes('http') || name.includes('request') || name.includes('api') || 
            name.includes('video') || name.includes('creator')) {
            return VERIFIED_NODES.httpRequest;
        }
        if (name.includes('agent') || name.includes('ai') || name.includes('openai') || 
            name.includes('research') || name.includes('script')) {
            return VERIFIED_NODES.set; // Use Set for AI functionality
        }
        if (name.includes('code') || name.includes('function')) {
            return VERIFIED_NODES.code;
        }
        if (name.includes('if') || name.includes('condition')) {
            return VERIFIED_NODES.if;
        }
        
        return VERIFIED_NODES.set; // Default fallback
    }

    // Clean workflow correction - only fix what's broken
    function cleanWorkflow(workflow) {
        console.log('🔧 Cleaning workflow...');
        
        if (!workflow || !workflow.nodes) return workflow;
        
        // Ensure nodes is array
        if (!Array.isArray(workflow.nodes)) {
            console.log('Converting nodes object to array');
            const nodesArray = [];
            for (const [nodeId, nodeData] of Object.entries(workflow.nodes)) {
                nodeData.id = nodeData.id || nodeId;
                nodesArray.push(nodeData);
            }
            workflow.nodes = nodesArray;
        }
        
        // Fix each node with verified types
        workflow.nodes.forEach((node, index) => {
            const originalType = node.type;
            const correctNode = getCorrectNodeType(node.name || node.id || '');
            
            // Force correct node type
            node.type = correctNode.type;
            node.parameters = { ...correctNode.parameters, ...node.parameters };
            
            // Ensure required properties
            if (!node.id) node.id = `node${index + 1}`;
            if (!node.name) node.name = node.id;
            if (!node.position) node.position = [100 + index * 200, 100];
            
            if (originalType !== node.type) {
                console.log(`✅ Fixed: ${node.name} (${originalType} → ${node.type})`);
            }
            
            // Special URL handling
            if (node.name.toLowerCase().includes('firecrawl')) {
                node.parameters.url = "https://api.firecrawl.dev/v0/scrape";
            }
            if (node.name.toLowerCase().includes('heygen') || node.name.toLowerCase().includes('video')) {
                node.parameters.url = "https://api.heygen.com/v2/video/generate";
            }
        });
        
        // Ensure connections exist
        if (!workflow.connections) workflow.connections = {};
        
        console.log('✅ Workflow cleaned. Node types:', workflow.nodes.map(n => n.type).join(', '));
        return workflow;
    }

    // Widget state
    let currentWorkflow = null;

    // Initialize widget
    function initWidget() {
        const container = document.getElementById(WIDGET_CONFIG.containerId);
        if (!container) {
            console.error('N8N Widget: Container not found');
            return;
        }

        injectStyles();
        container.innerHTML = getWidgetHTML();
        attachEventListeners();
        
        console.log('N8N Workflow Generator Widget loaded successfully');
    }

    // Inject CSS styles
    function injectStyles() {
        if (document.getElementById('n8n-widget-styles')) return;

        const styles = `
            <style id="n8n-widget-styles">
                .n8n-widget {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    max-width: 900px;
                    margin: 20px auto;
                    background: white;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    border: 2px solid #048ba8;
                    overflow: hidden;
                }
                
                .n8n-widget-header {
                    background: linear-gradient(135deg, #048ba8 0%, #2e4057 100%);
                    color: white;
                    padding: 20px;
                    text-align: center;
                }
                
                .n8n-widget-header h2 {
                    margin: 0 0 5px 0;
                    font-size: 1.8rem;
                }
                
                .n8n-widget-body {
                    padding: 30px;
                }
                
                .n8n-upload-area {
                    border: 3px dashed #048ba8;
                    border-radius: 10px;
                    padding: 30px;
                    text-align: center;
                    background: #f9f9f9;
                    cursor: pointer;
                    margin-bottom: 20px;
                }
                
                .n8n-generate-btn {
                    background: linear-gradient(135deg, #99c24d 0%, #048ba8 100%);
                    color: white;
                    padding: 15px 30px;
                    border: none;
                    border-radius: 8px;
                    font-size: 1.1rem;
                    cursor: pointer;
                    width: 100%;
                }
                
                .n8n-results {
                    display: none;
                    margin-top: 20px;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 8px;
                }
                
                .n8n-workflow-output {
                    background: #2e4057;
                    color: #f8f9fa;
                    padding: 15px;
                    border-radius: 6px;
                    font-family: monospace;
                    font-size: 11px;
                    white-space: pre-wrap;
                    max-height: 300px;
                    overflow-y: auto;
                    margin-bottom: 15px;
                }
                
                .n8n-success-message {
                    background: #d4edda;
                    border: 1px solid #c3e6cb;
                    color: #155724;
                    padding: 15px;
                    border-radius: 6px;
                    margin-bottom: 15px;
                }
                
                .n8n-error-message {
                    background: #f8d7da;
                    border: 1px solid #f5c6cb;
                    color: #721c24;
                    padding: 15px;
                    border-radius: 6px;
                    margin-bottom: 15px;
                }
                
                .n8n-action-buttons {
                    display: flex;
                    gap: 10px;
                }
                
                .n8n-action-btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                }
                
                .n8n-copy-btn { background: #048ba8; color: white; }
                .n8n-download-btn { background: #99c24d; color: white; }
                .n8n-reset-btn { background: #6c757d; color: white; }
                
                #n8n-widget-file { display: none; }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    // Generate widget HTML
    function getWidgetHTML() {
        return `
            <div class="n8n-widget">
                <div class="n8n-widget-header">
                    <h2>🔧 N8N Workflow Generator</h2>
                    <p>Convert workflow diagrams to importable JSON configurations</p>
                </div>
                
                <div class="n8n-widget-body">
                    <div class="n8n-upload-area" onclick="document.getElementById('n8n-widget-file').click()">
                        <div>📁 <strong>Upload Workflow Diagram</strong></div>
                        <div>Click to select image file</div>
                    </div>
                    
                    <input type="file" id="n8n-widget-file" accept="image/*">
                    
                    <button class="n8n-generate-btn" id="n8n-generate-btn">
                        🚀 Generate N8N Workflow
                    </button>
                    
                    <div class="n8n-results" id="n8n-results">
                        <div id="n8n-message-area"></div>
                        <div class="n8n-workflow-output" id="n8n-workflow-output"></div>
                        <div class="n8n-action-buttons">
                            <button class="n8n-action-btn n8n-copy-btn" onclick="N8NWidget.copyWorkflow()">
                                📋 Copy JSON
                            </button>
                            <button class="n8n-action-btn n8n-download-btn" onclick="N8NWidget.downloadWorkflow()">
                                💾 Download File
                            </button>
                            <button class="n8n-action-btn n8n-reset-btn" onclick="N8NWidget.resetForm()">
                                🔄 Reset
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Attach event listeners
    function attachEventListeners() {
        document.getElementById('n8n-widget-file').addEventListener('change', handleImageSelect);
        document.getElementById('n8n-generate-btn').addEventListener('click', generateWorkflow);
    }

    function handleImageSelect() {
        const file = document.getElementById('n8n-widget-file').files[0];
        if (!file) return;
        
        if (file.size > WIDGET_CONFIG.maxFileSize) {
            alert('File too large. Please use an image under 2MB.');
            return;
        }
        
        console.log('Image selected:', file.name, (file.size / 1024).toFixed(1) + 'KB');
    }

    function generateWorkflow() {
        const file = document.getElementById('n8n-widget-file').files[0];
        if (!file) {
            alert('Please select a workflow diagram image');
            return;
        }

        console.log('🚀 Starting workflow generation...');
        document.getElementById('n8n-generate-btn').disabled = true;

        // Convert to base64
        fileToBase64(file).then(function(base64Image) {
            console.log('✅ Image converted to base64');

            // Simple, focused prompt
            const claudeRequest = {
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 1500,
                messages: [{
                    role: 'user',
                    content: [{
                        type: 'text',
                        text: `Create N8N workflow JSON from this diagram. Use ONLY these node types:

n8n-nodes-base.webhook (for triggers)
n8n-nodes-base.httpRequest (for API calls)  
n8n-nodes-base.set (for data/AI processing)
n8n-nodes-base.code (for functions)
n8n-nodes-base.if (for conditions)

Output ONLY JSON:
{
  "nodes": [
    {"id": "node1", "type": "n8n-nodes-base.webhook", "name": "When chat message received", "position": [100, 100], "parameters": {"path": "webhook-path", "responseMode": "lastNode"}},
    {"id": "node2", "type": "n8n-nodes-base.set", "name": "Research Agent", "position": [300, 100], "parameters": {"keepOnlySet": false, "values": {"string": [{"name": "agent_type", "value": "research"}]}}}
  ],
  "connections": {
    "node1": {"main": [[{"node": "node2", "type": "main", "index": 0}]]}
  }
}

NO EXPLANATIONS. JSON ONLY.`
                    }, {
                        type: 'image',
                        source: {
                            type: 'base64',
                            media_type: 'image/jpeg',
                            data: base64Image
                        }
                    }]
                }]
            };

            console.log('📡 Calling Claude API...');
            return fetch(WIDGET_CONFIG.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(claudeRequest)
            });
        }).then(function(response) {
            if (!response.ok) {
                throw new Error('API error: ' + response.status);
            }
            return response.json();
        }).then(function(claudeResponse) {
            console.log('✅ Claude response received');

            // Extract JSON
            let workflowJson = claudeResponse.content[0].text.trim();
            console.log('Raw response (first 200 chars):', workflowJson.substring(0, 200));
            
            // Find JSON
            const jsonStart = workflowJson.indexOf('{');
            const jsonEnd = workflowJson.lastIndexOf('}') + 1;
            
            if (jsonStart >= 0 && jsonEnd > jsonStart) {
                workflowJson = workflowJson.substring(jsonStart, jsonEnd);
            }
            
            // Parse and clean
            let workflow = JSON.parse(workflowJson);
            console.log('✅ JSON parsed successfully');
            
            // CRITICAL: Clean the workflow to ensure correct node types
            workflow = cleanWorkflow(workflow);
            
            currentWorkflow = workflow;
            
            // Show results
            displayResults({
                status: 'success',
                data: { workflow: workflow }
            });

        }).catch(function(error) {
            console.error('❌ Generation failed:', error);
            displayError('Generation failed: ' + error.message);
        }).finally(function() {
            document.getElementById('n8n-generate-btn').disabled = false;
        });
    }

    function displayResults(result) {
        const resultsSection = document.getElementById('n8n-results');
        const messageArea = document.getElementById('n8n-message-area');
        const workflowOutput = document.getElementById('n8n-workflow-output');

        resultsSection.style.display = 'block';

        if (result.status === 'success') {
            messageArea.innerHTML = `
                <div class="n8n-success-message">
                    ✅ Workflow generated successfully! Using verified N8N node types.
                </div>
            `;
            workflowOutput.textContent = JSON.stringify(result.data.workflow, null, 2);
        } else {
            messageArea.innerHTML = `
                <div class="n8n-error-message">
                    ❌ ${result.message || 'Failed to generate workflow'}
                </div>
            `;
        }
    }

    function displayError(message) {
        const resultsSection = document.getElementById('n8n-results');
        const messageArea = document.getElementById('n8n-message-area');

        resultsSection.style.display = 'block';
        messageArea.innerHTML = `
            <div class="n8n-error-message">
                ❌ ${message}
            </div>
        `;
    }

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const base64 = e.target.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Public API
    window.N8NWidget = {
        copyWorkflow: function() {
            if (!currentWorkflow) {
                alert('No workflow to copy');
                return;
            }

            const jsonText = JSON.stringify(currentWorkflow, null, 2);
            
            if (navigator.clipboard) {
                navigator.clipboard.writeText(jsonText).then(function() {
                    alert('Workflow JSON copied to clipboard!');
                }).catch(function() {
                    fallbackCopy(jsonText);
                });
            } else {
                fallbackCopy(jsonText);
            }

            function fallbackCopy(text) {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert('Workflow JSON copied to clipboard!');
            }
        },

        downloadWorkflow: function() {
            if (!currentWorkflow) {
                alert('No workflow to download');
                return;
            }

            const jsonText = JSON.stringify(currentWorkflow, null, 2);
            const filename = 'n8n_workflow.json';
            
            const blob = new Blob([jsonText], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        },

        resetForm: function() {
            document.getElementById('n8n-results').style.display = 'none';
            document.getElementById('n8n-widget-file').value = '';
            currentWorkflow = null;
        }
    };

    // Initialize when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWidget);
    } else {
        initWidget();
    }

})();