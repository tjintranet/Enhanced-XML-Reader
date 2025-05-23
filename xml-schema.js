/**
 * XML Schema Module
 * Handles schema analysis and XSD generation functionality
 */

// Schema Module Variables
let schemaAnalysis = null;
let generatedSchema = '';

// Schema Analysis Functions
function analyzeForSchema(rootElement) {
    const analysis = {
        elements: new Map(),
        namespaces: new Set(),
        rootElement: rootElement.tagName
    };

    function analyzeElement(element, path = '') {
        const elementName = element.tagName;
        const currentPath = path ? `${path}/${elementName}` : elementName;
        
        if (!analysis.elements.has(elementName)) {
            analysis.elements.set(elementName, {
                name: elementName,
                attributes: new Map(),
                children: new Set(),
                parents: new Set(),
                contentTypes: new Set(),
                minOccurs: new Map(),
                maxOccurs: new Map(),
                isOptional: false,
                namespaceURI: element.namespaceURI,
                prefix: element.prefix
            });
        }

        const elementInfo = analysis.elements.get(elementName);
        
        // Analyze attributes
        Array.from(element.attributes).forEach(attr => {
            if (!elementInfo.attributes.has(attr.name)) {
                elementInfo.attributes.set(attr.name, {
                    name: attr.name,
                    types: new Set(),
                    required: true,
                    defaultValue: null
                });
            }
            
            const attrInfo = elementInfo.attributes.get(attr.name);
            attrInfo.types.add(inferDataType(attr.value));
        });

        // Analyze content
        let textContent = '';
        Array.from(element.childNodes).forEach(child => {
            if (child.nodeType === Node.TEXT_NODE) {
                textContent += child.textContent.trim();
            }
        });
        
        if (textContent) {
            elementInfo.contentTypes.add(inferDataType(textContent));
        }

        // Analyze children
        const childElements = Array.from(element.children);
        const childCounts = new Map();
        
        childElements.forEach(child => {
            elementInfo.children.add(child.tagName);
            
            // Count occurrences for minOccurs/maxOccurs
            if (!childCounts.has(child.tagName)) {
                childCounts.set(child.tagName, 0);
            }
            childCounts.set(child.tagName, childCounts.get(child.tagName) + 1);
            
            // Record parent relationship
            if (!analysis.elements.has(child.tagName)) {
                analysis.elements.set(child.tagName, {
                    name: child.tagName,
                    attributes: new Map(),
                    children: new Set(),
                    parents: new Set(),
                    contentTypes: new Set(),
                    minOccurs: new Map(),
                    maxOccurs: new Map(),
                    isOptional: false,
                    namespaceURI: child.namespaceURI,
                    prefix: child.prefix
                });
            }
            analysis.elements.get(child.tagName).parents.add(elementName);
            
            // Recursively analyze child
            analyzeElement(child, currentPath);
        });

        // Update occurrence counts
        childCounts.forEach((count, childName) => {
            const currentMin = elementInfo.minOccurs.get(childName) || Infinity;
            const currentMax = elementInfo.maxOccurs.get(childName) || 0;
            
            elementInfo.minOccurs.set(childName, Math.min(currentMin, count));
            elementInfo.maxOccurs.set(childName, Math.max(currentMax, count));
        });

        // Add namespace
        if (element.namespaceURI) {
            analysis.namespaces.add(element.namespaceURI);
        }
    }

    analyzeElement(rootElement);
    return analysis;
}

function inferDataType(value) {
    if (!value || value.trim() === '') return 'string';
    
    // Check for boolean
    if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
        return 'boolean';
    }
    
    // Check for integer
    if (/^-?\d+$/.test(value)) {
        return 'integer';
    }
    
    // Check for decimal
    if (/^-?\d*\.\d+$/.test(value)) {
        return 'decimal';
    }
    
    // Check for date (ISO format)
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return 'date';
    }
    
    // Check for dateTime (ISO format)
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        return 'dateTime';
    }
    
    // Check for time
    if (/^\d{2}:\d{2}:\d{2}/.test(value)) {
        return 'time';
    }
    
    // Default to string
    return 'string';
}

