/**
 * XML Schema Module - Optimized
 * Handles schema analysis and XSD generation functionality
 */

// Schema Module Variables
let schemaAnalysis = null;
let generatedSchema = '';

// =============================================================================
// SCHEMA ANALYSIS (Optimized)
// =============================================================================

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
            
            childCounts.set(child.tagName, (childCounts.get(child.tagName) || 0) + 1);
            
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
    
    // Data type patterns
    const patterns = {
        boolean: /^(true|false)$/i,
        integer: /^-?\d+$/,
        decimal: /^-?\d*\.\d+$/,
        date: /^\d{4}-\d{2}-\d{2}$/,
        dateTime: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
        time: /^\d{2}:\d{2}:\d{2}/
    };
    
    for (const [type, pattern] of Object.entries(patterns)) {
        if (pattern.test(value)) {
            return type;
        }
    }
    
    return 'string';
}

// =============================================================================
// XSD GENERATION (Optimized)
// =============================================================================

function generateXSDSchema() {
    if (!schemaAnalysis) return '';

    const config = getSchemaConfig();
    const { schemaPrefix } = config;

    let xsd = generateSchemaHeader(config);
    
    if (config.includeAnnotations) {
        xsd += generateSchemaDocumentation(schemaPrefix);
    }

    // Define root element
    xsd += `  <${schemaPrefix}:element name="${schemaAnalysis.rootElement}" type="${schemaAnalysis.rootElement}Type"/>\n\n`;

    // Generate complex types
    schemaAnalysis.elements.forEach((elementInfo, elementName) => {
        if (elementInfo.children.size > 0 || elementInfo.attributes.size > 0) {
            xsd += generateComplexType(elementInfo, config);
        }
    });

    xsd += `</${schemaPrefix}:schema>`;
    return xsd;
}

function getSchemaConfig() {
    return {
        includeOccurrence: document.getElementById('includeOccurrence')?.checked ?? true,
        inferDataTypes: document.getElementById('inferDataTypes')?.checked ?? true,
        includeAnnotations: document.getElementById('includeAnnotations')?.checked ?? true,
        targetNamespace: document.getElementById('targetNamespace')?.value.trim() || '',
        schemaPrefix: document.getElementById('schemaPrefix')?.value.trim() || 'xs'
    };
}

function generateSchemaHeader(config) {
    const { schemaPrefix, targetNamespace } = config;
    
    let header = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    header += `<${schemaPrefix}:schema xmlns:${schemaPrefix}="http://www.w3.org/2001/XMLSchema"`;
    
    if (targetNamespace) {
        header += `\n    targetNamespace="${targetNamespace}"`;
        header += `\n    xmlns="${targetNamespace}"`;
    }
    
    header += `\n    elementFormDefault="qualified">\n\n`;
    return header;
}

function generateSchemaDocumentation(schemaPrefix) {
    return `  <${schemaPrefix}:annotation>\n` +
           `    <${schemaPrefix}:documentation>\n` +
           `      Generated XSD schema from XML file: ${originalFileName || 'uploaded file'}\n` +
           `      Generated on: ${new Date().toISOString()}\n` +
           `      Total elements analyzed: ${schemaAnalysis.elements.size}\n` +
           `    </${schemaPrefix}:documentation>\n` +
           `  </${schemaPrefix}:annotation>\n\n`;
}

function generateComplexType(elementInfo, config) {
    const { schemaPrefix, includeOccurrence, inferDataTypes, includeAnnotations } = config;
    
    let complexType = `  <${schemaPrefix}:complexType name="${elementInfo.name}Type">\n`;

    if (includeAnnotations && (elementInfo.children.size > 0 || elementInfo.attributes.size > 0)) {
        complexType += generateElementDocumentation(elementInfo, schemaPrefix);
    }

    const hasTextContent = elementInfo.contentTypes.size > 0;
    const hasChildElements = elementInfo.children.size > 0;
    
    if (hasTextContent && hasChildElements) {
        complexType += generateMixedContent(elementInfo, config);
    } else if (hasChildElements) {
        complexType += generateElementOnlyContent(elementInfo, config);
    } else if (hasTextContent) {
        complexType += generateTextOnlyContent(elementInfo, config);
    }

    // Add attributes (if not already added in simpleContent)
    if (!hasTextContent && elementInfo.attributes.size > 0) {
        elementInfo.attributes.forEach((attrInfo) => {
            complexType += generateAttribute(attrInfo, schemaPrefix, inferDataTypes);
        });
    }

    complexType += `  </${schemaPrefix}:complexType>\n\n`;
    return complexType;
}

