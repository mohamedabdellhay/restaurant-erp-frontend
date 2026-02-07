import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { User, Mail, Lock, Save, AlertCircle, CheckCircle, Store, Briefcase } from 'lucide-react';

const Profile = () => {
    const { user, updateProfile, changePassword } = useAuth();
    const { t } = useTranslation();

    const [activeTab, setActiveTab] = useState('personal');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Personal Info State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
            });
        }
    }, [user]);

    const handleInfoSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        const result = await updateProfile(formData);

        setMessage({
            type: result.success ? 'success' : 'error',
            text: result.success ? t('profile.update_success') : result.message
        });
        setLoading(false);
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: t('profile.password_mismatch') });
            return;
        }

        setLoading(true);
        const result = await changePassword({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
        });

        if (result.success) {
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setMessage({ type: 'success', text: t('profile.password_success') });
        } else {
            setMessage({ type: 'error', text: result.message });
        }
        setLoading(false);
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>{t('profile.title')}</h1>
            </div>

            <div className="profile-content">
                <div className="profile-sidebar card">
                    <div className="user-avatar-large">
                        <User size={48} />
                    </div>
                    <h3>{user?.name}</h3>
                    <p className="role-badge">{user?.role}</p>

                    <div className="sidebar-menu">
                        <button
                            className={`menu-item ${activeTab === 'personal' ? 'active' : ''}`}
                            onClick={() => setActiveTab('personal')}
                        >
                            <User size={18} />
                            {t('profile.personal_info')}
                        </button>
                        <button
                            className={`menu-item ${activeTab === 'security' ? 'active' : ''}`}
                            onClick={() => setActiveTab('security')}
                        >
                            <Lock size={18} />
                            {t('profile.security')}
                        </button>
                    </div>
                </div>

                <div className="profile-main card">
                    {message.text && (
                        <div className={`alert ${message.type}`}>
                            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                            {message.text}
                        </div>
                    )}

                    {activeTab === 'personal' ? (
                        <form onSubmit={handleInfoSubmit} className="profile-form">
                            <h2>{t('profile.personal_info')}</h2>

                            <div className="form-group">
                                <label>{t('profile.name_label')}</label>
                                <div className="input-wrapper">
                                    <User size={18} />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>{t('profile.email_label')}</label>
                                <div className="input-wrapper">
                                    <Mail size={18} />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>{t('profile.role_label')}</label>
                                    <div className="input-wrapper disabled">
                                        <Briefcase size={18} />
                                        <input type="text" value={user?.role || ''} disabled />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>{t('profile.restaurant_label')}</label>
                                    <div className="input-wrapper disabled">
                                        <Store size={18} />
                                        <input type="text" value={user?.restaurant?.name || ''} disabled />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="btn-primary" disabled={loading}>
                                <Save size={18} />
                                {loading ? t('auth.logging_in') : t('profile.update_profile')}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handlePasswordSubmit} className="profile-form">
                            <h2>{t('profile.security')}</h2>

                            <div className="form-group">
                                <label>{t('profile.current_password')}</label>
                                <div className="input-wrapper">
                                    <Lock size={18} />
                                    <input
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>{t('profile.new_password')}</label>
                                <div className="input-wrapper">
                                    <Lock size={18} />
                                    <input
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>{t('profile.confirm_password')}</label>
                                <div className="input-wrapper">
                                    <Lock size={18} />
                                    <input
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-primary" disabled={loading}>
                                <Save size={18} />
                                {loading ? t('auth.logging_in') : t('profile.change_password')}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            <style>{`
        .profile-container {
          max-width: 1000px;
          margin: 0 auto;
        }

        .profile-header h1 {
          font-size: 1.8rem;
          margin-bottom: 2rem;
          color: var(--text-primary);
        }

        .profile-content {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 2rem;
        }

        .card {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          border: 1px solid var(--border-color);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .profile-sidebar {
          text-align: center;
          height: fit-content;
        }

        .user-avatar-large {
          width: 80px;
          height: 80px;
          background: var(--primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin: 0 auto 1rem;
        }

        .profile-sidebar h3 {
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .role-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: rgba(var(--primary-rgb), 0.1);
          color: var(--primary);
          border-radius: 99px;
          font-size: 0.875rem;
          margin-bottom: 2rem;
        }

        .sidebar-menu {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          width: 100%;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          transition: all 0.2s;
        }

        .menu-item:hover {
          background: var(--bg-hover);
        }

        .menu-item.active {
          background: var(--primary);
          color: white;
        }

        .profile-form h2 {
          font-size: 1.25rem;
          margin-bottom: 2rem;
          color: var(--text-primary);
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-wrapper svg {
          position: absolute;
          left: 1rem;
          color: var(--text-muted);
          pointer-events: none;
        }
        
        [dir='rtl'] .input-wrapper svg {
          left: auto;
          right: 1rem;
        }

        .input-wrapper input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.75rem;
          background: var(--input-bg);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          transition: border-color 0.2s;
        }
        
        [dir='rtl'] .input-wrapper input {
          padding: 0.75rem 2.75rem 0.75rem 1rem;
        }

        .input-wrapper input:focus {
          border-color: var(--primary);
          outline: none;
        }

        .input-wrapper.disabled input {
          background: var(--bg-base);
          cursor: not-allowed;
          opacity: 0.7;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 2rem;
          background: var(--primary);
          color: white;
          border-radius: var(--radius-md);
          font-weight: 500;
          margin-top: 1rem;
        }

        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .alert {
          padding: 1rem;
          border-radius: var(--radius-md);
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .alert.success {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .alert.error {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        @media (max-width: 768px) {
          .profile-content {
            grid-template-columns: 1fr;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
};

export default Profile;
