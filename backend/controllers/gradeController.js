import Grade from "../models/grades.js";
import Submission from "../models/submission.js";
import Notification from "../models/notifications.js";

const defaultLetters = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "E", "F"];

// Add new grade
export const addGrade = async (req, res) => {
  const {
    submissionId,
    grade,
    videoQuality,
    workQuality,
    writingQuality,
    commits,
    journalActive,
    isGraded,
    isReviewed,
  } = req.body;

  if (!grade && isGraded) {
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
  const { updatedValues, name } = req.body;

  try {
    const submissions = await Submission.find({ name });
    for (const submission of submissions) {
      if (submission.editable === false) {
        continue;
      }
      for (const [letter, value] of Object.entries(updatedValues)) {
        const numericValue = submission.numericValues.find((nv) => nv.letter === letter);
        if (numericValue) {
          numericValue.value = value;
        } else {
          submission.numericValues.push({ letter, value });
        }
      }
      await submission.save();
    }

    // Fetch updated numeric values
    const updatedNumericValues = submissions.flatMap((submission) => submission.numericValues);
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

export const getAllNumericValues = async (req, res) => {
  try {
    // Get all unique submission names with graded submissions
    const submissionNames = await Submission.distinct("name", { isGraded: true });

    // Prepare the grouped values
    const groupedValues = {};

    // Iterate through each submission name
    for (const name of submissionNames) {
      // Find all submissions with this specific name
      const submissions = await Submission.find({ name });

      // Initialize the group with default null values for all letters
      const groupValues = {
        name,
        ...defaultLetters.reduce((obj, letter) => ({ ...obj, [letter]: null }), {}),
      };

      // Populate the group's values
      for (const submission of submissions) {
        for (const letter of defaultLetters) {
          const existingValue = submission.numericValues.find((nv) => nv.letter === letter);

          if (!existingValue) {
            // If no existing value, create a new one
            const newValue = { letter, value: 0 };
            submission.numericValues.push(newValue);
            groupValues[letter] = 0;
          } else {
            // Use existing value
            groupValues[letter] = existingValue.value;
          }
        }
        await submission.save();
      }

      // Store the group values
      groupedValues[name] = groupValues;
    }

    // Convert to array and send response
    res.status(200).json(Object.values(groupedValues));
  } catch (error) {
    console.log("Error getting all numeric values:", error);
    res.status(500).json({ message: "Error getting all numeric values" });
  }
};

export const changeFinalGrade = async (req, res) => {
  const { id } = req.params;
  const { newGrade, comment } = req.body;

  try {
    const submission = await Submission.findById(id).populate("project");

    if (!submission) {
      return res.status(404).json({ message: "ההגשה לא נמצאה" });
    }

    const oldGrades = submission.overridden ? submission.overridden.oldGrades : [];
    oldGrades.push({
      grade: submission.finalGrade,
      comment: comment ? comment : "לא ניתנה סיבה",
    });

    submission.overridden = {
      by: req.user._id,
      oldGrades,
      newGrade,
    };
    submission.finalGrade = newGrade;
    await submission.save();

    // Create notifications for students and advisor
    const notifications = submission.project.students.map((student) => ({
      user: student.student,
      message: `הציון של "${submission.name}" שונה`,
    }));
    notifications.push({
      user: submission.project.advisors[0],
      message: `הציון של "${submission.name}" שונה`,
    });
    await Notification.insertMany(notifications);

    res.status(200).json({ message: "הציון הסופי עודכן בהצלחה" });
  } catch (error) {
    console.log("Error changing final grade:", error);
    res.status(500).json({ message: "Error changing final grade" });
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

export const publishGrades = async (req, res) => {
  const { submissionName, group } = req.body;
  try {
    const submissions = await Submission.find({ name: submissionName }).populate("grades").populate("project");
    const advisorNotified = new Set();
    for (const submission of submissions) {
      if (submission.editable === false) {
        continue;
      }

      let totalGrade = 0;
      let gradeCount = 0;
      let allGradesHaveNumericValue = true;
      let allGradesHaveVideoQuality = true;

      for (const grade of submission.grades) {
        if (grade.numericGrade === null && grade.grade !== null) {
          const numericValueDoc = submission.numericValues.find((nv) => nv.letter === grade.grade);
          if (!numericValueDoc) {
            return res.status(400).json({ message: `Missing numeric value for grade ${grade.grade}` });
          }
          grade.numericGrade = numericValueDoc.value;
          grade.editable = false;
          await grade.save();
        }
        if (grade.numericGrade !== null) {
          totalGrade += grade.numericGrade;
          gradeCount++;
        } else {
          allGradesHaveNumericValue = false;
        }
        if (grade.videoQuality !== undefined && grade.videoQuality !== null && grade.editable) {
          grade.editable = false;
          await grade.save();
        }
        if (grade.videoQuality === undefined || grade.videoQuality === null) {
          allGradesHaveVideoQuality = false;
        }
      }

      if (allGradesHaveNumericValue && gradeCount > 0) {
        let averageGrade = totalGrade / gradeCount;
        submission.finalGrade = Math.round(averageGrade);
        submission.editable = false;
        // adding penalty for days late
        const days = Math.ceil(
          (new Date(submission.uploadDate) - new Date(submission.submissionDate)) / (1000 * 60 * 60 * 24),
        );
        submission.finalGrade -= days * 2;
      } else {
        submission.finalGrade = null;
      }
      if (allGradesHaveVideoQuality && !allGradesHaveNumericValue) {
        submission.editable = false;
      }
      await submission.save();

      // Create notifications for students
      const notifications = submission.project.students.map((student) => ({
        user: student.student,
        message: `הציון עבור "${submission.name}" פורסם`,
      }));

      // Create notification for advisor if not already notified
      if (!advisorNotified.has(submission.project.advisors[0].toString())) {
        notifications.push({
          user: submission.project.advisors[0],
          message: `הציון עבור "${submission.name}" פורסם`,
        });
        advisorNotified.add(submission.project.advisors[0].toString());
      }

      await Notification.insertMany(notifications);
    }

    res.status(200).json({ message: "Grades were published" });
  } catch (error) {
    console.log("Error while publishing grades:", error);
    res.status(500).json({ message: "Error while publishing grades" });
  }
};
