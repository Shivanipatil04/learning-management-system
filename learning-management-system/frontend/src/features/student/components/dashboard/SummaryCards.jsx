import { BookOpen, CheckCircle, HelpCircle, Award } from 'lucide-react';

const SummaryCards = () => {
  const stats = [
    { label: 'Enrolled Courses', value: 4, icon: BookOpen, color: 'blue' },
    { label: 'Completed Courses', value: 2, icon: CheckCircle, color: 'green' },
    { label: 'Pending Quizzes', value: 1, icon: HelpCircle, color: 'orange' },
    { label: 'Certificates Earned', value: 2, icon: Award, color: 'purple' },
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
