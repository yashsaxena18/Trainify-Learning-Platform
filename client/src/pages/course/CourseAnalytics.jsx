// src/pages/course/CourseAnalytics.jsx
import React, { useState, useEffect } from 'react';
import API from '../services/api';

const CourseAnalytics = ({ courseId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await API.get(`/courses/${courseId}/analytics`);
        setAnalytics(response.data.analytics);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [courseId]);

  if (loading) return <div>Loading analytics...</div>;

  return (
    <div className="course-analytics">
      <div className="analytics-cards">
        <div className="card">
          <h3>Total Views</h3>
          <p className="big-number">{analytics.totalViews}</p>
        </div>
        <div className="card">
          <h3>Unique Viewers</h3>
          <p className="big-number">{analytics.uniqueViews}</p>
        </div>
        <div className="card">
          <h3>Avg Views/User</h3>
          <p className="big-number">{analytics.averageViewsPerUser}</p>
        </div>
        <div className="card">
          <h3>Recent Views (30d)</h3>
          <p className="big-number">{analytics.recentViews}</p>
        </div>
      </div>

      {/* Views by day chart */}
      <div className="views-chart">
        <h3>Views by Day (Last 7 Days)</h3>
        <div className="chart-bars">
          {analytics.viewsByDay.map((day) => (
            <div key={day.date} className="chart-bar">
              <div 
                className="bar" 
                style={{ height: `${(day.views / Math.max(...analytics.viewsByDay.map(d => d.views))) * 100}%` }}
              />
              <span className="date">{new Date(day.date).toLocaleDateString()}</span>
              <span className="count">{day.views}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseAnalytics;
