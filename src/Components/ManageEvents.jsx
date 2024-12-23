import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../Authentication/firebase";
import SimpleHeader from "./SimpleHeader";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";
import { deleteEventById, getEventsByCreator } from "../API-Functions/myApi";
import ErrorComponent from "./ErrorComponent";
import "../CSS/ManageEvents.css";
import EditEventForm from "./EditEventForm";
import { ToastContainer, toast } from "react-toastify";

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [error, setError] = useState("");
  const [deletingEventId, setDeletingEventId] = useState(null);
  const [editingEventId, setEditingEventId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCheckingAccess(true);
      if (user) {
        try {
          const docRef = doc(db, "Users", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists() && docSnap.data().role === "Staff Member") {
            fetchUserEvents(user, docSnap.data().username);
          } else {
            navigate("/");
          }
        } catch (err) {
          console.error("Error checking access:", err);
          navigate("/unauthorized");
        }
      } else {
        navigate("/unauthorized");
      }
      setCheckingAccess(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchUserEvents = async (user, creator) => {
    setLoadingEvents(true);
    setError("");
    try {
      const token = await user.getIdToken();
      const eventsData = await getEventsByCreator(creator, token);
      setEvents(eventsData);
    } catch (err) {
      setError(err.response.data.msg);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    setDeletingEventId(id);
    try {
      const token = await auth.currentUser.getIdToken();
      await deleteEventById(id, token);
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.event_id !== id)
      );

      toast.success("Event deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete the event. Please try again.", err.message);
    }
  };

  if (checkingAccess) {
    return <Loading />;
  }

  return (
    <>
      <SimpleHeader />
      <div className="manage-event-container">
        <h1>Manage Your Events</h1>
        {loadingEvents ? (
          <Loading />
        ) : error ? (
          <ErrorComponent error={error} />
        ) : (
          <main>
            {events.map((event) => (
              <section className="manage-event-card" key={event.event_id}>
                <h1 className="card-title">{event.event_name}</h1>
                <img
                  src={event.image}
                  alt="cover art for the event"
                  className="card-image"
                />
                <h3>
                  Start date: {new Date(event.start_date).toLocaleString()}
                </h3>
                <p>Venue: {event.venue}</p>
                <button
                  onClick={() => handleDeleteEvent(event.event_id)}
                  disabled={deletingEventId === event.event_id}
                  className="delete-button"
                >
                  {deletingEventId === event.event_id
                    ? "Deleting..."
                    : "Delete Event"}
                </button>
                <button onClick={() => setEditingEventId(event.event_id)}>
                  Edit Event
                </button>
                {editingEventId === event.event_id && (
                  <EditEventForm
                    event={event}
                    onUpdate={(updatedEvent) =>
                      setEvents((prevEvents) =>
                        prevEvents.map((e) =>
                          e.event_id === updatedEvent.event_id
                            ? updatedEvent
                            : e
                        )
                      )
                    }
                    onClose={() => setEditingEventId(null)}
                  />
                )}
              </section>
            ))}
          </main>
        )}
      </div>
      <ToastContainer position="top-center" theme="dark" autoClose={3000} />
    </>
  );
};

export default ManageEvents;
