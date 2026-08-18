import { BookOpen, CheckCircle, HelpCircle } from 'lucide-react';

const SummaryCards = ({ enrolledCount = 0, completedCourses = 0, completedLessons = 0 }) => {
  const stats = [
    { label: 'Enrolled Courses', value: enrolledCount, icon: BookOpen, color: 'blue' },
    { label: 'Completed Courses', value: completedCourses, icon: CheckCircle, color: 'green' },
    { label: 'Lessons Completed', value: completedLessons, icon: HelpCircle, color: 'orange' },
  ];

  return (
    <div className="summary-cards-grid">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div key={idx} className={`summary-card color-${stat.color}`}>
            <div className="summary-icon">
              <Icon size={24} />
            </div>
            <div className="summary-info">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryCards;
