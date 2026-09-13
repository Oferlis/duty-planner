export const HOLIDAYS: Record<string, string> = {
    '09-11': 'Rosh HaShana',
    '09-12': 'Rosh HaShana',
    '09-13': 'Rosh HaShana',
    '09-20': 'Yom Kippur',
    '09-21': 'Yom Kippur',
    '09-25': 'Sukkot',
    '09-26': 'Sukkot',
    '10-02': 'Sukkot B',
    '10-03': 'Sukkot B',
};

export const getHoliday = (date: Date): string | undefined => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return HOLIDAYS[`${month}-${day}`];
};
