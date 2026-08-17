import { Award, Download } from 'lucide-react';

const RecentCertificates = () => {
  const certificates = [
    { id: 1, course: 'Advanced React Patterns', issueDate: 'Oct 12, 2023' },
    { id: 2, course: 'Node.js Backend Architecture', issueDate: 'Sep 05, 2023' },
  ];

  return (
    <div className="dashboard-section-card side-card">
      <div className="section-header">
        <h3>Recent Certificates</h3>
      </div>
      <div className="certificate-list">
        {certificates.map((cert) => (
          <div key={cert.id} className="certificate-item">
            <div className="cert-icon">
              <Award size={24} />
            </div>
            <div className="cert-info">
              <h4>{cert.course}</h4>
              <span>Issued: {cert.issueDate}</span>
            </div>
            <button className="icon-button" aria-label="Download Certificate">
              <Download size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentCertificates;