// Schema Generation Functions
function generateXSDSchema() {
    if (!schemaAnalysis) return '';

    const includeOccurrence = document.getElementById('includeOccurrence').checked;
    const inferDataTypes = document.getElementById('inferDataTypes').checked;
    const includeAnnotations = document.getElementById('includeAnnotations').checked;
    const targetNamespace = document.getElementById('targetNamespace').value.trim();
    const schemaPrefix = document.getElementById('schemaPrefix').value.trim() || 'xs';

    let xsd = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xsd += `<${schemaPrefix}:schema xmlns:${schemaPrefix}="http://www.w3.org/2001/XMLSchema"`;
    
    if (targetNamespace) {
        xsd += `\n    targetNamespace="${targetNamespace}"`;
        xsd += `\n    xmlns="${targetNamespace}"`;
    }
    
    xsd += `\n    elementFormDefault="qualified">\n\n`;

    if (includeAnnotations) {
        xsd += `  <${schemaPrefix}:annotation>\n`;
        xsd += `    <${schemaPrefix}:documentation>\n`;
        xsd += `      Generated XSD schema from XML file: ${originalFileName || 'uploaded file'}\n`;
        xsd += `      Generated on: ${new Date().toISOString()}\n`;
        xsd += `      Total elements analyzed: ${schemaAnalysis.elements.size}\n`;
        xsd += `    </${schemaPrefix}:documentation>\n`;
        xsd += `  </${schemaPrefix}:annotation>\n\n`;
    }

    // Define root element
    xsd += `  <${schemaPrefix}:element name="${schemaAnalysis.rootElement}" type="${schemaAnalysis.rootElement}Type"/>\n\n`;

    // Generate complex types for each element that has children or attributes
    schemaAnalysis.elements.forEach((elementInfo, elementName) => {
        if (elementInfo.children.size > 0 || elementInfo.attributes.size > 0) {
            xsd += generateComplexType(elementInfo, schemaPrefix, includeOccurrence, inferDataTypes, includeAnnotations);
        }
    });

    xsd += `</${schemaPrefix}:schema>`;
    return xsd;
}

function generateComplexType(elementInfo, schemaPrefix, includeOccurrence, inferDataTypes, includeAnnotations) {
    let complexType = `  <${schemaPrefix}:complexType name="${elementInfo.name}Type">\n`;

    if (includeAnnotations && (elementInfo.children.size > 0 || elementInfo.attributes.size > 0)) {
        complexType += `    <${schemaPrefix}:annotation>\n`;
        complexType += `      <${schemaPrefix}:documentation>\n`;
        complexType += `        Element: ${elementInfo.name}\n`;
        if (elementInfo.children.size > 0) {
            complexType += `        Child elements: ${Array.from(elementInfo.children).join(', ')}\n`;
        }
        if (elementInfo.attributes.size > 0) {
            complexType += `        Attributes: ${Array.from(elementInfo.attributes.keys()).join(', ')}\n`;
        }
        complexType += `      </${schemaPrefix}:documentation>\n`;
        complexType += `    </${schemaPrefix}:annotation>\n`;
    }

    // Handle mixed content (elements with both text content and child elements)
    const hasTextContent = elementInfo.contentTypes.size > 0;
    const hasChildElements = elementInfo.children.size > 0;
    
    if (hasTextContent && hasChildElements) {
        complexType += `    <${schemaPrefix}:complexContent>\n`;
        complexType += `      <${schemaPrefix}:extension base="${schemaPrefix}:string">\n`;
        complexType += `        <${schemaPrefix}:sequence>\n`;
        
        elementInfo.children.forEach(childName => {
            complexType += generateChildElement(childName, elementInfo, schemaPrefix, includeOccurrence);
        });
        
        complexType += `        </${schemaPrefix}:sequence>\n`;
        complexType += `      </${schemaPrefix}:extension>\n`;
        complexType += `    </${schemaPrefix}:complexContent>\n`;
    } else if (hasChildElements) {
        // Only child elements
        complexType += `    <${schemaPrefix}:sequence>\n`;
        
        elementInfo.children.forEach(childName => {
            complexType += generateChildElement(childName, elementInfo, schemaPrefix, includeOccurrence);
        });
        
        complexType += `    </${schemaPrefix}:sequence>\n`;
    } else if (hasTextContent) {
        // Only text content
        complexType += `    <${schemaPrefix}:simpleContent>\n`;
        const dataType = inferDataTypes && elementInfo.contentTypes.size === 1 ? 
            Array.from(elementInfo.contentTypes)[0] : 'string';
        complexType += `      <${schemaPrefix}:extension base="${schemaPrefix}:${dataType}">\n`;
        
        // Add attributes to simple content
        elementInfo.attributes.forEach((attrInfo, attrName) => {
            complexType += generateAttribute(attrInfo, schemaPrefix, inferDataTypes);
        });
        
        complexType += `      </${schemaPrefix}:extension>\n`;
        complexType += `    </${schemaPrefix}:simpleContent>\n`;
    }

    // Add attributes (if not already added in simpleContent)
    if (!hasTextContent && elementInfo.attributes.size > 0) {
        elementInfo.attributes.forEach((attrInfo, attrName) => {
            complexType += generateAttribute(attrInfo, schemaPrefix, inferDataTypes);
        });
    }

    complexType += `  </${schemaPrefix}:complexType>\n\n`;
    return complexType;
}

