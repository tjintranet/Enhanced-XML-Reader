/**
 * XML Core Processing Module
 * Handles file operations, XML parsing, and data structure building
 */

// Global Variables
let parsedXMLData = null;
let originalXMLString = '';
let originalFileName = '';
let namespaceMap = new Map();
let namespaceColors = ['namespace-default', 'namespace-1', 'namespace-2', 'namespace-3', 'namespace-4', 'namespace-5'];

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Prevent default drag behaviors on the entire page
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    reattachEventListeners();
});

// File Handling Functions
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    document.getElementById('dragDropArea').classList.add('drag-over');
}

function unhighlight(e) {
    document.getElementById('dragDropArea').classList.remove('drag-over');
}

function handleDrop(e) {
    const files = e.dataTransfer.files;
    
    if (files.length > 0) {
        const file = files[0];
        
        // Check if it's an XML file
        if (file.type === 'text/xml' || file.type === 'application/xml' || file.name.toLowerCase().endsWith('.xml')) {
            handleFileSelection(file);
            
            // Update the file input to reflect the dropped file
            const fileInput = document.getElementById('xmlFileInput');
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;
        } else {
            showStatus('Please drop a valid XML file.', 'error');
        }
    }
}

function handleFileSelection(file) {
    if (!file) {
        showStatus('Please select an XML file first.', 'error');
        return;
    }
    
    // Store the original filename
    originalFileName = file.name;
    
    showStatus('Processing file...', 'info');
    
    const reader = new FileReader();
    reader.onload = function(e) {
        originalXMLString = e.target.result;
        try {
            parseXML(originalXMLString);
            hideStatus();
            
            // Update drag drop area to show selected file
            updateDragDropArea(file.name);
        } catch (error) {
            showStatus('Error parsing XML file. Please check the file format.', 'error');
        }
    };
    reader.onerror = function() {
        showStatus('Error reading file. Please try again.', 'error');
    };
    reader.readAsText(file);
}

function updateDragDropArea(fileName) {
    const dragDropArea = document.getElementById('dragDropArea');
    dragDropArea.innerHTML = `
        <div class="drag-drop-icon" style="color: #28a745;">
            <i class="fas fa-check-circle"></i>
        </div>
        <div class="drag-drop-text" style="color: #28a745;">
            File loaded successfully!
        </div>
        <div class="drag-drop-subtext">
            <strong>${fileName}</strong>
        </div>
        <div class="file-input-wrapper">
            <input class="form-control" type="file" id="xmlFileInput" accept=".xml" style="display: none;">
            <button class="file-input-button" type="button" id="chooseDifferentFileBtn">
                <i class="fas fa-folder-open"></i> Choose Different File
            </button>
        </div>
    `;
    
    // Reattach ALL event listeners to the updated area
    reattachEventListeners();
}

function resetDragDropArea() {
    const dragDropArea = document.getElementById('dragDropArea');
    dragDropArea.innerHTML = `
        <div class="drag-drop-icon">
            <i class="fas fa-cloud-upload-alt"></i>
        </div>
        <div class="drag-drop-text">
            Drag & Drop your XML file here
        </div>
        <div class="drag-drop-subtext">
            or click to browse files
        </div>
        <div class="file-input-wrapper">
            <input class="form-control" type="file" id="xmlFileInput" accept=".xml" style="display: none;">
            <button class="file-input-button" type="button" id="chooseFileBtn">
                <i class="fas fa-folder-open"></i> Choose File
            </button>
        </div>
    `;
    
    // Reattach ALL event listeners
    reattachEventListeners();
}

function reattachEventListeners() {
    const dragDropArea = document.getElementById('dragDropArea');
    const fileInput = document.getElementById('xmlFileInput');
    
    // Clear any existing event listeners by cloning and replacing the element
    const newDragDropArea = dragDropArea.cloneNode(true);
    dragDropArea.parentNode.replaceChild(newDragDropArea, dragDropArea);
    
    // Get references to the new elements
    const freshDragDropArea = document.getElementById('dragDropArea');
    const freshFileInput = document.getElementById('xmlFileInput');
    const fileButton = document.getElementById('chooseDifferentFileBtn') || document.getElementById('chooseFileBtn');
    
    // Attach file input change listener
    if (freshFileInput) {
        freshFileInput.addEventListener('change', function(event) {
            handleFileSelection(event.target.files[0]);
        });
    }
    
    // Attach button click listener
    if (fileButton) {
        fileButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            freshFileInput.click();
        });
    }
    
    // Attach drag and drop listeners
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        freshDragDropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        freshDragDropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        freshDragDropArea.addEventListener(eventName, unhighlight, false);
    });
    
    freshDragDropArea.addEventListener('drop', handleDrop, false);
    
    // Attach click to upload functionality (but not on the button)
    freshDragDropArea.addEventListener('click', function(e) {
        // Only trigger file input if clicking on the drag area itself, not the button
        if (e.target === freshDragDropArea || 
            (e.target.closest('.drag-drop-area') && !e.target.closest('.file-input-button'))) {
            freshFileInput.click();
        }
    });
}

