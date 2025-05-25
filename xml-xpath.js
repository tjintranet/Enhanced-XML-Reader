/**
 * XML XPath Module - Optimized
 * Handles XPath generation and evaluation functionality
 */

// XPath Module Variables
let selectedNode = null;
let xpathFormat = 'absolute';
let currentMatches = [];
let currentMatchIndex = -1;
let isXPathFiltered = false;
let originalFilterState = null;

// Initialize XPath functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeXPathUI();
    
    // Retry initialization if needed
    setTimeout(() => {
        if (!document.getElementById('xpathPanel')) {
            initializeXPathUI();
        }
    }, 500);
});

// =============================================================================
// XPATH UI INITIALIZATION (Optimized)
// =============================================================================

function initializeXPathUI() {
    if (!document.getElementById('xpathPanel')) {
        addXPathPanel();
    }
}

function addXPathPanel() {
    if (document.getElementById('xpathPanel')) return;
    
    const searchSection = document.getElementById('searchSection');
    if (!searchSection) {
        setTimeout(addXPathPanel, 500);
        return;
    }
    
    const xpathPanelHTML = getXPathPanelHTML();
    searchSection.insertAdjacentHTML('afterend', xpathPanelHTML);
    
    setTimeout(() => {
        initializeXPathEventListeners();
        makeXPathPanelCollapsible();
    }, 100);
}

function makeXPathPanelCollapsible() {
    const xpathPanel = document.getElementById('xpathPanel');
    if (!xpathPanel) return;
    
    xpathPanel.classList.add('collapsible-section', 'collapsed');
    
    const header = xpathPanel.querySelector('.card-header');
    if (header) {
        header.classList.add('section-header');
        header.style.cursor = 'pointer';
        
        const collapseBtn = document.createElement('button');
        collapseBtn.className = 'btn btn-sm btn-outline-secondary collapse-btn';
        collapseBtn.type = 'button';
        collapseBtn.innerHTML = '<i class="bi bi-chevron-down"></i>';
        header.appendChild(collapseBtn);
        
        header.addEventListener('click', () => toggleSection('xpathPanel'));
    }
    
    const cardBody = xpathPanel.querySelector('.card-body');
    if (cardBody) {
        cardBody.classList.add('section-content');
        cardBody.style.display = 'none';
    }
}

