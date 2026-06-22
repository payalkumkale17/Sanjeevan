import { AQIReading, UserProfile } from '../types';

export function buildGuidance(reading: AQIReading, profile: UserProfile): string[] {
  const suggestions: string[] = [];
  const aqi = reading.currentAqi;
  const hasRespiratoryRisk = profile.healthCondition === 'Asthma / Respiratory' || profile.healthCondition === 'Allergies';

  if (aqi > 150 && hasRespiratoryRisk) {
    suggestions.push('Avoid outdoor exposure and keep rescue medication ready.');
  }

  if (aqi >= 51 && aqi <= 100 && profile.activityPattern === 'Mostly Outdoor') {
    suggestions.push('Limit outdoor activity and avoid peak traffic hours.');
  }

  if (aqi <= 50) {
    suggestions.push('Safe for normal activity; outdoor plans are generally fine.');
  }

  if (aqi > 100 && profile.activityPattern !== 'Mostly Indoor') {
    suggestions.push('Use an N95 mask for essential outdoor trips.');
  }

  const age = parseInt(profile.age, 10);
  const isChild = !isNaN(age) && age <= 12;
  const isElderly = !isNaN(age) && age >= 60;

  if (isChild && aqi > 100) {
    suggestions.push('Keep children indoors during afternoon and evening pollution peaks.');
  }

  if (isElderly && aqi > 80) {
    suggestions.push('Prefer light indoor movement and monitor breathing comfort closely.');
  }

  if (suggestions.length === 0) {
    suggestions.push('Maintain normal routine but review air quality again before long outdoor activity.');
  }

  if (suggestions.length < 2) {
    suggestions.push('Hydrate well and keep windows closed during high-traffic periods.');
  }

  if (suggestions.length < 3) {
    suggestions.push('Check AQI every few hours for changes in exposure risk.');
  }

  return suggestions.slice(0, 3);
}
