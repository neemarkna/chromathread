import type { ScheduleEvent, ExpenseItem, NoteItem, TaskItem } from '../types';

/**
 * Generates a direct 1-click Google Calendar add link
 */
export function generateGoogleCalendarUrl(event: Partial<ScheduleEvent>): string {
  const title = encodeURIComponent(event.title || 'นัดหมายใหม่');
  const details = encodeURIComponent(
    `${event.description || ''}\n\n[สร้างโดย เลขาส่วนตัว AI]`
  );
  const location = encodeURIComponent(event.location || '');

  const dateStr = event.date || new Date().toISOString().split('T')[0];
  const cleanDate = dateStr.replace(/-/g, '');

  const startTimeStr = (event.startTime || '09:00').replace(':', '') + '00';
  const endTimeStr = (event.endTime || '10:00').replace(':', '') + '00';

  const startIso = `${cleanDate}T${startTimeStr}`;
  const endIso = `${cleanDate}T${endTimeStr}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startIso}/${endIso}`;
}

/**
 * Generates an .ics file download link for offline calendar import
 */
export function downloadICalFile(event: ScheduleEvent) {
  const dateStr = event.date.replace(/-/g, '');
  const startTimeStr = event.startTime.replace(':', '') + '00';
  const endTimeStr = event.endTime.replace(':', '') + '00';

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AI Mobile Secretary//TH',
    'BEGIN:VEVENT',
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description || ''}`,
    `LOCATION:${event.location || ''}`,
    `DTSTART:${dateStr}T${startTimeStr}`,
    `DTEND:${dateStr}T${endTimeStr}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.title.replace(/\s+/g, '_')}_calendar.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Backup data to JSON file / Google Drive Simulation
 */
export function createBackupPayload(
  expenses: ExpenseItem[],
  schedules: ScheduleEvent[],
  notes: NoteItem[],
  tasks: TaskItem[]
) {
  return {
    app: 'AI Personal Secretary',
    version: '1.0.0',
    backupDate: new Date().toISOString(),
    expenses,
    schedules,
    notes,
    tasks
  };
}

export function downloadBackupJson(data: ReturnType<typeof createBackupPayload>) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `AI_Secretary_Backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