function getXPathPanelHTML() {
    return `
        <!-- XPath Panel -->
        <div class="card mt-3" id="xpathPanel" style="display: none;">
            <div class="card-header bg-info text-white">
                <h6 class="mb-0"><i class="bi bi-signpost-2"></i> XPath Tools</h6>
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
                                <i class="bi bi-clipboard"></i>
                            </button>
                            <button class="btn btn-outline-secondary" type="button" onclick="clearXPath()" 
                                    title="Clear">
                                <i class="bi bi-x"></i>
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
                            <button class="btn btn-outline-secondary" type="button" onclick="pasteToXPathEvaluator()" 
                                    title="Paste from clipboard">
                                <i class="bi bi-clipboard-plus"></i>
                            </button>
                            <button class="btn btn-outline-secondary" type="button" onclick="clearXPathEvaluator()" 
                                    title="Clear test field">
                                <i class="bi bi-x"></i>
                            </button>
                            <button class="btn btn-success" type="button" onclick="evaluateXPath()">
                                <i class="bi bi-play-fill"></i> Evaluate
                            </button>
                        </div>
                        <div class="form-check mt-2">
                            <input class="form-check-input" type="checkbox" id="filterOnEvaluate" checked>
                            <label class="form-check-label" for="filterOnEvaluate">
                                Filter tree to show only matching elements
                            </label>
                        </div>
                        <div id="xpathResults" class="mt-2" style="display: none;">
                            <div class="alert alert-info mb-0">
                                <div class="d-flex justify-content-between align-items-center">
                                    <small><strong>Results:</strong> <span id="xpathResultCount">0</span> matches found</small>
                                    <div class="xpath-navigation" id="xpathNavigation" style="display: none;">
                                        <div class="btn-group btn-group-sm" role="group">
                                            <button type="button" class="btn btn-outline-primary" onclick="navigateToMatch('previous')" 
                                                    id="xpathPrevBtn" title="Previous match">
                                                <i class="bi bi-chevron-up"></i>
                                            </button>
                                            <span class="btn btn-outline-secondary disabled" id="xpathCurrentMatch">1 of 1</span>
                                            <button type="button" class="btn btn-outline-primary" onclick="navigateToMatch('next')" 
                                                    id="xpathNextBtn" title="Next match">
                                                <i class="bi bi-chevron-down"></i>
                                            </button>
                                            <button type="button" class="btn btn-outline-warning btn-sm" onclick="clearXPathFilter()" 
                                                    title="Clear XPath filter">
                                                <i class="bi bi-eye"></i> Show All
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// =============================================================================
// EVENT LISTENERS (Optimized)
// =============================================================================

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
    
    // XPath evaluator enter key
    const evaluator = document.getElementById('xpathEvaluator');
    if (evaluator) {
        evaluator.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') evaluateXPath();
        });
    }
    
    updateFormatDescription();
}

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

function showXPathPanel() {
    const panel = document.getElementById('xpathPanel');
    if (panel) {
        panel.style.display = 'block';
        updateSectionStatus('xpathPanel', 'Available');
        
        setTimeout(() => {
            initializeXPathEventListeners();
        }, 100);
    } else {
        addXPathPanel();
    }
}

function hideXPathPanel() {
    const panel = document.getElementById('xpathPanel');
    if (panel) {
        panel.style.display = 'none';
        panel.classList.add('collapsed');
        
        const cardBody = panel.querySelector('.card-body');
        if (cardBody) cardBody.style.display = 'none';
        
        const collapseBtn = panel.querySelector('.collapse-btn i');
        if (collapseBtn) collapseBtn.className = 'bi bi-chevron-down';
    }
}

// =============================================================================
// PASTE FUNCTIONALITY (Optimized)
// =============================================================================

async function pasteToXPathEvaluator() {
    try {
        const text = await navigator.clipboard.readText();
        const evaluator = document.getElementById('xpathEvaluator');
        if (evaluator) {
            evaluator.value = text;
            evaluator.focus();
            showXPathMessage('XPath pasted from clipboard!', 'success');
            
            const pasteBtn = evaluator.nextElementSibling;
            if (pasteBtn) {
                pasteBtn.classList.add('btn-success-flash');
                setTimeout(() => pasteBtn.classList.remove('btn-success-flash'), 600);
            }
        }
    } catch (err) {
        showXPathMessage('Paste not supported. Please use Ctrl+V manually.', 'warning');
    }
}

// =============================================================================
// XPATH GENERATION (Optimized)
// =============================================================================

function attachXPathClickHandlers() {
    document.querySelectorAll('.tree-node').forEach(node => {
        const newNode = node.cloneNode(true);
        node.parentNode.replaceChild(newNode, node);
        
        newNode.addEventListener('click', function(e) {
            if (e.target.closest('.tree-toggle')) return;
            
            e.stopPropagation();
            selectNodeForXPath(this);
        });
    });
}

function selectNodeForXPath(treeNode) {
    // Remove previous selection
    document.querySelectorAll('.tree-node.xpath-selected').forEach(node => {
        node.classList.remove('xpath-selected');
    });
    
    // Highlight selected node
    treeNode.classList.add('xpath-selected');
    selectedNode = treeNode;
    
    generateXPathForNode(treeNode);
}

function generateXPathForNode(treeNode) {
    if (!treeNode) return;
    
    const elementName = treeNode.getAttribute('data-element');
    if (!elementName) return;
    
    const generators = {
        absolute: generateAbsoluteXPath,
        relative: generateRelativeXPath,
        optimized: generateOptimizedXPath
    };
    
    const xpath = generators[xpathFormat]?.(treeNode) || generateAbsoluteXPath(treeNode);
    
    const xpathInput = document.getElementById('xpathExpression');
    if (xpathInput) {
        xpathInput.value = xpath;
    }
}

// =============================================================================
// XPATH GENERATION ALGORITHMS (Optimized)
// =============================================================================

function generateAbsoluteXPath(treeNode) {
    const pathParts = [];
    let currentNode = treeNode;
    
    while (currentNode?.classList.contains('tree-node')) {
        const elementName = currentNode.getAttribute('data-element');
        if (elementName) {
            const position = getElementPosition(currentNode);
            pathParts.unshift(`${elementName}[${position}]`);
        }
        
        currentNode = findParentTreeNode(currentNode);
    }
    
    return '/' + pathParts.join('/');
}

function generateRelativeXPath(treeNode) {
    const elementName = treeNode.getAttribute('data-element');
    if (!elementName) return '';
    
    const sameNameNodes = document.querySelectorAll(`[data-element="${elementName}"]`);
    
    if (sameNameNodes.length === 1) {
        return `//${elementName}`;
    } else {
        const position = getGlobalElementPosition(treeNode, elementName);
        return `//${elementName}[${position}]`;
    }
}

