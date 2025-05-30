import axios from "axios"


export const getDocumentById = async (id) => {
  try {
    const token = sessionStorage.getItem("token")
    const response = await axios.get(`${process.env.REACT_APP_URL}/api/documents/${id}`, {
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
    const response = await axios.put(`${process.env.REACT_APP_URL}/api/documents/${id}`, data, {
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
    await axios.delete(`${process.env.REACT_APP_URL}/api/documents/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } catch (error) {
    console.error("Error deleting document:", error)
    throw error
  }
}

