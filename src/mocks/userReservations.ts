import { generateUserReservations } from '../utils/flightSchedule';

export const userReservations = generateUserReservations();

export const savedPassengers = [
  {
    id: '1',
    name: 'Ahmet',
    surname: 'Yılmaz',
    tcNo: '12345678901',
    birthDate: '15.06.1985',
    phone: '+90 532 123 4567',
    email: 'ahmet.yilmaz@email.com'
  },
  {
    id: '2',
    name: 'Ayşe',
    surname: 'Yılmaz',
    birthDate: '22.08.1988',
    tcNo: '98765432109',
    phone: '+90 532 765 4321',
    email: 'ayse.yilmaz@email.com'
  }
];
