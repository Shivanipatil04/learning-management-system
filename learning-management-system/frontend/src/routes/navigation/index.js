import { studentNav } from './studentNav';
import { teacherNav } from './teacherNav';
import { coachingClassAdminNav } from './coachingClassAdminNav';
import { superAdminNav } from './superAdminNav';

export const getNavByRole = (userType) => {
  switch (userType) {
    case 'student':
      return studentNav;
    case 'teacher':
      return teacherNav;
    case 'coachingClassAdmin':
      return coachingClassAdminNav;
    case 'superAdmin':
      return superAdminNav;
    default:
      return [];
  }
};

export default getNavByRole;
