import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/apiClient';
import html2pdf from 'html2pdf.js';
import CertificateTemplate from '../components/CertificateTemplate';

const TeacherCertificates = () => {
  const [activeTab, setActiveTab] = useState('eligible');
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [issuedCertificates, setIssuedCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'eligible') {
        const res = await apiClient.get('/certificates/eligible');
        setEligibleStudents(res.data.data);
      } else {
        const res = await apiClient.get('/certificates/issued');
        setIssuedCertificates(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCertificate = async (studentId, courseId, completionDate) => {
    try {
      await apiClient.post('/certificates/issue', {
        studentId: studentId._id,
        courseId: courseId._id,
        completionDate
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error issuing certificate');
    }
  };

  const handleDownloadPDF = (certificate) => {
    setSelectedCertificate(certificate);
    setTimeout(() => {
      const element = document.getElementById('certificate-template');
      if (element) {
        const opt = {
          margin: 0,
          filename: `${certificate.certificateId}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'px', format: [800, 600], orientation: 'landscape' }
        };
        html2pdf().set(opt).from(element).save().then(() => {
          setSelectedCertificate(null);
        });
      }
    }, 500);
  };

  return (
    <div className="certificates-page" style={{ padding: '20px' }}>
      <h1>Certificates Management</h1>
      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => setActiveTab('eligible')}
          style={{ padding: '10px 20px', background: activeTab === 'eligible' ? '#007bff' : '#ccc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Eligible Students
        </button>
        <button 
          onClick={() => setActiveTab('issued')}
          style={{ padding: '10px 20px', background: activeTab === 'issued' ? '#007bff' : '#ccc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Issued Certificates
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {activeTab === 'eligible' && (
            <div>
              {eligibleStudents.length === 0 ? (
                <p>No eligible students found.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                      <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Student Name</th>
                      <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Course</th>
                      <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Progress</th>
                      <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Quiz Score</th>
                      <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Status</th>
                      <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eligibleStudents.map((item, index) => (
                      <tr key={index}>
                        <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{item.studentId?.name || 'Unknown'}</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{item.courseId?.title || 'Unknown'}</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{item.progress}%</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{item.quizScore !== null ? `${item.quizScore}%` : 'N/A'}</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #ddd', color: 'green' }}>Eligible</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                          <button 
                            onClick={() => handleIssueCertificate(item.studentId, item.courseId, item.completionDate)}
                            style={{ padding: '6px 12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Issue Certificate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'issued' && (
            <div>
              {issuedCertificates.length === 0 ? (
                <p>No certificates issued yet.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                      <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Certificate ID</th>
                      <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Student Name</th>
                      <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Course</th>
                      <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Issue Date</th>
                      <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issuedCertificates.map(cert => (
                      <tr key={cert._id}>
                        <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{cert.certificateId}</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{cert.studentId?.name || 'Unknown'}</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{cert.courseId?.title || 'Unknown'}</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{new Date(cert.issueDate).toLocaleDateString()}</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                          <button 
                            onClick={() => handleDownloadPDF(cert)}
                            style={{ padding: '6px 12px', background: '#17a2b8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Download PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}

      {selectedCertificate && (
        <CertificateTemplate certificate={selectedCertificate} id="certificate-template" />
      )}
    </div>
  );
};

export default TeacherCertificates;
