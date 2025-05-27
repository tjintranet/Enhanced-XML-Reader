/**
 * XML Core Processing Module - Refactored for Simple Upload
 * Handles file operations, XML parsing, and data structure building
 */

// =============================================================================
// GLOBAL VARIABLES
// =============================================================================

let parsedXMLData = null;
let originalXMLString = '';
let originalFileName = '';
let namespaceMap = new Map();
let namespaceColors = ['namespace-default', 'namespace-1', 'namespace-2', 'namespace-3', 'namespace-4', 'namespace-5'];

// Performance tracking
let performanceMetrics = {
    parseStartTime: 0,
    parseEndTime: 0,
    renderStartTime: 0,
    renderEndTime: 0
};

// =============================================================================
// INITIALIZATION
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    initializeCore();
});

function initializeCore() {
    // Simple initialization
    attachEventListeners();
    
    // Initialize UI state
    initializeUIState();
    
    console.log('XML Core Module initialized');
}

function initializeUIState() {
    // Hide control sections initially
    const controlElements = ['filterControls', 'exportSection'];
    controlElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'none';
    });
    
    // Initialize status
    hideStatus();
}

// =============================================================================
// EVENT HANDLING (SIMPLIFIED)
// =============================================================================

function attachEventListeners() {
    const fileInput = document.getElementById('xmlFileInput');
    
    console.log('attachEventListeners called');
    console.log('fileInput found:', !!fileInput);
    
    if (!fileInput) {
        console.warn('File input not found, retrying...');
        setTimeout(attachEventListeners, 500);
        return;
    }
    
    // Attach change event listener directly to the visible file input
    fileInput.addEventListener('change', handleFileInputChange);
    
    console.log('File input change listener attached');
}

// Remove the triggerFileUpload function as it's no longer needed

function handleFileInputChange(event) {
    console.log('File input change event triggered:', event);
    
    const file = event.target.files[0];
    if (file) {
        console.log('File selected:', file.name, file.type, file.size);
        handleFileSelection(file);
    } else {
        console.log('No file selected');
    }
}

// =============================================================================
// FILE HANDLING
// =============================================================================

function handleFileSelection(file) {
    console.log('=== HANDLE FILE SELECTION ===');
    console.log('File received:', file);
    console.log('File name:', file.name);
    console.log('File type:', file.type);
    console.log('File size:', file.size);
    
    if (!file) {
        console.log('No file provided');
        showStatus('Please select an XML file first.', 'error');
        return;
    }
    
    // Validate file type
    if (!isValidXMLFile(file)) {
        showStatus('Please select a valid XML file (.xml extension required)', 'error');
        return;
    }
    
    // Validate file size (warn for very large files)
    if (file.size > 10 * 1024 * 1024) { // 10MB
        if (!confirm(`Large file detected (${formatFileSize(file.size)}). This may take some time to process. Continue?`)) {
            return;
        }
    }
    
    // Clear all existing data and UI before processing new file
    clearAllData();
    
    // Store file information
    originalFileName = file.name;
    console.log('originalFileName set to:', originalFileName);
    
    // Show processing status
    showStatus('Processing file...', 'info');
    
    // Read file
    console.log('Starting file read...');
    readFile(file);
}

function isValidXMLFile(file) {
    const validTypes = ['text/xml', 'application/xml'];
    const validExtension = file.name.toLowerCase().endsWith('.xml');
    
    return validTypes.includes(file.type) || validExtension;
}

function readFile(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        originalXMLString = e.target.result;
        
        try {
            // Validate XML before processing
            if (validateXMLString(originalXMLString)) {
                parseXML(originalXMLString);
                updateFileUploadArea(file.name, file.size);
                hideStatus();
            } else {
                showStatus('Invalid XML format detected.', 'error');
            }
        } catch (error) {
            console.error('XML Processing Error:', error);
            showStatus('Error parsing XML file. Please check the file format.', 'error');
        }
    };
    
    reader.onerror = function() {
        showStatus('Error reading file. Please try again.', 'error');
    };
    
    reader.onprogress = function(e) {
        if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            showStatus(`Loading file... ${Math.round(percentComplete)}%`, 'info');
        }
    };
    
    reader.readAsText(file);
}

