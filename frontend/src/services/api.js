/**
 * API service layer.
 * All communication with the FastAPI backend goes through this module.
 */

import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60 seconds for large PDF processing
})

/**
 * Upload and process an FNOL document.
 * @param {File} file - PDF or TXT file
 * @returns {Promise<Object>} - { extractedFields, missingFields, recommendedRoute, reasoning }
 */
export async function processClaim(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/api/claims/process', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

/**
 * Check backend health.
 * @returns {Promise<Object>}
 */
export async function checkHealth() {
  const response = await api.get('/api/health')
  return response.data
}
