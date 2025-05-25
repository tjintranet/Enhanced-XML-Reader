/**
 * XML UI Module - Optimized and Fixed
 * Handles tree visualization, filtering, search, line numbers, and export
 */

// UI Module Variables
let isRegexMode = false;
let searchOptions = {
    elementNames: true,
    textContent: true,
    attributes: true
};
let showLineNumbers = true;
let currentLineNumber = 1;

// Initialize UI when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeUI();
});

// =============================================================================
// UI INITIALIZATION (Optimized)
// =============================================================================

function initializeUI() {
    // Add event listeners for search and filter
    const searchInput = document.getElementById('searchInput');
    const elementFilter = document.getElementById('elementFilter');
    const showEmpty = document.getElementById('showEmpty');
    const showAttributes = document.getElementById('showAttributes');
    
    if (searchInput) searchInput.addEventListener('input', debounce(applyFilters, 300));
    if (elementFilter) elementFilter.addEventListener('change', applyFilters);
    if (showEmpty) showEmpty.addEventListener('change', applyFilters);
    if (showAttributes) showAttributes.addEventListener('change', applyFilters);
    
    // Initialize components
    initializeSearchOptions();
    initializeCollapsibleSections();
    initializeGoToLine();
}

function initializeSearchOptions() {
    setTimeout(() => {
        const checkboxes = ['searchElementNames', 'searchTextContent', 'searchAttributes'];
        checkboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) checkbox.addEventListener('change', updateSearchOptions);
        });
        updateSearchModeText();
    }, 100);
}

// =============================================================================
// COLLAPSIBLE SECTIONS (Optimized)
// =============================================================================

function initializeCollapsibleSections() {
    const sections = {
        uploadSection: { collapsed: false },
        searchSection: { collapsed: true, status: 'Ready' },
        exportSection: { collapsed: true }
    };
    
    Object.entries(sections).forEach(([id, config]) => {
        const section = document.getElementById(id);
        if (section) {
            if (config.collapsed) {
                section.classList.add('collapsed');
                if (config.status) updateSectionStatus(id, config.status);
            }
        }
    });
}

function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const content = section?.querySelector('.section-content');
    const collapseBtn = section?.querySelector('.collapse-btn i');
    
    if (!section || !content) return;
    
    const isCollapsed = section.classList.contains('collapsed');
    
    if (isCollapsed) {
        // Expand
        section.classList.remove('collapsed');
        content.style.display = 'block';
        if (collapseBtn) collapseBtn.className = 'bi bi-chevron-up';
    } else {
        // Collapse
        section.classList.add('collapsed');
        content.style.display = 'none';
        if (collapseBtn) collapseBtn.className = 'bi bi-chevron-down';
    }
}

function updateSectionStatus(sectionId, status) {
    const statusElement = document.getElementById(sectionId + 'Status');
    if (statusElement) {
        statusElement.textContent = status;
        statusElement.classList.add('active');
    }
}

function autoCollapseUploadSection() {
    setTimeout(() => {
        const uploadSection = document.getElementById('uploadSection');
        if (uploadSection && !uploadSection.classList.contains('collapsed')) {
            toggleSection('uploadSection');
            updateSectionStatus('uploadSection', 'File Loaded');
        }
    }, 1000);
}

function showSearchSection() {
    const searchSection = document.getElementById('searchSection');
    if (searchSection?.classList.contains('collapsed')) {
        toggleSection('searchSection');
        updateSectionStatus('searchSection', 'Available');
    }
}

function showExportSection() {
    const exportSection = document.getElementById('exportSection');
    if (exportSection) {
        exportSection.style.display = 'block';
        updateSectionStatus('exportSection', 'Ready');
    }
}

// =============================================================================
// GO TO LINE FUNCTIONALITY (Optimized)
// =============================================================================

function initializeGoToLine() {
    const gotoInput = document.getElementById('gotoLineInput');
    if (gotoInput) {
        gotoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') goToLine();
        });
        
        gotoInput.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            const totalLines = document.querySelectorAll('.tree-node').length;
            
            if (value < 1) e.target.value = 1;
            else if (value > totalLines) e.target.value = totalLines;
        });
    }
}

function goToLine() {
    const gotoInput = document.getElementById('gotoLineInput');
    if (!gotoInput) return;
    
    const lineNumber = parseInt(gotoInput.value);
    if (!lineNumber || lineNumber < 1) {
        showGoToLineMessage('Please enter a valid line number', 'warning');
        return;
    }
    
    const targetNode = document.querySelector(`[data-line="${lineNumber}"]`);
    
    if (!targetNode) {
        const totalLines = document.querySelectorAll('.tree-node').length;
        showGoToLineMessage(`Line ${lineNumber} not found. Valid range: 1-${totalLines}`, 'warning');
        return;
    }
    
    // Check visibility
    const isHidden = targetNode.style.display === 'none' || targetNode.getAttribute('data-visible') === 'false';
    
    if (isHidden) {
        showGoToLineMessage(`Line ${lineNumber} is hidden by current filters`, 'info');
        scrollToLine(targetNode, true);
    } else {
        scrollToLine(targetNode, false);
        showGoToLineMessage(`Jumped to line ${lineNumber}`, 'success');
    }
    
    gotoInput.value = '';
}

