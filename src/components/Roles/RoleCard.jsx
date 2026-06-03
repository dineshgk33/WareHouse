import React from "react";
import { Eye } from "lucide-react";
import "./roles.css";

function RoleCard({ role, onViewPermissions }) {
    return (
        <article className="role-card">
            <div className={`role-card__badge role-card__badge--${role.badgeClass}`}>
                {role.badge}
            </div>
            <div className="role-card__header">
                <h4>{role.name}</h4>
                <span className="role-card__count">{role.permissions.length} Permissions</span>
            </div>
            <p className="role-card__desc">{role.description}</p>
            <div className="role-card__footer">
                <button
                    type="button"
                    className="role-btn role-btn--ghost"
                    onClick={() => onViewPermissions(role.id)}
                >
                    <Eye size={14} />
                    View Permissions
                </button>
            </div>
        </article>
    );
}

export default RoleCard;
