import mongoose from "mongoose";
import Grade from "../models/grades.js";
import Submission from "../models/submission.js";

// Add new grade
export const addGrade = async (req, res) => {
  const { submissionId, grade, videoQuality, workQuality, writingQuality, commits, journalActive } = req.body;

  console.log("Received data:", req.body); // Add this line to log the received data

  if (!grade) {
    return res.status(400).json({ message: "חייב להזין ציון" });
  }
  if (grade < 0 || grade > 100) {
    return res.status(400).json({ message: "הציון חייב להיות בין (0) ל-(100)" });
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
    console.log("Error saving grade:", error); // Add this line to log the error
    res.status(500).json({ message: "שגיאה בשמירת הציון" });
  }
};

// Update grade (override by coordinator)
export const updateGrade = async (req, res) => {
  const { grade, comment } = req.body;
  const { id } = req.params;

  if (!grade) {
    return res.status(400).json({ message: "חייב להזין ציון" });
  }
  if (grade < 0 || grade > 100) {
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
