import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export const getFactorInfo = async (params) => {
  const response = await axios.get(`${API_BASE_URL}/api/factor`, { params })
  return response.data
}

export const getFactorStats = async (params) => {
  const response = await axios.get(`${API_BASE_URL}/api/factor/stats`, { params })
  return response.data
}

export const getFactorPerf = async (factorName, params) => {
  const response = await axios.get(`${API_BASE_URL}/api/factor/${factorName}`, { params })
  return response.data
}
