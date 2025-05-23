/**
 * XML XPath Module
 * Handles XPath generation and evaluation functionality
 */

// XPath Module Variables
let xpathCache = new Map();
let selectedNode = null;
let xpathFormat = 'absolute'; // 'absolute', 'relative', 'optimized'

// Initialize XPath functionality when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeXPathUI();
});

// Initialize XPath UI components
function initializeXPathUI() {
    // Add XPath panel to the page if it doesn't exist
    if (!document.getElementById('xpathPanel')) {
        addXPathPanel();
    }
}

// Add XPath panel to the UI
function addXPathPanel() {
    const filterControls = document.getElementById('filterControls');
    if (!filterControls) return;
    
    const xpathPanelHTML = `
        <!-- XPath Panel -->
        <div class="card mt-3" id="xpathPanel" style="display: none;">
            <div class="card-header bg-info text-white">
                <h6 class="mb-0"><i class="fas fa-route"></i> XPath Tools</h6>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-8">
                        <label for="xpathExpression" class="form-label">Generated XPath Expression</label>
                        <div class="input-group">
                            <input type="text" class="form-control font-monospace" id="xpathExpression" 
                                   placeholder="Click on any element in the tree to generate XPath..." readonly>
                            <button class="btn btn-outline-secondary" type="button" onclick="copyXPathToClipboard()" 
                                    title="Copy to clipboard">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button class="btn btn-outline-secondary" type="button" onclick="clearXPath()" 
                                    title="Clear">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <small class="text-muted">Click on any element in the XML tree to generate its XPath</small>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">XPath Format</label>
                        <div class="btn-group w-100" role="group">
                            <input type="radio" class="btn-check" name="xpathFormat" id="absoluteXPath" value="absolute" checked>
                            <label class="btn btn-outline-primary btn-sm" for="absoluteXPath">Absolute</label>
                            
                            <input type="radio" class="btn-check" name="xpathFormat" id="relativeXPath" value="relative">
                            <label class="btn btn-outline-primary btn-sm" for="relativeXPath">Relative</label>
                            
                            <input type="radio" class="btn-check" name="xpathFormat" id="optimizedXPath" value="optimized">
                            <label class="btn btn-outline-primary btn-sm" for="optimizedXPath">Smart</label>
                        </div>
                        <small class="text-muted mt-1 d-block">
                            <span id="formatDescription">Full path from root</span>
                        </small>
                    </div>
                </div>
                
                <!-- XPath Evaluation Section -->
                <div class="row mt-3">
                    <div class="col-12">
                        <label for="xpathEvaluator" class="form-label">Test XPath Expression</label>
                        <div class="input-group">
                            <input type="text" class="form-control font-monospace" id="xpathEvaluator" 
                                   placeholder="Enter XPath expression to evaluate...">
                            <button class="btn btn-outline-secondary" type="button" onclick="clearXPathEvaluator()" 
                                    title="Clear test field">
                                <i class="fas fa-times"></i>
                            </button>
                            <button class="btn btn-success" type="button" onclick="evaluateXPath()">
                                <i class="fas fa-play"></i> Evaluate
                            </button>
                        </div>
                        <div id="xpathResults" class="mt-2" style="display: none;">
                            <div class="alert alert-info mb-0">
                                <small><strong>Results:</strong> <span id="xpathResultCount">0</span> matches found</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    filterControls.insertAdjacentHTML('afterend', xpathPanelHTML);
    
    // Initialize event listeners immediately after adding the panel
    setTimeout(() => {
        initializeXPathEventListeners();
    }, 0);
}

// Initialize XPath event listeners
function initializeXPathEventListeners() {
    // XPath format change listeners
    document.querySelectorAll('input[name="xpathFormat"]').forEach(radio => {
        radio.addEventListener('change', function() {
            xpathFormat = this.value;
            updateFormatDescription();
            if (selectedNode) {
                generateXPathForNode(selectedNode);
            }
        });
    });
    
    // XPath evaluator enter key support
    const evaluator = document.getElementById('xpathEvaluator');
    if (evaluator) {
        evaluator.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                evaluateXPath();
            }
        });
    }
    
    // Update format description initially
    updateFormatDescription();
}

// Update format description text
function updateFormatDescription() {
    const descriptions = {
        'absolute': 'Full path from root',
        'relative': 'Uses // for any descendant',
        'optimized': 'Uses attributes when available'
    };
    
    const descElement = document.getElementById('formatDescription');
    if (descElement) {
        descElement.textContent = descriptions[xpathFormat] || '';
    }
}

// Show XPath panel when XML is loaded
function showXPathPanel() {
    const panel = document.getElementById('xpathPanel');
    if (panel) {
        panel.style.display = 'block';
        // Ensure event listeners are attached when panel becomes visible
        setTimeout(() => {
            initializeXPathEventListeners();
        }, 100);
    }
}

// Hide XPath panel
function hideXPathPanel() {
    const panel = document.getElementById('xpathPanel');
    if (panel) {
        panel.style.display = 'none';
    }
}

// Add click handlers to tree nodes for XPath generation
function attachXPathClickHandlers() {
    document.querySelectorAll('.tree-node').forEach(node => {
        // Remove existing xpath listeners to avoid duplicates
        const newNode = node.cloneNode(true);
        node.parentNode.replaceChild(newNode, node);
        
        // Add new click listener for XPath generation
        newNode.addEventListener('click', function(e) {
            // Don't interfere with toggle functionality
            if (e.target.closest('.tree-toggle')) {
                return;
            }
            
            e.stopPropagation();
            selectNodeForXPath(this);
        });
    });
}

// Select a node and generate its XPath
function selectNodeForXPath(treeNode) {
    // Remove previous selection highlighting
    document.querySelectorAll('.tree-node.xpath-selected').forEach(node => {
        node.classList.remove('xpath-selected');
    });
    
    // Highlight selected node
    treeNode.classList.add('xpath-selected');
    selectedNode = treeNode;
    
    // Generate XPath for the selected node
    generateXPathForNode(treeNode);
}

// Generate XPath expression for a tree node
function generateXPathForNode(treeNode) {
    if (!treeNode) return;
    
    const elementName = treeNode.getAttribute('data-element');
    if (!elementName) return;
    
    let xpath = '';
    
    switch (xpathFormat) {
        case 'absolute':
            xpath = generateAbsoluteXPath(treeNode);
            break;
        case 'relative':
            xpath = generateRelativeXPath(treeNode);
            break;
        case 'optimized':
            xpath = generateOptimizedXPath(treeNode);
            break;
        default:
            xpath = generateAbsoluteXPath(treeNode);
    }
    
    // Display the generated XPath
    const xpathInput = document.getElementById('xpathExpression');
    if (xpathInput) {
        xpathInput.value = xpath;
    }
}

// Generate absolute XPath (full path from root)
function generateAbsoluteXPath(treeNode) {
    const pathParts = [];
    let currentNode = treeNode;
    
    while (currentNode && currentNode.classList.contains('tree-node')) {
        const elementName = currentNode.getAttribute('data-element');
        if (elementName) {
            const position = getElementPosition(currentNode);
            pathParts.unshift(`${elementName}[${position}]`);
        }
        
        // Move to parent element
        currentNode = findParentTreeNode(currentNode);
    }
    
    return '/' + pathParts.join('/');
}

// Generate relative XPath (using // when beneficial)
function generateRelativeXPath(treeNode) {
    const elementName = treeNode.getAttribute('data-element');
    if (!elementName) return '';
    
    // Check if element name is unique in the document
    const sameNameNodes = document.querySelectorAll(`[data-element="${elementName}"]`);
    
    if (sameNameNodes.length === 1) {
        return `//${elementName}`;
    } else {
        const position = getGlobalElementPosition(treeNode, elementName);
        return `//${elementName}[${position}]`;
    }
}

