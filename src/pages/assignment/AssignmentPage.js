import { NavigateNextRounded } from "@mui/icons-material";
import AssignmentIcon from '@mui/icons-material/Assignment';
import { IconButton, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import BackButton from "../../components/BackButton";
import Header from "../../components/Header";
import Loading from "../../components/Loading";
import SuccessSnackbar from "../../components/SuccessSnackbar";
import ThemedButton from "../../components/ThemedButton";
import { getClassCourseAssignmentsFromDB } from "../../database/assignment";
import { getClassCourseByIDFromDB } from "../../database/classCourse";
import { formatDateToString } from "../../utils/utils";
import CreateAssignmentDialog from "./CreateAssignmentDialog";

const AssignmentPage = () => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const { id: classCourseId } = useParams();

  const [classCourse, setClassCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [isCreateAssignmentDialogOpen, setIsCreateAssignmentDialogOpen] =
    useState(false);
  const [successSnackbarMsg, setSuccessSnackbarMsg] = useState(
    location.state?.justDeleted ? "Tugas berhasil dihapus" : ""
  );

  useEffect(() => {
    async function getClassCourseAndAssignment() {
      setIsLoading(true);

      try {
        const fetchedClassCourse = await getClassCourseByIDFromDB(
          classCourseId
        );
        setClassCourse(fetchedClassCourse);

        const fetchedAssignments = await getClassCourseAssignmentsFromDB(
          classCourseId
        );
        setAssignments(fetchedAssignments);
      } catch (error) {
        console.log(error);
      }

      setIsLoading(false);
    }

    getClassCourseAndAssignment();
  }, [classCourseId]);

  const handleCloseSuccessSnackbar = () => {
    setSuccessSnackbarMsg("");
  };

  return (
    <Stack
      spacing={!isLoading ? 3 : 0}
      bgcolor="background.default"
      minHeight="100vh"
    >
      <Header />
      {!isLoading ? (
        <Stack
          spacing={4}
          px={{
            xs: 2,
            sm: 4,
            md: 6,
            lg: 8,
            xl: 10,
          }}
        >
          <Stack spacing={2}>
            <BackButton
              onClick={() => {
                navigate(`/class-courses/${classCourseId}`);
              }}
            />
            <Typography
              textAlign="center"
              fontSize={{
                xs: "18px",
                md: "20px",
              }}
            >
              Daftar Tugas
              <br />
              {`${classCourse.className} ${classCourse.courseName}`}
            </Typography>
            {user.role === "teacher" && (
              <Stack alignItems="flex-end">
                <ThemedButton
                  onClick={() => setIsCreateAssignmentDialogOpen(true)}
                  sx={{ px: 2.5 }}
                  size="small"
                >
                  Buat Tugas
                </ThemedButton>
              </Stack>
            )}

            <Stack spacing={4} pb={4} px={{ xs: 0, sm: 4 }}>
              {assignments.map((assigment) => (
                <AssignmentCard key={assigment.id} assignment={assigment} />
              ))}
            </Stack>
          </Stack>
          <CreateAssignmentDialog
            open={isCreateAssignmentDialogOpen}
            setOpen={setIsCreateAssignmentDialogOpen}
          />
        </Stack>
      ) : (
        <Stack justifyContent="center" alignItems="center" flex={1}>
          <Loading />
        </Stack>
      )}
      <SuccessSnackbar
        text={successSnackbarMsg}
        onClose={handleCloseSuccessSnackbar}
      />
    </Stack>
  );
};

const AssignmentCard = ({ assignment }) => {
  const navigate = useNavigate();
  const { id: classCourseId } = useParams();

  return (
    <Paper elevation={3}>
      <Stack direction="row" justifyContent="space-between">
        
        <Stack direction="row" >

          <Stack justifyContent="center" paddingLeft={1}  >
          <AssignmentIcon sx={{fontSize: "48px"}}/>
          </Stack>

          <Stack
          direction="row"
          py={2}
          pl={1}
          
          >
            <Stack spacing={1}>
              <Typography fontWeight="bold">{assignment.title}</Typography>
              <Typography fontSize={{ xs: "12px", sm: "14px" }}>
                Batas Waktu:{" "}
                <Typography component="span" fontSize={{ xs: "12px", sm: "14px" }}>
                  {formatDateToString(assignment.deadline)}
                </Typography>
              </Typography>
            </Stack>
          
          </Stack>
        </Stack>

        

      <Stack justifyContent="center" pr={2}>
          <IconButton
            onClick={() =>
              navigate(
                `/class-courses/${classCourseId}/assignments/${assignment.id}`
              )
            }
          >
            <NavigateNextRounded sx={{ color: "#000", fontSize: "32px" }} />
          </IconButton>
        </Stack>

      </Stack>
      
    </Paper>
  );
};

export default AssignmentPage;