// Status and UI Functions
function showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('status');
    statusDiv.style.display = 'block';
    statusDiv.className = `alert alert-${type === 'error' ? 'danger' : 'info'}`;
    statusDiv.innerHTML = type === 'info' ? 
        `<i class="fas fa-spinner fa-spin"></i> ${message}` : 
        `<i class="fas fa-exclamation-triangle"></i> ${message}`;
}

function hideStatus() {
    document.getElementById('status').style.display = 'none';
}

// XML Parsing Functions
function parseXML(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    
    // Reset stats
    let xmlStats = {
        totalElements: 0,
        uniqueElements: new Set(),
        maxDepth: 0
    };
    namespaceMap.clear();
    
    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
        document.getElementById('result').innerHTML = 
            '<div class="alert alert-danger"><i class="fas fa-exclamation-triangle"></i> XML Parsing Error: ' + 
            parseError.textContent + '</div>';
        return;
    }
    
    // Process namespaces
    processNamespaces(xmlDoc.documentElement);
    
    // Build tree structure
    parsedXMLData = buildTreeStructure(xmlDoc.documentElement, 0, xmlStats);
    
    // Analyze structure for schema generation (if schema module is loaded)
    if (typeof analyzeForSchema === 'function') {
        schemaAnalysis = analyzeForSchema(xmlDoc.documentElement);
    }
    
    // Populate element filter dropdown (if UI module is loaded)
    if (typeof populateElementFilter === 'function') {
        populateElementFilter(xmlStats);
    }
    
    // Display the tree (if UI module is loaded)
    if (typeof displayTree === 'function') {
        displayTree();
    }
    
    // Show controls
    document.getElementById('filterControls').style.display = 'block';
    document.getElementById('exportSection').style.display = 'block';
}

function processNamespaces(element) {
    const processElement = (el) => {
        const namespaceURI = el.namespaceURI;
        if (namespaceURI && !namespaceMap.has(namespaceURI)) {
            const colorIndex = namespaceMap.size % namespaceColors.length;
            namespaceMap.set(namespaceURI, {
                prefix: el.prefix || 'default',
                color: namespaceColors[colorIndex],
                uri: namespaceURI
            });
        }
        
        Array.from(el.children).forEach(processElement);
    };
    
    processElement(element);
}

function buildTreeStructure(element, depth, xmlStats) {
    xmlStats.totalElements++;
    xmlStats.uniqueElements.add(element.tagName);
    xmlStats.maxDepth = Math.max(xmlStats.maxDepth, depth);
    
    const node = {
        tagName: element.tagName,
        localName: element.localName,
        prefix: element.prefix,
        namespaceURI: element.namespaceURI,
        attributes: {},
        textContent: '',
        children: [],
        depth: depth,
        hasChildren: element.children.length > 0,
        isEmpty: !element.textContent.trim() && element.children.length === 0
    };
    
    // Process attributes
    Array.from(element.attributes).forEach(attr => {
        node.attributes[attr.name] = attr.value;
    });
    
    // Get text content (only direct text, not from children)
    let textContent = '';
    Array.from(element.childNodes).forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
            textContent += child.textContent.trim();
        }
    });
    node.textContent = textContent;
    
    // Process children
    Array.from(element.children).forEach(child => {
        node.children.push(buildTreeStructure(child, depth + 1, xmlStats));
    });
    
    return node;
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Reset Functions
function clearAll() {
    document.getElementById('xmlFileInput').value = '';
    document.getElementById('result').innerHTML = '';
    document.getElementById('status').style.display = 'none';
    document.getElementById('filterControls').style.display = 'none';
    document.getElementById('exportSection').style.display = 'none';
    
    // Reset drag drop area
    resetDragDropArea();
    
    // Reset core variables
    parsedXMLData = null;
    originalXMLString = '';
    originalFileName = '';
    namespaceMap.clear();
    
    // Call other module reset functions if they exist
    if (typeof resetUIModule === 'function') {
        resetUIModule();
    }
    
    if (typeof resetSchemaModule === 'function') {
        resetSchemaModule();
    }
}