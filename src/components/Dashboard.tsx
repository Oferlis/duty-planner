import React, { useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import { eachDayOfInterval, parseISO, isFriday, isSaturday } from "date-fns";

export const Dashboard: React.FC = () => {
    const { state } = useAppContext();
    const { config, schedules } = state;

    const metrics = useMemo(() => {
        let daysArray: Date[] = [];
        try {
            if (config.startDate && config.endDate) {
                daysArray = eachDayOfInterval({
                    start: parseISO(config.startDate),
                    end: parseISO(config.endDate),
                });
            }
        } catch {
            // Invalid date formats
        }

        const totalDays = daysArray.length;

        return config.members.map(member => {
            let baseDays = 0;
            let homeDays = 0;
            let weekendShifts = 0;

            daysArray.forEach(day => {
                const dateStr = day.toISOString().split('T')[0];
                const statusObj = schedules[dateStr]?.[member.id];

                if (statusObj) {
                    if (statusObj.status === "BASE") {
                        baseDays += 1;
                        if (isFriday(day) || isSaturday(day)) weekendShifts += 1;
                    } else if (statusObj.status === "HOME") {
                        homeDays += 1;
                    } else if (statusObj.status === "TRANSIT") {
                        baseDays += 0.5; // partial
                        if (isFriday(day) || isSaturday(day)) weekendShifts += 1;
                    }
                }
            });

            const presenceRatio = totalDays > 0 ? ((baseDays / totalDays) * 100).toFixed(0) : 0;

            return {
                id: member.id,
                name: member.name,
                baseDays,
                homeDays,
                weekendShifts,
                presenceRatio
            };
        });
    }, [config, schedules]);

    return (
        <div className="dashboard-grid">
            {metrics.map(m => (
                <div key={m.id} className="metrics-card">
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', fontWeight: 600 }}>{m.name}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>Days on Base</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-base-text)' }}>{m.baseDays}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>Days at Home</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-home-text)' }}>{m.homeDays}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>Weekend Shifts</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{m.weekendShifts}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>Presence</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{m.presenceRatio}%</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