function generateOptimizedXPath(treeNode) {
    const elementName = treeNode.getAttribute('data-element');
    if (!elementName) return '';
    
    const attributes = extractAttributesFromNode(treeNode);
    
    // Check for ID attribute
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
    
    return generateRelativeXPath(treeNode);
}

// =============================================================================
// HELPER FUNCTIONS (Optimized)
// =============================================================================

function getElementPosition(treeNode) {
    const elementName = treeNode.getAttribute('data-element');
    const parent = findParentTreeNode(treeNode);
    
    if (!parent) return 1;
    
    const siblings = Array.from(parent.parentElement.querySelectorAll('.tree-node'))
        .filter(node => node.getAttribute('data-element') === elementName && 
                       findParentTreeNode(node) === parent);
    
    return siblings.indexOf(treeNode) + 1;
}

function getGlobalElementPosition(treeNode, elementName) {
    const allSameElements = Array.from(document.querySelectorAll(`[data-element="${elementName}"]`));
    return allSameElements.indexOf(treeNode) + 1;
}

function findParentTreeNode(treeNode) {
    let parent = treeNode.parentElement;
    while (parent && !parent.classList.contains('tree-node')) {
        parent = parent.parentElement;
    }
    return parent;
}

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

function getNodeTextContent(treeNode) {
    if (typeof getDirectTextContent === 'function') {
        return getDirectTextContent(treeNode);
    }
    
    const contentElement = treeNode.querySelector('.tree-content');
    return contentElement ? contentElement.textContent.trim() : '';
}

function isAttributeUnique(elementName, attrName, attrValue) {
    const xpath = `//${elementName}[@${attrName}='${attrValue}']`;
    try {
        const result = evaluateXPathExpression(xpath);
        return result && result.length === 1;
    } catch (e) {
        return false;
    }
}

function isTextContentUnique(elementName, textContent) {
    const xpath = `//${elementName}[text()='${textContent}']`;
    try {
        const result = evaluateXPathExpression(xpath);
        return result && result.length === 1;
    } catch (e) {
        return false;
    }
}

// =============================================================================
// XPATH EVALUATION (Optimized)
// =============================================================================

function evaluateXPath() {
    const evaluator = document.getElementById('xpathEvaluator');
    if (!evaluator?.value.trim()) {
        showXPathMessage('Please enter an XPath expression', 'warning');
        return;
    }
    
    const xpath = evaluator.value.trim();
    
    try {
        const evalBtn = document.querySelector('#xpathPanel .btn-success');
        if (evalBtn) {
            evalBtn.disabled = true;
            evalBtn.innerHTML = '<i class="bi bi-arrow-clockwise spinner-border spinner-border-sm"></i> Evaluating...';
        }
        
        const results = evaluateXPathExpression(xpath);
        displayXPathResults(results, xpath);
        
        if (evalBtn) {
            evalBtn.disabled = false;
            evalBtn.innerHTML = '<i class="bi bi-play-fill"></i> Evaluate';
        }
    } catch (error) {
        const evalBtn = document.querySelector('#xpathPanel .btn-success');
        if (evalBtn) {
            evalBtn.disabled = false;
            evalBtn.innerHTML = '<i class="bi bi-play-fill"></i> Evaluate';
        }
        
        showXPathMessage(`XPath evaluation error: ${error.message}`, 'error');
    }
}

