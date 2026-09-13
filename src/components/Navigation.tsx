import React, { useRef } from "react";
import { useAppContext } from "../context/AppContext";
import { LayoutDashboard, Calendar, Download, Upload } from "lucide-react";

export const Navigation: React.FC = () => {
    const { state, updateConfig, importState, activeView, setActiveView } = useAppContext();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
        const downloadAnchorNode = document.createElement("a");
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "duty_planner_backup.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const parsed = JSON.parse(content);
                if (parsed && parsed.config && parsed.schedules) {
                    importState(parsed);
                } else {
                    alert("Invalid file format.");
                }
            } catch (error) {
                console.error(error);
                alert("Error parsing the file.");
            }
        };
        reader.readAsText(file);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <header className="app-header">
            <div className="brand-title">
                <LayoutDashboard className="w-6 h-6 text-blue-500" />
                <span>Duty Planner</span>
            </div>

            <div className="controls-group">
                <div className="view-toggle">
                    <button className="toggle-btn" onClick={handleExport} title="Export Data">
                        <Download className="w-4 h-4" />
                    </button>
                    <button className="toggle-btn" onClick={() => fileInputRef.current?.click()} title="Import Data">
                        <Upload className="w-4 h-4" />
                    </button>
                    <input
                        type="file"
                        accept=".json"
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                </div>

                <input
                    type="date"
                    className="input-date"
                    value={state.config.startDate}
                    onChange={(e) => updateConfig({ startDate: e.target.value })}
                />
                <span style={{ color: "var(--color-text-light)" }}>to</span>
                <input
                    type="date"
                    className="input-date"
                    value={state.config.endDate}
                    onChange={(e) => updateConfig({ endDate: e.target.value })}
                />

                <div className="view-toggle">
                    <button
                        className="toggle-btn"
                        onClick={() => {
                            import("../utils/exportIcs").then(m => m.downloadIcs(state));
                        }}
                        title="Export to Calendar"
                    >
                        <Calendar className="w-4 h-4" />
                    </button>
                    <button
                        className={`toggle-btn ${activeView === "TABLE" ? "active" : ""}`}
                        onClick={() => setActiveView("TABLE")}
                    >
                        Matrix
                    </button>
                    <button
                        className={`toggle-btn ${activeView === "CALENDAR" ? "active" : ""}`}
                        onClick={() => setActiveView("CALENDAR")}
                    >
                        Calendar
                    </button>
                </div>
            </div>
        </header>
    );
};
