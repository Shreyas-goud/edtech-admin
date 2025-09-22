// frontend/src/pages/AdminCRUD.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminCRUD.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";

function AdminCRUD() {
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");
  let currentAdminId = null;

  try {
    const decoded = jwtDecode(token);
    currentAdminId = decoded.id;
  } catch (err) {
    console.error("Invalid admin token", err);
  }

  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    imageUrl: "",
    lessons: [],
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [courseWarnings, setCourseWarnings] = useState({});

  useEffect(() => {
    if (!token) {
      navigate("/");
    } else {
      fetchCourses();
    }
    // eslint-disable-next-line
  }, []);

  const BACKEND_URL = process.env.REACT_APP_EDTECH_BACKEND_URL;

  const fetchCourses = async () => {
    try {
      const res = await fetch(BACKEND_URL + "/api/v1/course/preview");
      const data = await res.json();
      setCourses(data.courses || []);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addLesson = () => {
    setForm({
      ...form,
      lessons: [...form.lessons, { title: "", videoUrl: "" }],
    });
  };

  const removeLesson = (index) => {
    const updated = [...form.lessons];
    updated.splice(index, 1);
    setForm({ ...form, lessons: updated });
  };

  const handleLessonChange = (index, field, value) => {
    const updated = [...form.lessons];
    updated[index][field] = value;
    setForm({ ...form, lessons: updated });
  };
  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.price || !form.imageUrl) {
      toast.warn("Please fill in all required fields.");
      return;
    }

    try {
      const url = BACKEND_URL + "/api/v1/admin/course";
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        body: JSON.stringify({
          ...form,
          courseId: editingCourseId,
          price: parseFloat(form.price),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Something went wrong");
        return;
      }

      toast.success(isEditMode ? "Course updated" : "Course created");

      setForm({
        title: "",
        description: "",
        price: "",
        imageUrl: "",
        lessons: [],
      });
      setIsEditMode(false);
      setEditingCourseId(null);
      fetchCourses();
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Something went wrong");
    }
  };

  const showCourseWarning = (courseId, message) => {
    setCourseWarnings((prev) => ({ ...prev, [courseId]: message }));
    setTimeout(() => {
      setCourseWarnings((prev) => {
        const updated = { ...prev };
        delete updated[courseId];
        return updated;
      });
    }, 3000);
  };

  const handleEdit = (course) => {
    if (course.creatorId !== currentAdminId) {
      showCourseWarning(
        course._id,
        "You are not the creator of this course. You cannot edit it."
      );
      return;
    }

    setForm({
      title: course.title,
      description: course.description,
      price: course.price,
      imageUrl: course.imageUrl,
      lessons: course.lessons || [],
    });
    setIsEditMode(true);
    setEditingCourseId(course._id);
    window.scrollTo(0, 0);
  };

  const handleDeleteRequest = (courseId) => {
    setPendingDeleteId(courseId);
  };

  const cancelDelete = () => {
    setPendingDeleteId(null);
  };

  const confirmDelete = async (courseId) => {
    const courseToDelete = courses.find((c) => c._id === courseId);
    if (courseToDelete.creatorId !== currentAdminId) {
      showCourseWarning(
        courseId,
        "You are not the creator of this course. You cannot delete it."
      );
      return;
    }

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/v1/admin/course/${courseId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            token,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to delete course");
        return;
      }

      toast.success("Course deleted successfully");
      fetchCourses();
      setPendingDeleteId(null);
      setCourseWarnings({});
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="crud-container">
      <h2>{isEditMode ? "Edit Course" : "Create Course"}</h2>
      <input
        type="text"
        name="title"
        placeholder="Course Title"
        value={form.title}
        onChange={handleChange}
      />
      <input
        type="text"
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
      />
      <input
        type="text"
        name="price"
        placeholder="Price"
        value={form.price}
        onChange={handleChange}
      />
      <input
        type="text"
        name="imageUrl"
        placeholder="Image URL"
        value={form.imageUrl}
        onChange={handleChange}
      />

      <h4>Lessons</h4>
      {form.lessons.map((lesson, index) => (
        <div key={index} className="lesson-input">
          <input
            type="text"
            placeholder="Lesson Title"
            value={lesson.title}
            onChange={(e) => handleLessonChange(index, "title", e.target.value)}
          />
          <input
            type="text"
            placeholder="Video URL"
            value={lesson.videoUrl}
            onChange={(e) =>
              handleLessonChange(index, "videoUrl", e.target.value)
            }
          />
          <button
            className="delete-lesson-button-inline"
            onClick={() => removeLesson(index)}
          >
            X
          </button>
        </div>
      ))}

      <button className="add-lesson-button" onClick={addLesson}>
        Add Lesson
      </button>

      <button className="add-lesson-button" onClick={handleSubmit}>
        {isEditMode ? "Save Changes" : "Create Course"}
      </button>

      <hr />

      <h2>All Courses</h2>
      {courses.map((c) => (
        <div key={c._id} className="course-card">
          {courseWarnings[c._id] && (
            <p
              style={{
                backgroundColor: "#ffe0e0",
                color: "#b30000",
                padding: "8px",
                borderRadius: "4px",
                marginBottom: "8px",
                fontSize: "13px",
                textAlign: "center",
              }}
            >
              {courseWarnings[c._id]}
            </p>
          )}
          <h3>{c.title}</h3>
          <p>{c.description}</p>
          <img
            src={c.imageUrl}
            alt={c.title}
            className="preview-img"
            onError={(e) =>
              (e.target.src =
                "https://via.placeholder.com/280x160?text=No+Image")
            }
          />
          <p>₹{c.price}</p>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="edit-button" onClick={() => handleEdit(c)}>
              Edit
            </button>
            <button
              className="delete-lesson-button-inline"
              onClick={() => handleDeleteRequest(c._id)}
            >
              Delete
            </button>
          </div>

          {pendingDeleteId === c._id && (
            <div className="inline-confirm-box">
              <p className="confirm-text">Are you sure?</p>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="confirm-delete-button"
                  onClick={() => confirmDelete(c._id)}
                >
                  Yes
                </button>
                <button className="cancel-delete-button" onClick={cancelDelete}>
                  No
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default AdminCRUD;
