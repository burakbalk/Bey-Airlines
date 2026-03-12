import { generateFlightResults, generateFlights, generateFlightsForDate } from '../utils/flightSchedule';

export const flightResults = generateFlightResults();

export const flights = generateFlights();

export const getFlightsForDate = generateFlightsForDate;
