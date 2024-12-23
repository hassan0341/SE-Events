/* eslint-disable react/prop-types */
import { useState } from "react";
import { updateEventById } from "../API-Functions/myApi";
import "../CSS/EditEventForm.css";
import { auth } from "../Authentication/firebase";
import { toast } from "react-toastify";

const EditEventForm = ({ event, onUpdate, onClose }) => {
  const [eventName, setEventName] = useState(event.event_name);
  const [startDate, setStartDate] = useState(
    formatDateTimeLocal(event.start_date)
  );
  const [venueName, setVenueName] = useState(event.venue);
  const [eventImage, setEventImage] = useState(event.image);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await auth.currentUser.getIdToken();
      const updatedFields = {
        event_name: eventName,
        start_date: startDate,
        venue: venueName,
        image: eventImage,
      };
      const updatedEvent = await updateEventById(
        event.event_id,
        updatedFields,
        token
      );
      onUpdate(updatedEvent);
      toast.success("Event updated successfully!");
      onClose();
    } catch (err) {
      toast.error(
        "Failed to update the event. Please try again. ",
        `${err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-event-form">
      <h3>Edit Event</h3>
      <form onSubmit={handleSubmit}>
        <label>
          Event Name:
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            required
          />
        </label>
        <label>
          Start Date:
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </label>
        <label>
          Venue:
          <input
            type="text"
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            required
          />
        </label>
        <label>
          Image URL:
          <input
            type="text"
            value={eventImage}
            onChange={(e) => setEventImage(e.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Event"}
        </button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
  );
};

const formatDateTimeLocal = (date) => {
  const d = new Date(date);
  const isoString = d.toISOString();
  return isoString.slice(0, 16);
};

export default EditEventForm;