function validateXMLString(xmlString) {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");
        const parseError = xmlDoc.querySelector('parsererror');
        return !parseError;
    } catch (error) {
        return false;
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function updateFileUploadArea(fileName, fileSize) {
    const xmlInfoDiv = document.getElementById('xmlInfo');
    if (!xmlInfoDiv) return;
    
    console.log('=== UPDATING XML INFO AREA ===');
    console.log('File:', fileName, 'Size:', fileSize);
    
    const fileSizeText = fileSize ? formatFileSize(fileSize) : '';
    
    // Update XML info section with file details
    let infoHTML = '<dl class="row mb-0">';
    infoHTML += `<dt class="col-sm-4">File Name:</dt><dd class="col-sm-8">${fileName}</dd>`;
    if (fileSizeText) {
        infoHTML += `<dt class="col-sm-4">File Size:</dt><dd class="col-sm-8">${fileSizeText}</dd>`;
    }
    infoHTML += `<dt class="col-sm-4">Status:</dt><dd class="col-sm-8"><span class="text-success">Successfully loaded</span></dd>`;
    infoHTML += '</dl>';
    
    xmlInfoDiv.innerHTML = infoHTML;
    
    console.log('XML info area updated successfully');
}

function resetFileUploadArea() {
    const xmlInfoDiv = document.getElementById('xmlInfo');
    if (!xmlInfoDiv) return;
    
    // Reset XML info section
    xmlInfoDiv.innerHTML = '<p class="text-muted">XML file information will appear here after upload</p>';
}

// =============================================================================
// STATUS AND UI MANAGEMENT
// =============================================================================

function showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('status');
    if (!statusDiv) return;
    
    statusDiv.style.display = 'block';
    statusDiv.className = `alert alert-${type === 'error' ? 'danger' : 'info'}`;
    
    const icon = getStatusIcon(type);
    statusDiv.innerHTML = `<i class="bi ${icon}"></i> ${message}`;
}

function hideStatus() {
    const statusDiv = document.getElementById('status');
    if (statusDiv) {
        statusDiv.style.display = 'none';
    }
}

function getStatusIcon(type) {
    const icons = {
        info: 'bi-info-circle-fill',
        error: 'bi-exclamation-triangle-fill',
        success: 'bi-check-circle-fill',
        warning: 'bi-exclamation-triangle-fill'
    };
    return icons[type] || icons.info;
}

// =============================================================================
// XML PARSING
// =============================================================================

function parseXML(xmlString) {
    performanceMetrics.parseStartTime = performance.now();
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    
    // Reset all modules
    resetModules();
    
    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
        displayParseError(parseError);
        return;
    }
    
    // Initialize statistics and data structures
    const xmlStats = initializeXMLStats();
    namespaceMap.clear();
    
    // Process the XML document
    try {
        processNamespaces(xmlDoc.documentElement);
        parsedXMLData = buildTreeStructure(xmlDoc.documentElement, 0, xmlStats);
        
        performanceMetrics.parseEndTime = performance.now();
        
        // Notify other modules and update UI
        notifyModules(xmlDoc.documentElement, xmlStats);
        showControlSections();
        
        // Log performance metrics
        logPerformanceMetrics(xmlStats);
        
    } catch (error) {
        console.error('XML Processing Error:', error);
        showStatus('Error processing XML structure. Please check the file format.', 'error');
    }
}

function displayParseError(parseError) {
    const resultDiv = document.getElementById('result');
    if (resultDiv) {
        resultDiv.innerHTML = `
            <div class="alert alert-danger">
                <h6><i class="bi bi-exclamation-triangle-fill"></i> XML Parsing Error</h6>
                <p>${parseError.textContent}</p>
                <small class="text-muted">Please check your XML file for syntax errors.</small>
            </div>
        `;
    }
}

function initializeXMLStats() {
    return {
        totalElements: 0,
        uniqueElements: new Set(),
        maxDepth: 0,
        totalAttributes: 0,
        totalTextNodes: 0,
        namespaceCount: 0,
        fileSize: originalXMLString.length
    };
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
        
        // Process children recursively
        Array.from(el.children).forEach(processElement);
    };
    
    processElement(element);
}