// Generate optimized XPath (using attributes when available)
function generateOptimizedXPath(treeNode) {
    const elementName = treeNode.getAttribute('data-element');
    if (!elementName) return '';
    
    // Look for unique attributes in the node
    const attributes = extractAttributesFromNode(treeNode);
    
    // Check for ID attribute first
    if (attributes.id) {
        return `//${elementName}[@id='${attributes.id}']`;
    }
    
    // Check for other unique attributes
    for (const [attrName, attrValue] of Object.entries(attributes)) {
        if (isAttributeUnique(elementName, attrName, attrValue)) {
            return `//${elementName}[@${attrName}='${attrValue}']`;
        }
    }
    
    // Check for unique text content
    const textContent = getNodeTextContent(treeNode);
    if (textContent && isTextContentUnique(elementName, textContent)) {
        return `//${elementName}[text()='${textContent}']`;
    }
    
    // Fall back to relative XPath with position
    return generateRelativeXPath(treeNode);
}

// Helper function to get element position among siblings
function getElementPosition(treeNode) {
    const elementName = treeNode.getAttribute('data-element');
    const parent = findParentTreeNode(treeNode);
    
    if (!parent) return 1; // Root element
    
    const siblings = Array.from(parent.parentElement.querySelectorAll('.tree-node'))
        .filter(node => node.getAttribute('data-element') === elementName && 
                       findParentTreeNode(node) === parent);
    
    return siblings.indexOf(treeNode) + 1;
}

