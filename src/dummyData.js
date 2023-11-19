export const dummySchool = {
  id: "a69111e9-e91f-4e12-9ee0-5a954982576e",
  name: "school1",
  currentSchoolYear: "2023/2024",
};

export const dummyStudent1 = {
  id: "81d9b244-2426-41c0-9102-a1f366cb1515",
  fullname: "fullnameStudent1",
  username: "usernameStudent1",
  phonenumber: "081212341234",
  password: "passwordStudent1",
  schoolId: dummySchool.id,
  role: "student",
  profileImage: "/profile-image/default.jpg",
};

export const dummyStudent2 = {
  id: "558c4b4e-bd9d-4bb4-bad1-495fca6d20b5",
  fullname: "fullnameStudent2",
  username: "usernameStudent2",
  phonenumber: "081211111111",
  password: "passwordStudent2",
  schoolId: dummySchool.id,
  role: "student",
  profileImage: "/profile-image/default.jpg",
};

export const dummyTeacher1 = {
  id: "af8229e5-f7ca-44ae-9b9a-a12596d963f4",
  fullname: "fullnameTeacher1",
  username: "usernameTeacher1",
  phonenumber: "081222222222",
  password: "passwordTeacher1",
  schoolId: dummySchool.id,
  role: "teacher",
  profileImage: "/profile-image/default.jpg",
};

export const dummyTeacher2 = {
  id: "5f2fa208-4372-49a2-a6f9-e57f4ef2cbce",
  fullname: "fullnameTeacher2",
  username: "usernameTeacher2",
  phonenumber: "081233333333",
  password: "passwordTeacher2",
  schoolId: dummySchool.id,
  role: "teacher",
  profileImage: "/profile-image/default.jpg",
};

export const dummyParent1 = {
  id: "ae8e6418-0563-45b4-bf53-658f1ee63c0f",
  fullname: "fullnameParent1",
  username: "usernameParent1",
  phonenumber: "081244444444",
  password: "passwordParent1",
  schoolId: dummySchool.id,
  role: "parent",
  profileImage: "/profile-image/default.jpg",
};

export const dummyStudentParent1 = {
  id: "894f3858-6b8d-4534-b568-b1ac616121a2",
  parentId: dummyParent1.id,
  studentIds: [dummyStudent1.id, dummyStudent2.id],
};

export const dummyClass1 = {
  id: "43542319-2601-4a19-b691-1541367508d4",
  name: "Kelas 7A",
  homeroomTeacherId: dummyTeacher1.id,
  schoolYear: "2023/2024",
  schoolId: dummySchool.id,
  studentIds: [dummyStudent1.id],
};

export const dummyClass2 = {
  id: "fae9c417-56be-45e8-8eaf-b435d709e5ad",
  name: "Kelas 8B",
  homeroomTeacherId: dummyTeacher2.id,
  schoolYear: "2023/2024",
  schoolId: dummySchool.id,
  studentIds: [dummyStudent2.id],
};

export const dummyCourse1 = {
  id: "750ed05a-170c-4618-b539-de1d0663f3fb",
  name: "Matematika",
  teacherId: dummyTeacher1.id,
  schoolId: dummySchool.id,
};

export const dummyCourse2 = {
  id: "cad2dd67-5986-4c52-ab31-206171eae2e4",
  name: "Biologi",
  teacherId: dummyTeacher2.id,
  schoolId: dummySchool.id,
};

export const dummyClassCourse1 = {
  id: "9a9918bb-ad7c-46ed-bd73-914552f065b3",
  classId: dummyClass1.id,
  courseId: dummyCourse1.id,
};

export const dummyClassCourse2 = {
  id: "87c5fdcc-55f2-42a5-97d2-ab17b2af51af",
  classId: dummyClass1.id,
  courseId: dummyCourse2.id,
};

export const dummyClassCourse3 = {
  id: "6ec9a853-402c-4c1e-bd5a-140a1681596e",
  classId: dummyClass2.id,
  courseId: dummyCourse1.id,
};

