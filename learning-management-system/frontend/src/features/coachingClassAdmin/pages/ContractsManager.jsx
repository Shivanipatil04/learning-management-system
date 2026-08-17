import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import apiClient from '../../../services/apiClient';
import { Plus, CheckCircle, XCircle, FileText, Download, Eye } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import ContractDocument from '../../teacher/components/ContractDocument';
import '../../teacher/styles/contracts.css'; 

const ContractsManager = () => {
  const location = useLocation();
  const [contracts, setContracts] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    contractId: '',
    teacherId: '',
    startDate: '',
    endDate: '',
    assignedClass: '',
    paymentTerms: '',
    terminationTerms: '',
    otherTerms: '',
    termsAndConditions: '',
    teacherRevenuePercentage: 70,
    adminRevenuePercentage: 30,
    previousContractId: ''
  });

  const [previewContract, setPreviewContract] = useState(null);
  const [downloadContractData, setDownloadContractData] = useState(null);
  const downloadRef = useRef(null);

  const defaultTerms = `1. The Teacher agrees to provide high-quality educational content.
2. The Teacher retains ownership of their original course materials, but grants LearnHub a perpetual, non-exclusive license to host and distribute the content.
3. Revenue will be calculated monthly and paid out by the 7th of the following month.
4. This contract will automatically expire on the End Date unless formally renewed.
5. Either party may terminate this agreement with a 30-day written notice.
6. The Teacher agrees to maintain professional conduct and confidentiality regarding platform data.
7. Any refunds issued to students will be proportionally deducted from the Teacher's revenue share.`;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (location.state?.renewContractId && contracts.length > 0) {
      const oldContract = contracts.find(c => c._id === location.state.renewContractId);
      if (oldContract) {
        setFormData({
          contractId: `RENEW-${oldContract.contractId}`,
          teacherId: oldContract.teacherId?._id || oldContract.teacherId,
          startDate: '',
          endDate: '',
          assignedClass: oldContract.assignedClass || '',
          paymentTerms: oldContract.paymentTerms || '',
          terminationTerms: oldContract.terminationTerms || '',
          otherTerms: oldContract.otherTerms || '',
          termsAndConditions: oldContract.termsAndConditions || '',
          teacherRevenuePercentage: oldContract.teacherRevenuePercentage,
          adminRevenuePercentage: oldContract.adminRevenuePercentage,
          previousContractId: oldContract._id
        });
        setShowCreate(true);
      }
    }
  }, [location.state, contracts]);

  const fetchData = async () => {
    try {
      const contractsRes = await apiClient.get('/contracts/all');
      if (contractsRes.data.success) setContracts(contractsRes.data.data);
      
      // Try fetching teachers if endpoint exists, else empty
      try {
        const teachersRes = await apiClient.get('/users?userType=teacher');
        if (teachersRes.data?.data) setTeachers(teachersRes.data.data);
      } catch (e) {
        // Fallback demo data just in case
        setTeachers([{ _id: "60d0fe4f5311236168a109ca", name: "Demo Teacher" }]);
      }
    } catch (error) {
      console.error('Error fetching contracts', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    
    // Auto calculate percentages
    if (name === 'teacherRevenuePercentage') {
      newData.adminRevenuePercentage = 100 - Number(value);
    } else if (name === 'adminRevenuePercentage') {
      newData.teacherRevenuePercentage = 100 - Number(value);
    }
    
    setFormData(newData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(formData.teacherRevenuePercentage) + Number(formData.adminRevenuePercentage) !== 100) {
      alert("Percentages must total exactly 100%");
      return;
    }
    
    try {
      // In case we are using the demo teacher because of missing users endpoint
      const payload = { ...formData };
      if (!payload.teacherId && teachers.length > 0) {
        payload.teacherId = teachers[0]._id;
      }
      
      if (!payload.previousContractId) {
        delete payload.previousContractId;
      }

      const res = await apiClient.post('/contracts', payload);
      if (res.data.success) {
        setShowCreate(false);
        fetchData();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating contract');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await apiClient.patch(`/contracts/${id}/status`, { status });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating status');
    }
  };

  const loadDefaultTerms = () => {
    setFormData({ ...formData, termsAndConditions: defaultTerms });
  };

  const triggerDownload = (contract) => {
    setDownloadContractData(contract);
  };

  useEffect(() => {
    if (downloadContractData && downloadRef.current) {
      const opt = {
        margin: [0.5, 0.5],
        filename: `Contract_${downloadContractData.contractId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      html2pdf().set(opt).from(downloadRef.current).save().then(() => {
        setDownloadContractData(null);
      });
    }
  }, [downloadContractData]);

  return (
    <div className="contracts-manager">
      <div className="contracts-header">
        <h1>Contract Management</h1>
        <button className="primary-button" onClick={() => setShowCreate(!showCreate)}>
          <Plus size={18} /> {showCreate ? 'Cancel' : 'Create Contract'}
        </button>
      </div>

      {showCreate && (
        <div className="contract-form-card">
          <h2>Create New Teacher Contract</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Contract ID</label>
                <input type="text" name="contractId" required onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Teacher</label>
                <select name="teacherId" required onChange={handleChange} value={formData.teacherId}>
                  <option value="">Select Teacher</option>
                  {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" name="startDate" required onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input type="date" name="endDate" required onChange={handleChange} />
              </div>
            </div>

            <div className="form-row split-row">
              <div className="form-group">
                <label>Teacher Revenue %</label>
                <input type="number" name="teacherRevenuePercentage" min="0" max="100" value={formData.teacherRevenuePercentage} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Admin Revenue %</label>
                <input type="number" name="adminRevenuePercentage" min="0" max="100" value={formData.adminRevenuePercentage} onChange={handleChange} required />
              </div>
            </div>
            
            <div className="percentage-validator">
              <span>Total: {Number(formData.teacherRevenuePercentage) + Number(formData.adminRevenuePercentage)}%</span>
              {Number(formData.teacherRevenuePercentage) + Number(formData.adminRevenuePercentage) === 100 ? 
                <span className="text-green"><CheckCircle size={14}/> Valid</span> : 
                <span className="text-red"><XCircle size={14}/> Must equal 100%</span>
              }
            </div>
            
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ marginBottom: 0 }}>Terms & Conditions</label>
                <button type="button" className="text-button" onClick={loadDefaultTerms} style={{ fontSize: '13px' }}>
                  <FileText size={14} style={{ marginRight: '4px' }}/> Load Default Template
                </button>
              </div>
              <textarea name="termsAndConditions" value={formData.termsAndConditions} onChange={handleChange} rows={10}></textarea>
            </div>
            
            <div className="form-group">
              <label>Payment Terms</label>
              <textarea name="paymentTerms" value={formData.paymentTerms} onChange={handleChange}></textarea>
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <button type="button" className="secondary-button" onClick={() => setPreviewContract(formData)}>Preview Contract</button>
              <button type="submit" className="primary-button submit-btn">Create Contract</button>
            </div>
          </form>
        </div>
      )}

      <div className="contracts-list">
        {loading ? <p>Loading contracts...</p> : contracts.length === 0 ? (
          <div className="empty-state">No contracts found.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Contract ID</th>
                <th>Teacher</th>
                <th>Dates</th>
                <th>Revenue Split</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map(c => (
                <tr key={c._id}>
                  <td>{c.contractId}</td>
                  <td>{c.teacherId?.name || 'Unknown'}</td>
                  <td>{new Date(c.startDate).toLocaleDateString()} - {new Date(c.endDate).toLocaleDateString()}</td>
                  <td>{c.teacherRevenuePercentage}% / {c.adminRevenuePercentage}%</td>
                  <td><span className={`status-badge ${c.status.toLowerCase()}`}>{c.status}</span></td>
                  <td style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {c.status === 'Draft' && (
                      <button className="text-button" onClick={() => updateStatus(c._id, 'Sent')}>Send</button>
                    )}
                    <button className="text-button" onClick={() => setPreviewContract(c)} title="Preview">
                      <Eye size={16} />
                    </button>
                    <button className="text-button" onClick={() => triggerDownload(c)} title="Download PDF">
                      <Download size={16} />
                    </button>
                    {(c.status === 'Active' || c.status === 'Accepted') && (
                      <button className="text-button text-red" onClick={() => updateStatus(c._id, 'Terminated')}>Terminate</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Preview Modal */}
      {previewContract && (
        <div className="modal-overlay" onClick={() => setPreviewContract(null)}>
          <div className="modal-content" style={{ width: '850px', maxWidth: '95vw', padding: '0', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ position: 'sticky', top: 0, background: 'white', padding: '15px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
              <h2 style={{ margin: 0 }}>Contract Preview</h2>
              <button className="text-button" onClick={() => setPreviewContract(null)}>Close</button>
            </div>
            <div style={{ padding: '20px' }}>
              {/* Prepare full contract object with teacher/admin populating for preview */}
              <ContractDocument 
                contract={{
                  ...previewContract,
                  teacherId: previewContract._id ? previewContract.teacherId : teachers.find(t => t._id === previewContract.teacherId),
                  classAdminId: previewContract._id ? previewContract.classAdminId : null,
                }} 
              />
            </div>
          </div>
        </div>
      )}

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

export default ContractsManager;
