import { RootState } from "../types";
import { addDays, format } from "date-fns";

const STORAGE_KEY = "duty_planner_mvp_state_v2";

export const getInitialConfig = (): RootState => {
    const today = new Date();
    const endDate = addDays(today, 30);

    return {
        config: {
            startDate: format(today, "yyyy-MM-dd"),
            endDate: format(endDate, "yyyy-MM-dd"),
            members: [
                { id: "m1", name: "Doron" },
                { id: "m2", name: "Yiftach" },
                { id: "m3", name: "Ofer" },
            ],
            minBasePresence: 2,
        },
        schedules: {},
    };
};

export const loadState = (): RootState => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return getInitialConfig();
        const parsed = JSON.parse(raw);

        // validate structure briefly
        if (!parsed.config || !parsed.schedules) {
            return getInitialConfig();
        }

        return parsed;
    } catch (err) {
        console.error("Failed to parse state from localStorage, falling back to initial.", err);
        return getInitialConfig();
    }
};

export const saveState = (state: RootState) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
        console.error("Failed to save state to localStorage.", err);
    }
};
