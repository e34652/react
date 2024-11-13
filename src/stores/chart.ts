import { create } from 'zustand'

export const useChartStore = create((set) => ({
    selectedType: "typeA",
    setType: (type) => set(() =>{
        console.log("Selected Type updated:", type); // 상태 변경 시 로그 출력
        return { selectedType: type}; }),
    
    selectedPeriod: "month",
    setPeriod: (period) => set(() => {
        console.log("Selected Period updated:", period); // 상태 변경 시 로그 출력
        return { selectedPeriod: period };
    }),
}));