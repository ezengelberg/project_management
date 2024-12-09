import Notification from "../models/notifications.js";

export const getUnreadNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id, read: false });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await Notification.findByIdAndUpdate(notificationId, { read: true });
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await Notification.findByIdAndDelete(notificationId);
    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