function scrollToLine(targetNode, isHidden = false) {
    // Clear existing highlights
    document.querySelectorAll('.goto-line-highlight').forEach(node => {
        node.classList.remove('goto-line-highlight');
    });
    
    // Expand parents
    expandParentsOfNode(targetNode);
    
    // Handle hidden nodes
    if (isHidden) {
        targetNode.style.display = '';
        targetNode.classList.add('goto-line-hidden');
    }
    
    // Highlight and scroll
    targetNode.classList.add('goto-line-highlight');
    targetNode.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
    });
    
    // Remove highlight after delay
    setTimeout(() => {
        targetNode.classList.remove('goto-line-highlight');
        if (isHidden) {
            targetNode.classList.remove('goto-line-hidden');
            if (targetNode.getAttribute('data-visible') === 'false') {
                targetNode.style.display = 'none';
            }
        }
    }, 3000);
}

function expandParentsOfNode(node) {
    let current = node;
    
    while (current) {
        let parent = current.parentElement;
        while (parent && !parent.classList.contains('tree-node')) {
            parent = parent.parentElement;
        }
        
        if (!parent) break;
        
        const childrenContainer = parent.nextElementSibling;
        if (childrenContainer?.classList.contains('tree-children') && childrenContainer.classList.contains('collapsed')) {
            const toggleButton = parent.querySelector('.tree-toggle');
            if (toggleButton) {
                childrenContainer.classList.remove('collapsed');
                const icon = toggleButton.querySelector('i');
                if (icon) icon.className = 'bi bi-dash';
            }
        }
        
        current = parent;
    }
}

function updateGoToLineMax() {
    const gotoInput = document.getElementById('gotoLineInput');
    if (gotoInput) {
        const totalLines = document.querySelectorAll('.tree-node').length;
        gotoInput.max = totalLines;
        gotoInput.placeholder = totalLines > 0 ? `1-${totalLines}` : 'Line';
    }
}

function showGoToLineMessage(message, type = 'info') {
    let messageDiv = document.getElementById('gotoLineMessage');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'gotoLineMessage';
        messageDiv.className = 'alert alert-dismissible fade show goto-line-message';
        messageDiv.style.cssText = 'position: fixed; top: 70px; right: 20px; z-index: 9999; min-width: 250px; max-width: 400px;';
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
    
    messageDiv.className = `alert ${alertClass} alert-dismissible fade show goto-line-message`;
    messageDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="bi ${iconClass} me-2"></i>
            <div class="flex-grow-1">${message}</div>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    const dismissTime = { error: 4000, warning: 3000 }[type] || 2000;
    setTimeout(() => messageDiv?.remove(), dismissTime);
}

// =============================================================================
// LINE NUMBERS FUNCTIONALITY (Optimized)
// =============================================================================

function toggleLineNumbers() {
    showLineNumbers = !showLineNumbers;
    const button = document.getElementById('lineNumberToggle');
    const lineNumbers = document.querySelectorAll('.line-number');
    
    if (!button) return;
    
    if (showLineNumbers) {
        button.className = 'btn btn-sm btn-secondary';
        button.innerHTML = '<i class="bi bi-list-ol"></i>';
        button.title = 'Hide line numbers';
        lineNumbers.forEach(ln => ln.style.display = 'inline-block');
    } else {
        button.className = 'btn btn-sm btn-outline-secondary';
        button.innerHTML = '<i class="bi bi-list-ol"></i>';
        button.title = 'Show line numbers';
        lineNumbers.forEach(ln => ln.style.display = 'none');
    }
}

// =============================================================================
// TREE DISPLAY FUNCTIONS (Optimized)
// =============================================================================

function populateElementFilter(xmlStats) {
    const select = document.getElementById('elementFilter');
    select.innerHTML = '<option value="">All Elements</option>';
    
    Array.from(xmlStats.uniqueElements).sort().forEach(elementName => {
        const option = document.createElement('option');
        option.value = elementName;
        option.textContent = elementName;
        select.appendChild(option);
    });
}

function displayTree() {
    if (!parsedXMLData) return;
    
    currentLineNumber = 1;
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = renderTreeNode(parsedXMLData);
    
    updateVisibleCount();
    updateGoToLineMax();
    
    // Auto-manage sections
    autoCollapseUploadSection();
    showSearchSection();
    showExportSection();
    
    // Attach XPath handlers if available
    if (typeof attachXPathClickHandlers === 'function') {
        attachXPathClickHandlers();
    }
}

