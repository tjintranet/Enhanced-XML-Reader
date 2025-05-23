# Enhanced XML Reader

A powerful, web-based XML visualization and analysis tool with advanced schema generation and XPath functionality. Parse, explore, filter, and export XML data with an intuitive drag-and-drop interface.

## 🚀 Features

### 📁 **File Processing**
- **Drag & Drop Interface** - Modern file upload with visual feedback
- **XML Validation** - Real-time parsing with detailed error reporting
- **Large File Support** - Efficiently handles complex XML structures
- **File Type Validation** - Automatically detects and validates XML files

### 🌳 **Interactive Tree Visualization**
- **Collapsible Tree Structure** - Navigate large XML documents easily
- **Namespace Color Coding** - Visual distinction for different XML namespaces
- **Attribute Display** - View element attributes inline with toggle options
- **Content Preview** - See text content directly in the tree view
- **Click-to-Select** - Click any element to generate its XPath or perform actions

### 🛤️ **XPath Tools**
- **Click-to-Generate XPath** - Click any element to automatically generate its XPath
- **Multiple XPath Formats** - Choose between Absolute, Relative, or Smart XPath generation
- **XPath Evaluation** - Test XPath expressions against the loaded XML document
- **Live Result Highlighting** - See matching elements highlighted in the tree
- **Copy to Clipboard** - One-click copying of generated XPath expressions
- **Smart Path Optimization** - Automatically uses attributes and unique identifiers when available

### 🔍 **Advanced Search & Filtering**
- **Real-time Search** - Find elements and content instantly
- **Regex Support** - Use regular expressions for complex searches
- **Element Filtering** - Filter by specific element types
- **Search Highlighting** - Visual highlighting of search matches
- **Display Options** - Show/hide empty elements and attributes

### 📊 **Multiple Export Formats**
- **JSON Export** - Convert XML structure to JSON format
- **CSV Export** - Tabular representation with element paths and metadata
- **Pretty XML** - Formatted XML with proper indentation
- **Text Structure** - Simple text-based tree representation
- **XSD Schema** - Generate XML Schema Definition files

### 🏗️ **Schema Generation (XSD)**
- **Automatic Analysis** - Deep structural analysis of XML documents
- **Data Type Inference** - Smart detection of content types (string, integer, date, etc.)
- **Occurrence Patterns** - Calculate minOccurs/maxOccurs based on actual data
- **Namespace Support** - Handle complex namespace scenarios
- **Customizable Options** - Control schema generation behavior
- **Preview Mode** - Review generated schemas before download

## 🛠️ Installation

### Quick Start
1. Clone or download the repository
2. Open `index.html` in a modern web browser
3. No server setup required - runs entirely client-side!

```bash
git clone https://github.com/yourusername/enhanced-xml-reader.git
cd enhanced-xml-reader
# Open index.html in your browser
```

### File Structure
```
enhanced-xml-reader/
├── index.html          # Main HTML structure
├── style.css           # Styling and animations
├── xml-core.js         # Core XML processing
├── xml-ui.js           # Tree display and filtering
├── xml-schema.js       # Schema analysis and generation
├── xml-xpath.js        # XPath generation and evaluation
└── README.md           # This file
```

## 🎯 Usage

### Loading XML Files
1. **Drag & Drop** - Simply drag an XML file onto the upload area
2. **File Browser** - Click "Choose File" to select from your computer
3. **Automatic Processing** - File is parsed and visualized immediately

### Exploring XML Structure
- **Expand/Collapse** - Click the arrow icons to navigate the tree
- **View Attributes** - Attributes are displayed inline with elements
- **Search Content** - Use the search box to find specific elements or text
- **Filter Elements** - Use the dropdown to show only specific element types

### Working with XPath
1. **Generate XPath** - Click any element in the tree to generate its XPath
2. **Choose Format** - Select Absolute, Relative, or Smart XPath format
3. **Copy XPath** - Use the copy button to copy the generated expression
4. **Test XPath** - Enter custom XPath expressions in the test field
5. **Evaluate** - Click "Evaluate" to test expressions and highlight matches
6. **Clear Results** - Use the clear button (×) to reset the test field

