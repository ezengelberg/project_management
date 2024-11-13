import mongoose from "mongoose";
import Grade from "../models/grades.js";

export const updateGrade = async (req, res) => {
  console.log("im here");
  const { grade, gradeInfo } = req.body;
  const { id } = req.params;
  console.log(req.body);
  console.log(req.params);
  console.log(grade);
  if (!grade) {
    return res.status(400).send("חייב להזין ציון");
  }
  if (grade < 0 || grade > 100) {
    return res.status(400).send("הציון חייב להיות בין (0) ל-(100)");
  }
  try {
    const gradeToUpdate = await Grade.findOneAndUpdate(
      { _id: id },
      {
        overridden: {
          by: req.user._id,
          newGrade: grade,
          comment: "הציון התעדכן על ידי הרצאה"
        }
      }
    );
    res.status(200).send("הציון עודכן בהצלחה");
    // const gradeToUpdate = await
    // Grade.findOneAndUpdate(
  } catch (error) {
    console.log(error);
    return res.status(500).send("שגיאה בעדכון הציון");
  }
};
