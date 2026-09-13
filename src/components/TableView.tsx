import React, { useMemo, useState, useEffect } from "react";
import { format, parseISO, eachDayOfInterval, isFriday, isSaturday } from "date-fns";
import { useAppContext } from "../context/AppContext";
import { CellPopover } from "./CellPopover";
import { DailyStatus } from "../types";
import { getHoliday } from "../utils/holidays";

export const TableView: React.FC = () => {
    const { state, updateStatus, updateStatusBulk } = useAppContext();
    const { config, schedules } = state;

    const [activeCell, setActiveCell] = useState<{
        memberId: string;
        memberName: string;
        dateStr: string;
        statusObj?: DailyStatus;
    } | null>(null);

    const [hoveredCell, setHoveredCell] = useState<{
        memberId: string;
        dateStr: string;
    } | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (activeCell) return;
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;
            if (!hoveredCell) return;

            const key = e.key.toLowerCase();
            let status: "BASE" | "HOME" | "TRANSIT" | "UNKNOWN" | null = null;
            if (key === 'b') status = 'BASE';
            if (key === 'h') status = 'HOME';
            if (key === 't') status = 'TRANSIT';
            if (key === 'u') status = 'UNKNOWN';

            if (status) {
                updateStatus(hoveredCell.dateStr, hoveredCell.memberId, { status });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [hoveredCell, activeCell, updateStatus]);

    const daysArray = useMemo(() => {
        try {
            if (config.startDate && config.endDate) {
                return eachDayOfInterval({
                    start: parseISO(config.startDate),
                    end: parseISO(config.endDate),
                });
            }
        } catch {
            return [];
        }
        return [];
    }, [config.startDate, config.endDate]);

    const getDayStatusClass = (status?: string) => {
        if (status === "BASE") return "cell-base";
        if (status === "HOME") return "cell-home";
        if (status === "TRANSIT") return "cell-transit";
        return "cell-unknown";
    };

    const getStatusInitial = (status?: string) => {
        if (status === "BASE") return "BASE";
        if (status === "HOME") return "HOME";
        if (status === "TRANSIT") return "T";
        return "-";
    };

    return (
        <>
            <div className="table-container">
                <table className="roster-table">
                    <thead>
                        <tr>
                            <th>Member</th>
                            {daysArray.map((day) => {
                                const isWeekend = isFriday(day) || isSaturday(day);
                                const holiday = getHoliday(day);
                                return (
                                    <th key={day.toISOString()} className={isWeekend ? "col-weekend" : ""}>
                                        <div style={{ fontSize: '0.8rem' }}>{format(day, "E")}</div>
                                        <div style={{ fontSize: '1rem', color: 'var(--color-text)' }}>{format(day, "dd")}</div>
                                        {holiday && (
                                            <div style={{ fontSize: '0.65rem', color: 'var(--color-primary)', fontWeight: 700, marginTop: '2px', lineHeight: 1.1 }}>
                                                {holiday}
                                            </div>
                                        )}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {config.members.map((member) => (
                            <tr key={member.id}>
                                <td>{member.name}</td>
                                {daysArray.map((day) => {
                                    const dateStr = day.toISOString().split('T')[0];
                                    const statusObj = schedules[dateStr]?.[member.id];
                                    const isWeekend = isFriday(day) || isSaturday(day);

                                    return (
                                        <td key={`${member.id}-${dateStr}`} className={isWeekend ? "col-weekend" : ""}>
                                            <div
                                                className={`cell-content ${getDayStatusClass(statusObj?.status)}`}
                                                onClick={() => setActiveCell({
                                                    memberId: member.id,
                                                    memberName: member.name,
                                                    dateStr,
                                                    statusObj
                                                })}
                                                onMouseEnter={() => setHoveredCell({ memberId: member.id, dateStr })}
                                                onMouseLeave={() => setHoveredCell(null)}
                                            >
                                                {getStatusInitial(statusObj?.status)}
                                                {statusObj?.status === "TRANSIT" && (
                                                    <div className="cell-time">
                                                        {statusObj.arrivalTime && `📥${statusObj.arrivalTime}`}{" "}
                                                        {statusObj.departureTime && `📤${statusObj.departureTime}`}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}

                        {/* Readiness Row */}
                        <tr>
                            <td style={{ fontWeight: 600, color: 'var(--color-text-light)' }}>On Base</td>
                            {daysArray.map((day) => {
                                const dateStr = day.toISOString().split('T')[0];
                                const daySchedule = schedules[dateStr] || {};

                                let activeCount = 0;
                                Object.values(daySchedule).forEach(statusObj => {
                                    if (statusObj.status === "BASE" || statusObj.status === "TRANSIT") {
                                        activeCount += 1;
                                    }
                                });

                                const isLow = activeCount < config.minBasePresence;
                                const readinessClass = isLow ? "readiness-low" : "readiness-ok";

                                return (
                                    <td key={`readiness-${dateStr}`} className={readinessClass} style={{ fontWeight: 700 }}>
                                        {activeCount}/{config.members.length}
                                    </td>
                                );
                            })}
                        </tr>
                    </tbody>
                </table>
            </div>

            {activeCell && (
                <CellPopover
                    memberId={activeCell.memberId}
                    memberName={activeCell.memberName}
                    dateStr={activeCell.dateStr}
                    currentStatus={activeCell.statusObj}
                    onClose={() => setActiveCell(null)}
                    onSave={(status, endDate) => {
                        if (endDate && endDate !== activeCell.dateStr) {
                            updateStatusBulk(activeCell.dateStr, endDate, activeCell.memberId, status);
                        } else {
                            updateStatus(activeCell.dateStr, activeCell.memberId, status);
                        }
                    }}
                />
            )}
        </>
    );
};
