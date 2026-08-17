import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import './TopHeader.css';

const TopHeader = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleAction = async (notification, action) => {
    try {
      if (action === 'ignore') {
        await apiClient.patch(`/notifications/${notification._id}/ignore`);
      } else if (action === 'read') {
        await apiClient.patch(`/notifications/${notification._id}/read`);
      }
      fetchNotifications();
      
      if (action === 'renew') {
        // Navigate to Contracts Manager with a query param or state indicating renewal
        navigate('/contracts', { state: { renewContractId: notification.contractId._id } });
        setShowDropdown(false);
      }
    } catch (error) {
      console.error('Action failed', error);
    }
  };

  return (
    <div className="top-header">
      <div className="header-right">
        <div className="notification-bell-container" ref={dropdownRef}>
          <button className="bell-button" onClick={() => setShowDropdown(!showDropdown)}>
            <Bell size={20} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {showDropdown && (
            <div className="notification-dropdown">
              <div className="dropdown-header">
                <h3>Notifications</h3>
              </div>
              <div className="dropdown-body">
                {notifications.length === 0 ? (
                  <p className="no-notifications">No notifications yet.</p>
                ) : (
                  notifications.map(n => (
                    <div key={n._id} className={`notification-item ${n.isRead ? 'read' : 'unread'}`}>
                      <h4>{n.title}</h4>
                      <p>{n.message}</p>
                      
                      {!n.isIgnored && n.type.startsWith('CONTRACT_EXPIRING') && n.recipientRole === 'coachingClassAdmin' && (
                        <div className="notification-actions">
                          <button className="btn-renew" onClick={() => handleAction(n, 'renew')}>Renew Contract</button>
                          <button className="btn-ignore" onClick={() => handleAction(n, 'ignore')}>Ignore</button>
                        </div>
                      )}
                      
                      {!n.isRead && (!n.type.startsWith('CONTRACT_EXPIRING') || n.recipientRole === 'teacher') && (
                        <button className="btn-dismiss" onClick={() => handleAction(n, 'read')}>Dismiss</button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
