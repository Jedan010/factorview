import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const getStrategies = async (params) => {
  const response = await axios.get(`${API_BASE_URL}/api/strategy`, { params })
  return response.data
}
