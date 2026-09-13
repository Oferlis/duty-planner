import { RootState } from "../types";


export const generateIcsContent = (state: RootState): string => {
    let icsContent = "";
    icsContent += "BEGIN:VCALENDAR\r\n";
    icsContent += "VERSION:2.0\r\n";
    icsContent += "PRODID:-//Duty Planner//EN\r\n";

    const membersMap = new Map(state.config.members.map(m => [m.id, m.name]));

    Object.entries(state.schedules).forEach(([dateStr, daySchedule]) => {
        // dateStr is in YYYY-MM-DD format
        const [yearStr, monthStr, dayStr] = dateStr.split('-');
        const dtBase = `${yearStr}${monthStr}${dayStr}`;
        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10) - 1;
        const day = parseInt(dayStr, 10);

        Object.entries(daySchedule).forEach(([memberId, statusObj]) => {
            if (statusObj.status !== "UNKNOWN") {
                const memberName = membersMap.get(memberId) || memberId;
                icsContent += "BEGIN:VEVENT\r\n";
                // UID is required for proper parsing in some calendar clients
                icsContent += `UID:${memberId}-${dateStr}@dutyplanner\r\n`;
                icsContent += `SUMMARY:${memberName} - ${statusObj.status}\r\n`;

                if (statusObj.arrivalTime && statusObj.departureTime) {
                    const dtStart = dtBase + "T" + statusObj.arrivalTime.replace(":", "") + "00";
                    const dtEnd = dtBase + "T" + statusObj.departureTime.replace(":", "") + "00";
                    icsContent += `DTSTART:${dtStart}\r\n`;
                    icsContent += `DTEND:${dtEnd}\r\n`;
                } else {
                    const dtStart = dtBase;
                    // Calculate next day cleanly using Date UTC to avoid any DST or timezone shifts
                    const nextDayDate = new Date(Date.UTC(year, month, day + 1));
                    const nextYear = nextDayDate.getUTCFullYear();
                    const nextMonth = String(nextDayDate.getUTCMonth() + 1).padStart(2, '0');
                    const nextDay = String(nextDayDate.getUTCDate()).padStart(2, '0');
                    const dtEnd = `${nextYear}${nextMonth}${nextDay}`;

                    icsContent += `DTSTART;VALUE=DATE:${dtStart}\r\n`;
                    icsContent += `DTEND;VALUE=DATE:${dtEnd}\r\n`;
                }

                icsContent += "END:VEVENT\r\n";
            }
        });
    });

    icsContent += "END:VCALENDAR\r\n";
    return icsContent;
};

export const downloadIcs = (state: RootState) => {
    const icsContent = generateIcsContent(state);
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "duty-schedule.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
