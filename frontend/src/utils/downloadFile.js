import axios from "axios";

export const downloadFile = async (fileId, destination) => {
  try {
    // Fetch the file details to get the original filename
    const fileResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/uploads/info/${fileId}`, {
      withCredentials: true,
    });
    const fileName = fileResponse.data.filename;
    const response = await axios.get(
      `${process.env.REACT_APP_BACKEND_URL}/api/uploads/download/${fileId}?destination=${destination}`,
      {
        responseType: "blob",
        withCredentials: true,
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  } catch (error) {
    console.error("Error downloading file:", error);
  }
};
