import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/apiClient';
import html2pdf from 'html2pdf.js';
import CertificateTemplate from '../components/CertificateTemplate';

const MyCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await apiClient.get('/certificates/mine');
      setCertificates(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = (certificate) => {
    setSelectedCertificate(certificate);
    setTimeout(() => {
      const element = document.getElementById('certificate-template');
      if (element) {
        const opt = {
          margin: 0,
          filename: `${certificate.courseId?.title || 'Course'}_Certificate.pdf`,
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
    <div className="my-certificates-page" style={{ padding: '20px' }}>
      <h1>My Certificates</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>View and download your earned certificates.</p>

      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

      {loading ? (
        <p>Loading your certificates...</p>
      ) : certificates.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', background: '#f9f9f9', borderRadius: '8px' }}>
          <h3>No certificates yet</h3>
          <p>Complete courses and pass quizzes to earn certificates.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {certificates.map(cert => (
            <div key={cert._id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{cert.courseId?.title || 'Unknown Course'}</h3>
              <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>Instructor: {cert.teacherId?.name || 'Unknown'}</p>
              <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>Issued: {new Date(cert.issueDate).toLocaleDateString()}</p>
              <div style={{ marginTop: '20px' }}>
                <button 
                  onClick={() => handleDownloadPDF(cert)}
                  style={{ width: '100%', padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Download Certificate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCertificate && (
        <CertificateTemplate certificate={selectedCertificate} id="certificate-template" />
      )}
    </div>
  );
};

export default MyCertificates;
