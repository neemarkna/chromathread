export type ExpenseCategory = 
  | 'Food' 
  | 'Transport' 
  | 'Utilities' 
  | 'Shopping' 
  | 'Entertainment' 
  | 'Health' 
  | 'Work' 
  | 'Transfer' 
  | 'Income' 
  | 'Others';

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  type: 'expense' | 'income';
  category: ExpenseCategory;
  date: string; // ISO string YYYY-MM-DD
  time: string; // HH:mm
  bankSender?: string;
  bankReceiver?: string;
  accountNo?: string;
  refNo?: string;
  slipImageUrl?: string;
  notes?: string;
  folderId?: string;
  source: 'slip_ocr' | 'voice' | 'manual' | 'line' | 'gdrive';
  autoProcessed?: boolean;
}

export type EventCategory = 'Meeting' | 'Appointment' | 'Personal' | 'Work' | 'Reminder' | 'Payment';

export interface ScheduleEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  category: EventCategory;
  location?: string;
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
  isAllDay?: boolean;
  gcalUrl?: string;
  syncedToGoogle?: boolean;
}

export type TaskPriority = 'high' | 'medium' | 'low';

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  priority: TaskPriority;
  dueDate?: string;
  dueTime?: string;
  category: string;
  source: 'voice' | 'slip' | 'manual' | 'line';
  createdAt: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  isAiGenerated?: boolean;
  summary?: string;
}

export type ActivityType = 
  | 'expense' 
  | 'schedule' 
  | 'task' 
  | 'note' 
  | 'voice' 
  | 'slip_auto_watch' 
  | 'line_msg' 
  | 'gdrive_sync';

export interface ActivityItem {
  id: string;
  timestamp: string;
  type: ActivityType;
  title: string;
  description: string;
  badgeText?: string;
  referenceId?: string;
}

export interface SlipFolderWatcherState {
  linkedFolderId: string;
  folderName: string;
  isWatching: boolean;
  autoProcessEnabled: boolean;
  lastScannedAt: string;
  scannedSlipsCount: number;
}

export interface LineChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
  flexCard?: {
    type: 'slip_summary' | 'schedule_alert' | 'task_summary' | 'daily_report';
    title: string;
    items: { label: string; value: string }[];
    actionLabel?: string;
    actionUrl?: string;
  };
}

export interface LineChannelState {
  channelId: string;
  channelName: string;
  isConnected: boolean;
  autoReplyEnabled: boolean;
  simulatedMessages: LineChatMessage[];
}

export interface GoogleIntegrationState {
  isConnected: boolean;
  accountEmail: string;
  lastDriveBackup?: string;
  autoBackupEnabled: boolean;
  driveFolderName: string;
}

export interface VoiceState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  parsedIntent?: {
    type: 'expense' | 'schedule' | 'task' | 'note';
    data: any;
    summary: string;
  };
}

export type ActiveTab = 'home' | 'slips' | 'schedule' | 'notes' | 'line' | 'activity';
