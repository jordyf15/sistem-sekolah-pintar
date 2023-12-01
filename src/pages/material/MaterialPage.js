import { ExpandMoreRounded, MoreVertRounded } from "@mui/icons-material";
import {
  Accordion,
  AccordionSummary,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../../components/BackButton";
import Header from "../../components/Header";
import Loading from "../../components/Loading";
import SuccessSnackbar from "../../components/SuccessSnackbar";
import ThemedButton from "../../components/ThemedButton";
import { getClassCourseByIDFromDB } from "../../database/classCourse";
import { getClassCourseTopicsFromDB } from "../../database/material";
import AddMaterialDialog from "./AddMaterialDialog";
import CreateTopicDialog from "./CreateTopicDialog";

const MaterialPage = () => {
  const { id: classCourseId } = useParams();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user);

  const [isCreateTopicDialogOpen, setIsCreateTopicDialogOpen] = useState(false);
  const [successSnackbarMsg, setSuccessSnackbarMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [classCourse, setClassCourse] = useState(null);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    async function getClassCourseAndMaterials() {
      setIsLoading(true);

      try {
        const fetchedClassCourse = await getClassCourseByIDFromDB(
          classCourseId
        );
        setClassCourse(fetchedClassCourse);

        const fetchedTopics = await getClassCourseTopicsFromDB(classCourseId);

        setTopics(fetchedTopics);
      } catch (error) {
        console.log(error);
      }
      setIsLoading(false);
    }

    getClassCourseAndMaterials();
  }, [classCourseId]);

  useEffect(() => {
    console.log("topics", topics);
  }, [topics]);

  const handleCloseSuccessSnackbar = () => {
    setSuccessSnackbarMsg("");
  };

  const handleSuccessCreateTopic = (topic) => {
    setTopics([topic].concat(topics));
    setSuccessSnackbarMsg("Topik berhasil dibuat");
  };

  const handleSuccessAddMaterial = (topicId, material) => {
    const editedTopic = topics.filter((topic) => topic.id === topicId)[0];

    const addedMaterial = {
      name: material.name,
    };

    if (material.link) {
      addedMaterial.link = material.link;
    } else {
      addedMaterial.fileName = material.fileName;
    }

    editedTopic.materials[material.id] = addedMaterial;

    setTopics(
      topics.map((topic) => (topic.id === topicId ? editedTopic : topic))
    );
    setSuccessSnackbarMsg("Material berhasil ditambah");
  };

  return (
    <Stack
      minHeight="100vh"
      bgcolor="background.default"
      spacing={!isLoading ? 3 : 0}
    >
      <Header />
      {!isLoading ? (
        <>
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
              Materi Pelajaran
              <br />
              {`${classCourse.className} ${classCourse.courseName}`}
            </Typography>
            {user.role === "teacher" && (
              <Stack alignItems="flex-end">
                <ThemedButton
                  onClick={() => setIsCreateTopicDialogOpen(true)}
                  sx={{ px: 2.5 }}
                  size="small"
                >
                  Buat Topik
                </ThemedButton>
              </Stack>
            )}
            <Stack spacing={4}>
              {topics.map((topic) => (
                <TopicDetail
                  key={topic.id}
                  topic={topic}
                  onAddMaterialSuccess={handleSuccessAddMaterial}
                />
              ))}
            </Stack>
            <CreateTopicDialog
              open={isCreateTopicDialogOpen}
              setOpen={setIsCreateTopicDialogOpen}
              onSuccess={handleSuccessCreateTopic}
            />
          </Stack>
        </>
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

const TopicDetail = ({ topic, onAddMaterialSuccess }) => {
  const user = useSelector((state) => state.user);

  const [isAddMaterialDialogOpen, setIsAddMaterialDialogOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const isMenuOpen = Boolean(menuAnchorEl);

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  return (
    <>
      <Accordion>
        <AccordionSummary
          sx={{
            flexDirection: "row-reverse",
            "& .MuiSvgIcon-root": {
              color: "#000",
            },
          }}
          expandIcon={<ExpandMoreRounded />}
        >
          <Stack
            direction="row"
            flex={1}
            ml={1}
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography>{topic.name}</Typography>
            {user.role === "teacher" && (
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuAnchorEl(e.currentTarget);
                }}
              >
                <MoreVertRounded sx={{ color: "#000", fontSize: "28px" }} />
              </IconButton>
            )}
          </Stack>
        </AccordionSummary>
        <Menu
          onClose={handleCloseMenu}
          anchorEl={menuAnchorEl}
          open={isMenuOpen}
        >
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              setIsAddMaterialDialogOpen(true);
            }}
          >
            Tambah Materi
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleCloseMenu();
            }}
          >
            Edit Topik
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleCloseMenu();
            }}
          >
            Hapus Topik
          </MenuItem>
        </Menu>
      </Accordion>
      <AddMaterialDialog
        open={isAddMaterialDialogOpen}
        setOpen={setIsAddMaterialDialogOpen}
        topic={topic}
        onSuccess={onAddMaterialSuccess}
      />
    </>
  );
};

export default MaterialPage;
