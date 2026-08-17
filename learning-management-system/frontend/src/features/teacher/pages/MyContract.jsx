import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../../services/apiClient';
import { CheckCircle, XCircle, Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import ContractDocument from '../components/ContractDocument';
import '../styles/contracts.css';

const MyContract = () => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadContractData, setDownloadContractData] = useState(null);
  const downloadRef = useRef(null);

  useEffect(() => {
    fetchContract();
  }, []);

  const fetchContract = async () => {
    try {
      const res = await apiClient.get('/contracts/my');
      if (res.data.success) {
        setContract(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching contract', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status) => {
    try {
      await apiClient.patch(`/contracts/${contract._id}/status`, { status });
      fetchContract();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating status');
    }
  };

  const triggerDownload = () => {
    setDownloadContractData(contract);
  };

  useEffect(() => {
    if (downloadContractData && downloadRef.current) {
      const opt = {
        margin: [0.5, 0.5],
        filename: `MyContract_${downloadContractData.contractId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      html2pdf().set(opt).from(downloadRef.current).save().then(() => {
        setDownloadContractData(null);
      });
    }
  }, [downloadContractData]);

  if (loading) return <div className="contract-page">Loading contract details...</div>;
  if (!contract) return <div className="contract-page empty-state">You do not have a contract assigned yet. Please contact your Class Admin.</div>;

  return (
    <div className="contract-page">
      <div className="contract-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h1 style={{ margin: 0 }}>My Teaching Contract</h1>
          <div className={`status-badge large ${contract.status.toLowerCase()}`}>
            {contract.status}
          </div>
        </div>
        <div>
          {(contract.status === 'Active' || contract.status === 'Accepted') && (
            <button className="primary-button" onClick={triggerDownload} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download size={18} /> Download PDF
            </button>
          )}
        </div>
      </div>

      <div className="contract-details-card" style={{ padding: '0', background: 'transparent', boxShadow: 'none' }}>
        <ContractDocument contract={contract} />

        {contract.status === 'Sent' && (
          <div className="contract-actions" style={{ background: 'white', padding: '20px', borderRadius: '8px', marginTop: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p>Please review the terms above before accepting.</p>
            <div className="action-buttons">
              <button className="primary-button success" onClick={() => updateStatus('Accepted')}>
                <CheckCircle size={18} /> Accept Contract
              </button>
              <button className="outline-button danger" onClick={() => updateStatus('Rejected')}>
                <XCircle size={18} /> Reject
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden Div for PDF Generation */}
      {downloadContractData && (
        <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
          <div ref={downloadRef}>
             <ContractDocument contract={downloadContractData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyContract;
