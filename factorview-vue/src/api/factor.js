import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const getFactors = async (params) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/factor`, { params })
    return response.data
  } catch (error) {
    console.error('Error fetching factors:', error)
    throw error
  }
}

export const getFactorPerf = async (factorName, params) => {
  const response = await axios.get(`${API_BASE_URL}/api/factor/${factorName}`, { params })
  return response.data
}