function renderTreeNode(node, isVisible = true) {
    const namespaceInfo = namespaceMap.get(node.namespaceURI) || { color: 'namespace-default', prefix: '' };
    const hasToggle = node.hasChildren;
    const toggleIcon = hasToggle ? 'bi bi-dash' : 'bi bi-circle-fill';
    
    // Build attributes HTML
    let attributesHtml = '';
    if (Object.keys(node.attributes).length > 0) {
        const attrStrings = Object.entries(node.attributes).map(([name, value]) => 
            `<span class="tree-attribute">${name}="${escapeHtml(value)}"</span>`
        );
        attributesHtml = ` ${attrStrings.join(' ')}`;
    }
    
    // Build content HTML
    let contentHtml = '';
    if (node.textContent) {
        contentHtml = `<span class="tree-content">${escapeHtml(node.textContent)}</span>`;
    }
    
    // Generate line number
    const lineNumber = currentLineNumber++;
    const lineNumberHtml = showLineNumbers ? 
        `<span class="line-number" data-line="${lineNumber}">${lineNumber}</span>` : '';
    
    let html = `
        <div class="tree-node" data-element="${node.tagName}" data-visible="${isVisible}" data-line="${lineNumber}" style="margin-left: ${node.depth * 20}px;">
            ${lineNumberHtml}
            <span class="tree-toggle" onclick="toggleNode(this)" data-has-children="${hasToggle}">
                ${hasToggle ? `<i class="${toggleIcon}"></i>` : ''}
            </span>
            <span class="tree-element ${namespaceInfo.color}">&lt;${node.tagName}&gt;</span>
            ${attributesHtml}
            ${contentHtml}
        </div>
    `;
    
    if (node.children.length > 0) {
        html += `<div class="tree-children">`;
        node.children.forEach(child => {
            html += renderTreeNode(child, isVisible);
        });
        html += `</div>`;
    }
    
    return html;
}

function toggleNode(toggleElement) {
    const hasChildren = toggleElement.getAttribute('data-has-children') === 'true';
    if (!hasChildren) return;
    
    const treeNode = toggleElement.parentElement;
    const childrenContainer = treeNode.nextElementSibling;
    const icon = toggleElement.querySelector('i');
    
    if (childrenContainer?.classList.contains('tree-children')) {
        const isCollapsed = childrenContainer.classList.contains('collapsed');
        
        if (isCollapsed) {
            childrenContainer.classList.remove('collapsed');
            icon.className = 'bi bi-dash';
        } else {
            childrenContainer.classList.add('collapsed');
            icon.className = 'bi bi-plus';
        }
    }
}

function expandAll() {
    document.querySelectorAll('.tree-children.collapsed').forEach(el => {
        el.classList.remove('collapsed');
    });
    document.querySelectorAll('.tree-toggle i.bi-plus').forEach(icon => {
        icon.className = 'bi bi-dash';
    });
}

function collapseAll() {
    document.querySelectorAll('.tree-children').forEach(el => {
        el.classList.add('collapsed');
    });
    document.querySelectorAll('.tree-toggle i.bi-dash').forEach(icon => {
        icon.className = 'bi bi-plus';
    });
}

// =============================================================================
// SEARCH AND FILTERING (Optimized)
// =============================================================================

function toggleSearchOptions() {
    const options = document.getElementById('searchOptions');
    const icon = document.getElementById('searchOptionsIcon');
    
    if (!options || !icon) return;
    
    const isVisible = options.style.display !== 'none';
    options.style.display = isVisible ? 'none' : 'block';
    
    if (isVisible) {
        icon.classList.remove('bi-gear-fill');
        icon.classList.add('bi-gear');
    } else {
        icon.classList.remove('bi-gear');
        icon.classList.add('bi-gear-fill');
    }
}

function updateSearchOptions() {
    const checkboxes = {
        searchElementNames: 'elementNames',
        searchTextContent: 'textContent', 
        searchAttributes: 'attributes'
    };
    
    Object.entries(checkboxes).forEach(([id, prop]) => {
        const checkbox = document.getElementById(id);
        if (checkbox) searchOptions[prop] = checkbox.checked;
    });
    
    updateSearchModeText();
    
    // Re-apply filters if there's an active search
    const searchInput = document.getElementById('searchInput');
    if (searchInput?.value.trim()) {
        applyFilters();
    }
}

function updateSearchModeText() {
    const modeText = document.getElementById('searchModeText');
    if (!modeText) return;
    
    const activeOptions = [];
    if (searchOptions.elementNames) activeOptions.push('names');
    if (searchOptions.textContent) activeOptions.push('content');
    if (searchOptions.attributes) activeOptions.push('attributes');
    
    const optionsText = activeOptions.length > 0 ? activeOptions.join(', ') : 'nothing';
    const regexText = isRegexMode ? 'regex enabled' : 'regex disabled';
    
    modeText.textContent = `Searching in: ${optionsText} • Direct matches only • ${regexText}`;
}

