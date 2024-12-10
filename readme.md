# PDF to Text Conversion API

A Node.js REST API service that converts PDF files to text. The service accepts PDF files via URLs (including Google Drive links) and returns the extracted text content.

## Features

-   PDF text extraction from URLs
-   Support for Google Drive PDF links
-   API key authentication
-   Error handling and validation
-   Environment-based configuration
-   Automatic content-type detection
-   Detailed response metadata

## Prerequisites

-   Node.js (v14 or higher)
-   npm (Node Package Manager)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd pdf-to-text-api
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```env
API_KEY=your-secret-api-key-here
PORT=3000
```

## Dependencies

```json
{
	"dependencies": {
		"express": "^4.18.2",
		"pdf-parse": "^1.1.1",
		"axios": "^1.6.2",
		"dotenv": "^16.3.1"
	}
}
```

## Usage

1. Start the server:

```bash
node server.js
```

2. Make a request to convert PDF to text:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key" \
  -d '{"pdfUrl": "https://example.com/sample.pdf"}' \
  http://localhost:3000/convert
```

### API Endpoints

#### POST /convert

Converts a PDF file to text.

**Request Headers:**

-   `Content-Type: application/json`
-   `x-api-key: your-api-key`

**Request Body:**

```json
{
	"pdfUrl": "string" // URL of the PDF file
}
```

**Success Response:**

```json
{
	"status": "success",
	"text": "extracted text content",
	"numberOfPages": 5,
	"metadata": {
		// PDF metadata
	},
	"version": "PDF version"
}
```

**Error Response:**

```json
{
	"status": "error",
	"message": "error description"
}
```

### Supported URL Types

1. Direct PDF URLs:

```
https://example.com/document.pdf
```

2. Google Drive URLs:

```
https://drive.google.com/file/d/{fileId}/view
https://drive.google.com/open?id={fileId}
```

## Error Handling

The API handles various error scenarios:

-   Invalid API key
-   Invalid URL format
-   Non-PDF content
-   Network timeouts
-   Server errors
-   PDF parsing errors

## Security Considerations

1. API Key Authentication:

    - Store the API key securely in environment variables
    - Never commit the `.env` file
    - Use different API keys for development and production

2. URL Validation:

    - All URLs are validated before processing
    - Content-type checking ensures only PDF files are processed

3. Resource Protection:
    - Request timeout limits prevent hanging connections
    - Error handling prevents server crashes

## Development

To run the server in development mode with automatic restarts:

1. Install nodemon:

```bash
npm install -g nodemon
```

2. Start the server:

```bash
nodemon server.js
```

## Limitations

-   Large PDF files might take longer to process
-   Some Google Drive files might require public access
-   Complex PDF layouts might affect text extraction accuracy

## Troubleshooting

1. **"Invalid API key" error:**

    - Check if the API key in the request header matches the one in your `.env` file

2. **Content-type error with Google Drive:**

    - Ensure the file is accessible via the sharing link
    - Try making the file publicly accessible

3. **Timeout errors:**
    - Check your internet connection
    - The PDF might be too large
    - The server might be under heavy load

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
