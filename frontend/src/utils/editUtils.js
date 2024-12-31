import axios from "axios";

export const handleEditSave = async (key, form, data, setData, endpoint, additionalFields = {}) => {
  try {
    const row = await form.validateFields();
    const newData = [...data];
    const index = newData.findIndex((item) => key === item.key);
    if (index > -1) {
      const item = newData[index];
      const updatedItem = { ...item, ...row, ...additionalFields };
      newData.splice(index, 1, updatedItem);
      setData(newData);
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}${endpoint}/${item._id}`, updatedItem, {
        withCredentials: true,
      });
      form.resetFields();
    }
  } catch (errInfo) {
    console.log("Validate Failed:", errInfo);
  }
};