function applyFilters() {
    if (!parsedXMLData) return;
    
    const searchTerm = document.getElementById('searchInput')?.value || '';
    const elementFilter = document.getElementById('elementFilter')?.value || '';
    const showEmpty = document.getElementById('showEmpty')?.checked ?? true;
    const showAttributes = document.getElementById('showAttributes')?.checked ?? true;
    
    // Clear previous highlights and reset visibility
    document.querySelectorAll('.tree-node').forEach(node => {
        node.classList.remove('highlighted');
        node.style.display = '';
        removeAllHighlights(node);
        
        // Handle attribute visibility
        const attributes = node.querySelectorAll('.tree-attribute');
        attributes.forEach(attr => attr.style.display = showAttributes ? '' : 'none');
    });
    
    // Apply filters
    document.querySelectorAll('.tree-node').forEach(node => {
        const elementName = node.getAttribute('data-element');
        let shouldShow = true;
        
        // Element filter
        if (elementFilter && elementName !== elementFilter) {
            shouldShow = false;
        }
        
        // Empty element filter
        if (!showEmpty) {
            const hasContent = node.querySelector('.tree-content');
            const hasChildren = node.nextElementSibling?.classList.contains('tree-children');
            if (!hasContent && !hasChildren) {
                shouldShow = false;
            }
        }
        
        // Search filter
        if (searchTerm) {
            const matchResult = isDirectMatch(node, searchTerm);
            
            if (matchResult.isMatch) {
                node.classList.add('highlighted');
                highlightMatches(node, searchTerm, matchResult);
            } else {
                shouldShow = false;
            }
        }
        
        node.style.display = shouldShow ? '' : 'none';
        node.setAttribute('data-visible', shouldShow);
    });
    
    updateVisibleCount();
    
    // Reattach XPath handlers if available
    if (typeof attachXPathClickHandlers === 'function') {
        attachXPathClickHandlers();
    }
}

function isDirectMatch(node, searchTerm) {
    const elementName = node.getAttribute('data-element');
    const result = {
        isMatch: false,
        matchType: [],
        content: null
    };
    
    try {
        if (isRegexMode) {
            const regex = new RegExp(searchTerm, 'gi');
            
            if (searchOptions.elementNames && regex.test(elementName)) {
                result.isMatch = true;
                result.matchType.push('elementName');
            }
            
            if (searchOptions.textContent) {
                const directTextContent = getDirectTextContent(node);
                if (directTextContent && regex.test(directTextContent)) {
                    result.isMatch = true;
                    result.matchType.push('textContent');
                    result.content = directTextContent;
                }
            }
            
            if (searchOptions.attributes) {
                const attributeMatch = checkAttributeMatch(node, regex);
                if (attributeMatch.isMatch) {
                    result.isMatch = true;
                    result.matchType.push('attributes');
                    result.matchedAttributes = attributeMatch.matchedAttributes;
                }
            }
            
        } else {
            const searchLower = searchTerm.toLowerCase();
            
            if (searchOptions.elementNames && elementName.toLowerCase().includes(searchLower)) {
                result.isMatch = true;
                result.matchType.push('elementName');
            }
            
            if (searchOptions.textContent) {
                const directTextContent = getDirectTextContent(node);
                if (directTextContent && directTextContent.toLowerCase().includes(searchLower)) {
                    result.isMatch = true;
                    result.matchType.push('textContent');
                    result.content = directTextContent;
                }
            }
            
            if (searchOptions.attributes) {
                const attributeMatch = checkAttributeMatch(node, searchLower, false);
                if (attributeMatch.isMatch) {
                    result.isMatch = true;
                    result.matchType.push('attributes');
                    result.matchedAttributes = attributeMatch.matchedAttributes;
                }
            }
        }
    } catch (e) {
        // Invalid regex fallback
        const searchLower = searchTerm.toLowerCase();
        
        if (searchOptions.elementNames && elementName.toLowerCase().includes(searchLower)) {
            result.isMatch = true;
            result.matchType.push('elementName');
        }
        
        if (searchOptions.textContent) {
            const directTextContent = getDirectTextContent(node);
            if (directTextContent && directTextContent.toLowerCase().includes(searchLower)) {
                result.isMatch = true;
                result.matchType.push('textContent');
                result.content = directTextContent;
            }
        }
    }
    
    return result;
}

function getDirectTextContent(node) {
    const contentElement = node.querySelector('.tree-content');
    return contentElement ? contentElement.textContent.trim() : '';
}

