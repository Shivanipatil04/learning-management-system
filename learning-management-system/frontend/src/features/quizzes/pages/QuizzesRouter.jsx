import React from 'react';
import { useSelector } from 'react-redux';
import StudentQuizzes from './StudentQuizzes';
import TeacherQuizzes from './TeacherQuizzes';

const QuizzesRouter = () => {
  const { user } = useSelector((state) => state.auth);

  if (user?.userType === 'teacher') {
    return <TeacherQuizzes />;
  }
  
  if (user?.userType === 'student') {
    return <StudentQuizzes />;
  }

  return (
    <div className="dashboard-shell">
      <div className="dashboard-card">
        <h1>Quizzes</h1>
        <p>Quizzes are not available for your role.</p>
      </div>
    </div>
  );
};

export default QuizzesRouter;