function generateElementDocumentation(elementInfo, schemaPrefix) {
    let doc = `    <${schemaPrefix}:annotation>\n`;
    doc += `      <${schemaPrefix}:documentation>\n`;
    doc += `        Element: ${elementInfo.name}\n`;
    
    if (elementInfo.children.size > 0) {
        doc += `        Child elements: ${Array.from(elementInfo.children).join(', ')}\n`;
    }
    if (elementInfo.attributes.size > 0) {
        doc += `        Attributes: ${Array.from(elementInfo.attributes.keys()).join(', ')}\n`;
    }
    
    doc += `      </${schemaPrefix}:documentation>\n`;
    doc += `    </${schemaPrefix}:annotation>\n`;
    return doc;
}

function generateMixedContent(elementInfo, config) {
    const { schemaPrefix } = config;
    
    let content = `    <${schemaPrefix}:complexContent>\n`;
    content += `      <${schemaPrefix}:extension base="${schemaPrefix}:string">\n`;
    content += `        <${schemaPrefix}:sequence>\n`;
    
    elementInfo.children.forEach(childName => {
        content += generateChildElement(childName, elementInfo, config);
    });
    
    content += `        </${schemaPrefix}:sequence>\n`;
    content += `      </${schemaPrefix}:extension>\n`;
    content += `    </${schemaPrefix}:complexContent>\n`;
    return content;
}

function generateElementOnlyContent(elementInfo, config) {
    const { schemaPrefix } = config;
    
    let content = `    <${schemaPrefix}:sequence>\n`;
    
    elementInfo.children.forEach(childName => {
        content += generateChildElement(childName, elementInfo, config);
    });
    
    content += `    </${schemaPrefix}:sequence>\n`;
    return content;
}

function generateTextOnlyContent(elementInfo, config) {
    const { schemaPrefix, inferDataTypes } = config;
    
    let content = `    <${schemaPrefix}:simpleContent>\n`;
    const dataType = inferDataTypes && elementInfo.contentTypes.size === 1 ? 
        Array.from(elementInfo.contentTypes)[0] : 'string';
    content += `      <${schemaPrefix}:extension base="${schemaPrefix}:${dataType}">\n`;
    
    // Add attributes to simple content
    elementInfo.attributes.forEach((attrInfo) => {
        content += generateAttribute(attrInfo, schemaPrefix, inferDataTypes);
    });
    
    content += `      </${schemaPrefix}:extension>\n`;
    content += `    </${schemaPrefix}:simpleContent>\n`;
    return content;
}

function generateChildElement(childName, parentInfo, config) {
    const { schemaPrefix, includeOccurrence } = config;
    
    let element = `      <${schemaPrefix}:element name="${childName}"`;
    
    // Determine element type
    const childInfo = schemaAnalysis.elements.get(childName);
    if (childInfo && (childInfo.children.size > 0 || childInfo.attributes.size > 0)) {
        element += ` type="${childName}Type"`;
    } else {
        // Simple element
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

// =============================================================================
// UI FUNCTIONS (Optimized)
// =============================================================================

function toggleSchemaOptions() {
    const options = document.getElementById('schemaOptions');
    if (options) {
        options.classList.toggle('show');
    }
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
    const previewContent = document.getElementById('schemaPreviewContent');
    if (previewContent) {
        previewContent.textContent = generatedSchema;
    }
    
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

// =============================================================================
// RESET FUNCTIONS (Optimized)
// =============================================================================

function resetSchemaModule() {
    // Reset schema options UI
    const schemaOptions = document.getElementById('schemaOptions');
    if (schemaOptions) {
        schemaOptions.classList.remove('show');
    }
    
    // Reset form controls to defaults
    const defaults = {
        includeOccurrence: true,
        inferDataTypes: true,
        includeAnnotations: true,
        targetNamespace: '',
        schemaPrefix: 'xs'
    };
    
    Object.entries(defaults).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            if (typeof value === 'boolean') {
                element.checked = value;
            } else {
                element.value = value;
            }
        }
    });
    
    // Reset module variables
    generatedSchema = '';
    schemaAnalysis = null;
}