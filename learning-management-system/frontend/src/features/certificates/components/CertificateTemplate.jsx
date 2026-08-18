import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const CertificateTemplate = ({ certificate, id }) => {
  if (!certificate) return null;

  const {
    certificateId,
    studentId,
    courseId,
    teacherId,
    issueDate,
    verificationCode
  } = certificate;

  const studentName = typeof studentId === 'object' ? studentId.name : 'Student Name';
  const courseName = typeof courseId === 'object' ? courseId.title : 'Course Name';
  const teacherName = typeof teacherId === 'object' ? teacherId.name : 'Instructor';

  return (
    <div 
      id={id} 
      style={{
        width: '800px',
        height: '600px',
        padding: '20px',
        position: 'absolute',
        left: '-9999px',
        top: '-9999px',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxSizing: 'border-box'
      }}
    >
      <div style={{
        width: '100%',
        height: '100%',
        border: '10px solid #2c3e50',
        padding: '40px',
        textAlign: 'center',
        backgroundColor: 'white',
        position: 'relative',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div>
          <h1 style={{ fontSize: '48px', margin: '0', color: '#2c3e50', textTransform: 'uppercase', letterSpacing: '4px' }}>CERTIFICATE</h1>
          <h3 style={{ fontSize: '24px', margin: '10px 0', color: '#7f8c8d' }}>OF COMPLETION</h3>
        </div>

        <div>
          <p style={{ fontSize: '18px', color: '#34495e', margin: '20px 0' }}>This is to certify that</p>
          <h2 style={{ fontSize: '36px', margin: '10px 0', color: '#2980b9', borderBottom: '2px solid #bdc3c7', display: 'inline-block', paddingBottom: '10px' }}>
            {studentName}
          </h2>
          <p style={{ fontSize: '18px', color: '#34495e', margin: '20px 0' }}>has successfully completed the course</p>
          <h3 style={{ fontSize: '28px', margin: '10px 0', color: '#2c3e50' }}>{courseName}</h3>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '40px' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ borderTop: '1px solid #7f8c8d', paddingTop: '10px', width: '200px' }}>
              <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>{teacherName}</p>
              <p style={{ margin: '0', fontSize: '14px', color: '#7f8c8d' }}>Instructor</p>
            </div>
            <div style={{ marginTop: '20px' }}>
              <p style={{ margin: '0', fontSize: '12px', color: '#7f8c8d' }}>Issue Date: {new Date(issueDate).toLocaleDateString()}</p>
              <p style={{ margin: '0', fontSize: '12px', color: '#7f8c8d' }}>Certificate ID: {certificateId}</p>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
             <QRCodeSVG value={`https://yourlms.com/verify?code=${verificationCode}`} size={80} />
             <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: '#7f8c8d' }}>Scan to Verify</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateTemplate;