function buildTreeStructure(element, depth, xmlStats) {
    // Update statistics
    xmlStats.totalElements++;
    xmlStats.uniqueElements.add(element.tagName);
    xmlStats.maxDepth = Math.max(xmlStats.maxDepth, depth);
    xmlStats.totalAttributes += element.attributes.length;
    
    // Create node structure
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
        isEmpty: false,
        nodeIndex: xmlStats.totalElements - 1
    };
    
    // Process attributes
    Array.from(element.attributes).forEach(attr => {
        node.attributes[attr.name] = attr.value;
    });
    
    // Extract direct text content (not from children)
    let textContent = '';
    Array.from(element.childNodes).forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
            const trimmedText = child.textContent.trim();
            if (trimmedText) {
                textContent += trimmedText;
                xmlStats.totalTextNodes++;
            }
        }
    });
    node.textContent = textContent;
    
    // Determine if node is empty
    node.isEmpty = !textContent && element.children.length === 0;
    
    // Process child elements recursively
    Array.from(element.children).forEach(child => {
        node.children.push(buildTreeStructure(child, depth + 1, xmlStats));
    });
    
    return node;
}

function logPerformanceMetrics(xmlStats) {
    const parseTime = performanceMetrics.parseEndTime - performanceMetrics.parseStartTime;
    
    console.group('XML Processing Metrics');
    console.log(`Parse Time: ${parseTime.toFixed(2)}ms`);
    console.log(`Total Elements: ${xmlStats.totalElements}`);
    console.log(`Unique Elements: ${xmlStats.uniqueElements.size}`);
    console.log(`Max Depth: ${xmlStats.maxDepth}`);
    console.log(`Total Attributes: ${xmlStats.totalAttributes}`);
    console.log(`Text Nodes: ${xmlStats.totalTextNodes}`);
    console.log(`Namespaces: ${namespaceMap.size}`);
    console.log(`File Size: ${formatFileSize(xmlStats.fileSize)}`);
    console.groupEnd();
    
    // Show performance warning for large files
    if (xmlStats.totalElements > 1000) {
        console.warn(`Large XML file detected: ${xmlStats.totalElements} elements. Consider performance optimizations.`);
    }
}

// =============================================================================
// MODULE INTEGRATION
// =============================================================================

function resetModules() {
    // Reset XPath module
    if (typeof resetXPathModule === 'function') {
        resetXPathModule();
    }
    
    // Reset UI module
    if (typeof resetUIModule === 'function') {
        resetUIModule();
    }
    
    // Reset schema module
    if (typeof resetSchemaModule === 'function') {
        resetSchemaModule();
    }
}

function notifyModules(xmlDoc, xmlStats) {
    // Analyze for schema generation
    if (typeof analyzeForSchema === 'function') {
        try {
            schemaAnalysis = analyzeForSchema(xmlDoc);
        } catch (error) {
            console.warn('Schema analysis failed:', error);
        }
    }
    
    // Populate element filter
    if (typeof populateElementFilter === 'function') {
        try {
            populateElementFilter(xmlStats);
        } catch (error) {
            console.warn('Element filter population failed:', error);
        }
    }
    
    // Display tree
    if (typeof displayTree === 'function') {
        try {
            performanceMetrics.renderStartTime = performance.now();
            displayTree();
            performanceMetrics.renderEndTime = performance.now();
            
            const renderTime = performanceMetrics.renderEndTime - performanceMetrics.renderStartTime;
            console.log(`Tree Render Time: ${renderTime.toFixed(2)}ms`);
        } catch (error) {
            console.error('Tree display failed:', error);
            showStatus('Error displaying XML tree. Please refresh and try again.', 'error');
        }
    }
    
    // Show XPath panel
    if (typeof showXPathPanel === 'function') {
        try {
            showXPathPanel();
        } catch (error) {
            console.warn('XPath panel initialization failed:', error);
        }
    }
}

function showControlSections() {
    const sections = ['filterControls', 'exportSection'];
    sections.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'block';
        }
    });
}

// =============================================================================
// DATA CLEARING AND RESET
// =============================================================================