function evaluateXPathExpression(xpath) {
    if (!originalXMLString) {
        throw new Error('No XML document loaded');
    }
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(originalXMLString, 'text/xml');
    
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
        throw new Error('XML parsing error');
    }
    
    const xpathResult = xmlDoc.evaluate(xpath, xmlDoc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    
    const results = [];
    for (let i = 0; i < xpathResult.snapshotLength; i++) {
        results.push(xpathResult.snapshotItem(i));
    }
    
    return results;
}

// =============================================================================
// RESULTS DISPLAY AND FILTERING (Optimized)
// =============================================================================

function displayXPathResults(results, xpath) {
    const resultsDiv = document.getElementById('xpathResults');
    const countSpan = document.getElementById('xpathResultCount');
    const navigationDiv = document.getElementById('xpathNavigation');
    const filterOnEvaluate = document.getElementById('filterOnEvaluate')?.checked;
    
    if (!resultsDiv || !countSpan) return;
    
    countSpan.textContent = results.length;
    resultsDiv.style.display = 'block';
    
    clearAllXPathHighlights();
    
    currentMatches = [];
    currentMatchIndex = -1;
    
    if (results.length > 0 && results.length <= 100) {
        currentMatches = highlightXPathMatches(results);
        
        if (currentMatches.length > 1) {
            navigationDiv.style.display = 'block';
        } else {
            navigationDiv.style.display = 'none';
        }
        
        if (filterOnEvaluate && currentMatches.length > 0) {
            applyXPathFilter(currentMatches);
        }
        
        if (currentMatches.length > 0) {
            currentMatchIndex = 0;
            navigateToCurrentMatch();
            updateNavigationDisplay();
        }
    } else {
        navigationDiv.style.display = 'none';
    }
}

function applyXPathFilter(matchedElements) {
    if (isXPathFiltered) {
        clearXPathFilter();
    }
    
    originalFilterState = {
        searchValue: document.getElementById('searchInput')?.value || '',
        elementFilter: document.getElementById('elementFilter')?.value || '',
        showEmpty: document.getElementById('showEmpty')?.checked ?? true,
        showAttributes: document.getElementById('showAttributes')?.checked ?? true
    };
    
    // Hide all nodes
    document.querySelectorAll('.tree-node').forEach(node => {
        node.style.display = 'none';
        node.setAttribute('data-visible', 'false');
    });
    
    // Show matched nodes and their context
    const nodesToShow = new Set();
    
    matchedElements.forEach(matchedNode => {
        nodesToShow.add(matchedNode);
        
        // Add parent nodes
        let parent = findParentTreeNode(matchedNode);
        while (parent) {
            nodesToShow.add(parent);
            parent = findParentTreeNode(parent);
        }
        
        // Add direct children
        const childrenContainer = matchedNode.nextElementSibling;
        if (childrenContainer?.classList.contains('tree-children')) {
            const directChildren = childrenContainer.querySelectorAll(':scope > .tree-node');
            directChildren.forEach(child => nodesToShow.add(child));
        }
    });
    
    // Show selected nodes
    nodesToShow.forEach(node => {
        node.style.display = '';
        node.setAttribute('data-visible', 'true');
        expandParentsOfElement(node);
    });
    
    isXPathFiltered = true;
    updateVisibleCount();
    
    // Add filter indicator
    const resultHeader = document.querySelector('.card-header .card-title');
    if (resultHeader && !resultHeader.querySelector('.xpath-filter-indicator')) {
        resultHeader.innerHTML += ' <span class="badge bg-warning xpath-filter-indicator">XPath Filtered</span>';
    }
}

