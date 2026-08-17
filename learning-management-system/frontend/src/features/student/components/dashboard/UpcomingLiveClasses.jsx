import { Calendar, Clock, Video } from 'lucide-react';

const UpcomingLiveClasses = () => {
  const classes = [
    {
      id: 1,
      title: 'State Management deep dive',
      instructor: 'John Doe',
      date: 'Today',
      time: '2:00 PM',
    },
    {
      id: 2,
      title: 'UI/UX Principles',
      instructor: 'Jane Smith',
      date: 'Tomorrow',
      time: '10:00 AM',
    },
  ];

  return (
    <div className="dashboard-section-card">
      <div className="section-header">
        <h3>Upcoming Live Classes</h3>
        <button className="text-button">View All</button>
      </div>
      <div className="live-classes-list">
        {classes.map((cls) => (
          <div key={cls.id} className="live-class-item">
            <div className="lc-info">
              <h4>{cls.title}</h4>
              <span className="lc-instructor">{cls.instructor}</span>
              <div className="lc-meta">
                <span><Calendar size={14} /> {cls.date}</span>
                <span><Clock size={14} /> {cls.time}</span>
              </div>
            </div>
            <div className="lc-actions">
              <button className="outline-button small">Remind</button>
              <button className="primary-button small"><Video size={14} /> Join</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingLiveClasses;