function checkAttributeMatch(node, searchPattern, isRegex = true) {
    const result = {
        isMatch: false,
        matchedAttributes: []
    };
    
    const attributes = node.querySelectorAll('.tree-attribute');
    
    attributes.forEach(attrElement => {
        const attrText = attrElement.textContent;
        let matches = false;
        
        if (isRegex && searchPattern instanceof RegExp) {
            matches = searchPattern.test(attrText);
        } else {
            const searchTerm = isRegex ? searchPattern : searchPattern.toLowerCase();
            const compareText = isRegex ? attrText : attrText.toLowerCase();
            matches = compareText.includes(searchTerm);
        }
        
        if (matches) {
            result.isMatch = true;
            result.matchedAttributes.push(attrElement);
        }
    });
    
    return result;
}

function highlightMatches(node, searchTerm, matchResult) {
    const regex = isRegexMode ? 
        new RegExp(searchTerm, 'gi') : 
        new RegExp(escapeRegExp(searchTerm), 'gi');
    
    // Highlight element name
    if (matchResult.matchType.includes('elementName')) {
        const elementSpan = node.querySelector('.tree-element');
        if (elementSpan) {
            elementSpan.innerHTML = elementSpan.innerHTML.replace(regex, '<span class="search-highlight">$&</span>');
        }
    }
    
    // Highlight text content
    if (matchResult.matchType.includes('textContent')) {
        const contentSpan = node.querySelector('.tree-content');
        if (contentSpan) {
            contentSpan.innerHTML = contentSpan.innerHTML.replace(regex, '<span class="search-highlight">$&</span>');
        }
    }
    
    // Highlight attributes
    if (matchResult.matchType.includes('attributes') && matchResult.matchedAttributes) {
        matchResult.matchedAttributes.forEach(attrElement => {
            attrElement.innerHTML = attrElement.innerHTML.replace(regex, '<span class="search-highlight">$&</span>');
        });
    }
}

function removeAllHighlights(node) {
    const elements = [
        node.querySelector('.tree-element'),
        node.querySelector('.tree-content'),
        ...node.querySelectorAll('.tree-attribute')
    ].filter(Boolean);
    
    elements.forEach(element => {
        element.innerHTML = element.innerHTML.replace(/<span class="search-highlight">(.*?)<\/span>/g, '$1');
    });
}

function toggleRegex() {
    isRegexMode = !isRegexMode;
    const icon = document.getElementById('regexIcon');
    const button = icon?.parentElement;
    
    if (button) {
        if (isRegexMode) {
            button.className = 'btn btn-warning';
            icon.className = 'bi bi-asterisk';
            icon.title = 'Regex mode enabled';
        } else {
            button.className = 'btn btn-outline-secondary';
            icon.className = 'bi bi-asterisk';
            icon.title = 'Regex mode disabled';
        }
    }
    
    updateSearchModeText();
    applyFilters();
}

function clearFilters() {
    // Reset filter controls
    const controls = {
        searchInput: '',
        elementFilter: '',
        showEmpty: true,
        showAttributes: true
    };
    
    Object.entries(controls).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            if (typeof value === 'boolean') {
                element.checked = value;
            } else {
                element.value = value;
            }
        }
    });
    
    // Reset search options
    const checkboxes = ['searchElementNames', 'searchTextContent', 'searchAttributes'];
    checkboxes.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) checkbox.checked = true;
    });
    
    searchOptions = {
        elementNames: true,
        textContent: true,
        attributes: true
    };
    
    // Hide search options panel
    const searchOptionsPanel = document.getElementById('searchOptions');
    if (searchOptionsPanel) {
        searchOptionsPanel.style.display = 'none';
        const icon = document.getElementById('searchOptionsIcon');
        if (icon) {
            icon.classList.remove('bi-gear-fill');
            icon.classList.add('bi-gear');
        }
    }
    
    // Reset regex mode
    if (isRegexMode) {
        toggleRegex();
    }
    
    // Clear applied filters
    document.querySelectorAll('.tree-node').forEach(node => {
        node.classList.remove('highlighted');
        node.style.display = '';
        node.setAttribute('data-visible', 'true');
        removeAllHighlights(node);
        
        // Show all attributes
        const attributes = node.querySelectorAll('.tree-attribute');
        attributes.forEach(attr => attr.style.display = '');
    });
    
    updateVisibleCount();
    updateSearchModeText();
    
    // Reattach XPath handlers
    if (typeof attachXPathClickHandlers === 'function') {
        attachXPathClickHandlers();
    }
}

function updateVisibleCount() {
    const totalNodes = document.querySelectorAll('.tree-node').length;
    const visibleNodes = document.querySelectorAll('.tree-node[data-visible="true"]').length;
    
    const totalSpan = document.getElementById('totalCount');
    const visibleSpan = document.getElementById('visibleCount');
    
    if (totalSpan) totalSpan.textContent = `${totalNodes} total`;
    if (visibleSpan) visibleSpan.textContent = `${visibleNodes} visible`;
}

// =============================================================================
// EXPORT FUNCTIONS (Optimized)
// =============================================================================