function clearXPathFilter() {
    if (!isXPathFiltered) return;
    
    // Show all nodes
    document.querySelectorAll('.tree-node').forEach(node => {
        node.style.display = '';
        node.setAttribute('data-visible', 'true');
    });
    
    // Restore original filter state
    if (originalFilterState) {
        if (originalFilterState.searchValue) {
            document.getElementById('searchInput').value = originalFilterState.searchValue;
        }
        if (originalFilterState.elementFilter) {
            document.getElementById('elementFilter').value = originalFilterState.elementFilter;
        }
        document.getElementById('showEmpty').checked = originalFilterState.showEmpty;
        document.getElementById('showAttributes').checked = originalFilterState.showAttributes;
        
        if (typeof applyFilters === 'function') {
            applyFilters();
        }
    }
    
    isXPathFiltered = false;
    originalFilterState = null;
    
    // Remove filter indicator
    const filterIndicator = document.querySelector('.xpath-filter-indicator');
    if (filterIndicator) {
        filterIndicator.remove();
    }
    
    updateVisibleCount();
}

// =============================================================================
// HIGHLIGHTING AND NAVIGATION (Optimized)
// =============================================================================

function highlightXPathMatches(xmlResults) {
    const matchedElements = [];
    
    document.querySelectorAll('.tree-node[data-match-index]').forEach(node => {
        node.removeAttribute('data-match-index');
    });
    
    xmlResults.forEach((xmlNode, xmlIndex) => {
        if (xmlNode.nodeType === Node.ELEMENT_NODE) {
            const elementName = xmlNode.tagName;
            
            const candidateTreeNodes = Array.from(document.querySelectorAll(`[data-element="${elementName}"]`));
            
            const availableNodes = candidateTreeNodes.filter(node => 
                !node.hasAttribute('data-match-index'));
            
            if (availableNodes.length > 0) {
                const matchedNode = availableNodes[0];
                matchedNode.classList.add('xpath-match');
                matchedNode.setAttribute('data-match-index', matchedElements.length);
                matchedElements.push(matchedNode);
            }
        }
    });
    
    return matchedElements;
}

function navigateToMatch(direction) {
    if (currentMatches.length === 0) return;
    
    if (currentMatchIndex >= 0 && currentMatchIndex < currentMatches.length) {
        currentMatches[currentMatchIndex].classList.remove('xpath-current-match');
    }
    
    if (direction === 'next') {
        currentMatchIndex = (currentMatchIndex + 1) % currentMatches.length;
    } else if (direction === 'previous') {
        currentMatchIndex = currentMatchIndex <= 0 ? currentMatches.length - 1 : currentMatchIndex - 1;
    }
    
    navigateToCurrentMatch();
    updateNavigationDisplay();
}

function navigateToCurrentMatch() {
    if (currentMatchIndex < 0 || currentMatchIndex >= currentMatches.length) return;
    
    const currentMatch = currentMatches[currentMatchIndex];
    
    document.querySelectorAll('.tree-node.xpath-current-match').forEach(node => {
        node.classList.remove('xpath-current-match');
    });
    
    currentMatch.classList.add('xpath-current-match');
    
    expandParentsOfElement(currentMatch);
    
    currentMatch.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
    });
    
    setTimeout(() => {
        selectNodeForXPath(currentMatch);
    }, 300);
}

function updateNavigationDisplay() {
    const currentMatchSpan = document.getElementById('xpathCurrentMatch');
    const prevBtn = document.getElementById('xpathPrevBtn');
    const nextBtn = document.getElementById('xpathNextBtn');
    
    if (!currentMatchSpan || !prevBtn || !nextBtn) return;
    
    if (currentMatches.length > 0) {
        currentMatchSpan.textContent = `${currentMatchIndex + 1} of ${currentMatches.length}`;
        
        prevBtn.disabled = false;
        nextBtn.disabled = false;
        
        prevBtn.title = `Previous match (${currentMatchIndex === 0 ? currentMatches.length : currentMatchIndex} of ${currentMatches.length})`;
        nextBtn.title = `Next match (${currentMatchIndex === currentMatches.length - 1 ? 1 : currentMatchIndex + 2} of ${currentMatches.length})`;
    } else {
        currentMatchSpan.textContent = '0 of 0';
        prevBtn.disabled = true;
        nextBtn.disabled = true;
    }
}

