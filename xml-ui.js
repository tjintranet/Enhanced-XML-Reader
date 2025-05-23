/**
 * XML UI Module
 * Handles tree visualization, filtering, search functionality, and basic export
 */

// UI Module Variables
let isRegexMode = false;

// Initialize UI event listeners when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners for search and filter
    document.getElementById('searchInput').addEventListener('input', applyFilters);
    document.getElementById('elementFilter').addEventListener('change', applyFilters);
    document.getElementById('showEmpty').addEventListener('change', applyFilters);
    document.getElementById('showAttributes').addEventListener('change', applyFilters);
});

// Tree Display Functions
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
    
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = renderTreeNode(parsedXMLData);
    
    updateVisibleCount();
}

function renderTreeNode(node, isVisible = true) {
    const namespaceInfo = namespaceMap.get(node.namespaceURI) || { color: 'namespace-default', prefix: '' };
    const hasToggle = node.hasChildren;
    const toggleIcon = hasToggle ? '<i class="fas fa-minus"></i>' : '<i class="fas fa-circle" style="font-size: 6px;"></i>';
    
    let attributesHtml = '';
    if (Object.keys(node.attributes).length > 0) {
        const attrStrings = Object.entries(node.attributes).map(([name, value]) => 
            `<span class="tree-attribute">${name}="${value}"</span>`
        );
        attributesHtml = ` ${attrStrings.join(' ')}`;
    }
    
    let contentHtml = '';
    if (node.textContent) {
        contentHtml = `<span class="tree-content">${escapeHtml(node.textContent)}</span>`;
    }
    
    let html = `
        <div class="tree-node" data-element="${node.tagName}" data-visible="${isVisible}" style="margin-left: ${node.depth * 20}px;">
            <span class="tree-toggle" onclick="toggleNode(this)" data-has-children="${hasToggle}">
                ${hasToggle ? toggleIcon : ''}
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
    
    if (childrenContainer && childrenContainer.classList.contains('tree-children')) {
        const isCollapsed = childrenContainer.classList.contains('collapsed');
        
        if (isCollapsed) {
            childrenContainer.classList.remove('collapsed');
            icon.className = 'fas fa-minus';
        } else {
            childrenContainer.classList.add('collapsed');
            icon.className = 'fas fa-plus';
        }
    }
}

function expandAll() {
    document.querySelectorAll('.tree-children.collapsed').forEach(el => {
        el.classList.remove('collapsed');
    });
    document.querySelectorAll('.tree-toggle i.fa-plus').forEach(icon => {
        icon.className = 'fas fa-minus';
    });
}

function collapseAll() {
    document.querySelectorAll('.tree-children').forEach(el => {
        el.classList.add('collapsed');
    });
    document.querySelectorAll('.tree-toggle i.fa-minus').forEach(icon => {
        icon.className = 'fas fa-plus';
    });
}

// Filter and Search Functions
function toggleRegex() {
    isRegexMode = !isRegexMode;
    const icon = document.getElementById('regexIcon');
    const button = icon.parentElement;
    
    if (isRegexMode) {
        button.classList.remove('btn-outline-secondary');
        button.classList.add('btn-warning');
        icon.className = 'fas fa-asterisk';
        icon.title = 'Regex mode enabled';
    } else {
        button.classList.remove('btn-warning');
        button.classList.add('btn-outline-secondary');
        icon.className = 'fas fa-asterisk';
        icon.title = 'Regex mode disabled';
    }
    
    applyFilters();
}

function clearFilters() {
    // Reset all filter controls
    document.getElementById('searchInput').value = '';
    document.getElementById('elementFilter').value = '';
    document.getElementById('showEmpty').checked = true;
    document.getElementById('showAttributes').checked = true;
    
    // Reset regex mode
    if (isRegexMode) {
        toggleRegex();
    }
    
    // Clear all applied filters and highlights
    document.querySelectorAll('.tree-node').forEach(node => {
        node.classList.remove('highlighted');
        node.style.display = '';
        node.setAttribute('data-visible', 'true');
        
        // Remove search highlights
        const content = node.innerHTML;
        node.innerHTML = content.replace(/<span class="search-highlight">(.*?)<\/span>/g, '$1');
        
        // Show all attributes
        const attributes = node.querySelectorAll('.tree-attribute');
        attributes.forEach(attr => attr.style.display = '');
    });
    
    // Update counters
    updateVisibleCount();
}

function applyFilters() {
    if (!parsedXMLData) return;
    
    const searchTerm = document.getElementById('searchInput').value;
    const elementFilter = document.getElementById('elementFilter').value;
    const showEmpty = document.getElementById('showEmpty').checked;
    const showAttributes = document.getElementById('showAttributes').checked;
    
    // Clear previous highlights
    document.querySelectorAll('.tree-node').forEach(node => {
        node.classList.remove('highlighted');
        node.style.display = '';
        
        // Remove search highlights
        const content = node.innerHTML;
        node.innerHTML = content.replace(/<span class="search-highlight">(.*?)<\/span>/g, '$1');
    });
    
    // Apply filters
    document.querySelectorAll('.tree-node').forEach(node => {
        const elementName = node.getAttribute('data-element');
        const nodeText = node.textContent.toLowerCase();
        let shouldShow = true;
        
        // Element filter
        if (elementFilter && elementName !== elementFilter) {
            shouldShow = false;
        }
        
        // Empty element filter
        if (!showEmpty) {
            const hasContent = node.querySelector('.tree-content');
            const hasChildren = node.nextElementSibling && node.nextElementSibling.classList.contains('tree-children');
            if (!hasContent && !hasChildren) {
                shouldShow = false;
            }
        }
        
        // Attribute display
        if (!showAttributes) {
            const attributes = node.querySelectorAll('.tree-attribute');
            attributes.forEach(attr => attr.style.display = 'none');
        } else {
            const attributes = node.querySelectorAll('.tree-attribute');
            attributes.forEach(attr => attr.style.display = '');
        }
        
        // Search filter
        if (searchTerm) {
            let matches = false;
            
            try {
                if (isRegexMode) {
                    const regex = new RegExp(searchTerm, 'gi');
                    matches = regex.test(nodeText);
                    
                    if (matches) {
                        // Highlight matches
                        const highlightedContent = node.innerHTML.replace(regex, '<span class="search-highlight">$&</span>');
                        node.innerHTML = highlightedContent;
                    }
                } else {
                    matches = nodeText.includes(searchTerm.toLowerCase());
                    
                    if (matches) {
                        // Highlight matches
                        const regex = new RegExp(escapeRegExp(searchTerm), 'gi');
                        const highlightedContent = node.innerHTML.replace(regex, '<span class="search-highlight">$&</span>');
                        node.innerHTML = highlightedContent;
                    }
                }
            } catch (e) {
                // Invalid regex, fall back to simple search
                matches = nodeText.includes(searchTerm.toLowerCase());
            }
            
            if (!matches) {
                shouldShow = false;
            } else {
                node.classList.add('highlighted');
            }
        }
        
        node.style.display = shouldShow ? '' : 'none';
        node.setAttribute('data-visible', shouldShow);
    });
    
    updateVisibleCount();
}

function updateVisibleCount() {
    const totalNodes = document.querySelectorAll('.tree-node').length;
    const visibleNodes = document.querySelectorAll('.tree-node[data-visible="true"]').length;
    
    document.getElementById('totalCount').textContent = `${totalNodes} total`;
    document.getElementById('visibleCount').textContent = `${visibleNodes} visible`;
}

// Basic Export Functions
function exportData(format) {
    if (!parsedXMLData) return;
    
    // Get base filename without extension
    const baseFileName = originalFileName ? 
        originalFileName.replace(/\.[^/.]+$/, "") : 
        'xml_data';
    
    let content = '';
    let filename = '';
    let mimeType = '';
    
    switch (format) {
        case 'json':
            content = JSON.stringify(parsedXMLData, null, 2);
            filename = `${baseFileName}.json`;
            mimeType = 'application/json';
            break;
            
        case 'csv':
            content = convertToCSV(parsedXMLData);
            filename = `${baseFileName}.csv`;
            mimeType = 'text/csv';
            break;
            
        case 'xml':
            content = formatXML(originalXMLString);
            filename = `${baseFileName}_formatted.xml`;
            mimeType = 'application/xml';
            break;
            
        case 'txt':
            content = convertToText(parsedXMLData);
            filename = `${baseFileName}_structure.txt`;
            mimeType = 'text/plain';
            break;
    }
    
    downloadFile(content, filename, mimeType);
}

// Data Conversion Functions
function convertToCSV(node, path = '', csvData = []) {
    const currentPath = path ? `${path}/${node.tagName}` : node.tagName;
    
    // Add current node
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
    
    // If this is the root call (path is empty), convert to CSV string and return
    if (path === '') {
        // Convert to CSV string
        const headers = Object.keys(csvData[0]);
        let csv = headers.join(',') + '\n';
        
        csvData.forEach(row => {
            const values = headers.map(header => {
                const value = (row[header] || '').toString();
                // Escape quotes and wrap in quotes if contains comma, quote, or newline
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

// Reset UI Module
function resetUIModule() {
    document.getElementById('searchInput').value = '';
    document.getElementById('elementFilter').innerHTML = '<option value="">All Elements</option>';
    document.getElementById('showEmpty').checked = true;
    document.getElementById('showAttributes').checked = true;
    
    // Reset regex mode
    if (isRegexMode) {
        toggleRegex();
    }
    
    // Reset regex button
    const regexButton = document.getElementById('regexIcon').parentElement;
    regexButton.classList.remove('btn-warning');
    regexButton.classList.add('btn-outline-secondary');
    document.getElementById('regexIcon').className = 'fas fa-asterisk';
    
    isRegexMode = false;
}