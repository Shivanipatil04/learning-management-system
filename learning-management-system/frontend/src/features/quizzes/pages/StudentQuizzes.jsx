import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/apiClient';
import '../styles/quizzes.css';

const StudentQuizzes = () => {
  const [activeTab, setActiveTab] = useState('available');
  const [quizzes, setQuizzes] = useState({ available: [], upcoming: [], completed: [], results: [] });
  const [loading, setLoading] = useState(true);

  // Attempt State
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({}); // questionId -> [selected option indices]

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/quizzes/student');
      if (response.data.success) {
        setQuizzes(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch quizzes', error);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async (id) => {
    try {
      const response = await apiClient.get(`/quizzes/student/${id}`);
      if (response.data.success) {
        setActiveQuiz(response.data.data);
        setAnswers({});
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error loading quiz');
    }
  };

  const submitQuiz = async () => {
    if (!window.confirm("Are you sure you want to submit?")) return;
    
    try {
      const formattedAnswers = Object.keys(answers).map(qId => ({
        questionId: qId,
        selectedOptions: answers[qId]
      }));

      const response = await apiClient.post(`/quizzes/student/${activeQuiz._id}/attempt`, {
        answers: formattedAnswers
      });

      if (response.data.success) {
        alert(`Quiz submitted! You scored ${response.data.percentage.toFixed(1)}% and ${response.data.status}.`);
        setActiveQuiz(null);
        fetchQuizzes();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit quiz');
    }
  };

  const handleOptionChange = (questionId, optionIndex, type) => {
    const current = answers[questionId] || [];
    if (type === 'mcq' || type === 'true-false') {
      setAnswers({ ...answers, [questionId]: [optionIndex] });
    } else {
      if (current.includes(optionIndex)) {
        setAnswers({ ...answers, [questionId]: current.filter(i => i !== optionIndex) });
      } else {
        setAnswers({ ...answers, [questionId]: [...current, optionIndex] });
      }
    }
  };

  if (activeQuiz) {
    return (
      <div className="quiz-attempt-page">
        <h2>{activeQuiz.title}</h2>
        <p>Course: {activeQuiz.courseId.title}</p>
        {activeQuiz.instructions && (
          <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <strong>Instructions:</strong>
            <p>{activeQuiz.instructions}</p>
          </div>
        )}
        <div className="questions-list">
          {activeQuiz.questions.map((q, index) => (
            <div key={q._id} className="question-card">
              <h4>{index + 1}. {q.questionText} <span className="marks">({q.marks} marks)</span></h4>
              {q.questionType === 'multi-select' && <p style={{fontSize: '12px', color: '#64748b'}}>Select all that apply</p>}
              
              <div className="options-list">
                {q.options.map((opt, oIndex) => {
                  const isChecked = (answers[q._id] || []).includes(oIndex);
                  return (
                    <label key={oIndex} className="option-label">
                      <input 
                        type={q.questionType === 'multi-select' ? 'checkbox' : 'radio'} 
                        name={q._id} 
                        checked={isChecked}
                        onChange={() => handleOptionChange(q._id, oIndex, q.questionType)}
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="quiz-actions">
          <button className="primary-button" onClick={submitQuiz}>Submit Quiz</button>
          <button className="text-button" onClick={() => setActiveQuiz(null)}>Cancel</button>
        </div>
      </div>
    );
  }

  if (loading) return <div>Loading quizzes...</div>;

  return (
    <div className="quizzes-page">
      <div className="page-header">
        <h1>My Quizzes</h1>
      </div>

      <div className="quizzes-tabs">
        {['available', 'upcoming', 'completed', 'results'].map(tab => (
          <button 
            key={tab} 
            className={activeTab === tab ? 'active' : ''} 
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {quizzes[activeTab].length === 0 ? (
          <div className="empty-state">No {activeTab} quizzes found.</div>
        ) : (
          <div className="quiz-grid">
            {quizzes[activeTab].map(item => {
              const quiz = activeTab === 'results' ? item.quizId : item;
              return (
                <div key={item._id} className="quiz-card">
                  <h3>{quiz.title}</h3>
                  <p><strong>Course:</strong> {quiz.courseId?.title}</p>
                  <p><strong>Teacher:</strong> {quiz.teacherId?.name}</p>
                  <div className="quiz-meta">
                    <span>{quiz.questions?.length || 0} Questions</span>
                    <span>{quiz.totalMarks} Marks</span>
                    <span>Pass: {quiz.passingPercentage}%</span>
                  </div>
                  
                  {activeTab === 'available' && (
                    <button className="primary-button full-width" onClick={() => startQuiz(quiz._id)}>Start Quiz</button>
                  )}
                  {activeTab === 'results' && (
                    <div className="result-banner">
                      Score: {item.score} | Status: <span className={item.status}>{item.status.toUpperCase()}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentQuizzes;
