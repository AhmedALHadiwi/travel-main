import React, { createContext, useContext, useState } from "react";

const ShiftContext = createContext(null);

export const ShiftProvider = ({ children }) => {
    const [shiftState, setShiftState] = useState({
        id: null,
        status: "not_started",
        startTime: null,
        endTime: null,
        breakStartTime: null,
        totalBreakSeconds: 0,
        activeBreakId: null,
    });

    return (
        <ShiftContext.Provider value={{ shiftState, setShiftState }}>
            {children}
        </ShiftContext.Provider>
    );
};

export const useShift = () => {
    const ctx = useContext(ShiftContext);
    if (!ctx) throw new Error("useShift must be used within ShiftProvider");
    return ctx;
};