function exportData(format) {
    if (!parsedXMLData) return;
    
    const baseFileName = originalFileName ? 
        originalFileName.replace(/\.[^/.]+$/, "") : 
        'xml_data';
    
    const exportConfig = {
        json: {
            content: () => JSON.stringify(parsedXMLData, null, 2),
            filename: `${baseFileName}.json`,
            mimeType: 'application/json'
        },
        csv: {
            content: () => convertToCSV(parsedXMLData),
            filename: `${baseFileName}.csv`,
            mimeType: 'text/csv'
        },
        xml: {
            content: () => formatXML(originalXMLString),
            filename: `${baseFileName}_formatted.xml`,
            mimeType: 'application/xml'
        },
        txt: {
            content: () => convertToText(parsedXMLData),
            filename: `${baseFileName}_structure.txt`,
            mimeType: 'text/plain'
        }
    };
    
    const config = exportConfig[format];
    if (config) {
        downloadFile(config.content(), config.filename, config.mimeType);
    }
}

function convertToCSV(node, path = '', csvData = []) {
    const currentPath = path ? `${path}/${node.tagName}` : node.tagName;
    
    const row = {
        'Element Path': currentPath,
        'Element Name': node.tagName,
        'Content': node.textContent || '',
        'Attributes': Object.entries(node.attributes).map(([k, v]) => `${k}="${v}"`).join('; '),
        'Depth': node.depth,
        'Has Children': node.hasChildren ? 'Yes' : 'No',
        'Namespace': node.namespaceURI || '',
        'Prefix': node.prefix || ''
    };
    
    csvData.push(row);
    
    // Process children
    node.children.forEach(child => {
        convertToCSV(child, currentPath, csvData);
    });
    
    // Convert to CSV string at root level
    if (path === '') {
        const headers = Object.keys(csvData[0]);
        let csv = headers.join(',') + '\n';
        
        csvData.forEach(row => {
            const values = headers.map(header => {
                const value = (row[header] || '').toString();
                // Escape quotes and wrap if needed
                if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            });
            csv += values.join(',') + '\n';
        });
        
        return csv;
    }
    
    return csvData;
}

function convertToText(node, indent = '') {
    let text = `${indent}${node.tagName}`;
    
    if (Object.keys(node.attributes).length > 0) {
        const attrs = Object.entries(node.attributes).map(([k, v]) => `${k}="${v}"`).join(' ');
        text += ` [${attrs}]`;
    }
    
    if (node.textContent) {
        text += `: ${node.textContent}`;
    }
    
    text += '\n';
    
    node.children.forEach(child => {
        text += convertToText(child, indent + '  ');
    });
    
    return text;
}

function formatXML(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    
    function formatNode(node, indent = '') {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent.trim();
            return text ? text : '';
        }
        
        if (node.nodeType === Node.ELEMENT_NODE) {
            let result = `${indent}<${node.tagName}`;
            
            // Add attributes
            Array.from(node.attributes).forEach(attr => {
                result += ` ${attr.name}="${attr.value}"`;
            });
            
            if (node.childNodes.length === 0) {
                result += '/>';
                return result;
            }
            
            result += '>';
            
            let hasElementChildren = false;
            let content = '';
            
            Array.from(node.childNodes).forEach(child => {
                if (child.nodeType === Node.ELEMENT_NODE) {
                    hasElementChildren = true;
                    content += '\n' + formatNode(child, indent + '  ');
                } else if (child.nodeType === Node.TEXT_NODE) {
                    const text = child.textContent.trim();
                    if (text) content += text;
                }
            });
            
            if (hasElementChildren) {
                result += content + '\n' + indent;
            } else {
                result += content;
            }
            
            result += `</${node.tagName}>`;
            return result;
        }
        
        return '';
    }
    
    return formatNode(xmlDoc.documentElement);
}

// =============================================================================
// ADDITIONAL UTILITY FUNCTIONS
// =============================================================================

function showMessage(message, type = 'info', duration = 3000) {
    let messageDiv = document.getElementById('tempMessage');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'tempMessage';
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
    
    setTimeout(() => messageDiv?.remove(), duration);
}

function getElementPosition(element) {
    const elementName = element.getAttribute('data-element');
    const parent = element.parentElement;
    
    if (!parent) return 1;
    
    const siblings = Array.from(parent.children).filter(child => 
        child.classList.contains('tree-node') && 
        child.getAttribute('data-element') === elementName
    );
    
    return siblings.indexOf(element) + 1;
}

function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    const container = document.querySelector('.tree-results-container');
    const containerRect = container ? container.getBoundingClientRect() : { top: 0, bottom: window.innerHeight };
    
    return (
        rect.top >= containerRect.top &&
        rect.bottom <= containerRect.bottom
    );
}

function smoothScrollToElement(element, container) {
    if (!element || !container) return;
    
    const elementRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    const scrollTop = container.scrollTop + elementRect.top - containerRect.top - (containerRect.height / 2) + (elementRect.height / 2);
    
    container.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
    });
}

