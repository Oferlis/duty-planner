import React, { createContext, useContext, useEffect, useState } from "react";
import { RootState, Config, DailyStatus } from "../types";
import { loadState, saveState } from "../utils/storage";
import { eachDayOfInterval, format, parseISO } from "date-fns";

interface AppContextType {
    state: RootState;
    updateConfig: (newConfig: Partial<Config>) => void;
    updateStatus: (dateStr: string, memberId: string, status: DailyStatus) => void;
    updateStatusBulk: (startDateStr: string, endDateStr: string, memberId: string, status: DailyStatus) => void;
    importState: (newState: RootState) => void;
    activeView: "TABLE" | "CALENDAR";
    setActiveView: (view: "TABLE" | "CALENDAR") => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<RootState>(loadState);
    const [activeView, setActiveView] = useState<"TABLE" | "CALENDAR">("TABLE");

    useEffect(() => {
        saveState(state);
    }, [state]);

    const updateConfig = (newConfig: Partial<Config>) => {
        setState((prev) => ({
            ...prev,
            config: { ...prev.config, ...newConfig },
        }));
    };

    const updateStatus = (dateStr: string, memberId: string, status: DailyStatus) => {
        setState((prev) => {
            const currentDay = prev.schedules[dateStr] || {};
            return {
                ...prev,
                schedules: {
                    ...prev.schedules,
                    [dateStr]: {
                        ...currentDay,
                        [memberId]: status,
                    },
                },
            };
        });
    };

    const updateStatusBulk = (startDateStr: string, endDateStr: string, memberId: string, status: DailyStatus) => {
        setState((prev) => {
            const dates = eachDayOfInterval({
                start: parseISO(startDateStr),
                end: parseISO(endDateStr)
            });
            let newSchedules = { ...prev.schedules };

            dates.forEach(d => {
                const dStr = format(d, 'yyyy-MM-dd');
                const currDay = newSchedules[dStr] || {};
                newSchedules[dStr] = {
                    ...currDay,
                    [memberId]: status,
                };
            });

            return {
                ...prev,
                schedules: newSchedules
            };
        });
    };

    const importState = (newState: RootState) => {
        setState(newState);
    };

    return (
        <AppContext.Provider value={{ state, updateConfig, updateStatus, updateStatusBulk, importState, activeView, setActiveView }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useAppContext must be used within AppProvider");
    return ctx;
};
