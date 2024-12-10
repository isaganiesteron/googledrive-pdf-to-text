import "dotenv/config"
import express from "express"
import pdf from "pdf-parse/lib/pdf-parse.js"
import axios from "axios"

const app = express()
app.use(express.json())

// Function to convert Google Drive URL to direct download link
const getGoogleDriveDirectUrl = (url) => {
	try {
		const urlObject = new URL(url)

		// Handle different Google Drive URL formats
		if (urlObject.hostname === "drive.google.com") {
			let fileId

			// Format: https://drive.google.com/file/d/{fileId}/view
			if (url.includes("/file/d/")) {
				fileId = url.split("/file/d/")[1].split("/")[0]
			}
			// Format: https://drive.google.com/open?id={fileId}
			else if (urlObject.searchParams.get("id")) {
				fileId = urlObject.searchParams.get("id")
			}

			if (fileId) {
				return `https://drive.google.com/uc?export=download&id=${fileId}`
			}
		}
	} catch (error) {
		console.error("Error parsing Google Drive URL:", error)
	}

	// Return original URL if it's not a Google Drive URL or if there's an error
	return url
}

// API key middleware
const authenticateApiKey = (req, res, next) => {
	const apiKey = req.headers["x-api-key"]

	if (!process.env.API_KEY) {
		console.error("API_KEY not set in environment variables")
		return res.status(500).json({ error: "Server configuration error" })
	}

	if (!apiKey || apiKey !== process.env.API_KEY) {
		return res.status(401).json({ error: "Invalid API key" })
	}

	next()
}

// Apply API key authentication to all routes
app.use(authenticateApiKey)

app.post("/convert", async (req, res) => {
	try {
		const { pdfUrl } = req.body

		if (!pdfUrl) {
			return res.status(400).json({ error: "PDF URL is required" })
		}

		// Validate URL format
		try {
			new URL(pdfUrl)
		} catch (error) {
			return res.status(400).json({ error: "Invalid URL format" })
		}

		// Convert Google Drive URL if necessary
		const directUrl = getGoogleDriveDirectUrl(pdfUrl)

		// Fetch PDF from URL with custom headers
		const response = await axios.get(directUrl, {
			responseType: "arraybuffer",
			timeout: 10000,
			headers: {
				Accept: "application/pdf",
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
			},
			maxRedirects: 5,
		})

		// Check if content is binary (PDF)
		const contentType = response.headers["content-type"]
		const isBinary = response.headers["content-type"]?.includes("application/pdf") || response.headers["content-type"]?.includes("application/octet-stream") || response.headers["content-type"]?.includes("binary/octet-stream")

		if (!isBinary) {
			return res.status(400).json({
				error: "URL does not point to a PDF file or is not accessible",
				contentType,
				url: directUrl,
			})
		}

		// Convert arraybuffer to Buffer for pdf-parse
		const buffer = Buffer.from(response.data)

		// Parse PDF with options
		const options = {
			max: 0,
			version: false,
		}

		const data = await pdf(buffer, options)

		res.json({
			status: "success",
			text: data.text,
			numberOfPages: data.numpages,
			metadata: data.metadata,
			version: data.version,
		})
	} catch (error) {
		console.error("Error details:", error)
		let statusCode = 500
		let message = "Internal server error"

		if (error.code === "ECONNABORTED") {
			statusCode = 408
			message = "Request timeout while fetching PDF"
		} else if (error.response) {
			statusCode = error.response.status
			message = `Failed to fetch PDF: ${error.response.statusText}`
		} else if (error.request) {
			statusCode = 503
			message = "Unable to reach PDF URL"
		} else if (error.message) {
			message = error.message
		}

		res.status(statusCode).json({
			status: "error",
			message: message,
			details: error.toString(),
		})
	}
})

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack)
	res.status(500).json({
		status: "error",
		message: "Internal server error",
	})
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
