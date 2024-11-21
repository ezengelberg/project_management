import mongoose from "mongoose";
import Grade from "../models/grades.js";
import Submission from "../models/submission.js";
import NumericValue from "../models/numericValues.js";

const defaultLetters = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "E", "F"];

// Add new grade
export const addGrade = async (req, res) => {
  const { submissionId, grade, videoQuality, workQuality, writingQuality, commits, journalActive } = req.body;

  if (!grade) {
    return res.status(400).json({ message: "חייב להזין ציון" });
  }

  try {
    // Check if judge already graded this submission
    const submission = await Submission.findById(submissionId).populate({
      path: "grades",
      match: { judge: req.user._id },
    });

    if (!submission) {
      return res.status(404).json({ message: "ההגשה לא נמצאה" });
    }

    // If judge already graded, update existing grade
    if (submission.grades.length > 0) {
      const existingGrade = submission.grades[0];
      await Grade.findByIdAndUpdate(existingGrade._id, {
        grade,
        videoQuality,
        workQuality,
        writingQuality,
        commits,
        journalActive,
        updatedAt: Date.now(),
      });
      return res.status(200).json({ message: "הציון עודכן בהצלחה" });
    }

    // Create new grade
    const newGrade = new Grade({
      grade,
      videoQuality,
      workQuality,
      writingQuality,
      commits,
      journalActive,
      judge: req.user._id,
    });

    await newGrade.save();

    // Add grade reference to submission
    submission.grades.push(newGrade._id);
    await submission.save();

    res.status(200).json({ message: "הציון נשמר בהצלחה" });
  } catch (error) {
    console.log("Error saving grade:", error);
    res.status(500).json({ message: "שגיאה בשמירת הציון" });
  }
};

// Update numeric values for grades
export const updateNumericValues = async (req, res) => {
  const { updatedValues } = req.body;

  try {
    for (const [letter, value] of Object.entries(updatedValues)) {
      await NumericValue.findOneAndUpdate({ letter }, { value }, { upsert: true, new: true });
    }
    const updatedNumericValues = await NumericValue.find({});
    const letterToNumber = defaultLetters.reduce((acc, letter) => {
      acc[letter] = updatedNumericValues.find((nv) => nv.letter === letter)?.value || null;
      return acc;
    }, {});
    res.status(200).json({ message: "Numeric values updated successfully", letterToNumber });
  } catch (error) {
    console.log("Error updating numeric values:", error);
    res.status(500).json({ message: "Error updating numeric values" });
  }
};

export const getNumericValues = async (req, res) => {
  try {
    const numericValues = await NumericValue.find({});
    const letterToNumber = defaultLetters.reduce((acc, letter) => {
      acc[letter] = numericValues.find((nv) => nv.letter === letter)?.value || null;
      return acc;
    }, {});
    console.log("Getting numeric values:", letterToNumber);
    res.status(200).json(letterToNumber);
  } catch (error) {
    console.log("Error getting numeric values:", error);
    res.status(500).json({ message: "Error getting numeric values" });
  }
};

// Update grade (override by coordinator)
export const updateGrade = async (req, res) => {
  const { grade, comment } = req.body;
  const { id } = req.params;
  const numericValueDoc = await NumericValue.findOne({ letter: grade });
  const numericGrade = numericValueDoc ? numericValueDoc.value : null;

  if (!grade) {
    return res.status(400).json({ message: "חייב להזין ציון" });
  }
  if (numericGrade === null) {
    return res.status(400).json({ message: "הציון חייב להיות בין (0) ל-(100)" });
  }

  try {
    const gradeToUpdate = await Grade.findById(id);

    if (!gradeToUpdate) {
      return res.status(404).json({ message: "הציון לא נמצא" });
    }

    gradeToUpdate.overridden = {
      by: req.user._id,
      newGrade: grade,
      numericGrade,
      comment: comment || "הציון התעדכן על ידי הרכז",
    };

    await gradeToUpdate.save();

    res.status(200).json({ message: "הציון עודכן בהצלחה" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "שגיאה בעדכון הציון" });
  }
};

// Get grade by submission ID
export const getGradeBySubmission = async (req, res) => {
  const { submissionId } = req.params;

  try {
    const submission = await Submission.findById(submissionId).populate({
      path: "grades",
      match: { judge: req.user._id },
      populate: {
        path: "judge",
        select: "name email",
      },
    });

    if (!submission) {
      return res.status(404).json({ message: "ההגשה לא נמצאה" });
    }

    const grade = submission.grades[0] || null;

    res.status(200).json(grade);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "שגיאה בטעינת הציון" });
  }
};

export const endJudgingPeriod = async (req, res) => {
  try {
    const submissions = await Submission.find().populate("grades");

    for (const submission of submissions) {
      submission.editable = false;
      for (const grade of submission.grades) {
        if (grade.numericGrade === null && grade.grade) {
          const numericValueDoc = await NumericValue.findOne({ letter: grade.grade });
          if (!numericValueDoc) {
            return res.status(400).json({ message: `Missing numeric value for grade ${grade.grade}` });
          }
          grade.numericGrade = numericValueDoc.value;
          await grade.save();
        }
      }
      await submission.save();
    }

    res.status(200).json({ message: "Judging period ended and numeric values attached successfully" });
  } catch (error) {
    console.log("Error ending judging period:", error);
    res.status(500).json({ message: "Error ending judging period" });
  }
};