// Helper function to get global position for elements with same name
function getGlobalElementPosition(treeNode, elementName) {
    const allSameElements = Array.from(document.querySelectorAll(`[data-element="${elementName}"]`));
    return allSameElements.indexOf(treeNode) + 1;
}

// Helper function to find parent tree node
function findParentTreeNode(treeNode) {
    let parent = treeNode.parentElement;
    while (parent && !parent.classList.contains('tree-node')) {
        parent = parent.parentElement;
    }
    return parent;
}

// Helper function to extract attributes from tree node display
function extractAttributesFromNode(treeNode) {
    const attributes = {};
    const attrElements = treeNode.querySelectorAll('.tree-attribute');
    
    attrElements.forEach(attrElement => {
        const attrText = attrElement.textContent;
        const match = attrText.match(/(\w+)="([^"]+)"/);
        if (match) {
            attributes[match[1]] = match[2];
        }
    });
    
    return attributes;
}

// Helper function to get text content of a node
function getNodeTextContent(treeNode) {
    const contentElement = treeNode.querySelector('.tree-content');
    return contentElement ? contentElement.textContent.trim() : '';
}

// Helper function to check if attribute value is unique
function isAttributeUnique(elementName, attrName, attrValue) {
    const xpath = `//${elementName}[@${attrName}='${attrValue}']`;
    try {
        const result = evaluateXPathExpression(xpath);
        return result && result.length === 1;
    } catch (e) {
        return false;
    }
}

// Helper function to check if text content is unique
function isTextContentUnique(elementName, textContent) {
    const xpath = `//${elementName}[text()='${textContent}']`;
    try {
        const result = evaluateXPathExpression(xpath);
        return result && result.length === 1;
    } catch (e) {
        return false;
    }
}

