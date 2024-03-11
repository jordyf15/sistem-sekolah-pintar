import { ExpandLessRounded, ExpandMoreRounded } from "@mui/icons-material";
import {
  Box,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import Loading from "../../components/Loading";
import Searchbar from "../../components/Searchbar";
import SuccessSnackbar from "../../components/SuccessSnackbar";
import ThemedButton from "../../components/ThemedButton";
import { getAllClassCoursesForAdminFromDB } from "../../database/classCourse";
import { getUserByIdsFromDB } from "../../database/user";
import { splitArrayIntoChunks } from "../../utils/utils";
import DeleteClassCourseDialog from "./DeleteClassCourseDialog";

const tableCellStyle = {
  borderRight: "1px solid #000",
  borderBottom: "1px solid #000",
  pl: 2,
  pr: 0,
  py: 0,
  width: "150px",
  boxSizing: "border-box",
  minWidth: "145px",
  bgcolor: "#fff",
  height: "45px",
};

const AdminClassCoursesTab = () => {
  const [classCourses, setClassCourses] = useState([]);
  const [teachers, setTeachers] = useState(new Map());
  const [filter, setFilter] = useState("");
  const [lastActiveYearSort, setLastActiveYearSort] = useState("asc");
  const [isLoading, setIsLoading] = useState(true);
  const [successSnackbarMsg, setSuccessSnackbarMsg] = useState("");

  useEffect(() => {
    async function getClassCoursesAndTeachers() {
      try {
        setIsLoading(true);

        const fetchedClassCourses = await getAllClassCoursesForAdminFromDB();
        setClassCourses(fetchedClassCourses);

        const teacherIds = fetchedClassCourses.map(
          (classCourse) => classCourse.teacherId
        );

        let fetchedTeachers;
        if (teacherIds.length > 30) {
          const teacherIdBatches = splitArrayIntoChunks(teacherIds, 30);
          const getTeacherBatches = [];
          teacherIdBatches.forEach((teacherIdBatch) =>
            getTeacherBatches.push(getUserByIdsFromDB(teacherIdBatch))
          );

          const fetchedTeacherBatches = await Promise.all(getTeacherBatches);
          fetchedTeachers = fetchedTeacherBatches.flat();
        } else {
          fetchedTeachers = await getUserByIdsFromDB(teacherIds);
        }

        const teacherMap = new Map();
        fetchedTeachers.forEach((teacher) => {
          teacherMap.set(teacher.id, teacher);
        });

        setTeachers(teacherMap);
      } catch (error) {
        console.log(error);
      }
      setIsLoading(false);
    }

    getClassCoursesAndTeachers();
  }, []);

  const displayedClassCourses = useMemo(() => {
    return classCourses
      .filter(
        (classCourse) =>
          classCourse.className.toLowerCase().includes(filter.toLowerCase()) ||
          classCourse.courseName.toLowerCase().includes(filter.toLowerCase()) ||
          classCourse.schoolYear.toLowerCase().includes(filter.toLowerCase()) ||
          teachers
            .get(classCourse.teacherId)
            .userNumber.toString()
            .includes(filter.toLowerCase()) ||
          teachers
            .get(classCourse.teacherId)
            .fullname.toLowerCase()
            .includes(filter.toLowerCase()) ||
          (classCourse.isActive ? "aktif" : "tidak aktif").includes(
            filter.toLowerCase()
          ) ||
          classCourse.lastActiveYear.toString().includes(filter)
      )
      .sort((a, b) =>
        lastActiveYearSort === "asc"
          ? a.lastActiveYear - b.lastActiveYear
          : b.lastActiveYear - a.lastActiveYear
      );
  }, [classCourses, teachers, lastActiveYearSort, filter]);

  const handleSuccessDelete = (deletedClassCourseId) => {
    setClassCourses(
      classCourses.filter(
        (classCourse) => classCourse.id !== deletedClassCourseId
      )
    );
    setSuccessSnackbarMsg("Kelas berhasil dihapus");
  };

  const toggleLastActiveYearSort = () => {
    if (lastActiveYearSort === "asc") {
      setLastActiveYearSort("desc");
    } else {
      setLastActiveYearSort("asc");
    }
  };

  return (
    <>
      <Searchbar
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter kelas berdasarkan nama kelas, nama mata pelajaran, tahun ajaran, guru, status kelas, atau tahun terakhir aktif"
      />
      <TableContainer component={Paper}>
        <Table
          sx={{
            borderCollapse: "separate",
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  "&.MuiTableCell-root": {
                    ...tableCellStyle,
                    position: "sticky",
                    left: 0,
                    zIndex: 5,
                  },
                }}
                style={{ backgroundColor: "	#cbcbcb" }}
              >
                Nama Kelas
              </TableCell>
              <TableCell
                sx={{
                  "&.MuiTableCell-root": {
                    ...tableCellStyle,
                  },
                }}
                style={{ backgroundColor: "	#cbcbcb" }}
              >
                Nama Mata Pelajaran
              </TableCell>
              <TableCell
                sx={{
                  "&.MuiTableCell-root": {
                    ...tableCellStyle,
                  },
                }}
                style={{ backgroundColor: "	#cbcbcb" }}
              >
                Tahun Ajaran
              </TableCell>
              <TableCell
                sx={{
                  "&.MuiTableCell-root": {
                    ...tableCellStyle,
                  },
                }}
                style={{ backgroundColor: "	#cbcbcb" }}
              >
                Guru
              </TableCell>
              <TableCell
                sx={{
                  "&.MuiTableCell-root": {
                    ...tableCellStyle,
                  },
                }}
                style={{ backgroundColor: "#cbcbcb", width: "10%" }}
              >
                Status
              </TableCell>
              <TableCell
                sx={{
                  "&.MuiTableCell-root": {
                    ...tableCellStyle,
                  },
                }}
                style={{ backgroundColor: "	#cbcbcb" }}
              >
                <Stack direction="row" alignItems="center">
                  <Typography>Tahun Terakhir Aktif</Typography>
                  <IconButton onClick={toggleLastActiveYearSort}>
                    {lastActiveYearSort === "asc" ? (
                      <ExpandMoreRounded sx={{ color: "#000" }} />
                    ) : (
                      <ExpandLessRounded sx={{ color: "#000" }} />
                    )}
                  </IconButton>
                </Stack>
              </TableCell>
              <TableCell
                sx={{
                  "&.MuiTableCell-root": {
                    ...tableCellStyle,
                  },
                }}
                style={{ backgroundColor: "	#cbcbcb", width: "10%" }}
              ></TableCell>
            </TableRow>
          </TableHead>
          {!isLoading && (
            <TableBody>
              {displayedClassCourses.map((classCourse) => (
                <TableRowClassCourse
                  key={classCourse.id}
                  classCourse={classCourse}
                  teacher={teachers.get(classCourse.teacherId)}
                  onSuccessDelete={handleSuccessDelete}
                />
              ))}
            </TableBody>
          )}
        </Table>
      </TableContainer>
      {isLoading && (
        <Stack justifyContent="center" alignItems="center" flex={1}>
          <Loading />
        </Stack>
      )}
      <Box mb={4} />
      <SuccessSnackbar
        text={successSnackbarMsg}
        onClose={() => setSuccessSnackbarMsg("")}
      />
    </>
  );
};

const TableRowClassCourse = ({ classCourse, teacher, onSuccessDelete }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <TableRow>
      <TableCell
        sx={{
          "&.MuiTableCell-root": {
            ...tableCellStyle,
          },
        }}
      >
        {classCourse.className}
      </TableCell>
      <TableCell
        sx={{
          "&.MuiTableCell-root": {
            ...tableCellStyle,
          },
        }}
      >
        {classCourse.courseName}
      </TableCell>
      <TableCell
        sx={{
          "&.MuiTableCell-root": {
            ...tableCellStyle,
          },
        }}
      >
        {classCourse.schoolYear}
      </TableCell>
      <TableCell
        sx={{
          "&.MuiTableCell-root": {
            ...tableCellStyle,
          },
        }}
      >
        {teacher.userNumber} - {teacher.fullname}
      </TableCell>
      <TableCell
        sx={{
          "&.MuiTableCell-root": {
            ...tableCellStyle,
          },
        }}
        style={{ width: "10%" }}
      >
        <Typography color={classCourse.isActive ? "#44a716" : "#e01d33"}>
          {classCourse.isActive ? "Aktif" : "Tidak aktif"}
        </Typography>
      </TableCell>
      <TableCell
        sx={{
          "&.MuiTableCell-root": {
            ...tableCellStyle,
          },
        }}
      >
        {classCourse.lastActiveYear}
      </TableCell>
      <TableCell
        sx={{
          "&.MuiTableCell-root": {
            ...tableCellStyle,
          },
        }}
        style={{ width: "10%" }}
      >
        <ThemedButton onClick={() => setIsDeleteDialogOpen(true)} size="small">
          Hapus
        </ThemedButton>
      </TableCell>
      <DeleteClassCourseDialog
        open={isDeleteDialogOpen}
        setOpen={setIsDeleteDialogOpen}
        classCourse={classCourse}
        teacher={teacher}
        onSuccess={onSuccessDelete}
      />
    </TableRow>
  );
};

export default AdminClassCoursesTab;
