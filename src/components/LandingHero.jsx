import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingHero.css";

function LandingHero() {
  const [courses, setCourses] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("N/A");
  const navigate = useNavigate();

  const BACKEND_URL = process.env.REACT_APP_EDTECH_BACKEND_URL;

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/");
      return;
    }

    async function fetchCourses() {
      try {
        const res = await fetch(BACKEND_URL + "/api/v1/course/preview");
        const data = await res.json();

        if (res.ok && data.courses.length > 0) {
          const filteredCourses = data.courses.filter((c) => c.updatedAt);
          const sorted = filteredCourses.sort(
            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
          );
          setCourses(data.courses);

          if (sorted.length > 0) {
            const latestDate = new Date(sorted[0].updatedAt);
            setLastUpdated(latestDate.toLocaleString());
          }
        }
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      }
    }

    fetchCourses();
  }, [navigate]);

  return (
    <div className="landing-hero">
      <div className="hero-text">
        <h1>"Manage your courses with ease"</h1>
        <p>
          You can create, edit and manage all your published courses from this
          admin panel.
        </p>

        <div className="summary">
          <span>Total Courses Created: {courses.length}</span>
          <span>Last Updated: {lastUpdated}</span>
        </div>
      </div>

      <div className="course-preview-grid">
        {courses.map((course) => (
          <div className="course-preview-card" key={course._id}>
            <img
              src={course.imageUrl}
              alt={course.title}
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/280x160?text=No+Image";
              }}
            />
            <h3>{course.title}</h3>
            <p>{course.description.slice(0, 60)}...</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LandingHero;