function getTreeStatistics() {
    const totalNodes = document.querySelectorAll('.tree-node').length;
    const visibleNodes = document.querySelectorAll('.tree-node[data-visible="true"]').length;
    const highlightedNodes = document.querySelectorAll('.tree-node.highlighted').length;
    const xpathMatches = document.querySelectorAll('.tree-node.xpath-match').length;
    
    return {
        total: totalNodes,
        visible: visibleNodes,
        highlighted: highlightedNodes,
        xpathMatches: xpathMatches,
        hiddenByFilters: totalNodes - visibleNodes
    };
}

function validateRegexInput(pattern) {
    if (!isRegexMode) return { valid: true };
    
    try {
        new RegExp(pattern);
        return { valid: true };
    } catch (e) {
        return { 
            valid: false, 
            error: e.message 
        };
    }
}

function performEnhancedSearch(searchTerm) {
    if (!searchTerm.trim()) {
        clearFilters();
        return;
    }
    
    // Validate regex if in regex mode
    const validation = validateRegexInput(searchTerm);
    if (!validation.valid) {
        showMessage(`Invalid regex pattern: ${validation.error}`, 'error');
        return;
    }
    
    // Perform the search
    applyFilters();
    
    // Show search statistics
    const stats = getTreeStatistics();
    if (stats.highlighted > 0) {
        showMessage(`Found ${stats.highlighted} matches`, 'success', 2000);
    } else {
        showMessage('No matches found', 'warning', 2000);
    }
}

function exportViewState() {
    const state = {
        searchTerm: document.getElementById('searchInput')?.value || '',
        elementFilter: document.getElementById('elementFilter')?.value || '',
        showEmpty: document.getElementById('showEmpty')?.checked ?? true,
        showAttributes: document.getElementById('showAttributes')?.checked ?? true,
        searchOptions: { ...searchOptions },
        isRegexMode: isRegexMode,
        showLineNumbers: showLineNumbers,
        timestamp: new Date().toISOString(),
        fileName: originalFileName || 'unknown'
    };
    
    return JSON.stringify(state, null, 2);
}

function importViewState(stateJson) {
    try {
        const state = JSON.parse(stateJson);
        
        // Apply search settings
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = state.searchTerm || '';
        
        const elementFilter = document.getElementById('elementFilter');
        if (elementFilter) elementFilter.value = state.elementFilter || '';
        
        const showEmpty = document.getElementById('showEmpty');
        if (showEmpty) showEmpty.checked = state.showEmpty ?? true;
        
        const showAttributes = document.getElementById('showAttributes');
        if (showAttributes) showAttributes.checked = state.showAttributes ?? true;
        
        // Apply search options
        if (state.searchOptions) {
            searchOptions = { ...state.searchOptions };
            
            const checkboxes = {
                searchElementNames: 'elementNames',
                searchTextContent: 'textContent',
                searchAttributes: 'attributes'
            };
            
            Object.entries(checkboxes).forEach(([id, prop]) => {
                const checkbox = document.getElementById(id);
                if (checkbox) checkbox.checked = searchOptions[prop] ?? true;
            });
        }
        
        // Apply regex mode
        if (state.isRegexMode !== isRegexMode) {
            toggleRegex();
        }
        
        // Apply line numbers
        if (state.showLineNumbers !== showLineNumbers) {
            toggleLineNumbers();
        }
        
        // Update UI
        updateSearchModeText();
        applyFilters();
        
        showMessage('View state imported successfully', 'success');
        
    } catch (error) {
        showMessage('Error importing view state: Invalid format', 'error');
    }
}

function getPerformanceMetrics() {
    const startTime = performance.now();
    
    // Count various elements
    const metrics = {
        totalNodes: document.querySelectorAll('.tree-node').length,
        totalAttributes: document.querySelectorAll('.tree-attribute').length,
        totalContent: document.querySelectorAll('.tree-content').length,
        visibleNodes: document.querySelectorAll('.tree-node[data-visible="true"]').length,
        collapsedSections: document.querySelectorAll('.tree-children.collapsed').length,
        highlighted: document.querySelectorAll('.tree-node.highlighted').length,
        depth: getMaxTreeDepth(),
        renderTime: performance.now() - startTime
    };
    
    return metrics;
}

function getMaxTreeDepth() {
    let maxDepth = 0;
    document.querySelectorAll('.tree-node').forEach(node => {
        const depth = parseInt(node.style.marginLeft) / 20 || 0;
        maxDepth = Math.max(maxDepth, depth);
    });
    return maxDepth;
}

function optimizeTreeRendering() {
    const totalNodes = document.querySelectorAll('.tree-node').length;
    
    // For very large trees, implement virtual scrolling or pagination
    if (totalNodes > 1000) {
        console.log(`Large tree detected: ${totalNodes} nodes. Consider implementing virtual scrolling.`);
        
        // Add warning message
        showMessage(`Large XML file detected (${totalNodes} elements). Performance may be affected.`, 'warning', 5000);
    }
}

