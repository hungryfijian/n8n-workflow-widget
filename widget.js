// N8N Workflow Generator Widget
// Version 1.0 - THLS Widget
(function() {
    'use strict';

    // Widget configuration
    const WIDGET_CONFIG = {
        apiEndpoint: 'https://n8n-generator.netlify.app/.netlify/functions/claude-api',
        containerId: 'n8n-workflow-generator',
        maxFileSize: 2 * 1024 * 1024 // 2MB
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
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 8px;
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
                    margin-bottom: 15px;
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
                        <div class="n8n-workflow-output" id="n8n-workflow-output"></div>
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

            // Prepare Claude API request
            const claudeRequest = {
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 2000,
                messages: [{
                    role: 'user',
                    content: [{
                        type: 'text',
                        text: `You are an expert N8N workflow developer. Analyze this workflow diagram image in detail and create a comprehensive N8N workflow JSON.

ANALYZE THE IMAGE CAREFULLY:
1. Identify ALL nodes, boxes, and connections shown
2. Note any text labels, API endpoints, or tool names visible
3. Recognize the complete flow from start to finish
4. Include ALL stages and components you can see

CREATE A DETAILED WORKFLOW:
- Use appropriate N8N node types for each component
- Include multiple nodes if you see multiple stages or tools
- Add HTTP Request nodes for any API calls or external services shown
- Connect all nodes according to the flow in the image
- Use descriptive names matching what you see in the image

Description: ${enhancedDescription}
Project: ${currentProjectName}

Respond with ONLY valid JSON that represents the complete workflow shown in the image.`
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

            // Validate JSON
            const workflow = JSON.parse(workflowJson);
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

        resultsSection.style.display = 'block';

        if (result.status === 'success') {
            messageArea.innerHTML = `
                <div class="n8n-success-message">
                    ✅ Workflow generated successfully! The JSON is ready to import into N8N.
                </div>
            `;

            workflowOutput.textContent = JSON.stringify(result.data.workflow, null, 2);
        } else {
            messageArea.innerHTML = `
                <div class="n8n-error-message">
                    ❌ ${result.message || 'Failed to generate workflow'}
                </div>
            `;
            workflowOutput.textContent = 'No output available';
        }
    }

    function displayError(message) {
        const resultsSection = document.getElementById('n8n-results');
        const messageArea = document.getElementById('n8n-message-area');
        const workflowOutput = document.getElementById('n8n-workflow-output');

        resultsSection.style.display = 'block';
        messageArea.innerHTML = `
            <div class="n8n-error-message">
                ❌ ${message}
            </div>
        `;
        workflowOutput.textContent = '';
    }

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    // Create image to validate it's actually an image
                    const img = new Image();
                    img.onload = function() {
                        // Image loaded successfully, return base64
                        const base64 = e.target.result.split(',')[1];
                        resolve(base64);
                    };
                    img.onerror = function() {
                        reject(new Error('Invalid image file'));
                    };
                    img.src = e.target.result;
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = function() {
                reject(new Error('Failed to read file'));
            };
            reader.readAsDataURL(file);
        });
    }

    // Public API for the widget
    window.N8NWidget = {
        copyWorkflow: function() {
            if (!currentWorkflow) {
                alert('No workflow to copy');
                return;
            }

            const jsonText = JSON.stringify(currentWorkflow, null, 2);
            
            // Try modern clipboard API
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(jsonText).then(() => {
                    alert('Workflow JSON copied to clipboard!');
                }).catch(() => {
                    fallbackCopy(jsonText);
                });
            } else {
                fallbackCopy(jsonText);
            }

            function fallbackCopy(text) {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                try {
                    const successful = document.execCommand('copy');
                    if (successful) {
                        alert('Workflow JSON copied to clipboard!');
                    } else {
                        alert('Copy failed. Please select and copy the JSON manually from the output above.');
                    }
                } catch (err) {
                    alert('Copy failed. Please select and copy the JSON manually from the output above.');
                } finally {
                    document.body.removeChild(textArea);
                }
            }
        },

        downloadWorkflow: function() {
            if (!currentWorkflow) {
                alert('No workflow to download');
                return;
            }

            const jsonText = JSON.stringify(currentWorkflow, null, 2);
            const filename = `${currentProjectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_workflow.json`;
            
            try {
                const blob = new Blob([jsonText], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } catch (error) {
                alert('Download failed. Please copy the JSON and save it manually as ' + filename);
            }
        },

        resetForm: function() {
            document.getElementById('n8n-preview').style.display = 'none';
            document.getElementById('n8n-results').style.display = 'none';
            document.getElementById('n8n-loading').style.display = 'none';
            
            document.getElementById('n8n-widget-file').value = '';
            document.getElementById('n8n-project-name').value = '';
            document.getElementById('n8n-description').value = '';
            
            currentWorkflow = null;
            currentProjectName = '';
        }
    };

    // Initialize when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWidget);
    } else {
        initWidget();
    }

})();