// N8N Workflow Generator Widget - Optimized Version
// Version 2.0 - THLS Widget
(function() {
    'use strict';

    // Widget configuration
    const WIDGET_CONFIG = {
        apiEndpoint: 'https://n8n-generator.netlify.app/.netlify/functions/claude-api',
        containerId: 'n8n-workflow-generator',
        maxFileSize: 2 * 1024 * 1024 // 2MB
    };

    // EXPANDED N8N NODE DATABASE with correct types
    const N8N_NODE_DATABASE = {
        // TRIGGERS
        "webhook": {
            type: "n8n-nodes-base.webhook",
            name: "Webhook",
            category: "trigger",
            description: "Receives HTTP requests",
            parameters: {
                path: "webhook-path",
                responseMode: "lastNode",
                httpMethod: "POST"
            },
            common_names: ["webhook", "http trigger", "api endpoint", "when message received", "chat trigger", "trigger"]
        },
        
        "schedule": {
            type: "n8n-nodes-base.scheduleTrigger",
            name: "Schedule Trigger",
            category: "trigger",
            description: "Triggers workflow on schedule",
            parameters: {
                rule: {
                    interval: [{ field: "hours", value: 1 }]
                }
            },
            common_names: ["schedule", "cron", "timer", "interval"]
        },
        
        // AI & LANGUAGE MODELS
        "openai": {
            type: "n8n-nodes-langchain.openAi",
            name: "OpenAI",
            category: "ai",
            description: "OpenAI language model",
            parameters: {
                model: "gpt-4",
                temperature: 0.7
            },
            common_names: ["openai", "gpt", "chat model", "ai model", "language model", "llm"]
        },
        
        "agent": {
            type: "n8n-nodes-langchain.agent",
            name: "AI Agent",
            category: "ai",
            description: "AI Agent with tools",
            parameters: {
                prompt: "",
                hasOutputParser: true
            },
            common_names: ["agent", "ai agent", "research agent", "scriptwriting agent", "tool agent"]
        },
        
        "chain": {
            type: "n8n-nodes-langchain.chainLlm",
            name: "Basic LLM Chain",
            category: "ai",
            description: "Basic LLM Chain",
            parameters: {},
            common_names: ["chain", "llm chain", "basic chain"]
        },
        
        // HTTP & API
        "httpRequest": {
            type: "n8n-nodes-base.httpRequest",
            name: "HTTP Request",
            category: "http",
            description: "Make HTTP requests",
            parameters: {
                method: "POST",
                url: "",
                authentication: "none"
            },
            common_names: ["http", "api call", "request", "post", "get", "api request", "firecrawl", "heygen"]
        },
        
        // DATA TRANSFORMATION
        "set": {
            type: "n8n-nodes-base.set",
            name: "Set",
            category: "data",
            description: "Set data values",
            parameters: {
                keepOnlySet: false,
                values: {
                    string: []
                }
            },
            common_names: ["set", "data", "variable", "value", "assign", "edit fields"]
        },
        
        "code": {
            type: "n8n-nodes-base.code",
            name: "Code",
            category: "data", 
            description: "Execute JavaScript code",
            parameters: {
                jsCode: "// Process data\nreturn items;"
            },
            common_names: ["code", "javascript", "script", "function", "execute"]
        },
        
        "merge": {
            type: "n8n-nodes-base.merge",
            name: "Merge",
            category: "data",
            description: "Merge data streams",
            parameters: {
                mode: "append"
            },
            common_names: ["merge", "combine", "join"]
        },
        
        "splitInBatches": {
            type: "n8n-nodes-base.splitInBatches",
            name: "Split In Batches",
            category: "data",
            description: "Split data into batches",
            parameters: {
                batchSize: 10
            },
            common_names: ["split", "batch", "chunk"]
        },
        
        // FLOW CONTROL
        "if": {
            type: "n8n-nodes-base.if",
            name: "IF",
            category: "flow",
            description: "Conditional routing",
            parameters: {
                conditions: {}
            },
            common_names: ["if", "condition", "branch", "switch"]
        },
        
        "switch": {
            type: "n8n-nodes-base.switch",
            name: "Switch",
            category: "flow",
            description: "Route based on value",
            parameters: {
                dataType: "string",
                value1: "",
                rules: {}
            },
            common_names: ["switch", "router", "case"]
        },
        
        // COMMUNICATION
        "emailSend": {
            type: "n8n-nodes-base.emailSend",
            name: "Send Email",
            category: "communication",
            description: "Send an email",
            parameters: {
                fromEmail: "",
                toEmail: "",
                subject: "",
                text: ""
            },
            common_names: ["email", "send email", "mail", "smtp"]
        },
        
        "slack": {
            type: "n8n-nodes-base.slack",
            name: "Slack",
            category: "communication",
            description: "Send messages to Slack",
            parameters: {
                resource: "message",
                operation: "send",
                channel: ""
            },
            common_names: ["slack", "message", "notification"]
        },
        
        // RESPONSE
        "respondToWebhook": {
            type: "n8n-nodes-base.respondToWebhook",
            name: "Respond to Webhook",
            category: "response",
            description: "Send response to webhook",
            parameters: {
                responseMode: "lastNode",
                responseCode: 200
            },
            common_names: ["respond", "response", "reply", "return", "webhook response"]
        },
        
        // UTILITIES
        "wait": {
            type: "n8n-nodes-base.wait",
            name: "Wait",
            category: "utility",
            description: "Wait before continuing",
            parameters: {
                resume: "timeInterval",
                amount: 1,
                unit: "seconds"
            },
            common_names: ["wait", "delay", "pause", "sleep"]
        },
        
        "noOp": {
            type: "n8n-nodes-base.noOp",
            name: "No Operation",
            category: "utility",
            description: "Do nothing (placeholder)",
            parameters: {},
            common_names: ["noop", "no operation", "placeholder", "pass"]
        }
    };

    // Enhanced node name mapping for Claude's common outputs
    const NODE_NAME_MAPPINGS = {
        "research agent": "agent",
        "scriptwriting ai agent": "agent",
        "openai chat model": "openai",
        "http request1": "httpRequest",
        "http request": "httpRequest",
        "video creator": "httpRequest",
        "when chat message received": "webhook",
        "basic llm chain": "chain",
        "ai agent": "agent",
        "gpt-4": "openai",
        "firecrawl": "httpRequest",
        "heygen": "httpRequest"
    };

    // Widget state
    let currentWorkflow = null;
    let currentProjectName = '';

    // Initialize widget when DOM is ready
    function initWidget() {
        const container = document.getElementById(WIDGET_CONFIG.containerId);
        if (!container) {
            console.error('N8N Widget: Container element not found. Please add <div id="n8n-workflow-generator"></div> to your page.');
            return;
        }

        // Inject styles
        injectStyles();
        
        // Render widget HTML
        container.innerHTML = getWidgetHTML();
        
        // Attach event listeners
        attachEventListeners();
        
        console.log('N8N Workflow Generator Widget loaded successfully');
    }

    // Inject CSS styles (keeping existing styles)
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
                
                .n8n-widget-header p {
                    margin: 0;
                    opacity: 0.9;
                    font-size: 1rem;
                }
                
                .n8n-widget-body {
                    padding: 30px;
                }
                
                .n8n-notice {
                    background: #d1ecf1;
                    border: 1px solid #bee5eb;
                    color: #0c5460;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    font-size: 0.9rem;
                }
                
                .n8n-upload-area {
                    border: 3px dashed #048ba8;
                    border-radius: 10px;
                    padding: 30px;
                    text-align: center;
                    background: #f9f9f9;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    margin-bottom: 20px;
                }
                
                .n8n-upload-area:hover {
                    border-color: #99c24d;
                    background: #f0f8ff;
                }
                
                .n8n-upload-area.dragover {
                    border-color: #f18f01;
                    background: #fff8f0;
                }
                
                .n8n-upload-icon {
                    font-size: 2.5rem;
                    margin-bottom: 10px;
                }
                
                .n8n-form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    margin-bottom: 20px;
                }
                
                .n8n-form-group {
                    margin-bottom: 20px;
                }
                
                .n8n-form-group label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: 600;
                    color: #2e4057;
                }
                
                .n8n-form-group input,
                .n8n-form-group textarea,
                .n8n-form-group select {
                    width: 100%;
                    padding: 10px;
                    border: 2px solid #e0e0e0;
                    border-radius: 6px;
                    font-size: 14px;
                    transition: border-color 0.3s ease;
                }
                
                .n8n-form-group input:focus,
                .n8n-form-group textarea:focus,
                .n8n-form-group select:focus {
                    outline: none;
                    border-color: #048ba8;
                }
                
                .n8n-generate-btn {
                    background: linear-gradient(135deg, #99c24d 0%, #048ba8 100%);
                    color: white;
                    padding: 15px 30px;
                    border: none;
                    border-radius: 8px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    width: 100%;
                }
                
                .n8n-generate-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                }
                
                .n8n-generate-btn:disabled {
                    background: #ccc;
                    cursor: not-allowed;
                    transform: none;
                }
                
                .n8n-preview {
                    margin-top: 20px;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    display: none;
                }
                
                .n8n-preview img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 6px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                
                .n8n-loading {
                    display: none;
                    text-align: center;
                    padding: 30px;
                    background: #f0f8ff;
                    margin-top: 20px;
                    border-radius: 8px;
                }
                
                .n8n-spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #e0e0e0;
                    border-top: 4px solid #048ba8;
                    border-radius: 50%;
                    animation: n8n-spin 1s linear infinite;
                    margin: 0 auto 15px;
                }
                
                @keyframes n8n-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .n8n-results {
                    display: none;
                    margin-top: 20px;
                }
                
                .n8n-results-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 20px;
                }
                
                .n8n-json-panel {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                }
                
                .n8n-preview-panel {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                }
                
                .n8n-panel-title {
                    font-weight: bold;
                    margin-bottom: 15px;
                    color: #2e4057;
                    font-size: 1.1rem;
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
                
                .n8n-workflow-output {
                    background: #2e4057;
                    color: #f8f9fa;
                    padding: 15px;
                    border-radius: 6px;
                    font-family: 'Courier New', monospace;
                    font-size: 11px;
                    white-space: pre-wrap;
                    max-height: 300px;
                    overflow-y: auto;
                }
                
                .n8n-workflow-preview {
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    padding: 15px;
                    background: white;
                    min-height: 400px;
                    position: relative;
                    overflow: auto;
                }
                
                .n8n-node-box {
                    position: absolute;
                    background: #e3f2fd;
                    border: 2px solid #2196f3;
                    border-radius: 8px;
                    padding: 8px 12px;
                    font-size: 11px;
                    font-weight: bold;
                    cursor: pointer;
                    min-width: 80px;
                    text-align: center;
                }
                
                .n8n-node-webhook { background: #e8f5e8; border-color: #4caf50; }
                .n8n-node-agent { background: #fff3e0; border-color: #ff9800; }
                .n8n-node-openai { background: #f3e5f5; border-color: #9c27b0; }
                .n8n-node-http { background: #e1f5fe; border-color: #03a9f4; }
                .n8n-node-set { background: #fce4ec; border-color: #e91e63; }
                
                .n8n-connection-line {
                    position: absolute;
                    background: #666;
                    height: 2px;
                    transform-origin: left center;
                }
                
                .n8n-connection-arrow {
                    position: absolute;
                    width: 0;
                    height: 0;
                    border-left: 8px solid #666;
                    border-top: 4px solid transparent;
                    border-bottom: 4px solid transparent;
                }
                
                .n8n-validation-status {
                    margin-bottom: 15px;
                    padding: 10px;
                    border-radius: 6px;
                }
                
                .n8n-validation-valid {
                    background: #d4edda;
                    border: 1px solid #c3e6cb;
                    color: #155724;
                }
                
                .n8n-validation-invalid {
                    background: #f8d7da;
                    border: 1px solid #f5c6cb;
                    color: #721c24;
                }
                
                .n8n-action-buttons {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                }
                
                .n8n-action-btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    font-size: 0.9rem;
                }
                
                .n8n-copy-btn {
                    background: #048ba8;
                    color: white;
                }
                
                .n8n-copy-btn:hover {
                    background: #036b87;
                }
                
                .n8n-download-btn {
                    background: #99c24d;
                    color: white;
                }
                
                .n8n-download-btn:hover {
                    background: #7ea63b;
                }
                
                .n8n-reset-btn {
                    background: #6c757d;
                    color: white;
                }
                
                .n8n-reset-btn:hover {
                    background: #545b62;
                }
                
                #n8n-widget-file {
                    display: none;
                }
                
                @media (max-width: 768px) {
                    .n8n-form-row {
                        grid-template-columns: 1fr;
                    }
                    
                    .n8n-action-buttons {
                        flex-direction: column;
                    }
                    
                    .n8n-widget-body {
                        padding: 20px;
                    }
                }
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
                    <div class="n8n-notice">
                        ℹ️ <strong>File Size Limit:</strong> Please keep images under 2MB for optimal processing.
                    </div>
                    
                    <div class="n8n-upload-area" onclick="document.getElementById('n8n-widget-file').click()">
                        <div class="n8n-upload-icon">📁</div>
                        <div><strong>Click to upload workflow diagram</strong></div>
                        <div>or drag and drop your image here</div>
                        <div style="margin-top: 8px; font-size: 0.9rem; color: #666;">Supports PNG, JPG, GIF formats</div>
                    </div>
                    
                    <input type="file" id="n8n-widget-file" accept="image/*">
                    
                    <div class="n8n-form-row">
                        <div class="n8n-form-group">
                            <label for="n8n-project-name">Project Name</label>
                            <input type="text" id="n8n-project-name" placeholder="e.g., Customer Email Automation">
                        </div>
                        <div class="n8n-form-group">
                            <label for="n8n-workflow-type">Workflow Type</label>
                            <select id="n8n-workflow-type">
                                <option value="general">General Automation</option>
                                <option value="customer">Customer Communication</option>
                                <option value="inventory">Inventory Management</option>
                                <option value="training">Training & Education</option>
                                <option value="reporting">Reporting & Analytics</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="n8n-form-group">
                        <label for="n8n-description">Workflow Description</label>
                        <textarea id="n8n-description" rows="3" placeholder="Describe what this workflow should accomplish..."></textarea>
                    </div>
                    
                    <button class="n8n-generate-btn" id="n8n-generate-btn">
                        🚀 Generate N8N Workflow
                    </button>
                    
                    <div class="n8n-preview" id="n8n-preview">
                        <h4>📋 Workflow Diagram Preview</h4>
                        <img id="n8n-preview-image" src="" alt="Workflow preview">
                        <div id="n8n-file-info"></div>
                    </div>
                    
                    <div class="n8n-loading" id="n8n-loading">
                        <div class="n8n-spinner"></div>
                        <div><strong>Analyzing workflow diagram...</strong></div>
                        <div style="font-size: 0.9rem; color: #666; margin-top: 5px;">AI processing may take 30-60 seconds</div>
                    </div>
                    
                    <div class="n8n-results" id="n8n-results">
                        <div id="n8n-message-area"></div>
                        
                        <div class="n8n-results-grid">
                            <div class="n8n-json-panel">
                                <div class="n8n-panel-title">📄 Generated JSON</div>
                                <div id="n8n-validation-status"></div>
                                <div class="n8n-workflow-output" id="n8n-workflow-output"></div>
                            </div>
                            
                            <div class="n8n-preview-panel">
                                <div class="n8n-panel-title">👁️ Workflow Preview</div>
                                <div class="n8n-workflow-preview" id="n8n-workflow-preview">
                                    <div style="color: #666; text-align: center; padding: 50px;">
                                        Workflow preview will appear here
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="n8n-action-buttons">
                            <button class="n8n-action-btn n8n-copy-btn" onclick="N8NWidget.copyWorkflow()">
                                📋 Copy JSON
                            </button>
                            <button class="n8n-action-btn n8n-download-btn" onclick="N8NWidget.downloadWorkflow()">
                                💾 Download File
                            </button>
                            <button class="n8n-action-btn n8n-reset-btn" onclick="N8NWidget.resetForm()">
                                🔄 Generate Another
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Attach event listeners
    function attachEventListeners() {
        const fileInput = document.getElementById('n8n-widget-file');
        const uploadArea = document.querySelector('.n8n-upload-area');
        const generateBtn = document.getElementById('n8n-generate-btn');

        // File input change
        fileInput.addEventListener('change', handleImageSelect);

        // Generate button click
        generateBtn.addEventListener('click', generateWorkflow);

        // Drag and drop
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => uploadArea.classList.add('dragover'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => uploadArea.classList.remove('dragover'), false);
        });

        uploadArea.addEventListener('drop', handleDrop, false);
    }

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.size > WIDGET_CONFIG.maxFileSize) {
                alert(`File size too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Please reduce to under 2MB.`);
                return;
            }
            document.getElementById('n8n-widget-file').files = files;
            handleImageSelect();
        }
    }

    function handleImageSelect() {
        const file = document.getElementById('n8n-widget-file').files[0];
        if (!file) return;

        // Validate file size
        if (file.size > WIDGET_CONFIG.maxFileSize) {
            alert(`File size too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Please reduce to under 2MB.`);
            document.getElementById('n8n-widget-file').value = '';
            return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert('Please upload a valid image file (JPG, PNG, GIF, or WebP).');
            document.getElementById('n8n-widget-file').value = '';
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('n8n-preview-image').src = e.target.result;
            document.getElementById('n8n-file-info').innerHTML = `
                <div style="margin-top: 10px; font-size: 0.9rem; color: #666;">
                    File: ${file.name} (${(file.size / 1024).toFixed(1)}KB)
                </div>
            `;
            document.getElementById('n8n-preview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    async function generateWorkflow() {
        const projectName = document.getElementById('n8n-project-name').value;
        const workflowType = document.getElementById('n8n-workflow-type').value;
        const description = document.getElementById('n8n-description').value;
        const file = document.getElementById('n8n-widget-file').files[0];

        // Validation
        if (!file) {
            alert('Please select a workflow diagram image');
            return;
        }

        currentProjectName = projectName || 'THLS N8N Workflow';

        // Show loading
        document.getElementById('n8n-loading').style.display = 'block';
        document.getElementById('n8n-results').style.display = 'none';
        document.getElementById('n8n-generate-btn').disabled = true;

        try {
            // Convert image to base64
            const base64Image = await fileToBase64(file);

            // Enhanced description based on workflow type
            const enhancedDescription = description || getWorkflowDescription(workflowType);

            // Create list of valid node types for Claude
            const validNodeTypes = Object.values(N8N_NODE_DATABASE).map(node => 
                `- ${node.name}: ${node.type} (${node.common_names.join(', ')})`
            ).join('\n');

            // Prepare Claude API request with improved prompt
            const claudeRequest = {
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 2000,
                messages: [{
                    role: 'user',
                    content: [{
                        type: 'text',
                        text: `Analyze this workflow diagram and create N8N JSON configuration.

IMPORTANT: Use ONLY these valid N8N node types:
${validNodeTypes}

VISUAL ANALYSIS STEPS:
1. Identify all boxes/nodes in the diagram
2. Read text labels exactly as shown
3. Map connections between nodes
4. Handle parallel flows correctly

MAPPING RULES:
- "Research Agent" or "Scriptwriting Agent" → use type: "n8n-nodes-langchain.agent"
- "OpenAI Chat Model" or "GPT-4" → use type: "n8n-nodes-langchain.openAi"
- "HTTP Request" or API calls → use type: "n8n-nodes-base.httpRequest"
- "When chat message received" → use type: "n8n-nodes-base.webhook"
- Any trigger/start node → use type: "n8n-nodes-base.webhook"

REQUIRED JSON STRUCTURE:
{
  "name": "${currentProjectName}",
  "nodes": [
    {
      "id": "unique_id",
      "name": "Exact name from diagram",
      "type": "valid.node.type",
      "position": [x, y],
      "parameters": {
        // Node-specific parameters
      }
    }
  ],
  "connections": {
    "source_id": {
      "main": [
        [
          {
            "node": "target_id",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}

PROJECT: ${currentProjectName}
DESCRIPTION: ${enhancedDescription}

OUTPUT ONLY VALID JSON:`
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

            // Make request to Netlify function
            const response = await fetch(WIDGET_CONFIG.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(claudeRequest)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(`API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
            }

            const claudeResponse = await response.json();
            
            // Process Claude's response
            let workflowJson = claudeResponse.content[0].text.trim();
            
            // Remove markdown formatting if present
            if (workflowJson.startsWith('```json')) {
                workflowJson = workflowJson.replace(/^```json\n/, '').replace(/\n```$/, '');
            } else if (workflowJson.startsWith('```')) {
                workflowJson = workflowJson.replace(/^```\n/, '').replace(/\n```$/, '');
            }

            // Parse and fix the workflow
            let workflow = JSON.parse(workflowJson);
            
            // Fix common issues and validate node types
            workflow = fixWorkflowStructure(workflow);
            workflow = correctNodeTypes(workflow);
            
            currentWorkflow = workflow;
            
            // Hide loading
            document.getElementById('n8n-loading').style.display = 'none';
            document.getElementById('n8n-generate-btn').disabled = false;

            // Show success results
            displayResults({
                status: 'success',
                data: {
                    workflow: workflow,
                    nodeCount: workflow.nodes.length,
                    generatedFor: 'The Hearing Lab Store Ltd',
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error) {
            // Hide loading
            document.getElementById('n8n-loading').style.display = 'none';
            document.getElementById('n8n-generate-btn').disabled = false;

            // Show error
            displayError('Generation failed: ' + error.message);
        }
    }

    // Correct node types based on our database
    function correctNodeTypes(workflow) {
        if (!workflow || !workflow.nodes) return workflow;

        workflow.nodes = workflow.nodes.map(node => {
            // Try to find correct node type
            const originalType = node.type;
            const nodeName = (node.name || '').toLowerCase();
            
            // First check direct mappings
            if (NODE_NAME_MAPPINGS[nodeName]) {
                const correctNode = N8N_NODE_DATABASE[NODE_NAME_MAPPINGS[nodeName]];
                if (correctNode) {
                    node.type = correctNode.type;
                    // Add default parameters if missing
                    if (!node.parameters || Object.keys(node.parameters).length === 0) {
                        node.parameters = { ...correctNode.parameters };
                    }
                }
            } else {
                // Try to find by partial match
                const foundNode = findNodeByName(nodeName) || findNodeByType(originalType);
                if (foundNode) {
                    node.type = foundNode.type;
                    // Add default parameters if missing
                    if (!node.parameters || Object.keys(node.parameters).length === 0) {
                        node.parameters = { ...foundNode.parameters };
                    }
                }
            }

            // Special handling for specific nodes
            if (nodeName.includes('firecrawl')) {
                node.type = 'n8n-nodes-base.httpRequest';
                node.parameters = {
                    ...node.parameters,
                    url: node.parameters.url || 'https://api.firecrawl.dev/v0/scrape',
                    method: 'POST',
                    authentication: 'headerAuth'
                };
            } else if (nodeName.includes('heygen') || nodeName.includes('video')) {
                node.type = 'n8n-nodes-base.httpRequest';
                node.parameters = {
                    ...node.parameters,
                    url: node.parameters.url || 'https://api.heygen.com/v2/video/generate',
                    method: 'POST',
                    authentication: 'headerAuth'
                };
            }

            return node;
        });

        return workflow;
    }

    // Helper function to find node by name
    function findNodeByName(searchTerm) {
        const term = searchTerm.toLowerCase();
        
        for (const [key, node] of Object.entries(N8N_NODE_DATABASE)) {
            // Check exact match
            if (node.name.toLowerCase() === term) {
                return node;
            }
            
            // Check common names
            if (node.common_names.some(name => term.includes(name) || name.includes(term))) {
                return node;
            }
            
            // Check description
            if (node.description.toLowerCase().includes(term)) {
                return node;
            }
        }
        
        return null;
    }

    // Helper function to find node by type
    function findNodeByType(type) {
        if (!type) return null;
        
        // Remove any prefixes and clean up
        const cleanType = type.replace('n8n-nodes-base.', '').replace('n8n-nodes-langchain.', '');
        
        for (const [key, node] of Object.entries(N8N_NODE_DATABASE)) {
            if (node.type.includes(cleanType) || cleanType.includes(key)) {
                return node;
            }
        }
        
        return null;
    }

    function getWorkflowDescription(workflowType) {
        const descriptions = {
            'general': 'Convert this N8N workflow diagram to a working JSON configuration with proper error handling',
            'customer': 'Create an N8N workflow for customer communication automation with email notifications and CRM integration',
            'inventory': 'Generate an N8N workflow for inventory management with stock alerts and supplier notifications',
            'training': 'Build an N8N workflow for training content automation and learner progress tracking',
            'reporting': 'Create an N8N workflow for automated reporting with data collection and dashboard updates'
        };
        return descriptions[workflowType] || descriptions['general'];
    }

    function displayResults(result) {
        const resultsSection = document.getElementById('n8n-results');
        const messageArea = document.getElementById('n8n-message-area');
        const workflowOutput = document.getElementById('n8n-workflow-output');
        const validationStatus = document.getElementById('n8n-validation-status');

        resultsSection.style.display = 'block';

        if (result.status === 'success') {
            messageArea.innerHTML = `
                <div class="n8n-success-message">
                    ✅ Workflow generated successfully! The JSON is ready to import into N8N.
                </div>
            `;

            workflowOutput.textContent = JSON.stringify(result.data.workflow, null, 2);
            
            // Show validation status
            const validation = validateN8NWorkflow(result.data.workflow);
            if (validation.isValid) {
                validationStatus.innerHTML = `
                    <div class="n8n-validation-valid">
                        ✅ Valid N8N workflow - Ready for import
                    </div>
                `;
            } else {
                validationStatus.innerHTML = `
                    <div class="n8n-validation-invalid">
                        ⚠️ Validation warnings: ${validation.errors.join(', ')}
                    </div>
                `;
            }
            
            // Generate visual preview
            generateWorkflowPreview(result.data.workflow);

        } else {
            messageArea.innerHTML = `
                <div class="n8n-error-message">
                    ❌ ${result.message || 'Failed to generate workflow'}
                </div>
            `;
            workflowOutput.textContent = 'No output available';
            validationStatus.innerHTML = '';
            document.getElementById('n8n-workflow-preview').innerHTML = '<div style="color: #999; text-align: center; padding: 50px;">No preview available</div>';
        }
    }

    function displayError(message) {
        const resultsSection = document.getElementById('n8n-results');
        const messageArea = document.getElementById('n8n-message-area');
        const workflowOutput = document.getElementById('n8n-workflow-output');
        const validationStatus = document.getElementById('n8n-validation-status');

        resultsSection.style.display = 'block';
        messageArea.innerHTML = `
            <div class="n8n-error-message">
                ❌ ${message}
            </div>
        `;
        workflowOutput.textContent = '';
        validationStatus.innerHTML = '';
        document.getElementById('n8n-workflow-preview').innerHTML = '<div style="color: #999; text-align: center; padding: 50px;">No preview available</div>';
    }

    // Fix common workflow structure issues from Claude
    function fixWorkflowStructure(workflow) {
        if (!workflow || typeof workflow !== 'object') {
            return workflow;
        }

        // Ensure workflow has a name
        if (!workflow.name) {
            workflow.name = currentProjectName || 'N8N Workflow';
        }

        // Fix nodes structure if it's an object instead of array
        if (workflow.nodes && typeof workflow.nodes === 'object' && !Array.isArray(workflow.nodes)) {
            console.log('Converting nodes object to array...');
            const nodesArray = [];
            for (const [nodeId, nodeData] of Object.entries(workflow.nodes)) {
                if (nodeData && typeof nodeData === 'object') {
                    // Ensure the node has an id property
                    nodeData.id = nodeData.id || nodeId;
                    nodesArray.push(nodeData);
                }
            }
            workflow.nodes = nodesArray;
        }

        // Fix connections structure if needed
        if (workflow.connections && typeof workflow.connections === 'object') {
            // Connections are usually correct, but ensure proper structure
            for (const [sourceId, connections] of Object.entries(workflow.connections)) {
                if (connections && typeof connections === 'object') {
                    // Ensure main connections array exists
                    if (!connections.main) {
                        connections.main = [];
                    }
                    // Ensure main is array of arrays
                    if (!Array.isArray(connections.main)) {
                        connections.main = [];
                    }
                    for (let i = 0; i < connections.main.length; i++) {
                        if (!Array.isArray(connections.main[i])) {
                            connections.main[i] = [];
                        }
                    }
                }
            }
        }

        // Ensure all nodes have required properties
        if (Array.isArray(workflow.nodes)) {
            for (let i = 0; i < workflow.nodes.length; i++) {
                const node = workflow.nodes[i];
                if (node && typeof node === 'object') {
                    // Ensure required properties exist
                    if (!node.id) {
                        node.id = `node_${i + 1}`;
                    }
                    if (!node.name) {
                        node.name = node.id || `Node ${i + 1}`;
                    }
                    if (!node.type) {
                        // Try to guess type from name
                        const guessedNode = findNodeByName(node.name);
                        node.type = guessedNode ? guessedNode.type : 'n8n-nodes-base.noOp';
                    }
                    if (!node.position || !Array.isArray(node.position)) {
                        node.position = [100 + i * 200, 100 + Math.floor(i / 3) * 150];
                    }
                    if (!node.parameters || typeof node.parameters !== 'object') {
                        node.parameters = {};
                    }
                }
            }
        }

        return workflow;
    }

    // N8N Workflow Validation
    function validateN8NWorkflow(workflow) {
        const errors = [];
        const warnings = [];

        try {
            // Check basic structure
            if (!workflow || typeof workflow !== 'object') {
                errors.push('Workflow is not a valid object');
                return { isValid: false, errors, warnings };
            }

            if (!workflow.nodes) {
                errors.push('Missing nodes array');
                return { isValid: false, errors, warnings };
            }

            if (!Array.isArray(workflow.nodes)) {
                errors.push('Nodes is not an array');
                return { isValid: false, errors, warnings };
            }

            if (!workflow.connections) {
                warnings.push('Missing connections object');
                workflow.connections = {}; // Set default empty connections
            }

            if (typeof workflow.connections !== 'object') {
                errors.push('Connections is not an object');
                return { isValid: false, errors, warnings };
            }

            // Validate nodes
            const nodeIds = new Set();
            const validNodeTypes = new Set(Object.values(N8N_NODE_DATABASE).map(n => n.type));
            
            for (let i = 0; i < workflow.nodes.length; i++) {
                const node = workflow.nodes[i];
                
                if (!node || typeof node !== 'object') {
                    errors.push(`Node ${i} is not a valid object`);
                    continue;
                }

                if (!node.id) {
                    errors.push(`Node ${i} missing ID`);
                    continue;
                }
                
                if (nodeIds.has(node.id)) {
                    errors.push(`Duplicate node ID: ${node.id}`);
                }
                nodeIds.add(node.id);

                if (!node.type) {
                    errors.push(`Node ${node.id} missing type`);
                } else if (!validNodeTypes.has(node.type)) {
                    warnings.push(`Node ${node.id} uses unrecognized type: ${node.type}`);
                }

                if (!node.position || !Array.isArray(node.position) || node.position.length !== 2) {
                    warnings.push(`Node ${node.id} missing or invalid position`);
                    // Set default position if missing
                    if (!node.position) {
                        node.position = [100 + i * 200, 100];
                    }
                }

                if (!node.name) {
                    warnings.push(`Node ${node.id} missing name`);
                    node.name = node.id; // Set default name
                }
            }

            // Validate connections
            for (const [sourceId, connections] of Object.entries(workflow.connections)) {
                if (!nodeIds.has(sourceId)) {
                    warnings.push(`Connection source ${sourceId} not found in nodes`);
                    continue;
                }

                if (!connections || typeof connections !== 'object') {
                    warnings.push(`Invalid connection structure for ${sourceId}`);
                    continue;
                }

                if (connections.main && Array.isArray(connections.main)) {
                    for (let i = 0; i < connections.main.length; i++) {
                        const connectionGroup = connections.main[i];
                        if (!Array.isArray(connectionGroup)) {
                            warnings.push(`Invalid connection group ${i} for ${sourceId}`);
                            continue;
                        }

                        for (let j = 0; j < connectionGroup.length; j++) {
                            const connection = connectionGroup[j];
                            if (!connection || typeof connection !== 'object') {
                                warnings.push(`Invalid connection ${j} in group ${i} for ${sourceId}`);
                                continue;
                            }

                            if (!connection.node) {
                                warnings.push(`Connection missing target node from ${sourceId}`);
                            } else if (!nodeIds.has(connection.node)) {
                                warnings.push(`Connection target ${connection.node} not found`);
                            }

                            if (!connection.type) {
                                connection.type = 'main'; // Set default
                            }

                            if (typeof connection.index !== 'number') {
                                connection.index = 0; // Set default
                            }
                        }
                    }
                }
            }

            return {
                isValid: errors.length === 0,
                errors: errors,
                warnings: warnings
            };

        } catch (error) {
            return {
                isValid: false,
                errors: ['Workflow validation failed: ' + error.message],
                warnings: []
            };
        }
    }