function clearAllData() {
    // Reset core variables
    parsedXMLData = null;
    originalXMLString = '';
    originalFileName = '';
    namespaceMap.clear();
    
    // Reset performance metrics
    performanceMetrics = {
        parseStartTime: 0,
        parseEndTime: 0,
        renderStartTime: 0,
        renderEndTime: 0
    };
    
    // Clear results
    const resultDiv = document.getElementById('result');
    if (resultDiv) resultDiv.innerHTML = '';
    
    // Reset other modules
    resetModules();
    
    console.log('All data cleared for new file');
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function escapeHtml(text) {
    if (!text) return '';
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function downloadFile(content, filename, mimeType) {
    try {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        // Show success message
        if (typeof showMessage === 'function') {
            showMessage(`File "${filename}" downloaded successfully`, 'success', 2000);
        }
        
    } catch (error) {
        console.error('Download failed:', error);
        if (typeof showMessage === 'function') {
            showMessage('Download failed. Please try again.', 'error');
        }
    }
}

// Performance utilities
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Data validation utilities
function validateXMLNode(node) {
    return node && 
           typeof node.tagName === 'string' && 
           node.tagName.length > 0 &&
           typeof node.depth === 'number' &&
           node.depth >= 0;
}

function sanitizeFileName(fileName) {
    return fileName.replace(/[^a-z0-9\-_.]/gi, '_');
}

// =============================================================================
// DATA EXPORT AND IMPORT
// =============================================================================

function exportXMLData(format = 'json') {
    if (!parsedXMLData) {
        if (typeof showMessage === 'function') {
            showMessage('No XML data available to export', 'warning');
        }
        return null;
    }
    
    try {
        switch (format.toLowerCase()) {
            case 'json':
                return JSON.stringify(parsedXMLData, null, 2);
            case 'summary':
                return generateXMLSummary();
            case 'stats':
                return generateStatsReport();
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    } catch (error) {
        console.error('Export failed:', error);
        if (typeof showMessage === 'function') {
            showMessage(`Export failed: ${error.message}`, 'error');
        }
        return null;
    }
}

function generateXMLSummary() {
    const stats = calculateXMLStatistics();
    
    return {
        fileName: originalFileName,
        fileSize: originalXMLString.length,
        parsed: new Date().toISOString(),
        statistics: stats,
        namespaces: Array.from(namespaceMap.entries()).map(([uri, info]) => ({
            uri,
            prefix: info.prefix,
            elements: countElementsInNamespace(uri)
        })),
        structure: {
            rootElement: parsedXMLData?.tagName,
            totalLevels: stats.maxDepth + 1,
            largestElement: findLargestElement()
        }
    };
}

function generateStatsReport() {
    const stats = calculateXMLStatistics();
    
    let report = `XML File Statistics Report\n`;
    report += `=====================================\n\n`;
    report += `File: ${originalFileName}\n`;
    report += `Size: ${formatFileSize(originalXMLString.length)}\n`;
    report += `Parsed: ${new Date().toLocaleString()}\n\n`;
    report += `Structure:\n`;
    report += `- Total Elements: ${stats.totalElements}\n`;
    report += `- Unique Element Types: ${stats.uniqueElements}\n`;
    report += `- Maximum Depth: ${stats.maxDepth}\n`;
    report += `- Total Attributes: ${stats.totalAttributes}\n`;
    report += `- Text Nodes: ${stats.totalTextNodes}\n`;
    report += `- Namespaces: ${namespaceMap.size}\n\n`;
    
    if (namespaceMap.size > 0) {
        report += `Namespaces:\n`;
        namespaceMap.forEach((info, uri) => {
            report += `- ${info.prefix}: ${uri}\n`;
        });
        report += `\n`;
    }
    
    return report;
}

function calculateXMLStatistics() {
    if (!parsedXMLData) return {};
    
    const stats = {
        totalElements: 0,
        uniqueElements: 0,
        maxDepth: 0,
        totalAttributes: 0,
        totalTextNodes: 0,
        emptyElements: 0
    };
    
    function analyzeNode(node) {
        stats.totalElements++;
        stats.maxDepth = Math.max(stats.maxDepth, node.depth);
        stats.totalAttributes += Object.keys(node.attributes).length;
        
        if (node.textContent) {
            stats.totalTextNodes++;
        }
        
        if (node.isEmpty) {
            stats.emptyElements++;
        }
        
        node.children.forEach(analyzeNode);
    }
    
    analyzeNode(parsedXMLData);
    
    // Count unique elements from the global set
    const uniqueElements = new Set();
    function countUnique(node) {
        uniqueElements.add(node.tagName);
        node.children.forEach(countUnique);
    }
    countUnique(parsedXMLData);
    stats.uniqueElements = uniqueElements.size;
    
    return stats;
}

function countElementsInNamespace(namespaceURI) {
    if (!parsedXMLData) return 0;
    
    let count = 0;
    function countNodes(node) {
        if (node.namespaceURI === namespaceURI) {
            count++;
        }
        node.children.forEach(countNodes);
    }
    countNodes(parsedXMLData);
    
    return count;
}

function findLargestElement() {
    if (!parsedXMLData) return null;
    
    let largest = { node: null, size: 0 };
    
    function calculateSize(node) {
        let size = node.textContent.length + Object.keys(node.attributes).length * 10;
        node.children.forEach(child => {
            size += calculateSize(child);
        });
        
        if (size > largest.size) {
            largest = { node: node.tagName, size };
        }
        
        return size;
    }
    
    calculateSize(parsedXMLData);
    return largest.node;
}

// =============================================================================
// ERROR HANDLING AND RECOVERY
// =============================================================================

function handleCriticalError(error, context = 'Unknown') {
    console.error(`Critical error in ${context}:`, error);
    
    showStatus(`Critical error occurred: ${error.message}`, 'error');
    
    // Try to recover by resetting state
    try {
        resetApplicationState();
    } catch (recoveryError) {
        console.error('Recovery failed:', recoveryError);
    }
}

function resetApplicationState() {
    // Reset core variables
    parsedXMLData = null;
    originalXMLString = '';
    originalFileName = '';
    namespaceMap.clear();
    
    // Reset performance metrics
    performanceMetrics = {
        parseStartTime: 0,
        parseEndTime: 0,
        renderStartTime: 0,
        renderEndTime: 0
    };
    
    // Reset file input
    const fileInput = document.getElementById('xmlFileInput');
    if (fileInput) fileInput.value = '';
    
    // Reset XML info
    resetFileUploadArea();
    hideStatus();
    
    // Hide control sections
    const sections = ['filterControls', 'exportSection'];
    sections.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'none';
    });
    
    // Clear results
    const resultDiv = document.getElementById('result');
    if (resultDiv) resultDiv.innerHTML = '';
    
    console.log('Application state reset successfully');
}

// =============================================================================
// MAIN CLEAR FUNCTION
// =============================================================================

function clearAll() {
    try {
        // Reset file input
        const fileInput = document.getElementById('xmlFileInput');
        if (fileInput) fileInput.value = '';
        
        // Clear results
        const resultDiv = document.getElementById('result');
        if (resultDiv) resultDiv.innerHTML = '';
        
        // Hide status and control sections
        hideStatus();
        const sections = ['filterControls', 'exportSection'];
        sections.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.style.display = 'none';
        });
        
        // Reset XML info
        resetFileUploadArea();
        
        // Reset core variables
        parsedXMLData = null;
        originalXMLString = '';
        originalFileName = '';
        namespaceMap.clear();
        
        // Reset performance metrics
        performanceMetrics = {
            parseStartTime: 0,
            parseEndTime: 0,
            renderStartTime: 0,
            renderEndTime: 0
        };
        
        // Reset other modules
        resetModules();
        
        console.log('All data cleared successfully');
        
    } catch (error) {
        handleCriticalError(error, 'clearAll');
    }
}

// =============================================================================
// GLOBAL API EXPOSURE
// =============================================================================

// Expose core functions for external use
window.XMLCoreModule = {
    // Data access
    getParsedData: () => parsedXMLData,
    getOriginalXML: () => originalXMLString,
    getFileName: () => originalFileName,
    getNamespaces: () => namespaceMap,
    
    // Statistics
    getPerformanceMetrics: () => performanceMetrics,
    getXMLStatistics: calculateXMLStatistics,
    
    // Export functions
    exportData: exportXMLData,
    downloadFile: downloadFile,
    
    // Utility functions
    escapeHtml: escapeHtml,
    escapeRegExp: escapeRegExp,
    formatFileSize: formatFileSize,
    
    // Control functions
    clearAll: clearAll,
    resetApplicationState: resetApplicationState
};

console.log('XML Core Module loaded successfully');