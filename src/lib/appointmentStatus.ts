export const APPOINTMENT_STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Task Pending',
  received: 'Task Received',
  ongoing: 'Ongoing',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function getStatusLabel(status: string): string {
  return APPOINTMENT_STATUS_LABEL[status] || status;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'confirmed':
      return 'bg-indigo-100 text-indigo-800';
    case 'received':
      return 'bg-sky-100 text-sky-800';
    case 'ongoing':
      return 'bg-orange-100 text-orange-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}