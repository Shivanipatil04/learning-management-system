import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/apiClient';
import '../styles/quizzes.css';

const TeacherQuizzes = () => {
  const [activeTab, setActiveTab] = useState('my_quizzes'); // my_quizzes, create, results
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [formData, setFormData] = useState({
    title: '', courseId: '', instructions: '', status: 'draft',
    totalMarks: 100, passingPercentage: 50, timeLimit: '', maxAttempts: 1,
    startDate: '', dueDate: '', questions: []
  });

  // Results State
  const [selectedQuizForResults, setSelectedQuizForResults] = useState(null);
  const [resultsData, setResultsData] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [qRes, cRes] = await Promise.all([
        apiClient.get('/quizzes/teacher'),
        apiClient.get('/courses')
      ]);
      if (qRes.data.success) setQuizzes(qRes.data.data);
      if (cRes.data.success) setCourses(cRes.data.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (formData.questions.length === 0) return alert("Please add at least one question");
    
    try {
      if (editingQuizId) {
        await apiClient.put(`/quizzes/teacher/${editingQuizId}`, formData);
        alert('Quiz updated successfully!');
      } else {
        await apiClient.post('/quizzes/teacher', formData);
        alert('Quiz created successfully!');
      }
      
      resetForm();
      fetchData();
      setActiveTab('my_quizzes');
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving quiz');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quiz? All attempts will be lost.")) return;
    try {
      await apiClient.delete(`/quizzes/teacher/${id}`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting quiz');
    }
  };

  const editQuiz = (quiz) => {
    setEditingQuizId(quiz._id);
    setFormData({
      title: quiz.title,
      courseId: quiz.courseId._id,
      instructions: quiz.instructions || '',
      status: quiz.status,
      totalMarks: quiz.totalMarks,
      passingPercentage: quiz.passingPercentage,
      timeLimit: quiz.timeLimit || '',
      maxAttempts: quiz.maxAttempts || 1,
      startDate: quiz.startDate ? quiz.startDate.substring(0, 16) : '',
      dueDate: quiz.dueDate ? quiz.dueDate.substring(0, 16) : '',
      questions: quiz.questions.map(q => ({
        ...q,
        correctOptions: q.correctOptions || []
      }))
    });
    setActiveTab('create');
  };

  const resetForm = () => {
    setEditingQuizId(null);
    setFormData({
      title: '', courseId: '', instructions: '', status: 'draft',
      totalMarks: 100, passingPercentage: 50, timeLimit: '', maxAttempts: 1,
      startDate: '', dueDate: '', questions: []
    });
  };

  const addQuestion = (type) => {
    let newQ = { questionText: '', questionType: type, marks: 1, options: ['', ''], correctOptions: [] };
    if (type === 'true-false') {
      newQ.options = ['True', 'False'];
      newQ.correctOptions = [0];
    }
    setFormData({ ...formData, questions: [...formData.questions, newQ] });
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...formData.questions];
    updated[index][field] = value;
    setFormData({ ...formData, questions: updated });
  };

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...formData.questions];
    updated[qIndex].options[oIndex] = value;
    setFormData({ ...formData, questions: updated });
  };

  const toggleCorrectOption = (qIndex, oIndex) => {
    const updated = [...formData.questions];
    const q = updated[qIndex];
    if (q.questionType === 'mcq' || q.questionType === 'true-false') {
      q.correctOptions = [oIndex];
    } else if (q.questionType === 'multi-select') {
      const idx = q.correctOptions.indexOf(oIndex);
      if (idx > -1) q.correctOptions.splice(idx, 1);
      else q.correctOptions.push(oIndex);
    }
    setFormData({ ...formData, questions: updated });
  };

  const viewResults = async (quiz) => {
    setSelectedQuizForResults(quiz);
    setActiveTab('results');
    try {
      const [resData, statData] = await Promise.all([
        apiClient.get(`/quizzes/teacher/${quiz._id}/results`),
        apiClient.get(`/quizzes/teacher/${quiz._id}/analytics`)
      ]);
      setResultsData(resData.data.data);
      setAnalytics(statData.data.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Error fetching results');
    }
  };

  if (loading) return <div>Loading Quizzes...</div>;

  return (
    <div className="quizzes-page">
      <div className="page-header">
        <h1>Teacher Quiz Dashboard</h1>
      </div>

      <div className="quizzes-tabs">
        <button className={activeTab === 'my_quizzes' ? 'active' : ''} onClick={() => { setActiveTab('my_quizzes'); resetForm(); }}>My Quizzes</button>
        <button className={activeTab === 'create' ? 'active' : ''} onClick={() => setActiveTab('create')}>{editingQuizId ? 'Edit Quiz' : 'Create Quiz'}</button>
        <button className={activeTab === 'results' ? 'active' : ''} onClick={() => setActiveTab('results')}>Results</button>
      </div>

      <div className="tab-content">
        {activeTab === 'my_quizzes' && (
          <div className="quiz-grid">
            {quizzes.length === 0 ? <div className="empty-state">No quizzes found.</div> : null}
            {quizzes.map(quiz => (
              <div key={quiz._id} className="quiz-card">
                <h3>{quiz.title}</h3>
                <p><strong>Course:</strong> {quiz.courseId?.title}</p>
                <p><strong>Status:</strong> <span className={`status-badge ${quiz.status}`}>{quiz.status}</span></p>
                <p><small>{quiz.questions?.length || 0} Questions | {quiz.totalMarks} Marks</small></p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <button className="outline-button" onClick={() => editQuiz(quiz)}>Edit</button>
                  <button className="primary-button" onClick={() => viewResults(quiz)}>Results</button>
                  <button className="text-button" style={{color: 'red'}} onClick={() => handleDelete(quiz._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'create' && (
          <form onSubmit={handleCreateOrUpdate} className="quiz-form-card">
            <div className="form-row">
              <div className="form-group" style={{ flex: 2 }}>
                <label>Quiz Title</label>
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="form-group" style={{ flex: 2 }}>
                <label>Course</label>
                <select value={formData.courseId} onChange={e => setFormData({...formData, courseId: e.target.value})} required>
                  <option value="">Select Course...</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Instructions</label>
              <textarea value={formData.instructions} onChange={e => setFormData({...formData, instructions: e.target.value})} rows="2" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="form-group">
                <label>Passing %</label>
                <input type="number" min="1" max="100" value={formData.passingPercentage} onChange={e => setFormData({...formData, passingPercentage: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Max Attempts</label>
                <input type="number" min="1" value={formData.maxAttempts} onChange={e => setFormData({...formData, maxAttempts: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Time Limit (mins)</label>
                <input type="number" min="0" value={formData.timeLimit} onChange={e => setFormData({...formData, timeLimit: e.target.value})} placeholder="No limit" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input type="datetime-local" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input type="datetime-local" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
              </div>
            </div>

            <div className="questions-builder">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Questions ({formData.questions.length})</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" className="outline-button" onClick={() => addQuestion('mcq')}>+ MCQ</button>
                  <button type="button" className="outline-button" onClick={() => addQuestion('multi-select')}>+ Multi-Select</button>
                  <button type="button" className="outline-button" onClick={() => addQuestion('true-false')}>+ True/False</button>
                </div>
              </div>
              
              {formData.questions.map((q, qIndex) => (
                <div key={qIndex} className="question-edit-card">
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Q{qIndex + 1}: {q.questionType.toUpperCase()}</label>
                      <input type="text" placeholder="Question Text" value={q.questionText} onChange={e => updateQuestion(qIndex, 'questionText', e.target.value)} required />
                    </div>
                    <div className="form-group" style={{ width: '100px' }}>
                      <label>Marks</label>
                      <input type="number" min="1" value={q.marks} onChange={e => updateQuestion(qIndex, 'marks', e.target.value)} required />
                    </div>
                    <button type="button" className="text-button" style={{color:'red'}} onClick={() => {
                      const updated = [...formData.questions];
                      updated.splice(qIndex, 1);
                      setFormData({...formData, questions: updated});
                    }}>Remove</button>
                  </div>
                  
                  <div className="options-list">
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex} className="option-edit">
                        <input 
                          type={q.questionType === 'multi-select' ? 'checkbox' : 'radio'} 
                          name={`correct_${qIndex}`} 
                          checked={(q.correctOptions || []).includes(oIndex)} 
                          onChange={() => toggleCorrectOption(qIndex, oIndex)} 
                        />
                        {q.questionType === 'true-false' ? (
                          <span>{opt}</span>
                        ) : (
                          <input type="text" placeholder={`Option ${oIndex + 1}`} value={opt} onChange={e => updateOption(qIndex, oIndex, e.target.value)} required />
                        )}
                        {q.questionType !== 'true-false' && (
                          <button type="button" className="text-button" onClick={() => {
                            const updated = [...formData.questions];
                            updated[qIndex].options.splice(oIndex, 1);
                            setFormData({...formData, questions: updated});
                          }}>&times;</button>
                        )}
                      </div>
                    ))}
                    {q.questionType !== 'true-false' && (
                      <button type="button" className="text-button" onClick={() => {
                        const updated = [...formData.questions];
                        updated[qIndex].options.push('');
                        setFormData({...formData, questions: updated});
                      }}>+ Add Option</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button type="submit" className="primary-button full-width" style={{ marginTop: '20px' }}>{editingQuizId ? 'Update Quiz' : 'Save Quiz'}</button>
          </form>
        )}

        {activeTab === 'results' && (
          <div className="results-container">
            {!selectedQuizForResults ? (
              <div className="empty-state">Select a quiz from "My Quizzes" to view results.</div>
            ) : (
              <div>
                <h2>Results for: {selectedQuizForResults.title}</h2>
                {analytics && (
                  <div className="analytics-cards" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                    <div className="stat-card" style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', flex: 1 }}>
                      <h4>Total Attempts</h4>
                      <h2>{analytics.totalAttempts}</h2>
                    </div>
                    <div className="stat-card" style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', flex: 1 }}>
                      <h4>Average Score</h4>
                      <h2>{analytics.averageScore.toFixed(1)}</h2>
                    </div>
                    <div className="stat-card" style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', flex: 1 }}>
                      <h4>Pass Rate</h4>
                      <h2>{analytics.passRate.toFixed(1)}%</h2>
                    </div>
                  </div>
                )}
                
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '10px' }}>Student</th>
                      <th style={{ padding: '10px' }}>Attempt #</th>
                      <th style={{ padding: '10px' }}>Score</th>
                      <th style={{ padding: '10px' }}>Percentage</th>
                      <th style={{ padding: '10px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultsData.length === 0 ? (
                      <tr><td colSpan="5" style={{ padding: '10px', textAlign: 'center' }}>No attempts yet.</td></tr>
                    ) : resultsData.map(attempt => (
                      <tr key={attempt._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px' }}>{attempt.studentId?.name || 'Unknown'}</td>
                        <td style={{ padding: '10px' }}>{attempt.attemptNumber}</td>
                        <td style={{ padding: '10px' }}>{attempt.score}</td>
                        <td style={{ padding: '10px' }}>{attempt.percentage.toFixed(1)}%</td>
                        <td style={{ padding: '10px' }} className={attempt.status}>{attempt.status.toUpperCase()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherQuizzes;
