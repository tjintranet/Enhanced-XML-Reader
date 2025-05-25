# Enhanced XML Reader

A powerful, modern web-based XML file reader and analyzer with advanced features for viewing, searching, and exporting XML data.

## 🚀 Features

### Core Functionality
- **🎯 Drag & Drop Interface** - Simply drag XML files into the browser
- **📁 File Browser Support** - Traditional file selection with validation
- **🌳 Interactive Tree View** - Collapsible hierarchical XML structure
- **🔢 Line Numbers** - Toggle-able line numbering for easy navigation
- **📍 Go-to-Line** - Jump directly to any line number
- **🎨 Namespace Color Coding** - Visual distinction for different XML namespaces

### Advanced Search & Filtering
- **🔍 Enhanced Search** - Search in element names, content, or attributes
- **🔧 Regex Support** - Regular expression pattern matching
- **⚡ Real-time Filtering** - Instant results as you type
- **🎛️ Filter Options** - Show/hide empty elements and attributes
- **📊 Element Filtering** - Filter by specific element types
- **📈 Search Statistics** - View match counts and filter status

### XPath Tools
- **🛠️ XPath Generation** - Automatic XPath creation for any element
- **📋 Multiple Formats** - Absolute, relative, and optimized XPath expressions
- **🧪 XPath Evaluation** - Test custom XPath expressions
- **🎯 Match Navigation** - Navigate through XPath results
- **📌 Element Selection** - Click any element to generate its XPath
- **🔍 Filter Integration** - Filter tree view by XPath matches

### Export & Schema Generation
- **📄 Multiple Export Formats** - JSON, CSV, XML, and plain text
- **📋 XSD Schema Generation** - Automatic XML Schema (XSD) creation
- **⚙️ Schema Customization** - Configure namespaces, types, and annotations
- **📑 Schema Preview** - Review generated schemas before download
- **💾 View State Export** - Save and restore UI configurations

### User Experience
- **📱 Responsive Design** - Works on desktop, tablet, and mobile
- **🎨 Modern UI** - Clean interface with Bootstrap Icons
- **⌨️ Keyboard Shortcuts** - Efficient navigation and operations
- **🔄 Collapsible Sections** - Organized, space-efficient interface
- **⚡ Performance Optimized** - Handles large XML files efficiently
- **♿ Accessibility** - Screen reader support and keyboard navigation

## 🏗️ Architecture

### Modular Design
The application is built with a modular architecture for maintainability and extensibility:

```
Enhanced XML Reader
├── xml-core.js      # File handling, XML parsing, data structures
├── xml-ui.js        # User interface, tree rendering, search/filter
├── xml-xpath.js     # XPath generation, evaluation, navigation
├── xml-schema.js    # XSD schema analysis and generation
└── style.css        # Complete styling and responsive design
```

### Key Components

#### 🧠 Core Module (`xml-core.js`)
- File upload and validation
- XML parsing and tree structure building
- Namespace processing
- Performance monitoring
- Module coordination

#### 🎨 UI Module (`xml-ui.js`)
- Tree visualization and rendering
- Search and filtering functionality
- Line numbering and navigation
- Export operations
- User interaction handling

#### 🛣️ XPath Module (`xml-xpath.js`)
- Dynamic XPath generation
- XPath expression evaluation
- Match highlighting and navigation
- Filter integration

#### 📋 Schema Module (`xml-schema.js`)
- XML structure analysis
- XSD schema generation
- Data type inference
- Customizable output options

## 🚀 Getting Started

### Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server installation required
- JavaScript enabled

### Installation
1. Download or clone the repository
2. Open `index.html` in your web browser
3. Start using immediately - no build process required!

### Basic Usage

#### Loading XML Files
1. **Drag & Drop**: Drag an XML file directly onto the upload area
2. **File Browser**: Click "Choose File" to browse and select an XML file
3. **File Validation**: Only valid XML files (.xml extension) are accepted

#### Navigating the Tree
- **Expand/Collapse**: Click the `+`/`-` icons to expand or collapse nodes
- **Line Numbers**: Use the "Lines" button to toggle line number display
- **Go to Line**: Enter a line number in the input field and press Enter
- **Search**: Use the search box to find specific elements or content

#### Using XPath Tools
1. **Generate XPath**: Click any element in the tree to generate its XPath
2. **Test XPath**: Enter custom XPath expressions in the evaluation field
3. **Navigate Results**: Use the navigation buttons to jump between matches
4. **Filter View**: Enable filtering to show only XPath matches