function generateChildElement(childName, parentInfo, schemaPrefix, includeOccurrence) {
    let element = `      <${schemaPrefix}:element name="${childName}"`;
    
    // Determine if this child has its own complex type
    const childInfo = schemaAnalysis.elements.get(childName);
    if (childInfo && (childInfo.children.size > 0 || childInfo.attributes.size > 0)) {
        element += ` type="${childName}Type"`;
    } else {
        // Simple element - determine type from content
        if (childInfo && childInfo.contentTypes.size === 1) {
            const dataType = Array.from(childInfo.contentTypes)[0];
            element += ` type="${schemaPrefix}:${dataType}"`;
        } else {
            element += ` type="${schemaPrefix}:string"`;
        }
    }

    if (includeOccurrence) {
        const minOccurs = parentInfo.minOccurs.get(childName) || 1;
        const maxOccurs = parentInfo.maxOccurs.get(childName) || 1;
        
        if (minOccurs !== 1) {
            element += ` minOccurs="${minOccurs}"`;
        }
        if (maxOccurs !== 1) {
            element += ` maxOccurs="${maxOccurs === Infinity ? 'unbounded' : maxOccurs}"`;
        }
    }

    element += `/>\n`;
    return element;
}

function generateAttribute(attrInfo, schemaPrefix, inferDataTypes) {
    let attribute = `    <${schemaPrefix}:attribute name="${attrInfo.name}"`;
    
    if (inferDataTypes && attrInfo.types.size === 1) {
        const dataType = Array.from(attrInfo.types)[0];
        attribute += ` type="${schemaPrefix}:${dataType}"`;
    } else {
        attribute += ` type="${schemaPrefix}:string"`;
    }
    
    attribute += ` use="optional"/>\n`;
    return attribute;
}

// Schema Export UI Functions
function toggleSchemaOptions() {
    const options = document.getElementById('schemaOptions');
    options.classList.toggle('show');
}

function generateSchema() {
    if (!schemaAnalysis) {
        alert('Please load an XML file first.');
        return;
    }

    generatedSchema = generateXSDSchema();
    
    const baseFileName = originalFileName ? 
        originalFileName.replace(/\.[^/.]+$/, "") : 
        'schema';
    const filename = `${baseFileName}.xsd`;
    
    downloadFile(generatedSchema, filename, 'application/xml');
}

function previewSchema() {
    if (!schemaAnalysis) {
        alert('Please load an XML file first.');
        return;
    }

    generatedSchema = generateXSDSchema();
    document.getElementById('schemaPreviewContent').textContent = generatedSchema;
    
    const modal = new bootstrap.Modal(document.getElementById('schemaPreviewModal'));
    modal.show();
}

function downloadPreviewedSchema() {
    if (!generatedSchema) return;
    
    const baseFileName = originalFileName ? 
        originalFileName.replace(/\.[^/.]+$/, "") : 
        'schema';
    const filename = `${baseFileName}.xsd`;
    
    downloadFile(generatedSchema, filename, 'application/xml');
}

// Reset Schema Module
function resetSchemaModule() {
    // Reset schema options
    document.getElementById('schemaOptions').classList.remove('show');
    document.getElementById('includeOccurrence').checked = true;
    document.getElementById('inferDataTypes').checked = true;
    document.getElementById('includeAnnotations').checked = true;
    document.getElementById('targetNamespace').value = '';
    document.getElementById('schemaPrefix').value = 'xs';
    
    // Reset schema variables
    generatedSchema = '';
    schemaAnalysis = null;
}