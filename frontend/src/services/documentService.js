import axios from "axios"

const API_BASE_URL = "http://localhost:5000/api/documents"

export const getDocumentById = async (id) => {
  try {
    const token = sessionStorage.getItem("token")
    const response = await axios.get(`${API_BASE_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    console.error("Error fetching document:", error)
    throw error
  }
}

export const updateDocument = async (id, data) => {
  try {
    const token = sessionStorage.getItem("token")
    const response = await axios.put(`${API_BASE_URL}/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    console.error("Error updating document:", error)
    throw error
  }
}

export const deleteDocument = async (id) => {
  try {
    const token = sessionStorage.getItem("token")
    await axios.delete(`${API_BASE_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } catch (error) {
    console.error("Error deleting document:", error)
    throw error
  }
}

