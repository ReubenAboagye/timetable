import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility function for combining Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Format time from HH:mm to 12-hour format
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

// Convert 12-hour format to 24-hour format
export function convertTo24Hour(time: string): string {
  const [timeStr, period] = time.split(' ');
  let [hours, minutes] = timeStr.split(':');
  let hour = parseInt(hours);
  
  if (period === 'PM' && hour !== 12) {
    hour += 12;
  } else if (period === 'AM' && hour === 12) {
    hour = 0;
  }
  
  return `${hour.toString().padStart(2, '0')}:${minutes}`;
}

// Get day name from day enum
export function getDayName(day: string): string {
  const dayNames: Record<string, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  };
  return dayNames[day] || day;
}

// Get short day name
export function getShortDayName(day: string): string {
  const shortDayNames: Record<string, string> = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun',
  };
  return shortDayNames[day] || day;
}

// Get room type display name
export function getRoomTypeName(type: string): string {
  const typeNames: Record<string, string> = {
    lecture_hall: 'Lecture Hall',
    laboratory: 'Laboratory',
    computer_lab: 'Computer Lab',
    seminar_room: 'Seminar Room',
    auditorium: 'Auditorium',
    tutorial_room: 'Tutorial Room',
  };
  return typeNames[type] || type;
}

// Get assignment type display name
export function getAssignmentTypeName(type: string): string {
  const typeNames: Record<string, string> = {
    dedicated: 'Dedicated',
    preferred: 'Preferred',
    restricted: 'Restricted',
  };
  return typeNames[type] || type;
}

// Get assignment type color
export function getAssignmentTypeColor(type: string): string {
  const colors: Record<string, string> = {
    dedicated: 'bg-green-100 text-green-800 border-green-200',
    preferred: 'bg-blue-100 text-blue-800 border-blue-200',
    restricted: 'bg-red-100 text-red-800 border-red-200',
  };
  return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
}

// Get room type color
export function getRoomTypeColor(type: string): string {
  const colors: Record<string, string> = {
    lecture_hall: 'bg-purple-100 text-purple-800 border-purple-200',
    laboratory: 'bg-orange-100 text-orange-800 border-orange-200',
    computer_lab: 'bg-blue-100 text-blue-800 border-blue-200',
    seminar_room: 'bg-green-100 text-green-800 border-green-200',
    auditorium: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    tutorial_room: 'bg-pink-100 text-pink-800 border-pink-200',
  };
  return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
}

// Format date to readable string
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

// Format date to short string
export function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

// Get current academic year
export function getCurrentAcademicYear(): string {
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  return `${currentYear}-${nextYear}`;
}

// Check if time slot conflicts with another
export function hasTimeConflict(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const start1Time = new Date(`2000-01-01T${start1}`);
  const end1Time = new Date(`2000-01-01T${end1}`);
  const start2Time = new Date(`2000-01-01T${start2}`);
  const end2Time = new Date(`2000-01-01T${end2}`);

  return start1Time < end2Time && start2Time < end1Time;
}

// Get time slot duration in minutes
export function getTimeSlotDuration(startTime: string, endTime: string): number {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
}

// Validate time format (HH:mm)
export function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

// Sort time slots by start time
export function sortTimeSlots(timeSlots: { startTime: string; endTime: string }[]): typeof timeSlots {
  return [...timeSlots].sort((a, b) => {
    const timeA = new Date(`2000-01-01T${a.startTime}`);
    const timeB = new Date(`2000-01-01T${b.startTime}`);
    return timeA.getTime() - timeB.getTime();
  });
}

// Get working days array
export function getWorkingDaysArray(): Array<{ value: string; label: string }> {
  return [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ];
}

// Get room types array
export function getRoomTypesArray(): Array<{ value: string; label: string }> {
  return [
    { value: 'lecture_hall', label: 'Lecture Hall' },
    { value: 'laboratory', label: 'Laboratory' },
    { value: 'computer_lab', label: 'Computer Lab' },
    { value: 'seminar_room', label: 'Seminar Room' },
    { value: 'auditorium', label: 'Auditorium' },
    { value: 'tutorial_room', label: 'Tutorial Room' },
  ];
}

// Get assignment types array
export function getAssignmentTypesArray(): Array<{ value: string; label: string }> {
  return [
    { value: 'dedicated', label: 'Dedicated' },
    { value: 'preferred', label: 'Preferred' },
    { value: 'restricted', label: 'Restricted' },
  ];
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Local storage helpers
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      
      const parsed = JSON.parse(item);
      
      // Handle date conversion for arrays
      if (Array.isArray(parsed)) {
        return parsed.map(item => {
          if (item && typeof item === 'object') {
            // Convert date strings back to Date objects
            if (item.startDate && typeof item.startDate === 'string') {
              item.startDate = new Date(item.startDate);
            }
            if (item.endDate && typeof item.endDate === 'string') {
              item.endDate = new Date(item.endDate);
            }
            if (item.createdAt && typeof item.createdAt === 'string') {
              item.createdAt = new Date(item.createdAt);
            }
            if (item.updatedAt && typeof item.updatedAt === 'string') {
              item.updatedAt = new Date(item.updatedAt);
            }
          }
          return item;
        }) as T;
      }
      
      return parsed;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      // Convert Date objects to ISO strings for storage
      const serializedValue = JSON.stringify(value, (key, val) => {
        if (val instanceof Date) {
          return val.toISOString();
        }
        return val;
      });
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
};
