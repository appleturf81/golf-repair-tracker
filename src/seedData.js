
// Helper data to populate the DB for the first time
export const INITIAL_EQUIPMENT = [
    { name: 'Toro Reelmaster 3100-D', type: 'Mower', status: 'Operational', department: 'Greens', purchaseDate: '2023-01-15', serial: 'TRM3100-8842' },
    { name: 'John Deere Gator TX', type: 'Vehicle', status: 'Operational', department: 'Maintenance', purchaseDate: '2022-05-20', serial: 'JDG-TX-9921' },
    { name: 'Jacobsen LF570', type: 'Mower', status: 'Down', department: 'Fairways', purchaseDate: '2021-03-10', serial: 'JLF570-5531' },
    { name: 'Club Car Carryall 500', type: 'Vehicle', status: 'Operational', department: 'Range', purchaseDate: '2022-08-11', serial: 'CC500-1122' },
    { name: 'Toro Greensmaster 1000', type: 'Mower', status: 'In Repair', department: 'Greens', purchaseDate: '2020-02-28', serial: 'TGM1000-3344' },
];

export const INITIAL_USERS = [
    { name: 'Superintendent', code: 'SUPER123', role: 'Superintendent' },
    { name: 'Assistant Superintendent', code: 'ASST456', role: 'Assistant' },
    { name: 'Staff Member', code: '1234', role: 'Employee' }
];
