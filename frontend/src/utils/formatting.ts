export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function formatDistance(meters: number, units: 'metric' | 'imperial' = 'metric'): string {
  if (units === 'imperial') {
    const miles = meters / 1609.34;
    return `${miles.toFixed(2)} mi`;
  }
  const km = meters / 1000;
  return `${km.toFixed(2)} km`;
}

export function formatPace(minPerKm: number | undefined, units: 'metric' | 'imperial' = 'metric'): string {
  if (!minPerKm || !isFinite(minPerKm)) return '--:--';
  
  if (units === 'imperial') {
    // Convert to min/mile
    const minPerMile = minPerKm * 1.60934;
    const min = Math.floor(minPerMile);
    const sec = Math.floor((minPerMile - min) * 60);
    return `${min}:${sec.toString().padStart(2, '0')} /mi`;
  }
  
  const min = Math.floor(minPerKm);
  const sec = Math.floor((minPerKm - min) * 60);
  return `${min}:${sec.toString().padStart(2, '0')} /km`;
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
