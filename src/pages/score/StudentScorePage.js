import { Paper, Stack, Typography, useMediaQuery } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../../components/BackButton";
import Header from "../../components/Header";
import Loading from "../../components/Loading";
import { getClassCourseByIDFromDB } from "../../database/classCourse";
import {
  getClassCourseScoresFromDB,
  getStudentScoresByScoreIdsAndStudentId,
} from "../../database/score";
import { splitArrayIntoChunks } from "../../utils/utils";

const StudentScorePage = () => {
  const navigate = useNavigate();
  const { id: classCourseId } = useParams();
  const user = useSelector((state) => state.user);

  const [isLoading, setIsLoading] = useState(true);
  const [classCourse, setClassCourse] = useState(null);
  const [studentScores, setStudentScores] = useState([]);
  const [scores, setScores] = useState([]);

  const studentScoreMap = useMemo(() => {
    const tempMap = new Map();
    studentScores.forEach((studentScore) => {
      tempMap.set(studentScore.scoreId, studentScore);
    });

    return tempMap;
  }, [studentScores]);

  useEffect(() => {
    async function getStudentScores() {
      setIsLoading(true);
      try {
        const fetchedClassCourse = await getClassCourseByIDFromDB(
          classCourseId
        );
        setClassCourse(fetchedClassCourse);

        const fetchedScores = await getClassCourseScoresFromDB(classCourseId);
        setScores(fetchedScores);
        const scoreIds = fetchedScores.map((score) => score.id);

        if (scoreIds.length > 30) {
          const scoreIdBatches = splitArrayIntoChunks(scoreIds, 30);
          const getStudentScoreBatches = [];
          scoreIdBatches.forEach((scoreIdBatch) =>
            getStudentScoreBatches.push(
              getStudentScoresByScoreIdsAndStudentId(scoreIdBatch, user.id)
            )
          );
          const fetchedStudentScoreBatches = await Promise.all(
            getStudentScoreBatches
          );
          setStudentScores(fetchedStudentScoreBatches.flat());
        } else {
          const fetchedStudentScores =
            await getStudentScoresByScoreIdsAndStudentId(scoreIds, user.id);
          setStudentScores(fetchedStudentScores);
        }
      } catch (error) {
        console.log(error);
      }
      setIsLoading(false);
    }
    getStudentScores();
  }, [classCourseId, user]);

  return (
    <Stack
      minHeight="100vh"
      bgcolor="background.default"
      spacing={!isLoading ? 3 : 0}
    >
      <Header />
      {!isLoading ? (
        <Stack
          spacing={2}
          px={{
            xs: 2,
            sm: 4,
            md: 6,
            lg: 8,
            xl: 10,
          }}
        >
          <BackButton
            onClick={() => navigate(`/class-courses/${classCourseId}`)}
          />
          <Typography
            textAlign="center"
            fontSize={{
              xs: "18px",
              md: "20px",
            }}
          >
            Nilai
            <br />
            {`${classCourse.className} ${classCourse.courseName}`}
          </Typography>{" "}
          <Stack alignItems="center" mt="32px !important" px={2}>
            <Paper elevation={3} sx={{ maxWidth: "900px", width: 1, p: 2 }}>
              <Grid container columns={10} columnSpacing={2} rowSpacing={2}>
                {scores.map((score) =>
                  studentScoreMap.has(score.id) ? (
                    <StudentScoreItem
                      key={studentScoreMap.get(score.id).id}
                      score={studentScoreMap.get(score.id).score}
                      scoreName={score.name}
                    />
                  ) : null
                )}
              </Grid>
            </Paper>
          </Stack>
        </Stack>
      ) : (
        <Stack justifyContent="center" alignItems="center" flex={1}>
          <Loading />
        </Stack>
      )}
    </Stack>
  );
};

const StudentScoreItem = ({ score, scoreName }) => {
  const isSmallMobile = useMediaQuery("(max-width:400px)");
  return (
    <Grid xs={isSmallMobile ? 5 : 3.3} sm={2.5} md={2}>
      <Stack alignItems="center">
        <Typography fontWeight="bold">{scoreName}</Typography>
        <Typography>{score}</Typography>
      </Stack>
    </Grid>
  );
};

export default StudentScorePage;
