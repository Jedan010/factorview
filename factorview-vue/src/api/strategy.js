import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export const getStrategy = async (params) => {
  const response = await axios.get(`${API_BASE_URL}/api/strategy`, { params })
  return response.data
}

export const getStrategyPerf = async (strategyName, params) => {
  const response = await axios.get(`${API_BASE_URL}/api/strategy/${strategyName}`, { params })
  return response.data
}

export const getStrategyFactorPerf = async (strategyName, params) => {
  const response = await axios.get(`${API_BASE_URL}/api/strategy/${strategyName}/factors`, { params })
  return response.data
}
