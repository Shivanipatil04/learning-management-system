import { CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PendingQuizzes = () => {
  const navigate = useNavigate();
  const quizzes = [
    { id: 1, title: 'React Hooks Quiz', course: 'Advanced React', dueDate: 'Tomorrow', status: 'pending' },
    { id: 2, title: 'JS Fundamentals', course: 'JS Basics', score: '90%', status: 'passed' },
    { id: 3, title: 'CSS Grid Layout', course: 'Advanced CSS', score: '45%', status: 'failed' },
  ];

  return (
    <div className="dashboard-section-card side-card">
      <div className="section-header">
        <h3>Quizzes</h3>
      </div>
      <div className="quiz-list">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="quiz-item">
            <div className="quiz-info">
              <h4>{quiz.title}</h4>
              <span>{quiz.course}</span>
              {quiz.dueDate && <span className="quiz-due">Due: {quiz.dueDate}</span>}
            </div>
            <div className="quiz-action">
              {quiz.status === 'pending' && (
                <button className="primary-button small" onClick={() => navigate('/quizzes')}>Start</button>
              )}
              {quiz.status === 'passed' && <span className="quiz-score passed"><CheckCircle size={16} /> {quiz.score}</span>}
              {quiz.status === 'failed' && <span className="quiz-score failed"><XCircle size={16} /> {quiz.score}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingQuizzes;
