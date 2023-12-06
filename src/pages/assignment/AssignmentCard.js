import { NavigateNextRounded } from "@mui/icons-material";
import { IconButton, Paper, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { formatDateToString } from "../../utils/utils";

const AssignmentCard = ({ classCourseId, assignment }) => {
  const navigate = useNavigate();

  const tugasId = assignment.id;
  const onViewAssignment = () => {
    navigate(`/class-courses/${classCourseId}/assignments/${tugasId}`);
  };

  const lewatDeadline = () => {
    const datenow = new Date();

    if (assignment.deadline < datenow) {
      return true;
    } else return false;
  };

  const mendekatiDeadline = () => {
    const datenow = new Date();
    const endate = assignment.deadline;
    var seconds = (endate.getTime() - datenow.getTime()) / 1000;
    var hour = seconds / 3600;

    if (hour <= 24) return true;
    else return false;
  };

  return (
    <Paper elevation={3}>
      <Stack
        direction="row"
        py={2}
        pl={4}
        pr={2}
        justifyContent="space-between"
      >
        <Stack spacing={1}>
          <Typography fontWeight="bold">{assignment.title}</Typography>

          <Stack spacing={1} direction="row">
            <Typography fontSize="12px">Batas Waktu:</Typography>
            {lewatDeadline() ? (
              <Typography fontSize="12px" color="crimson">
                {formatDateToString(assignment.deadline)}
              </Typography>
            ) : mendekatiDeadline() ? (
              <Typography fontSize="12px" color="#DAA520">
                {formatDateToString(assignment.deadline)}
              </Typography>
            ) : (
              <Typography fontSize="12px">
                {formatDateToString(assignment.deadline)}
              </Typography>
            )}
          </Stack>
        </Stack>

        <Stack justifyContent="center">
          <IconButton onClick={onViewAssignment}>
            <NavigateNextRounded sx={{ color: "#000", fontSize: "32px" }} />
          </IconButton>
        </Stack>
      </Stack>
    </Paper>
  );
};
export default AssignmentCard;