function batchDOMUpdates(updateFunction) {
    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
        updateFunction();
    });
}

function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Only handle shortcuts when not in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        // Ctrl/Cmd + F for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
        
        // Ctrl/Cmd + E for expand all
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            expandAll();
        }
        
        // Ctrl/Cmd + R for collapse all
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            collapseAll();
        }
        
        // Ctrl/Cmd + L for toggle line numbers
        if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
            e.preventDefault();
            toggleLineNumbers();
        }
        
        // Escape to clear search
        if (e.key === 'Escape') {
            const searchInput = document.getElementById('searchInput');
            if (searchInput && searchInput.value) {
                clearFilters();
            }
        }
    });
}

function copyElementName(elementName) {
    navigator.clipboard.writeText(elementName).then(() => {
        showMessage(`Copied "${elementName}" to clipboard`, 'success', 2000);
    }).catch(() => {
        showMessage('Failed to copy to clipboard', 'error');
    });
}

function expandNodeTree(treeNode) {
    if (!treeNode) return;
    
    const childrenContainer = treeNode.nextElementSibling;
    if (childrenContainer?.classList.contains('tree-children')) {
        // Expand this level
        childrenContainer.classList.remove('collapsed');
        const toggleIcon = treeNode.querySelector('.tree-toggle i');
        if (toggleIcon) {
            toggleIcon.className = 'bi bi-dash';
        }
        
        // Recursively expand all children
        const childNodes = childrenContainer.querySelectorAll('.tree-node');
        childNodes.forEach(child => {
            const childContainer = child.nextElementSibling;
            if (childContainer?.classList.contains('tree-children')) {
                childContainer.classList.remove('collapsed');
                const childToggle = child.querySelector('.tree-toggle i');
                if (childToggle) {
                    childToggle.className = 'bi bi-dash';
                }
            }
        });
    }
}

function collapseNodeTree(treeNode) {
    if (!treeNode) return;
    
    const childrenContainer = treeNode.nextElementSibling;
    if (childrenContainer?.classList.contains('tree-children')) {
        // Collapse this level and all children
        childrenContainer.classList.add('collapsed');
        const toggleIcon = treeNode.querySelector('.tree-toggle i');
        if (toggleIcon) {
            toggleIcon.className = 'bi bi-plus';
        }
        
        // Recursively collapse all children
        const childNodes = childrenContainer.querySelectorAll('.tree-node');
        childNodes.forEach(child => {
            const childContainer = child.nextElementSibling;
            if (childContainer?.classList.contains('tree-children')) {
                childContainer.classList.add('collapsed');
                const childToggle = child.querySelector('.tree-toggle i');
                if (childToggle) {
                    childToggle.className = 'bi bi-plus';
                }
            }
        });
    }
}

// =============================================================================
// RESET FUNCTIONS (Optimized)
// =============================================================================

function resetUIModule() {
    // Reset form controls
    const resets = {
        searchInput: '',
        elementFilter: '<option value="">All Elements</option>',
        showEmpty: true,
        showAttributes: true
    };
    
    Object.entries(resets).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            if (id === 'elementFilter') {
                element.innerHTML = value;
            } else if (typeof value === 'boolean') {
                element.checked = value;
            } else {
                element.value = value;
            }
        }
    });
    
    // Reset search options
    const checkboxes = ['searchElementNames', 'searchTextContent', 'searchAttributes'];
    checkboxes.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) checkbox.checked = true;
    });
    
    searchOptions = {
        elementNames: true,
        textContent: true,
        attributes: true
    };
    
    // Hide search options panel
    const searchOptionsPanel = document.getElementById('searchOptions');
    if (searchOptionsPanel) {
        searchOptionsPanel.style.display = 'none';
        const icon = document.getElementById('searchOptionsIcon');
        if (icon) {
            icon.classList.remove('bi-gear-fill');
            icon.classList.add('bi-gear');
        }
    }
    
    // Reset line numbers
    showLineNumbers = true;
    currentLineNumber = 1;
    const lineToggleBtn = document.getElementById('lineNumberToggle');
    if (lineToggleBtn) {
        lineToggleBtn.className = 'btn btn-sm btn-secondary';
        lineToggleBtn.innerHTML = '<i class="bi bi-list-ol"></i>';
        lineToggleBtn.title = 'Hide line numbers';
    }
    
    // Reset regex mode
    if (isRegexMode) {
        toggleRegex();
    }
    
    // Reset other variables
    isRegexMode = false;
    updateSearchModeText();
}

// Initialize additional features when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initializeKeyboardShortcuts();
    }, 1000);
});

// Export functions for external use
window.XMLUIModule = {
    showMessage,
    exportViewState,
    importViewState,
    getPerformanceMetrics,
    getTreeStatistics,
    performEnhancedSearch
};