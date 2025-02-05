import ZoomMeeting from "../models/zoomMeeting.js";
import dayjs from "dayjs";

const updateRecurringMeetings = async () => {
  const now = new Date();

  const meetings = await ZoomMeeting.find({ endTime: { $lte: now } });

  for (const meeting of meetings) {
    if (meeting.recurring) {
      let nextStartTime = dayjs(meeting.startTime);
      let nextEndTime = dayjs(meeting.endTime);

      switch (meeting.recurrence.type) {
        case "daily":
          nextStartTime = nextStartTime.add(meeting.recurrence.interval, "day");
          nextEndTime = nextEndTime.add(meeting.recurrence.interval, "day");
          break;
        case "weekly":
          nextStartTime = nextStartTime.add(meeting.recurrence.interval, "week");
          nextEndTime = nextEndTime.add(meeting.recurrence.interval, "week");
          break;
        case "monthly":
          nextStartTime = nextStartTime.add(meeting.recurrence.interval, "month");
          nextEndTime = nextEndTime.add(meeting.recurrence.interval, "month");
          break;
        default:
          break;
      }

      meeting.startTime = nextStartTime.toDate();
      meeting.endTime = nextEndTime.toDate();
      await meeting.save();
    } else {
      await ZoomMeeting.deleteOne({ _id: meeting._id });
    }
  }
};

export default updateRecurringMeetings;
