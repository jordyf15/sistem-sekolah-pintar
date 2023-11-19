import { Stack } from "@mui/material";
import {
  dummyAnnouncement1,
  dummyAnnouncement2,
  dummyAnnouncement3,
  dummyClass1,
  dummyClass2,
  dummyClassCourse1,
  dummyClassCourse2,
  dummyClassCourse3,
  dummyClassCourse4,
  dummyCourse1,
  dummyCourse2,
  dummyParent1,
  dummySchedule1,
  dummySchedule2,
  dummySchedule3,
  dummySchedule4,
  dummySchedule5,
  dummySchedule6,
  dummySchedule7,
  dummySchedule8,
  dummySchool,
  dummyStudent1,
  dummyStudent2,
  dummyStudentParent1,
  dummyTeacher1,
  dummyTeacher2,
} from "../dummyData";
import {
  addAnnouncementToDB,
  addClassCoursesToDB,
  addClassToDB,
  addCourseToDB,
  addScheduleToDB,
  addSchoolToDB,
  addStudentParent,
  addUserToDB,
} from "../utils/firestore";

const TestPage = () => {
  const testAddStudent = () => {
    addUserToDB(dummyStudent2);
    addUserToDB(dummyStudent1);
  };

  const testAddParent = () => {
    addUserToDB(dummyParent1);
    addStudentParent(dummyStudentParent1);
  };

  const testAddTeacher = () => {
    addUserToDB(dummyTeacher1);
    addUserToDB(dummyTeacher2);
  };

  const testAddClass = () => {
    addClassToDB(dummyClass1);
    addClassToDB(dummyClass2);
  };

  const testAddCourses = () => {
    addCourseToDB(dummyCourse1);
    addClassCoursesToDB([dummyClassCourse1, dummyClassCourse2]);
    addCourseToDB(dummyCourse2);
    addClassCoursesToDB([dummyClassCourse3, dummyClassCourse4]);
  };

  const testAddSchedule = () => {
    addScheduleToDB(dummySchedule1);
    addScheduleToDB(dummySchedule2);
    addScheduleToDB(dummySchedule3);
    addScheduleToDB(dummySchedule4);
    addScheduleToDB(dummySchedule5);
    addScheduleToDB(dummySchedule6);
    addScheduleToDB(dummySchedule7);
    addScheduleToDB(dummySchedule8);
  };

  const testAddAnnouncement = () => {
    addAnnouncementToDB(dummyAnnouncement1);
    addAnnouncementToDB(dummyAnnouncement2);
    addAnnouncementToDB(dummyAnnouncement3);
  };

  const testAddSchool = () => {
    addSchoolToDB(dummySchool);
  };
  return (
    <Stack>
      <button onClick={testAddStudent}>test student</button>
      <button onClick={testAddParent}>test parent</button>
      <button onClick={testAddTeacher}>test teacher</button>
      <button onClick={testAddClass}>test class</button>
      <button onClick={testAddCourses}>test courses</button>
      <button onClick={testAddSchedule}>test schedule</button>
      <button onClick={testAddAnnouncement}>test announcement</button>
      <button onClick={testAddSchool}>test school</button>
    </Stack>
  );
};

export default TestPage;
