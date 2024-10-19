import FileTemplates from "../models/fileTemplates";

export const getFileTemplatess = async (req, res) => {
  try {
    const fileTemplatess = await FileTemplates.find();
    res.status(200).send(fileTemplatess);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const createFileTemplates = async (req, res) => {
  try {
    const fileTemplates = new FileTemplates(req.body);
    await fileTemplates.save();
    res.status(201).send(fileTemplates);
  } catch (err) {
    if (err.message === "A file with this name already exists") {
      res.status(409).send({ message: err.message }); // 409 Conflict
    } else {
      res.status(500).send({ message: err.message });
    }
  }
};

export const updateFileTemplates = async (req, res) => {
  try {
    const fileTemplates = await FileTemplates.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
      runValidators: true,
    });
    if (!fileTemplates) {
      return res.status(404).send({ message: "File template not found" });
    }
    res.status(200).send(fileTemplates);
  } catch (err) {
    if (err.message === "A file with this name already exists") {
      res.status(409).send({ message: err.message }); // 409 Conflict
    } else {
      res.status(500).send({ message: err.message });
    }
  }
};

export const deleteFileTemplates = async (req, res) => {
  try {
    const result = await FileTemplates.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).send({ message: "File template not found" });
    }
    res.status(200).send({ message: "File template deleted successfully" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
