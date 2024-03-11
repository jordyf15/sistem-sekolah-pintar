import {
  Article,
  DownloadRounded,
  ExpandMoreRounded,
  InsertLinkRounded,
  MenuBook,
  MoreVertRounded,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
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
import { getFileDownloadLink } from "../../cloudStorage/cloudStorage";
import BackButton from "../../components/BackButton";
import Header from "../../components/Header";
import Loading from "../../components/Loading";
import SuccessSnackbar from "../../components/SuccessSnackbar";
import ThemedButton from "../../components/ThemedButton";
import { getClassCourseByIDFromDB } from "../../database/classCourse";
import { getClassCourseTopicsFromDB } from "../../database/material";
import AddMaterialDialog from "./AddMaterialDialog";
import CreateTopicDialog from "./CreateTopicDialog";
import DeleteMaterialDialog from "./DeleteMaterialDialog";
import DeleteTopicDialog from "./DeleteTopicDialog";
import EditMaterialDialog from "./EditMaterialDialog";
import EditTopicDialog from "./EditTopicDialog";

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

  const handleCloseSuccessSnackbar = () => {
    setSuccessSnackbarMsg("");
  };

  const handleSuccessCreateTopic = (topic) => {
    setTopics(topics.concat([topic]));
    setSuccessSnackbarMsg("Topik berhasil dibuat");
  };

  const handleSuccessEditTopic = (topicId, topicName) => {
    const editedTopic = topics.filter((topic) => topic.id === topicId)[0];

    editedTopic.name = topicName;

    setTopics(
      topics.map((topic) => (topic.id === topicId ? editedTopic : topic))
    );
    setSuccessSnackbarMsg("Topik berhasil diedit");
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
    setSuccessSnackbarMsg("Materi berhasil ditambah");
  };

  const handleSuccessEditMaterial = (topicId, material) => {
    const editedTopic = topics.filter((topic) => topic.id === topicId)[0];

    const updatedMaterial = {
      name: material.name,
    };

    if (material.link) {
      updatedMaterial.link = material.link;
    } else {
      updatedMaterial.fileName = material.fileName;
    }

    editedTopic.materials[material.id] = updatedMaterial;

    setTopics(
      topics.map((topic) => (topic.id === topicId ? editedTopic : topic))
    );

    setSuccessSnackbarMsg("Materi berhasil diedit");
  };

  const handleSuccessDeleteMaterial = (topicId, materialId) => {
    const editedTopic = topics.filter((topic) => topic.id === topicId)[0];

    delete editedTopic.materials[materialId];

    setTopics(
      topics.map((topic) => (topic.id === topicId ? editedTopic : topic))
    );

    setSuccessSnackbarMsg("Materi berhasil dihapus");
  };

  const handleSuccessDeleteTopic = (topicId) => {
    setTopics(topics.filter((topic) => topic.id !== topicId));
    setSuccessSnackbarMsg("Topik berhasil dihapus");
  };

  return (
    <Stack
      minHeight="100vh"
      bgcolor="background.default"
      spacing={!isLoading ? 3 : 0}
      pb={4}
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
            <Stack
              spacing={4}
              mt={user.role === "student" ? "32px !important" : 2}
              alignItems="center"
            >
              {topics.map((topic) => (
                <TopicDetail
                  key={topic.id}
                  topic={topic}
                  classCourse={classCourse}
                  setClassCourse={setClassCourse}
                  onAddMaterialSuccess={handleSuccessAddMaterial}
                  onEditMaterialSuccess={handleSuccessEditMaterial}
                  onEditTopicSuccess={handleSuccessEditTopic}
                  onDeleteMaterialSuccess={handleSuccessDeleteMaterial}
                  onDeleteTopicSuccess={handleSuccessDeleteTopic}
                />
              ))}
            </Stack>
            <CreateTopicDialog
              open={isCreateTopicDialogOpen}
              setOpen={setIsCreateTopicDialogOpen}
              classCourse={classCourse}
              setClassCourse={setClassCourse}
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

const TopicDetail = ({
  topic,
  classCourse,
  setClassCourse,
  onAddMaterialSuccess,
  onEditTopicSuccess,
  onEditMaterialSuccess,
  onDeleteMaterialSuccess,
  onDeleteTopicSuccess,
}) => {
  const user = useSelector((state) => state.user);

  const [isAddMaterialDialogOpen, setIsAddMaterialDialogOpen] = useState(false);
  const [isEditTopicDialogOpen, setIsEditTopicDialogOpen] = useState(false);
  const [isDeleteTopicDialogOpen, setIsDeleteTopicDialogOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const isMenuOpen = Boolean(menuAnchorEl);

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  return (
    <>
      <Accordion elevation={4} sx={{ width: 1, maxWidth: "900px" }}>
        <AccordionSummary
          sx={{
            flexDirection: "row-reverse",
            boxShadow:
              "0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)",
            "& .MuiSvgIcon-root": {
              color: "#000",
            },
            "& .MuiAccordionSummary-content": {
              my: "0px !important",
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
            <Stack direction="row" alignItems="center" spacing={1}>
              <MenuBook />
              <Typography>{topic.name}</Typography>
            </Stack>

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
        <AccordionDetails>
          {Object.entries(topic.materials)
            .sort((a, b) => {
              return (
                parseInt(a[0].split(":")[0]) - parseInt(b[0].split(":")[0])
              );
            })
            .map(([materialId, material]) => (
              <MaterialDetail
                key={materialId}
                topicId={topic.id}
                materialId={materialId}
                material={material}
                classCourse={classCourse}
                setClassCourse={setClassCourse}
                onEditSuccess={onEditMaterialSuccess}
                onDeleteSuccess={onDeleteMaterialSuccess}
              />
            ))}
        </AccordionDetails>
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
              setIsEditTopicDialogOpen(true);
            }}
          >
            Edit Topik
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              setIsDeleteTopicDialogOpen(true);
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
        classCourse={classCourse}
        setClassCourse={setClassCourse}
        onSuccess={onAddMaterialSuccess}
      />
      <EditTopicDialog
        open={isEditTopicDialogOpen}
        setOpen={setIsEditTopicDialogOpen}
        topic={topic}
        classCourse={classCourse}
        setClassCourse={setClassCourse}
        onSuccess={onEditTopicSuccess}
      />
      <DeleteTopicDialog
        open={isDeleteTopicDialogOpen}
        setOpen={setIsDeleteTopicDialogOpen}
        topic={topic}
        classCourse={classCourse}
        setClassCourse={setClassCourse}
        onSuccess={onDeleteTopicSuccess}
      />
    </>
  );
};

const MaterialDetail = ({
  material,
  materialId,
  topicId,
  classCourse,
  setClassCourse,
  onEditSuccess,
  onDeleteSuccess,
}) => {
  const user = useSelector((state) => state.user);

  const [isEditMaterialDialogOpen, setIsEditMaterialDialogOpen] =
    useState(false);
  const [isDeleteMaterialDialogOpen, setIsDeleteMaterialDialogOpen] =
    useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const isMenuOpen = Boolean(menuAnchorEl);

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  const onDownloadAttachment = async () => {
    const downloadLink = await getFileDownloadLink(
      `/material-attachments/${materialId}/${material.fileName}`
    );

    const aElement = document.createElement("a");
    aElement.href = downloadLink;
    aElement.target = "_blank";
    aElement.click();
  };

  const onViewAttachment = async () => {
    const aElement = document.createElement("a");
    aElement.href = material.link;
    aElement.target = "_blank";
    aElement.click();
  };

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Stack direction="row" alignItems="center" spacing={1}>
        <Article />
        <Typography>{material.name}</Typography>
      </Stack>

      {user.role === "teacher" ? (
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            setMenuAnchorEl(e.currentTarget);
          }}
        >
          <MoreVertRounded sx={{ color: "#000", fontSize: "28px" }} />
        </IconButton>
      ) : material.link ? (
        <IconButton onClick={onViewAttachment}>
          <InsertLinkRounded sx={{ color: "#000" }} />
        </IconButton>
      ) : (
        <IconButton onClick={onDownloadAttachment}>
          <DownloadRounded sx={{ color: "#000" }} />
        </IconButton>
      )}
      <EditMaterialDialog
        open={isEditMaterialDialogOpen}
        setOpen={setIsEditMaterialDialogOpen}
        topicId={topicId}
        material={material}
        materialId={materialId}
        classCourse={classCourse}
        setClassCourse={setClassCourse}
        onSuccess={onEditSuccess}
      />
      <DeleteMaterialDialog
        open={isDeleteMaterialDialogOpen}
        setOpen={setIsDeleteMaterialDialogOpen}
        topicId={topicId}
        material={material}
        materialId={materialId}
        classCourse={classCourse}
        setClassCourse={setClassCourse}
        onSuccess={onDeleteSuccess}
      />
      <Menu onClose={handleCloseMenu} anchorEl={menuAnchorEl} open={isMenuOpen}>
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            if (material.link) {
              onViewAttachment();
            } else {
              onDownloadAttachment();
            }
          }}
        >
          {material.link ? "Lihat Materi" : "Unduh Berkas"}
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            setIsEditMaterialDialogOpen(true);
          }}
        >
          Edit Materi
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            setIsDeleteMaterialDialogOpen(true);
          }}
        >
          Hapus Materi
        </MenuItem>
      </Menu>
    </Stack>
  );
};

export default MaterialPage;