function expandParentsOfElement(element) {
    let currentElement = element;
    
    while (currentElement) {
        const childrenContainer = currentElement.nextElementSibling;
        if (childrenContainer?.classList.contains('tree-children', 'collapsed')) {
            const parentNode = currentElement;
            const toggleButton = parentNode.querySelector('.tree-toggle');
            if (toggleButton) {
                childrenContainer.classList.remove('collapsed');
                const icon = toggleButton.querySelector('i');
                if (icon) {
                    icon.className = 'bi bi-dash';
                }
            }
        }
        
        currentElement = findParentTreeNode(currentElement);
    }
}

// =============================================================================
// UTILITY FUNCTIONS (Optimized)
// =============================================================================

function clearAllXPathHighlights() {
    const classesToRemove = ['xpath-match', 'xpath-current-match', 'xpath-first-match', 'xpath-first-match-pulse'];
    
    document.querySelectorAll('.tree-node').forEach(node => {
        classesToRemove.forEach(cls => node.classList.remove(cls));
        node.removeAttribute('data-match-index');
    });
}

function copyXPathToClipboard() {
    const xpathInput = document.getElementById('xpathExpression');
    if (!xpathInput?.value) {
        showXPathMessage('No XPath expression to copy', 'warning');
        return;
    }
    
    navigator.clipboard.writeText(xpathInput.value).then(() => {
        showXPathMessage('XPath copied to clipboard!', 'success');
        
        const copyBtn = xpathInput.nextElementSibling;
        if (copyBtn) {
            copyBtn.classList.add('btn-success-flash');
            setTimeout(() => copyBtn.classList.remove('btn-success-flash'), 600);
        }
    }).catch(() => {
        xpathInput.select();
        document.execCommand('copy');
        showXPathMessage('XPath copied to clipboard!', 'success');
    });
}

function clearXPathEvaluator() {
    const evaluator = document.getElementById('xpathEvaluator');
    if (evaluator) {
        evaluator.value = '';
        evaluator.focus();
    }
    
    const results = document.getElementById('xpathResults');
    if (results) results.style.display = 'none';
    
    const navigation = document.getElementById('xpathNavigation');
    if (navigation) navigation.style.display = 'none';
    
    if (isXPathFiltered) {
        clearXPathFilter();
    }
    
    clearAllXPathHighlights();
    currentMatches = [];
    currentMatchIndex = -1;
}

function clearXPath() {
    const xpathInput = document.getElementById('xpathExpression');
    if (xpathInput) {
        xpathInput.value = '';
    }
    
    document.querySelectorAll('.tree-node.xpath-selected').forEach(node => {
        node.classList.remove('xpath-selected');
    });
    
    selectedNode = null;
}

// =============================================================================
// MESSAGING SYSTEM (Optimized)
// =============================================================================

function showXPathMessage(message, type = 'info') {
    let messageDiv = document.getElementById('xpathMessage');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'xpathMessage';
        messageDiv.className = 'alert alert-dismissible fade show';
        messageDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px; max-width: 500px;';
        document.body.appendChild(messageDiv);
    }
    
    const alertClass = {
        success: 'alert-success',
        warning: 'alert-warning',
        error: 'alert-danger',
        info: 'alert-info'
    }[type] || 'alert-info';
    
    const iconClass = {
        success: 'bi-check-circle-fill',
        warning: 'bi-exclamation-triangle-fill',
        error: 'bi-x-circle-fill',
        info: 'bi-info-circle-fill'
    }[type] || 'bi-info-circle-fill';
    
    messageDiv.className = `alert ${alertClass} alert-dismissible fade show`;
    messageDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="bi ${iconClass} me-2"></i>
            <div class="flex-grow-1">${message}</div>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    const dismissTime = { error: 5000, warning: 4000 }[type] || 3000;
    setTimeout(() => messageDiv?.remove(), dismissTime);
}

