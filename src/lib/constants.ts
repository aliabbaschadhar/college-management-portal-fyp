/**
 * Shared domain constants for the College Management Portal.
 */

export const DEPARTMENTS = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "English",
  "Chemistry",
  "Economics",
  "Political Science",
  "Zoology",
  "Urdu",
  "Islamic Studies",
] as const;

export type Department = (typeof DEPARTMENTS)[number];
