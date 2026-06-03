import React from "react";
import { ChevronDown } from "lucide-react";
import "./roles.css";

function Accordion({ title, isOpen, onToggle, children, count }) {
    return (
        <section className="role-accordion">
            <button
                type="button"
                className="role-accordion__trigger"
                onClick={onToggle}
                aria-expanded={isOpen}
            >
                <span className="role-accordion__title">
                    <ChevronDown
                        size={16}
                        className={`role-accordion__chevron ${isOpen ? "role-accordion__chevron--open" : ""}`}
                    />
                    {title}
                </span>
                {typeof count === "number" && (
                    <span className="role-accordion__count">{count} enabled</span>
                )}
            </button>
            {isOpen && <div className="role-accordion__panel">{children}</div>}
        </section>
    );
}

export default Accordion;
