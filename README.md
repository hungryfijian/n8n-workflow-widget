# N8N Workflow Generator Widget

A JavaScript widget for converting workflow diagrams into N8N JSON configurations using Claude AI.

## Features
- Upload workflow diagram images
- Generate N8N-compatible JSON workflows
- Copy and download functionality
- Mobile responsive design
- Easy website integration

## Usage
Add this code to any webpage:

```html
<div id="n8n-workflow-generator"></div>
<script src="https://n8n-widget.netlify.app/widget.js"></script>
Development
Developed for The Hearing Lab Store Ltd.
Built with vanilla JavaScript and Netlify Functions.
API Integration
Uses Claude AI via Netlify Functions for secure image analysis and workflow generation.
File Structure

widget.js - Main widget JavaScript
index.html - Demo page
netlify/functions/claude-api.js - Backend API function