import React, { useState } from "react";
import { format, parseISO } from "date-fns";
import { DailyStatus, Status } from "../types";

export interface CellPopoverProps {
    memberId: string;
    memberName: string;
    dateStr: string;
    currentStatus?: DailyStatus;
    onSave: (status: DailyStatus, endDate?: string) => void;
    onClose: () => void;
}

export const CellPopover: React.FC<CellPopoverProps> = ({
    memberName,
    dateStr,
    currentStatus,
    onSave,
    onClose,
}) => {
    const [selectedStatus, setSelectedStatus] = useState<Status>(currentStatus?.status || "UNKNOWN");
    const [arrivalTime, setArrivalTime] = useState(currentStatus?.arrivalTime || "");
    const [departureTime, setDepartureTime] = useState(currentStatus?.departureTime || "");
    const [rangeEnd, setRangeEnd] = useState("");

    // Prevent closing when clicking inside modal
    const handleBodyClick = (e: React.MouseEvent) => e.stopPropagation();

    const handleSave = () => {
        onSave({
            status: selectedStatus,
            arrivalTime: selectedStatus === "TRANSIT" ? arrivalTime : undefined,
            departureTime: selectedStatus === "TRANSIT" ? departureTime : undefined,
        }, rangeEnd);
        onClose();
    };

    const displayDate = () => {
        try {
            return format(parseISO(dateStr), "EEEE, MMM d, yyyy");
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
            <div className="modal-content" onClick={handleBodyClick}>
                <div className="modal-header">
                    <div>
                        <h3 style={{ margin: 0 }}>{memberName}</h3>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                            {displayDate()}
                        </span>
                    </div>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    <div className="status-grid">
                        <button
                            className={`status-btn status-base ${selectedStatus === 'BASE' ? 'selected' : ''}`}
                            onClick={() => setSelectedStatus('BASE')}
                        >
                            <span style={{ fontSize: '1.25rem' }}>🛡️</span> On Base
                        </button>
                        <button
                            className={`status-btn status-home ${selectedStatus === 'HOME' ? 'selected' : ''}`}
                            onClick={() => setSelectedStatus('HOME')}
                        >
                            <span style={{ fontSize: '1.25rem' }}>🏠</span> At Home
                        </button>
                        <button
                            className={`status-btn status-transit ${selectedStatus === 'TRANSIT' ? 'selected' : ''}`}
                            onClick={() => setSelectedStatus('TRANSIT')}
                        >
                            <span style={{ fontSize: '1.25rem' }}>🚗</span> Transit
                        </button>
                        <button
                            className={`status-btn status-unknown ${selectedStatus === 'UNKNOWN' ? 'selected' : ''}`}
                            onClick={() => setSelectedStatus('UNKNOWN')}
                        >
                            <span style={{ fontSize: '1.25rem' }}>❓</span> Clear
                        </button>
                    </div>

                    {selectedStatus === "TRANSIT" && (
                        <div className="time-inputs" style={{ marginBottom: '24px' }}>
                            <div>
                                <label>Arrival to Base</label>
                                <input
                                    type="time"
                                    value={arrivalTime}
                                    onChange={(e) => setArrivalTime(e.target.value)}
                                />
                            </div>
                            <div>
                                <label>Departure Home</label>
                                <input
                                    type="time"
                                    value={departureTime}
                                    onChange={(e) => setDepartureTime(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-light)', marginBottom: '8px' }}>
                            Apply to date range (Optional)
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <input type="date" value={dateStr} disabled className="input-date" style={{ flex: 1, opacity: 0.7 }} />
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>to</span>
                            <input
                                type="date"
                                value={rangeEnd}
                                min={dateStr}
                                onChange={(e) => setRangeEnd(e.target.value)}
                                className="input-date"
                                style={{ flex: 1 }}
                            />
                        </div>
                    </div>

                    <button className="btn-primary" onClick={handleSave}>
                        Save Status
                    </button>
                </div>
            </div>
        </div>
    );
};
