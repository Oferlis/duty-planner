import React, { useMemo, useState, useEffect } from "react";
import { format, parseISO, eachDayOfInterval, startOfWeek, endOfWeek } from "date-fns";
import { useAppContext } from "../context/AppContext";
import { CellPopover } from "./CellPopover";
import { DailyStatus } from "../types";
import { getHoliday } from "../utils/holidays";

export const CalendarView: React.FC = () => {
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

    const calendarDays = useMemo(() => {
        try {
            if (!config.startDate || !config.endDate) return [];
            const start = parseISO(config.startDate);
            const end = parseISO(config.endDate);

            const gridStart = startOfWeek(start);
            const gridEnd = endOfWeek(end);

            return eachDayOfInterval({ start: gridStart, end: gridEnd });
        } catch {
            return [];
        }
    }, [config.startDate, config.endDate]);

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div style={{ background: 'var(--color-surface)', padding: '20px', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'var(--color-border)', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>

                {/* Header */}
                {weekDays.map(d => (
                    <div key={d} style={{ background: 'var(--color-surface)', padding: '12px', textAlign: 'center', fontWeight: 600, fontSize: '0.875rem' }}>
                        {d}
                    </div>
                ))}

                {/* Days Grid */}
                {calendarDays.map((day) => {
                    const dateStr = day.toISOString().split('T')[0];
                    const daySchedule = schedules[dateStr] || {};

                    let inRange = false;
                    try {
                        inRange = day >= parseISO(config.startDate) && day <= parseISO(config.endDate);
                    } catch { }

                    const onBase: { id: string, name: string, statusObj: DailyStatus }[] = [];
                    const atHome: { id: string, name: string, statusObj: DailyStatus }[] = [];

                    if (inRange) {
                        config.members.forEach(member => {
                            const st = daySchedule[member.id];
                            if (st?.status === "BASE" || st?.status === "TRANSIT") {
                                onBase.push({ id: member.id, name: member.name, statusObj: st });
                            } else if (st?.status === "HOME") {
                                atHome.push({ id: member.id, name: member.name, statusObj: st });
                            }
                        });
                    }

                    return (
                        <div
                            key={day.toISOString()}
                            style={{
                                background: inRange ? 'var(--color-surface)' : 'var(--color-background)',
                                padding: '12px',
                                minHeight: '120px',
                                opacity: inRange ? 1 : 0.5
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-light)' }}>
                                    {format(day, 'MMM d')}
                                </div>
                                {getHoliday(day) && (
                                    <div style={{ fontSize: '0.65rem', color: 'var(--color-primary)', fontWeight: 700, textAlign: 'right', maxWidth: '60px', lineHeight: 1.1 }}>
                                        {getHoliday(day)}
                                    </div>
                                )}
                            </div>

                            {inRange && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {/* Base Group */}
                                    {onBase.length > 0 && (
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--color-base-text)', fontWeight: 700, marginBottom: '4px' }}>ON BASE ({onBase.length})</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                {onBase.map(m => (
                                                    <div
                                                        key={m.id}
                                                        onClick={() => setActiveCell({ memberId: m.id, memberName: m.name, dateStr, statusObj: m.statusObj })}
                                                        onMouseEnter={() => setHoveredCell({ memberId: m.id, dateStr })}
                                                        onMouseLeave={() => setHoveredCell(null)}
                                                        style={{
                                                            fontSize: '0.75rem',
                                                            padding: '4px 8px',
                                                            background: m.statusObj.status === 'TRANSIT' ? 'var(--color-transit-bg)' : 'var(--color-base-bg)',
                                                            color: m.statusObj.status === 'TRANSIT' ? 'var(--color-transit-text)' : 'var(--color-base-text)',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {m.name} {m.statusObj.status === 'TRANSIT' && "🚗"}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Home Group */}
                                    {atHome.length > 0 && (
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--color-home-text)', fontWeight: 700, marginBottom: '4px' }}>AT HOME ({atHome.length})</div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                {atHome.map(m => (
                                                    <div
                                                        key={m.id}
                                                        onClick={() => setActiveCell({ memberId: m.id, memberName: m.name, dateStr, statusObj: m.statusObj })}
                                                        onMouseEnter={() => setHoveredCell({ memberId: m.id, dateStr })}
                                                        onMouseLeave={() => setHoveredCell(null)}
                                                        style={{
                                                            fontSize: '0.75rem',
                                                            padding: '2px 6px',
                                                            background: 'var(--color-home-bg)',
                                                            color: 'var(--color-home-text)',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            display: 'inline-block'
                                                        }}
                                                    >
                                                        {m.name}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Empty Cells allows picking someone out of UNKNOWN state indirectly */}
                                    {config.members.filter(m => !onBase.find(b => b.id === m.id) && !atHome.find(a => a.id === m.id)).length > 0 && (
                                        <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
                                            <select
                                                style={{ width: '100%', fontSize: '0.7rem', padding: '2px', border: '1px dashed var(--color-border)', borderRadius: '4px', background: 'transparent' }}
                                                value=""
                                                onChange={(e) => {
                                                    if (!e.target.value) return;
                                                    const selected = config.members.find(m => m.id === e.target.value);
                                                    if (selected) {
                                                        setActiveCell({ memberId: selected.id, memberName: selected.name, dateStr, statusObj: { status: 'UNKNOWN' } });
                                                    }
                                                }}
                                            >
                                                <option value="">+ Add to schedule...</option>
                                                {config.members.filter(m => !onBase.find(b => b.id === m.id) && !atHome.find(a => a.id === m.id)).map(m => (
                                                    <option key={m.id} value={m.id}>{m.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
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
        </div>
    );
};
