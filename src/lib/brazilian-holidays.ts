
type Holiday = {
  date: string; // YYYY-MM-DD
  name: string;
  type: 'national' | 'commemorative' | 'optional';
};

// Fonte: ANBIMA e calendários oficiais.
// Datas comemorativas sem dia fixo (Dia das Mães, Pais) foram calculadas.
// Feriados móveis (Carnaval, Corpus Christi) foram calculados com base na Páscoa.
export const brazilianHolidays: Holiday[] = [
  // 2025
  { date: '2025-01-01', name: 'Confraternização Universal', type: 'national' },
  { date: '2025-03-03', name: 'Carnaval', type: 'optional' },
  { date: '2025-03-04', name: 'Carnaval', type: 'optional' },
  { date: '2025-04-18', name: 'Paixão de Cristo', type: 'national' },
  { date: '2025-04-20', name: 'Páscoa', type: 'commemorative' },
  { date: '2025-04-21', name: 'Tiradentes', type: 'national' },
  { date: '2025-05-01', name: 'Dia do Trabalho', type: 'national' },
  { date: '2025-05-11', name: 'Dia das Mães', type: 'commemorative' },
  { date: '2025-06-12', name: 'Dia dos Namorados', type: 'commemorative' },
  { date: '2025-06-19', name: 'Corpus Christi', type: 'optional' },
  { date: '2025-08-10', name: 'Dia dos Pais', type: 'commemorative' },
  { date: '2025-09-07', name: 'Independência do Brasil', type: 'national' },
  { date: '2025-10-12', name: 'Nossa Senhora Aparecida', type: 'national' },
  { date: '2025-11-02', name: 'Finados', type: 'national' },
  { date: '2025-11-15', name: 'Proclamação da República', type: 'national' },
  { date: '2025-12-25', name: 'Natal', type: 'national' },

  // 2026
  { date: '2026-01-01', name: 'Confraternização Universal', type: 'national' },
  { date: '2026-02-16', name: 'Carnaval', type: 'optional' },
  { date: '2026-02-17', name: 'Carnaval', type: 'optional' },
  { date: '2026-04-03', name: 'Paixão de Cristo', type: 'national' },
  { date: '2026-04-05', name: 'Páscoa', type: 'commemorative' },
  { date: '2026-04-21', name: 'Tiradentes', type: 'national' },
  { date: '2026-05-01', name: 'Dia do Trabalho', type: 'national' },
  { date: '2026-05-10', name: 'Dia das Mães', type: 'commemorative' },
  { date: '2026-06-04', name: 'Corpus Christi', type: 'optional' },
  { date: '2026-06-12', name: 'Dia dos Namorados', type: 'commemorative' },
  { date: '2026-08-09', name: 'Dia dos Pais', type: 'commemorative' },
  { date: '2026-09-07', name: 'Independência do Brasil', type: 'national' },
  { date: '2026-10-12', name: 'Nossa Senhora Aparecida', type: 'national' },
  { date: '2026-11-02', name: 'Finados', type: 'national' },
  { date: '2026-11-15', name: 'Proclamação da República', type: 'national' },
  { date: '2026-12-25', name: 'Natal', type: 'national' },
];

/**
 * Parses a "YYYY-MM-DD" string into a Date object, avoiding timezone issues.
 * The `replace` is necessary because `new Date('YYYY-MM-DD')` can result in the previous day
 * depending on the user's timezone. `new Date('YYYY/MM/DD')` interprets it as local time.
 */
const parseDate = (dateStr: string) => new Date(dateStr.replace(/-/g, '/'));

export const holidaysByType = {
  national: brazilianHolidays.filter(h => h.type === 'national').map(h => parseDate(h.date)),
  commemorative: brazilianHolidays.filter(h => h.type === 'commemorative').map(h => parseDate(h.date)),
  optional: brazilianHolidays.filter(h => h.type === 'optional').map(h => parseDate(h.date)),
};

// A Map for quick lookup of a holiday name by its date string.
export const holidaysByName = new Map(brazilianHolidays.map(h => [h.date, h.name]));
