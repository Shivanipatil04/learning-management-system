import React from 'react';
import './ContractDocument.css';

const ContractDocument = ({ contract }) => {
  if (!contract) return null;

  return (
    <div className="contract-document-wrapper" id="printable-contract">
      <div className="contract-doc-header">
        <div className="doc-logo-area">
          <h2>LearnHub</h2>
          <p>Teacher Contract Agreement</p>
        </div>
        <div className="doc-meta">
          <p><strong>Contract ID:</strong> {contract.contractId}</p>
          <p><strong>Status:</strong> {contract.status}</p>
          <p><strong>Date Generated:</strong> {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="doc-section">
        <h3>1. Parties to the Agreement</h3>
        <p>This agreement is entered into by and between:</p>
        <div className="parties-grid">
          <div>
            <strong>Class Administrator:</strong>
            <p>{contract.classAdminId?.name || 'Class Admin'}</p>
            <p>{contract.classAdminId?.email}</p>
          </div>
          <div>
            <strong>Teacher:</strong>
            <p>{contract.teacherId?.name || 'Teacher'}</p>
            <p>{contract.teacherId?.email}</p>
          </div>
        </div>
      </div>

      <div className="doc-section">
        <h3>2. Contract Duration & Assignment</h3>
        <table className="doc-table">
          <tbody>
            <tr>
              <td><strong>Assigned Course/Class:</strong></td>
              <td>{contract.assignedClass || 'General Teaching Duties'}</td>
            </tr>
            <tr>
              <td><strong>Start Date:</strong></td>
              <td>{new Date(contract.startDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td><strong>End Date:</strong></td>
              <td>{new Date(contract.endDate).toLocaleDateString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="doc-section">
        <h3>3. Financial Terms</h3>
        <div className="revenue-split-box">
          <div className="split-item">
            <span>Teacher Share</span>
            <strong>{contract.teacherRevenuePercentage}%</strong>
          </div>
          <div className="split-divider"></div>
          <div className="split-item">
            <span>Admin Share</span>
            <strong>{contract.adminRevenuePercentage}%</strong>
          </div>
        </div>
        
        {contract.paymentTerms && (
          <div className="terms-block">
            <strong>Payment Terms:</strong>
            <p>{contract.paymentTerms}</p>
          </div>
        )}
      </div>

      {contract.termsAndConditions && (
        <div className="doc-section">
          <h3>4. General Terms & Conditions</h3>
          <div className="terms-block text-pre-wrap">
            {contract.termsAndConditions}
          </div>
        </div>
      )}

      {contract.terminationTerms && (
        <div className="doc-section">
          <h3>5. Termination</h3>
          <div className="terms-block text-pre-wrap">
            {contract.terminationTerms}
          </div>
        </div>
      )}

      {contract.otherTerms && (
        <div className="doc-section">
          <h3>6. Additional Terms</h3>
          <div className="terms-block text-pre-wrap">
            {contract.otherTerms}
          </div>
        </div>
      )}

      <div className="doc-signatures">
        <div className="signature-box">
          <p><strong>For LearnHub (Class Admin)</strong></p>
          <div className="sig-line"></div>
          <p>{contract.classAdminId?.name || 'Authorized Signatory'}</p>
        </div>
        <div className="signature-box">
          <p><strong>Teacher</strong></p>
          {contract.acceptedDate ? (
            <div className="digital-signature">
              <span className="sig-text">Digitally Accepted</span>
              <span className="sig-date">{new Date(contract.acceptedDate).toLocaleString()}</span>
            </div>
          ) : (
            <div className="sig-line"></div>
          )}
          <p>{contract.teacherId?.name || 'Teacher Signature'}</p>
        </div>
      </div>
    </div>
  );
};

export default ContractDocument;
