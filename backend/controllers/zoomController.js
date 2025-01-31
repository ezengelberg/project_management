import ZoomMeeting from "../models/zoomMeeting.js";
import Project from "../models/projects.js";
import Notification from "../models/notifications.js";
import axios from "axios";

// Zoom OAuth Token Generation
let zoomAccessToken = null;
let tokenExpiration = null;

const getZoomAccessToken = async () => {
  if (zoomAccessToken && Date.now() < tokenExpiration) {
    return zoomAccessToken;
  }

  try {
    const response = await axios.post("https://zoom.us/oauth/token", null, {
      params: {
        grant_type: "account_credentials",
        account_id: process.env.ZOOM_ACCOUNT_ID,
      },
      auth: {
        username: process.env.ZOOM_CLIENT_ID,
        password: process.env.ZOOM_CLIENT_SECRET,
      },
    });

    zoomAccessToken = response.data.access_token;
    tokenExpiration = Date.now() + response.data.expires_in * 1000 - 30000; // Refresh 30s before expiry
    return zoomAccessToken;
  } catch (error) {
    console.error("Error getting Zoom access token:", error.response?.data || error.message);
    throw new Error("Failed to authenticate with Zoom");
  }
};

export const createMeeting = async (req, res) => {
  try {
    const { topic, date, time, recurring, projectId, recurrenceType, recurrenceInterval, participants } = req.body;
    const user = req.user;
    const truncatedTopic = topic ? (topic.length > 200 ? topic.substring(0, 200) : topic) : "לא צוין";

    // Convert date and time to UTC
    const startTime = new Date(`${date}T${time}`);
    const utcStartTime = startTime.toISOString();

    // Calculate endTime
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Default to 60 minutes

    // Get Zoom access token
    const accessToken = await getZoomAccessToken();

    // Zoom meeting payload
    const meetingPayload = {
      topic: truncatedTopic,
      type: recurring ? 8 : 2, // 2 = scheduled, 8 = recurring
      start_time: utcStartTime,
      duration: 60, // Default to 60 minutes
      timezone: "UTC",
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        waiting_room: true,
      },
      recurrence: recurring
        ? {
            type: recurrenceType === "daily" ? 1 : recurrenceType === "weekly" ? 2 : 3,
            repeat_interval: recurrenceInterval || 1,
          }
        : undefined,
    };

    // Create Zoom meeting
    const response = await axios.post("https://api.zoom.us/v2/users/me/meetings", meetingPayload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    // Save meeting to database
    const zoomMeeting = new ZoomMeeting({
      meetingId: response.data.id,
      topic: response.data.topic,
      startTime: utcStartTime,
      duration: response.data.duration,
      participants: projectId
        ? (await Project.findById(projectId).populate("students.student")).students.map((student) => student.student)
        : participants,
      creator: user._id,
      joinUrl: response.data.join_url,
      startUrl: response.data.start_url,
      recurring,
      project: projectId || null,
      endTime,
      recurrence: recurring
        ? {
            type: recurrenceType,
            interval: recurrenceInterval,
          }
        : undefined,
    });

    await zoomMeeting.save();

    // Send notifications to participants
    const notifications = zoomMeeting.participants
      .filter((participantId) => participantId.toString() !== user._id.toString())
      .map((participantId) => ({
        user: participantId,
        message: `נקבעה פגישה חדשה בתאריך ${new Date(utcStartTime).toLocaleString("he-IL", {
          timeZone: "Asia/Jerusalem",
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}`,
      }));
    await Notification.insertMany(notifications);

    res.status(201).json({
      message: "Meeting created successfully",
      meeting: zoomMeeting,
    });
  } catch (error) {
    console.error("Error creating meeting:", error);
    res.status(500).json({
      message: "Error creating meeting",
      error: error.response?.data || error.message,
    });
  }
};

export const deleteMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const user = req.user;

    const meeting = await ZoomMeeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    if (meeting.creator.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this meeting" });
    }

    await ZoomMeeting.deleteOne({ _id: meetingId });

    // Send notifications to participants
    const notifications = meeting.participants
      .filter((participantId) => participantId.toString() !== user._id.toString())
      .map((participantId) => ({
        user: participantId,
        message: `הפגישה בוטלה בתאריך ${new Date(meeting.startTime).toLocaleString("he-IL", {
          timeZone: "Asia/Jerusalem",
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}`,
      }));
    await Notification.insertMany(notifications);

    res.status(200).json({ message: "Meeting deleted successfully" });
  } catch (error) {
    console.error("Error deleting meeting:", error);
    res.status(500).json({
      message: "Error deleting meeting",
      error: error.response?.data || error.message,
    });
  }
};

export const getMeetings = async (req, res) => {
  try {
    const userId = req.user._id;
    const meetings = await ZoomMeeting.find({
      $or: [{ creator: userId }, { participants: userId }],
    })
      .populate({
        path: "participants",
        select: "name email",
      })
      .populate("project")
      .sort({ startTime: 1 })
      .lean();

    res.status(200).json(meetings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching meetings", error: error.message });
  }
};
