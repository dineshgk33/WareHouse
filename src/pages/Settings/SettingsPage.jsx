import React, { useState, useEffect, useRef } from "react";
import { 
    Trash2, 
    Upload, 
    MoreHorizontal, 
    Check, 
    Shield, 
    Lock, 
    Plus, 
    Download, 
    ExternalLink,
    RotateCcw,
    User,
    Bell,
    CreditCard,
    Briefcase,
    Users,
    Palette,
    Phone,
    Mail,
    Globe,
    Languages,
    Zap,
    LogOut,
    Monitor,
    Moon,
    Sun,
    CheckCircle,
    X
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import avatarImg from "../../assets/dinesh.png";
import { useToast } from "../../hooks/useToast";
import UserRolesSection from "../../components/Roles/UserRolesSection";
import { authService } from "../../services/authService";
import "./Settings.css";

function SettingsPage() {
    const { user, selectedRole, selectedRoleName, userPassword, updatePassword, updateUser } = useAuth();
    const [theme, setTheme] = useState("light");

    // Dynamic states for interactive controls
    const [name, setName] = useState(() => user ? `${user.firstName} ${user.lastName}` : "");
    const [phone, setPhone] = useState(() => user?.phone || "");
    const [email, setEmail] = useState(() => user?.email || "");
    const [googleConnected, setGoogleConnected] = useState(true);
    const [activeIntegrationDropdownOpen, setActiveIntegrationDropdownOpen] = useState(false);
    const [twoFAEnabled, setTwoFAEnabled] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const { toast, showToast } = useToast(3000);

    // Password change states
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // File upload ref and loading state
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [photoPreview, setPhotoPreview] = useState("");
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [shouldDeleteAvatar, setShouldDeleteAvatar] = useState(false);
    const [isViewerOpen, setIsViewerOpen] = useState(false);

    // Inline editing state for name and phone
    const [editingName, setEditingName] = useState(false);
    const [editingPhone, setEditingPhone] = useState(false);
    const [pendingName, setPendingName] = useState("");
    const [pendingPhone, setPendingPhone] = useState("");

    const handleResetChanges = () => {
        if (user) {
            setName(`${user.firstName} ${user.lastName}`);
            setPhone(user.phone || "");
            setEmail(user.email || "");
        }
        setPhotoPreview("");
        setSelectedImageFile(null);
        setShouldDeleteAvatar(false);
        setHasChanges(false);
        showToast("Changes reset to default!");
    };

    const handleSaveChanges = async (onlyPassword = false) => {
        if (isSaving) return;

        // 1. Password validation (if onlyPassword is true OR if any password field is filled)
        const isPasswordChangeAttempted = onlyPassword || currentPassword || newPassword || confirmPassword;
        if (isPasswordChangeAttempted) {
            if (!currentPassword) {
                showToast("Current Password is required.");
                return;
            }
            if (!newPassword) {
                showToast("New Password is required.");
                return;
            }
            if (!confirmPassword) {
                showToast("Confirm Password is required.");
                return;
            }
            if (newPassword !== confirmPassword) {
                showToast("New Password and Confirm Password must match.");
                return;
            }
            if (newPassword === currentPassword) {
                showToast("New Password cannot be the same as Current Password.");
                return;
            }

            // Verify current password
            if (currentPassword !== userPassword) {
                showToast("Current password is incorrect");
                return;
            }
        }

        // 2. Phone validation (only if not onlyPassword)
        let cleanPhone = "";
        if (!onlyPassword) {
            if (phone === undefined || phone === null || phone === "") {
                showToast("Phone number is required.");
                return;
            }
            cleanPhone = String(phone).replace(/[\s\-\+\(\)]/g, "");
            if (!/^[0-9]+$/.test(cleanPhone)) {
                showToast("Phone number must contain numbers only.");
                return;
            }
            if (cleanPhone.length < 10 || cleanPhone.length > 15) {
                showToast("Phone number must be between 10 and 15 digits.");
                return;
            }
        }

        setIsSaving(true);

        try {
            let finalPhotoUrl = user?.ProfileImage || "";
            // STEP 1 & 2 & 3: Profile Photo Upload (only if not onlyPassword)
            if (!onlyPassword && selectedImageFile) {
                try {
                    // Convert image to base64
                    const base64Data = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const base64String = reader.result.split(',')[1];
                            resolve(base64String);
                        };
                        reader.onerror = (error) => reject(error);
                        reader.readAsDataURL(selectedImageFile);
                    });

                    // Call uploadMedia API
                    const uploadRes = await authService.uploadMedia(selectedImageFile.name, base64Data, selectedImageFile.type);
                    if (uploadRes && uploadRes.imageUrl) {
                        finalPhotoUrl = uploadRes.imageUrl;
                    } else {
                        throw new Error("Invalid upload response");
                    }
                } catch (uploadErr) {
                    console.error("Image upload failed:", uploadErr);
                    showToast("Failed to upload profile photo");
                    setIsSaving(false);
                    return;
                }
            } else if (!onlyPassword && shouldDeleteAvatar) {
                finalPhotoUrl = "";
            }

            // Split name into firstName and lastName (only if not onlyPassword)
            let firstName = user?.firstName || "";
            let lastName = user?.lastName || "";
            if (!onlyPassword && name) {
                const nameParts = name.trim().split(/\s+/);
                firstName = nameParts[0] || "";
                lastName = nameParts.slice(1).join(" ") || "";
            }

            // STEP 6: Call updateEmployeeMasters
            const updatePayload = {
                email: user.email,
                employeeId: user.employeeId || user.employeeCode || "",
                employeeCode: user.employeeCode || user.employeeId || "",
                photo: onlyPassword ? (user?.ProfileImage || "") : finalPhotoUrl
            };
            
            if (!onlyPassword) {
                updatePayload.phone = Number(cleanPhone);
                updatePayload.firstName = firstName;
                updatePayload.lastName = lastName;
            } else {
                updatePayload.phone = user.phone ? Number(String(user.phone).replace(/\D/g, '')) : "";
            }

            if (isPasswordChangeAttempted && newPassword) {
                updatePayload.password = newPassword;
            }

            const updateRes = await authService.updateEmployeeMasters(updatePayload);

            if (updateRes && (updateRes.success === true || updateRes.status === "success")) {
                // Update frontend auth context
                const updatedUserFields = {};
                if (!onlyPassword) {
                    updatedUserFields.phone = cleanPhone;
                    updatedUserFields.ProfileImage = finalPhotoUrl;
                    updatedUserFields.firstName = firstName;
                    updatedUserFields.lastName = lastName;
                } else {
                    updatedUserFields.ProfileImage = user?.ProfileImage || "";
                }
                
                updateUser(updatedUserFields);
                
                if (isPasswordChangeAttempted && newPassword) {
                    updatePassword(newPassword);
                }

                // Clear password fields on success
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                
                if (!onlyPassword) {
                    setSelectedImageFile(null);
                    setShouldDeleteAvatar(false);
                }
                setHasChanges(false);

                // Show simple, clear context-appropriate toast message
                if (onlyPassword) {
                    showToast("Password updated successfully.");
                } else {
                    const isProfileChanged = (cleanPhone !== String(user?.phone || "")) || selectedImageFile || shouldDeleteAvatar || (firstName !== user?.firstName) || (lastName !== user?.lastName);
                    const isPasswordChanged = isPasswordChangeAttempted && newPassword;

                    if (isProfileChanged && isPasswordChanged) {
                        showToast("Profile and password updated successfully.");
                    } else if (isPasswordChanged) {
                        showToast("Password updated successfully.");
                    } else {
                        showToast("Profile updated successfully.");
                    }
                }
            } else {
                showToast(updateRes?.message || "Unable to update profile. Please try again.");
            }
        } catch (error) {
            console.error("Failed to update profile:", error);
            showToast("Unable to update profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdatePassword = () => {
        handleSaveChanges(true);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoPreview(reader.result);
            setSelectedImageFile(file);
            setShouldDeleteAvatar(false);
            setHasChanges(true);
        };
        reader.readAsDataURL(file);
    };

    const handleDeleteAvatar = () => {
        setPhotoPreview(avatarImg);
        setSelectedImageFile(null);
        setShouldDeleteAvatar(true);
        setHasChanges(true);
        showToast("Profile image removed from preview. Click Save Changes to apply.");
    };

    return (
        <div className="settings-page-wrapper">
            {/* Accessible Toast Notification */}
            {toast && (
                <div
                    className="orders-toast slide-in-top"
                    role="alert"
                    aria-live="polite"
                    style={{ position: "fixed", top: 20, right: 24, zIndex: 2000 }}
                >
                    <CheckCircle size={15} className="toast-icon" />
                    <span>{toast}</span>
                </div>
            )}

            {/* Top Title Block with Action Buttons */}
            <div className="settings-page-header">
                <div className="header-content">
                    <div className="header-text">
                        <h1>Settings</h1>
                        <p className="header-subtitle">Manage account preferences, profile details and password settings.</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn-reset" onClick={handleResetChanges} disabled={isSaving}>Reset</button>
                        <button className="btn-save" onClick={handleSaveChanges} disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Split Grid Container Box */}
            <div className="settings-container">
                {/* Single Content Pane */}
                <section className="settings-content">
                    <div className="tab-panel-content fade-in">
                        {/* 1. Profile Picture Row */}
                        <div className="settings-row profile-row">
                            <div className="profile-section-wrapper">
                                <div className="profile-pic-container">
                                    <img 
                                        src={photoPreview || user?.ProfileImage || avatarImg} 
                                        alt={`${name} Profile Avatar`} 
                                        className="settings-profile-avatar clickable-avatar"
                                        onClick={() => setIsViewerOpen(true)}
                                        title="Click to view profile photo"
                                        onError={(e) => {
                                            e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80";
                                        }}
                                    />
                                    <label className="camera-overlay-btn" title="Change photo" style={{ cursor: isSaving ? 'not-allowed' : 'pointer' }}>
                                        <Upload size={16} />
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            accept="image/*" 
                                            onChange={handleImageUpload} 
                                            disabled={isSaving} 
                                            hidden 
                                        />
                                    </label>
                                </div>
                                <div className="profile-meta">
                                    <h4 className="profile-name">{name}</h4>
                                    <p className="profile-status">
                                        <span className="status-badge online">●</span> {selectedRoleName || ""} • {selectedRole ? selectedRole.status : "Active"}
                                    </p>
                                    <p className="profile-login">
                                        Organization: <strong>{user?.Organization || ""}</strong>
                                    </p>
                                    <p className="profile-login">
                                        Employee ID: <strong>{user?.employeeId || ""}</strong> | Type: <strong>{user?.employmentType || ""}</strong>
                                    </p>
                                </div>
                            </div>
                            <div className="profile-actions">
                                <button 
                                    className="btn-delete" 
                                    aria-label="Delete avatar" 
                                    onClick={handleDeleteAvatar}
                                    disabled={isSaving}
                                >
                                    <Trash2 size={16} />
                                </button>
                                <button 
                                    className="btn-upload" 
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isSaving}
                                >
                                    <Upload size={14} />
                                    <span>{isSaving ? "Saving..." : "Upload"}</span>
                                </button>
                            </div>
                        </div>

                        {/* 2. Name Section */}
                        <div className="settings-card-item">
                            <div className="card-icon-wrapper">
                                <User size={18} className="card-icon" />
                            </div>
                            <div className="card-content">
                                <div className="row-info">
                                    <h3>Name</h3>
                                    {editingName ? (
                                        <div className="inline-edit-group">
                                            <input
                                                className="settings-inline-input"
                                                value={pendingName}
                                                onChange={e => setPendingName(e.target.value)}
                                                autoFocus
                                                aria-label="Edit your name"
                                            />
                                            <button className="btn-edit-pill" onClick={() => {
                                                if (pendingName.trim()) { setName(pendingName.trim()); setHasChanges(true); showToast("Name updated!"); }
                                                setEditingName(false);
                                            }}>Save</button>
                                            <button className="btn-edit-pill btn-cancel-edit" onClick={() => setEditingName(false)}>Cancel</button>
                                        </div>
                                    ) : (
                                        <p>{name}</p>
                                    )}
                                </div>
                                {!editingName && (
                                    <button
                                        className="btn-edit-pill"
                                        onClick={() => { setPendingName(name); setEditingName(true); }}
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* 3. Contacts Section */}
                        <div className="settings-card-item">
                            <div className="card-icon-wrapper">
                                <Phone size={18} className="card-icon" />
                            </div>
                            <div className="card-content">
                                <div className="row-info">
                                    <h3>Contact Information</h3>
                                    {editingPhone ? (
                                        <div className="inline-edit-group">
                                            <input
                                                className="settings-inline-input"
                                                value={pendingPhone}
                                                onChange={e => setPendingPhone(e.target.value)}
                                                autoFocus
                                                aria-label="Edit your phone number"
                                            />
                                            <button className="btn-edit-pill" onClick={() => {
                                                if (pendingPhone.trim()) { setPhone(pendingPhone.trim()); setHasChanges(true); showToast("Phone updated!"); }
                                                setEditingPhone(false);
                                            }}>Save</button>
                                            <button className="btn-edit-pill btn-cancel-edit" onClick={() => setEditingPhone(false)}>Cancel</button>
                                        </div>
                                    ) : (
                                        <div className="contact-details">
                                            <p><span className="detail-label">Phone:</span> {phone}</p>
                                            <p><span className="detail-label">Email:</span> {email}</p>
                                        </div>
                                    )}
                                </div>
                                {!editingPhone && (
                                    <button
                                        className="btn-edit-pill"
                                        onClick={() => { setPendingPhone(phone); setEditingPhone(true); }}
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* 4. Social Media Section */}
                        <div className="settings-card-item">
                            <div className="card-icon-wrapper">
                                <Globe size={18} className="card-icon" />
                            </div>
                            <div className="card-content">
                                <div className="row-info">
                                    <h3>Social Media</h3>
                                    <div className="contact-details">
                                        <p>linkedin.com/in/dineshgk</p>
                                        <p>dribbble.com/haatza</p>
                                    </div>
                                </div>
                                <button 
                                    className="btn-edit-pill"
                                    onClick={() => showToast("Social Media editing coming soon")}
                                >
                                    Edit
                                </button>
                            </div>
                        </div>

                        {/* 5. Language & Currency Section */}
                        <div className="settings-card-item">
                            <div className="card-icon-wrapper">
                                <Languages size={18} className="card-icon" />
                            </div>
                            <div className="card-content">
                                <div className="row-info">
                                    <h3>Language & Currency</h3>
                                    <p>English (US), INR ₹</p>
                                </div>
                                <button 
                                    className="btn-edit-pill"
                                    onClick={() => showToast("Language & Currency editing coming soon")}
                                >
                                    Edit
                                </button>
                            </div>
                        </div>

                        {/* 7. Integration Section */}
                        <div className="settings-card-item">
                            <div className="card-icon-wrapper">
                                <Zap size={18} className="card-icon" />
                            </div>
                            <div className="card-content">
                                <div className="row-info">
                                    <h3>Connected Services</h3>
                                    <p>{googleConnected ? "Google • dinesh.gk@gmail.com" : "No active integrations"}</p>
                                </div>
                                <div className="integration-actions" style={{ position: "relative", display: "flex", gap: "8px", alignItems: "center" }}>
                                    {googleConnected ? (
                                        <span className="integration-badge">
                                            <Check size={12} className="badge-check-icon" />
                                            <span>Connected</span>
                                        </span>
                                    ) : (
                                        <span className="integration-badge status-disabled">
                                            <Lock size={12} className="badge-check-icon" />
                                            <span>Disconnected</span>
                                        </span>
                                    )}
                                    <button 
                                        className="btn-more" 
                                        aria-label="More actions"
                                        onClick={() => setActiveIntegrationDropdownOpen(prev => !prev)}
                                    >
                                        <MoreHorizontal size={16} />
                                    </button>

                                    {activeIntegrationDropdownOpen && (
                                        <>
                                            <div className="global-dropdown-overlay" onClick={() => setActiveIntegrationDropdownOpen(false)} />
                                            <div className="global-action-dropdown" style={{ right: "0", top: "36px" }}>
                                                <button 
                                                    className="global-dropdown-item"
                                                    onClick={() => {
                                                        setGoogleConnected(prev => !prev);
                                                        setActiveIntegrationDropdownOpen(false);
                                                    }}
                                                >
                                                    {googleConnected ? <Lock size={13} /> : <Check size={13} />}
                                                    <span>{googleConnected ? "Disconnect" : "Connect"}</span>
                                                </button>
                                                <button 
                                                    className="global-dropdown-item"
                                                    onClick={() => {
                                                        showToast("Google Integration Synced Successfully!");
                                                        setActiveIntegrationDropdownOpen(false);
                                                    }}
                                                >
                                                    <RotateCcw size={13} />
                                                    <span>Sync Account</span>
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Change Password section */}
                        <div className="settings-card-item">
                            <div className="card-icon-wrapper">
                                <Lock size={18} className="card-icon" />
                            </div>
                            <div className="card-content-column">
                                <div className="row-info mb-16">
                                    <h3>Change Password</h3>
                                    <p>Update your password regularly for better security</p>
                                </div>
                                <div className="password-inputs-group">
                                    <input 
                                        type="password" 
                                        placeholder="Current Password" 
                                        className="settings-input settings-password-field" 
                                        value={currentPassword}
                                        onChange={e => setCurrentPassword(e.target.value)}
                                    />
                                    <input 
                                        type="password" 
                                        placeholder="New Password" 
                                        className="settings-input settings-password-field" 
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                    />
                                    <input 
                                        type="password" 
                                        placeholder="Confirm Password" 
                                        className="settings-input settings-password-field" 
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                                <button className="btn-secondary" onClick={handleUpdatePassword} disabled={isSaving}>
                                    {isSaving ? "Saving..." : "Update Password"}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Profile Photo Viewer Modal */}
            {isViewerOpen && (
                <div className="profile-photo-modal-overlay" onClick={() => setIsViewerOpen(false)}>
                    <div className="profile-photo-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="profile-photo-modal-close" onClick={() => setIsViewerOpen(false)} aria-label="Close viewer">
                            <X size={20} />
                        </button>
                        <img 
                            src={photoPreview || user?.ProfileImage || avatarImg} 
                            alt={`${name} Profile`} 
                            className="profile-photo-modal-img"
                            onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80";
                            }}
                        />
                        <div className="profile-photo-modal-actions">
                            <a 
                                href={photoPreview || user?.ProfileImage || avatarImg} 
                                download={`${name.replace(/\s+/g, "_")}_profile_photo`}
                                target="_blank"
                                rel="noreferrer"
                                className="profile-photo-modal-btn"
                            >
                                <Download size={16} />
                                <span>Download</span>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SettingsPage;