#### Exporting Data
- **JSON**: Export the parsed XML structure as JSON
- **CSV**: Export as comma-separated values for spreadsheet use
- **XML**: Export formatted/pretty-printed XML
- **Text**: Export as plain text outline
- **XSD Schema**: Generate XML Schema Definition files

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + F` | Focus search input |
| `Ctrl/Cmd + E` | Expand all nodes |
| `Ctrl/Cmd + R` | Collapse all nodes |
| `Ctrl/Cmd + L` | Toggle line numbers |
| `Escape` | Clear search/filters |
| `Enter` | Execute XPath evaluation |
| `↑/↓` | Navigate XPath matches |

## 🎛️ Configuration Options

### Search Settings
- **Element Names**: Search in XML element names
- **Text Content**: Search in element text content
- **Attributes**: Search in element attributes
- **Regex Mode**: Enable regular expression matching

### Display Options
- **Line Numbers**: Show/hide line numbers
- **Empty Elements**: Show/hide elements with no content
- **Attributes**: Show/hide element attributes
- **Namespaces**: Color-coded namespace display

### XPath Options
- **Absolute**: Full path from root (`/root/child[1]/element[2]`)
- **Relative**: Descendant-based paths (`//element[2]`)
- **Smart**: Optimized paths using attributes when available

### Schema Generation
- **Occurrence Indicators**: Include minOccurs/maxOccurs
- **Data Type Inference**: Automatically detect data types
- **Annotations**: Include documentation in schema
- **Namespace Configuration**: Set target namespace and prefix

## 🔧 Advanced Features

### Performance Optimization
- **Large File Handling**: Optimized for files up to 10MB+
- **Virtual Scrolling**: Efficient rendering for large XML structures
- **Debounced Search**: Smooth search experience without lag
- **Memory Management**: Efficient memory usage and cleanup

### Error Handling
- **Graceful Degradation**: Continues working even with partial errors
- **User Feedback**: Clear error messages and recovery suggestions
- **Debug Information**: Console logging for troubleshooting
- **State Recovery**: Automatic recovery from critical errors

### Extensibility
- **Module System**: Easy to add new features
- **Event System**: Inter-module communication
- **Plugin Architecture**: Extensible for custom functionality
- **API Exposure**: Global JavaScript API for integration

## 🎨 Customization

### Styling
The application uses Bootstrap 5 with custom CSS:
- **CSS Variables**: Easy color and spacing customization
- **Theme Support**: Ready for dark mode implementation
- **Responsive Breakpoints**: Mobile-first responsive design
- **Print Styles**: Optimized for printing XML structures

### Icons
Uses Bootstrap Icons for consistent, modern iconography:
- **Scalable**: Vector icons that work at any size
- **Accessible**: Proper ARIA labels and semantic markup
- **Consistent**: Unified design language throughout

## 📊 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Full Support |
| Firefox | 88+ | ✅ Full Support |
| Safari | 14+ | ✅ Full Support |
| Edge | 90+ | ✅ Full Support |
| Mobile Safari | 14+ | ✅ Full Support |
| Chrome Mobile | 90+ | ✅ Full Support |

### Required Features
- ES6+ JavaScript support
- CSS Grid and Flexbox
- File API and FileReader
- Drag and Drop API
- Clipboard API (for copy/paste features)

## 🐛 Troubleshooting

### Common Issues

#### File Won't Load
- ✅ Ensure file has `.xml` extension
- ✅ Check that XML is well-formed (no syntax errors)
- ✅ Verify file size is reasonable (< 50MB for best performance)
- ✅ Try refreshing the page and loading again

#### Search Not Working
- ✅ Check search options are enabled (names, content, attributes)
- ✅ Verify regex syntax if regex mode is enabled
- ✅ Clear filters and try again
- ✅ Ensure elements aren't hidden by other filters

#### XPath Errors
- ✅ Verify XPath syntax is correct
- ✅ Check that referenced elements exist in the XML
- ✅ Try generating XPath by clicking elements first
- ✅ Use the built-in XPath validation

#### Performance Issues
- ✅ For very large files, try collapsing sections first
- ✅ Disable line numbers for better performance
- ✅ Use filtering to reduce visible elements
- ✅ Consider breaking large XML into smaller files

### Debug Mode
Open browser developer tools (F12) to access:
- Console logging with detailed information
- Performance metrics and timing
- Error details and stack traces
- Global API for advanced debugging

