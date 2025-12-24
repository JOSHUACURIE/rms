import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { get } from '../../api/api';
import './Dashboard.css';

const DosDashboard = () => {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalStudents: 0,
    pendingScores: 0
  });
  
  const [recentScores, setRecentScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentYear = new Date().getFullYear().toString();
        let currentTermId = '';
        let defaultClassId = '';

        try {
          const termsRes = await get('/terms');
          const termsData = termsRes.data || termsRes.terms || Array.isArray(termsRes) ? termsRes : [];
          const termsArray = Array.isArray(termsData) ? termsData : [];
          const currentTerm = termsArray.find(term => 
            term.is_active || term.status === 'active' || term.is_current
          ) || termsArray[0];
          currentTermId = currentTerm?.term_id || '';
        } catch (termsError) {
          console.warn('Could not fetch terms:', termsError);
        }

        try {
          const classesRes = await get('/classes');
          const classesData = classesRes.data || classesRes.classes || Array.isArray(classesRes) ? classesRes : [];
          const classesArray = Array.isArray(classesData) ? classesData : [];
          defaultClassId = classesArray[0]?.class_id || '';
        } catch (classesError) {
          console.warn('Could not fetch classes:', classesError);
        }

        const requests = [
          get('/teachers').catch(err => {
            console.warn('Failed to fetch teachers:', err);
            return [];
          }),
          get('/students').catch(err => {
            console.warn('Failed to fetch students:', err);
            return [];
          })
        ];

        if (currentTermId && defaultClassId) {
          requests.push(
            get(`/results/submitted?term_id=${currentTermId}&class_id=${defaultClassId}&academic_year=${currentYear}`)
              .catch(err => {
                console.warn('Failed to fetch submitted results:', err);
                return { success: false, data: [] };
              })
          );
        } else {
          requests.push(Promise.resolve({ success: false, data: [] }));
        }

        const [
          teachersRes,
          studentsRes,
          submittedResultsRes
        ] = await Promise.all(requests);

        const teachersData = teachersRes.data || Array.isArray(teachersRes) ? teachersRes : [];
        const studentsData = studentsRes.data || Array.isArray(studentsRes) ? studentsRes : [];
        const teachersArray = Array.isArray(teachersData) ? teachersData : [];
        const studentsArray = Array.isArray(studentsData) ? studentsData : [];

        const totalStudents = studentsArray.length;
        let studentsWithScores = 0;
        let submittedResultsData = [];

        if (submittedResultsRes && submittedResultsRes.success) {
          submittedResultsData = submittedResultsRes.data || [];
          studentsWithScores = Array.isArray(submittedResultsData) ? submittedResultsData.length : 0;
        }

        const pendingScoresCount = Math.max(0, totalStudents - studentsWithScores);

        setStats({
          totalTeachers: teachersArray.length,
          totalStudents: totalStudents,
          pendingScores: pendingScoresCount
        });

        if (Array.isArray(submittedResultsData) && submittedResultsData.length > 0) {
          const recentSubmittedScores = submittedResultsData.slice(0, 5).map(result => {
            const subjectScores = result.subject_scores || [];
            const latestSubject = subjectScores.length > 0 
              ? subjectScores[subjectScores.length - 1] 
              : { subject_name: 'No subjects', score: 'N/A' };
            
            return {
              id: result.student_id || result.admission_number,
              student: result.fullname || 'Unknown Student',
              subject: latestSubject.subject_name || 'Unknown Subject',
              score: latestSubject.score || 'N/A',
              submittedAt: new Date().toLocaleDateString()
            };
          });
          setRecentScores(recentSubmittedScores);
        } else {
          setRecentScores([]);
        }

      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleManageTeachers = () => navigate('/dos/manage-teachers');
  const handleManageStudents = () => navigate('/dos/manage-students');
  const handleAnalyzeResults = () => navigate('/dos/analyze-results');
  const handleViewSubmittedResults = () => navigate('/dos/submitted-results');

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>{error}</p>
        <button 
          className="quick-action-btn mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dos-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Director of Studies Dashboard</h1>
        <p className="dashboard-subtitle">
          Overview of school academic performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grids">
        <div className="content-card">
          <div className="stat-items">
            <span className="badge badge-dos">DOS</span>
            <h3 className="stat-label">Total Teachers</h3>
            <p className="stat-value">{stats.totalTeachers}</p>
            <p className="stat-change">Active staff members</p>
          </div>
        </div>

        <div className="content-card">
          <div className="stat-items">
            <span className="badge badge-info">Students</span>
            <h3 className="stat-label">Total Students</h3>
            <p className="stat-value">{stats.totalStudents}</p>
            <p className="stat-change">Currently enrolled</p>
          </div>
        </div>

        <div className="content-card">
          <div className="stat-items">
            <span className="badge badge-warning">Pending</span>
            <h3 className="stat-label">Pending Scores</h3>
            <p className="stat-value">{stats.pendingScores}</p>
            <p className="stat-change">Awaiting submission</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        
        <div className="quick-actions-grid">
          <button 
            onClick={handleManageTeachers}
            className="quick-action-btn"
          >
            👨‍🏫 Manage Teachers
          </button>
          <button 
            onClick={handleManageStudents}
            className="quick-action-btn"
          >
            👨‍🎓 Manage Students
          </button>
          <button 
            onClick={handleAnalyzeResults}
            className="quick-action-btn"
          >
            📊 Analyze Results
          </button>
          <button 
            onClick={handleViewSubmittedResults}
            className="quick-action-btn"
          >
            📝 View Submitted Results
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity-section">
        <div className="activity-grid">
          <div className="content-card">
            <div className="activity-header">
              <h3 className="activity-title">
                Recently Submitted Scores
                {recentScores.length > 0 && (
                  <span className="badge badge-info ml-2">
                    {recentScores.length}
                  </span>
                )}
              </h3>
              <button 
                className="quick-action-btn" 
                onClick={handleViewSubmittedResults}
              >
                View All
              </button>
            </div>
            
            {recentScores.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Subject</th>
                      <th>Score</th>
                      <th>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentScores.map((score) => (
                      <tr key={score.id}>
                        <td>{score.student}</td>
                        <td>{score.subject}</td>
                        <td>
                          {score.score === 'N/A' ? (
                            <span className="badge badge-warning">Pending</span>
                          ) : (
                            <span className="font-semibold">{score.score}</span>
                          )}
                        </td>
                        <td>{score.submittedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>No recently submitted scores found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DosDashboard;