#### XPath Format Options
- **Absolute** - Full path from root: `/root/section[1]/item[2]`
- **Relative** - Uses descendant axis: `//item[2]`
- **Smart** - Uses attributes when available: `//item[@id='123']`

### Generating Schemas
1. Load an XML file
2. Click "Export Schema (XSD)"
3. Configure generation options:
   - **Occurrence Indicators** - Include minOccurs/maxOccurs
   - **Data Type Inference** - Automatically detect data types
   - **Annotations** - Include documentation in schema
   - **Target Namespace** - Set custom namespace
4. Preview or download the generated XSD

### Export Options
- **JSON** - Full tree structure as JSON
- **CSV** - Element data in tabular format
- **Pretty XML** - Formatted XML with indentation
- **Text** - Simple text tree representation
- **XSD Schema** - XML Schema Definition

## ⚙️ Configuration

### Schema Generation Options

| Option | Description | Default |
|--------|-------------|---------|
| Include Occurrence | Add minOccurs/maxOccurs attributes | ✅ Enabled |
| Infer Data Types | Detect string, integer, date, etc. | ✅ Enabled |
| Include Annotations | Add documentation to schema | ✅ Enabled |
| Target Namespace | Custom namespace URI | Empty |
| Schema Prefix | XML Schema prefix (xs, xsd, etc.) | `xs` |

### XPath Generation Options

| Format | Description | Example |
|--------|-------------|---------|
| Absolute | Full path from document root | `/bookstore/book[1]/title` |
| Relative | Uses descendant axis when beneficial | `//book[@id='123']/title` |
| Smart | Optimizes using attributes and unique content | `//book[@isbn='978-0123456789']` |

### Display Options

| Option | Description |
|--------|-------------|
| Show Empty Elements | Display elements with no content |
| Show Attributes | Display element attributes inline |
| Regex Search | Enable regular expression search |

## 🔧 Technical Details

### Browser Compatibility
- **Chrome** 80+ ✅
- **Firefox** 75+ ✅
- **Safari** 13+ ✅
- **Edge** 80+ ✅

### Dependencies
- **Bootstrap 5.3.2** - UI framework
- **Font Awesome 6.4.0** - Icons
- **No jQuery required** - Pure vanilla JavaScript

### Architecture
The application uses a modular architecture with four main components:

1. **xml-core.js** - File handling, XML parsing, data structures
2. **xml-ui.js** - Tree visualization, search, filtering
3. **xml-schema.js** - Schema analysis and XSD generation
4. **xml-xpath.js** - XPath generation and evaluation

### Performance
- **Client-side Processing** - No server required
- **Memory Efficient** - Optimized for large XML files
- **Responsive UI** - Non-blocking operations
- **Fast Search** - Indexed element lookup
- **Efficient XPath** - Cached path generation

## 🎨 Customization

### Styling
Modify `style.css` to customize:
- Color schemes and themes
- Tree visualization appearance
- Namespace color coding
- Animation effects
- XPath highlighting styles

### Functionality
Extend the modules:
- Add new export formats in `xml-ui.js`
- Implement additional data types in `xml-schema.js`
- Add file format support in `xml-core.js`
- Enhance XPath features in `xml-xpath.js`

## 🐛 Troubleshooting

### Common Issues

**File won't load**
- Ensure file is valid XML
- Check file size (very large files may take time)
- Verify file extension is .xml

**Schema generation fails**
- Confirm XML file is loaded successfully
- Check browser console for error messages
- Try with a simpler XML structure first

**XPath not generating**
- Ensure XML file is loaded and tree is displayed
- Try clicking directly on element text, not expand/collapse icons
- Check that XPath Tools panel is visible

**Search not working**
- Verify search terms are correct
- Try disabling regex mode for simple searches
- Clear filters and try again

**XPath evaluation errors**
- Verify XPath syntax is correct
- Try simpler expressions first
- Check browser console for detailed error messages

### Error Messages
- **XML Parsing Error** - Invalid XML syntax
- **File Type Error** - Non-XML file selected
- **Memory Error** - File too large for browser
- **XPath Evaluation Error** - Invalid XPath expression syntax