### Reset Options
- **Clear All**: Resets entire application state
- **Clear Filters**: Removes search and filter settings
- **Refresh Page**: Complete reset (if other options fail)

## 🔒 Privacy & Security

### Data Handling
- **Local Processing**: All XML processing happens in your browser
- **No Server Upload**: Files never leave your computer
- **No Tracking**: No analytics or user tracking
- **No Storage**: No persistent data storage (session only)

### File Security
- **Type Validation**: Only XML files are processed
- **Size Limits**: Warnings for very large files
- **Content Sanitization**: XSS protection in displayed content
- **Error Isolation**: Errors don't expose system information

## 📈 Performance Metrics

The application tracks and displays performance information:

### Parsing Metrics
- **Parse Time**: Time to parse XML into data structure
- **Element Count**: Total number of XML elements
- **File Size**: Original XML file size
- **Memory Usage**: Approximate memory consumption

### Rendering Metrics
- **Render Time**: Time to display XML tree
- **Visible Elements**: Number of currently visible elements
- **Search Performance**: Time for search operations
- **Filter Application**: Time to apply filters

### Optimization Tips
- **Collapse Unused Sections**: Hide sections you're not using
- **Use Filters**: Reduce visible elements for better performance
- **Disable Line Numbers**: For very large files
- **Clear Search**: Remove search terms when not needed

## 🤝 Contributing

### Development Setup
1. Clone the repository
2. Open `index.html` in a modern browser
3. Use browser developer tools for debugging
4. No build process required!

### Code Style
- **ES6+ JavaScript**: Modern JavaScript features
- **Modular Architecture**: Separate concerns into modules
- **Bootstrap Integration**: Use Bootstrap classes where possible
- **Accessible HTML**: Semantic markup with ARIA labels

### Module Structure
Each module follows this pattern:
```javascript
// Module variables
let moduleState = {};

// Initialization
function initializeModule() { }

// Public API
function publicFunction() { }

// Private helpers
function privateHelper() { }

// Reset/cleanup
function resetModule() { }

// Global exposure
window.ModuleName = { publicFunction };
```

## 📚 API Reference

### Global Objects

#### XMLCoreModule
```javascript
// Data access
XMLCoreModule.getParsedData()      // Get parsed XML structure
XMLCoreModule.getOriginalXML()     // Get original XML string
XMLCoreModule.getFileName()        // Get loaded file name
XMLCoreModule.getNamespaces()      // Get namespace map

// Export functions
XMLCoreModule.exportData(format)   // Export in specified format
XMLCoreModule.downloadFile(content, filename, mimeType)

// Utilities
XMLCoreModule.escapeHtml(text)     // HTML escape
XMLCoreModule.formatFileSize(bytes) // Format file size
XMLCoreModule.clearAll()           // Reset application
```

#### XMLUIModule
```javascript
// UI functions
XMLUIModule.showMessage(message, type, duration)
XMLUIModule.exportViewState()      // Export UI configuration
XMLUIModule.importViewState(json)  // Import UI configuration
XMLUIModule.getTreeStatistics()    // Get tree statistics
XMLUIModule.performEnhancedSearch(term) // Execute search
```

### Events
The application fires custom events for integration:
- `xmlLoaded`: When XML file is successfully loaded
- `treeRendered`: When tree display is complete
- `searchUpdated`: When search results change
- `xpathEvaluated`: When XPath evaluation completes

## 🔄 Version History

### Version 2.0.0 (Current)
- ✨ Complete rewrite with modular architecture
- 🎨 Bootstrap Icons integration
- ⚡ Performance optimizations
- 🔍 Enhanced search and filtering
- 🛠️ Advanced XPath tools
- 📱 Improved mobile support
- ♿ Better accessibility

### Version 1.x
- 🌳 Basic XML tree viewing
- 🔍 Simple search functionality
- 📄 Basic export options
- Font Awesome icons

## 📄 License

This project is open source and available under the MIT License.

```
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

## 🙏 Acknowledgments

- **Bootstrap** - For the excellent CSS framework and icons
- **Web Standards** - Built on modern web APIs and standards
- **Open Source Community** - For inspiration and best practices

## 📞 Support

For questions, issues, or feature requests:
- 📧 Check the troubleshooting section above
- 🐛 Use browser developer tools for debugging
- 💡 Consider contributing improvements back to the project

---

**Enhanced XML Reader** - Making XML data accessible and analyzable in the browser.

*Built with ❤️ using modern web technologies*