// Copy XPath to clipboard
function copyXPathToClipboard() {
    const xpathInput = document.getElementById('xpathExpression');
    if (!xpathInput || !xpathInput.value) {
        showXPathMessage('No XPath expression to copy', 'warning');
        return;
    }
    
    navigator.clipboard.writeText(xpathInput.value).then(() => {
        showXPathMessage('XPath copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback for older browsers
        xpathInput.select();
        document.execCommand('copy');
        showXPathMessage('XPath copied to clipboard!', 'success');
    });
}

// Clear XPath evaluator field
function clearXPathEvaluator() {
    const evaluator = document.getElementById('xpathEvaluator');
    if (evaluator) {
        evaluator.value = '';
        evaluator.focus(); // Give focus back to the field after clearing
    }
    
    // Hide results when clearing
    const results = document.getElementById('xpathResults');
    if (results) {
        results.style.display = 'none';
    }
    
    // Clear any previous highlights
    document.querySelectorAll('.tree-node.xpath-match').forEach(node => {
        node.classList.remove('xpath-match');
    });
}

// Clear XPath expression
function clearXPath() {
    const xpathInput = document.getElementById('xpathExpression');
    if (xpathInput) {
        xpathInput.value = '';
    }
    
    // Remove selection highlighting
    document.querySelectorAll('.tree-node.xpath-selected').forEach(node => {
        node.classList.remove('xpath-selected');
    });
    
    selectedNode = null;
}

// Evaluate XPath expression
function evaluateXPath() {
    const evaluator = document.getElementById('xpathEvaluator');
    if (!evaluator || !evaluator.value.trim()) {
        showXPathMessage('Please enter an XPath expression', 'warning');
        return;
    }
    
    const xpath = evaluator.value.trim();
    
    try {
        const results = evaluateXPathExpression(xpath);
        displayXPathResults(results, xpath);
    } catch (error) {
        showXPathMessage(`XPath evaluation error: ${error.message}`, 'error');
    }
}

// Evaluate XPath expression against the original XML
function evaluateXPathExpression(xpath) {
    if (!originalXMLString) {
        throw new Error('No XML document loaded');
    }
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(originalXMLString, 'text/xml');
    
    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
        throw new Error('XML parsing error');
    }
    
    // Evaluate XPath
    const xpathResult = xmlDoc.evaluate(xpath, xmlDoc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    
    const results = [];
    for (let i = 0; i < xpathResult.snapshotLength; i++) {
        results.push(xpathResult.snapshotItem(i));
    }
    
    return results;
}

// Display XPath evaluation results
function displayXPathResults(results, xpath) {
    const resultsDiv = document.getElementById('xpathResults');
    const countSpan = document.getElementById('xpathResultCount');
    
    if (!resultsDiv || !countSpan) return;
    
    countSpan.textContent = results.length;
    resultsDiv.style.display = 'block';
    
    // Clear previous highlights
    document.querySelectorAll('.tree-node.xpath-match').forEach(node => {
        node.classList.remove('xpath-match');
    });
    
    // Highlight matching nodes in the tree if possible
    if (results.length > 0 && results.length <= 50) { // Limit highlighting for performance
        highlightXPathMatches(results);
    }
    
    showXPathMessage(`Found ${results.length} matches for: ${xpath}`, 'info');
}

// Highlight XPath matches in the tree
function highlightXPathMatches(xmlResults) {
    // This is a simplified approach - matching by element name and content
    xmlResults.forEach(xmlNode => {
        if (xmlNode.nodeType === Node.ELEMENT_NODE) {
            const elementName = xmlNode.tagName;
            const textContent = xmlNode.textContent ? xmlNode.textContent.trim() : '';
            
            // Find corresponding tree nodes
            const treeNodes = document.querySelectorAll(`[data-element="${elementName}"]`);
            treeNodes.forEach(treeNode => {
                const treeContent = getNodeTextContent(treeNode);
                if (!textContent || treeContent === textContent) {
                    treeNode.classList.add('xpath-match');
                }
            });
        }
    });
}

// Show XPath message
function showXPathMessage(message, type = 'info') {
    // Create or update message element
    let messageDiv = document.getElementById('xpathMessage');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'xpathMessage';
        messageDiv.className = 'alert alert-dismissible fade show';
        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '20px';
        messageDiv.style.right = '20px';
        messageDiv.style.zIndex = '9999';
        messageDiv.style.minWidth = '300px';
        document.body.appendChild(messageDiv);
    }
    
    const alertClass = type === 'success' ? 'alert-success' : 
                      type === 'warning' ? 'alert-warning' : 
                      type === 'error' ? 'alert-danger' : 'alert-info';
    
    messageDiv.className = `alert ${alertClass} alert-dismissible fade show`;
    messageDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
        if (messageDiv && messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 3000);
}

// Reset XPath module
function resetXPathModule() {
    clearXPath();
    hideXPathPanel();
    
    const evaluator = document.getElementById('xpathEvaluator');
    if (evaluator) {
        evaluator.value = '';
    }
    
    const results = document.getElementById('xpathResults');
    if (results) {
        results.style.display = 'none';
    }
    
    // Clear highlights
    document.querySelectorAll('.tree-node.xpath-match').forEach(node => {
        node.classList.remove('xpath-match');
    });
    
    // Reset format to absolute
    const absoluteRadio = document.getElementById('absoluteXPath');
    if (absoluteRadio) {
        absoluteRadio.checked = true;
        xpathFormat = 'absolute';
        updateFormatDescription();
    }
    
    xpathCache.clear();
    selectedNode = null;
}