// =============================================================================
// KEYBOARD SHORTCUTS (Optimized)
// =============================================================================

document.addEventListener('keydown', function(e) {
    const xpathPanel = document.getElementById('xpathPanel');
    if (!xpathPanel || xpathPanel.style.display === 'none') return;
    
    // Ctrl+Enter to evaluate XPath
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        evaluateXPath();
    }
    
    // Escape to clear XPath evaluator
    if (e.key === 'Escape') {
        const evaluator = document.getElementById('xpathEvaluator');
        if (evaluator && document.activeElement === evaluator) {
            e.preventDefault();
            clearXPathEvaluator();
        }
    }
    
    // Arrow keys for navigation
    const navigation = document.getElementById('xpathNavigation');
    if (navigation && navigation.style.display !== 'none') {
        if (e.key === 'ArrowUp' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
            e.preventDefault();
            navigateToMatch('previous');
        } else if (e.key === 'ArrowDown' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
            e.preventDefault();
            navigateToMatch('next');
        }
    }
    
    // Copy XPath when expression field is focused
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        const xpathExpression = document.getElementById('xpathExpression');
        if (xpathExpression && document.activeElement === xpathExpression) {
            setTimeout(() => {
                if (xpathExpression.value) {
                    showXPathMessage('XPath copied to clipboard!', 'success');
                }
            }, 100);
        }
    }
    
    // Paste when evaluator field is focused
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        const evaluator = document.getElementById('xpathEvaluator');
        if (evaluator && document.activeElement === evaluator) {
            setTimeout(() => {
                showXPathMessage('Content pasted from clipboard!', 'success');
            }, 100);
        }
    }
});

// =============================================================================
// INTEGRATION FUNCTIONS (Optimized)
// =============================================================================

function isXPathFilterActive() {
    return isXPathFiltered;
}

function getXPathFilterState() {
    return {
        isFiltered: isXPathFiltered,
        matchCount: currentMatches.length,
        currentMatch: currentMatchIndex,
        originalState: originalFilterState
    };
}

function temporarilyDisableXPathFilter() {
    if (isXPathFiltered) {
        clearXPathFilter();
        return true;
    }
    return false;
}

function reEnableXPathFilter() {
    if (currentMatches.length > 0) {
        applyXPathFilter(currentMatches);
    }
}

// =============================================================================
// RESET AND CLEANUP (Optimized)
// =============================================================================

function resetXPathModule() {
    clearXPath();
    
    const evaluator = document.getElementById('xpathEvaluator');
    if (evaluator) evaluator.value = '';
    
    const results = document.getElementById('xpathResults');
    if (results) results.style.display = 'none';
    
    const navigation = document.getElementById('xpathNavigation');
    if (navigation) navigation.style.display = 'none';
    
    if (isXPathFiltered) {
        clearXPathFilter();
    }
    
    clearAllXPathHighlights();
    
    // Reset format to absolute
    const formatRadios = document.querySelectorAll('input[name="xpathFormat"]');
    formatRadios.forEach(radio => {
        radio.checked = radio.value === 'absolute';
    });
    xpathFormat = 'absolute';
    updateFormatDescription();
    
    // Reset filter checkbox
    const filterCheckbox = document.getElementById('filterOnEvaluate');
    if (filterCheckbox) filterCheckbox.checked = true;
    
    // Reset variables
    selectedNode = null;
    currentMatches = [];
    currentMatchIndex = -1;
    isXPathFiltered = false;
    originalFilterState = null;
    
    // Remove messages
    const xpathMessageDiv = document.getElementById('xpathMessage');
    if (xpathMessageDiv?.parentNode) {
        xpathMessageDiv.remove();
    }
    
    hideXPathPanel();
    
    // Remove filter indicator
    const filterIndicator = document.querySelector('.xpath-filter-indicator');
    if (filterIndicator) {
        filterIndicator.remove();
    }
}