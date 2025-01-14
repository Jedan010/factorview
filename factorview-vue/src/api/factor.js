import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // 更新为FastAPI服务的端口

export const getFactors = async (params) => {
  try {
    // 只保留pool、start_date和end_date参数
    const { pool, start_date, end_date } = params;
    const response = await axios.get(`${API_BASE_URL}/api/factor`, { 
      params: { pool, start_date, end_date }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching factors:', error);
    throw error;
  }
};