export const dummyClassCourse4 = {
  id: "d52b41d3-2f72-4815-8867-1370a4184e06",
  classId: dummyClass2.id,
  courseId: dummyCourse2.id,
};

export const dummyAnnouncementAttachment1 = {
  id: "243fa591-e4fa-44db-8be9-711602041678",
  name: "attachment1.docx",
};

export const dummyAnnouncementAttachment2 = {
  id: "103084cb-db94-4347-8128-744ac4a431b5",
  name: "attachment2.docx",
};

const attachments = {
  [dummyAnnouncementAttachment1.id]: dummyAnnouncementAttachment1.name,
  [dummyAnnouncementAttachment2.id]: dummyAnnouncementAttachment2.name,
};

export const dummyAnnouncement1 = {
  id: "90a28b9f-95c5-4789-97d6-3d7060deb672",
  title: "titleAnnouncement1",
  description: "descriptionAnnouncement1",
  createdAt: new Date(),
  target: "all",
  targetIds: [],
  schoolId: dummySchool.id,
  attachments: attachments,
};

export const dummyAnnouncement2 = {
  id: "1ec2d0c0-6434-4266-a829-febea248012b",
  title: "titleAnnouncement2",
  description: "descriptionAnnouncement2",
  createdAt: new Date(),
  target: "individual",
  targetIds: [dummyStudent1.id],
  schoolId: dummySchool.id,
  attachments: attachments,
};

export const dummyAnnouncement3 = {
  id: "b13bc48b-5bb5-4019-b3fc-6ec0985003ab",
  title: "titleAnnouncement3",
  description: "descriptionAnnouncement3",
  createdAt: new Date(),
  target: "class",
  targetIds: [dummyClass1.id],
  schoolId: dummySchool.id,
  attachments: attachments,
};

export const dummySchedule1 = {
  id: "fa47eec4-3eeb-48ea-83bf-1a5898654779",
  classCourseId: dummyClassCourse1.id,
  startTime: new Date("November 20, 2023 07:00:00"),
  endTime: new Date("November 20, 2023 09:00:00"),
};

export const dummySchedule2 = {
  id: "348ddb29-a055-47a0-b34a-289e7fc19157",
  classCourseId: dummyClassCourse1.id,
  startTime: new Date("November 21, 2023 07:00:00"),
  endTime: new Date("November 21, 2023 09:00:00"),
};

export const dummySchedule3 = {
  id: "d8435594-bcd5-4df6-8dae-17ecc5aa32d6",
  classCourseId: dummyClassCourse2.id,
  startTime: new Date("November 20, 2023 09:00:00"),
  endTime: new Date("November 20, 2023 11:00:00"),
};

export const dummySchedule4 = {
  id: "a2c00863-4ee3-4452-84d8-66da419c7bc6",
  classCourseId: dummyClassCourse2.id,
  startTime: new Date("November 21, 2023 09:00:00"),
  endTime: new Date("November 21, 2023 11:00:00"),
};

export const dummySchedule5 = {
  id: "b61a3a05-4b0f-40a3-ba76-6f520f24e79f",
  classCourseId: dummyClassCourse3.id,
  startTime: new Date("November 20, 2023 09:00:00"),
  endTime: new Date("November 20, 2023 11:00:00"),
};

export const dummySchedule6 = {
  id: "77f16429-34fe-4b5b-8d7a-587989c0dab6",
  classCourseId: dummyClassCourse3.id,
  startTime: new Date("November 21, 2023 09:00:00"),
  endTime: new Date("November 21, 2023 11:00:00"),
};

export const dummySchedule7 = {
  id: "8f136ff1-775a-45ca-b321-47f30c21c2ff",
  classCourseId: dummyClassCourse4.id,
  startTime: new Date("November 20, 2023 07:00:00"),
  endTime: new Date("November 20, 2023 09:00:00"),
};

export const dummySchedule8 = {
  id: "42510566-8433-4a7e-a590-bb54ac450f32",
  classCourseId: dummyClassCourse4.id,
  startTime: new Date("November 21, 2023 07:00:00"),
  endTime: new Date("November 21, 2023 09:00:00"),
};
