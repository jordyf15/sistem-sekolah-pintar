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
import { getAllUsersForAdminFromDB } from "../../database/user";
import DeleteUserDialog from "./DeleteUserDialog";

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

const AdminUsersTab = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("");
  const [lastActiveYearSort, setLastActiveYearSort] = useState("asc");
  const [isLoading, setIsLoading] = useState(true);
  const [successSnackbarMsg, setSuccessSnackbarMsg] = useState("");

  useEffect(() => {
    async function getUsers() {
      try {
        setIsLoading(true);

        const fetchedUsers = await getAllUsersForAdminFromDB();
        setUsers(fetchedUsers);
      } catch (error) {
        console.log(error);
      }

      setIsLoading(false);
    }

    getUsers();
  }, []);

  const displayedUsers = useMemo(() => {
    return users
      .filter(
        (user) =>
          user.userNumber
            .toString()
            .toLowerCase()
            .includes(filter.toLowerCase()) ||
          user.fullname.toLowerCase().includes(filter.toLowerCase()) ||
          user.role.toLowerCase().includes(filter.toLowerCase()) ||
          user.username.toLowerCase().includes(filter.toLowerCase()) ||
          user.lastActiveYear
            .toString()
            .toLowerCase()
            .includes(filter.toLowerCase())
      )
      .sort((a, b) =>
        lastActiveYearSort === "asc"
          ? a.lastActiveYear - b.lastActiveYear
          : b.lastActiveYear - a.lastActiveYear
      );
  }, [filter, lastActiveYearSort, users]);

  const handleSuccessDelete = (deletedUserId) => {
    setUsers(users.filter((user) => user.id !== deletedUserId));
    setSuccessSnackbarMsg("Pengguna berhasil dihapus");
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
        placeholder="Filter pengguna berdasarkan nomor pengguna, nama lengkap, username, peran, atau tahun terakhir aktif"
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
                Nomor Pengguna
              </TableCell>
              <TableCell
                sx={{
                  "&.MuiTableCell-root": {
                    ...tableCellStyle,
                  },
                }}
                style={{ backgroundColor: "	#cbcbcb" }}
              >
                Nama Lengkap
              </TableCell>
              <TableCell
                sx={{
                  "&.MuiTableCell-root": {
                    ...tableCellStyle,
                  },
                }}
                style={{ backgroundColor: "	#cbcbcb" }}
              >
                Username
              </TableCell>
              <TableCell
                sx={{
                  "&.MuiTableCell-root": {
                    ...tableCellStyle,
                  },
                }}
                style={{ width: "10%", backgroundColor: "	#cbcbcb" }}
              >
                Peran
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
                style={{ width: "10%", backgroundColor: "	#cbcbcb" }}
              ></TableCell>
            </TableRow>
          </TableHead>
          {!isLoading && (
            <TableBody>
              {displayedUsers.map((user) => (
                <TableRowUser
                  key={user.id}
                  user={user}
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

const TableRowUser = ({ user, onSuccessDelete }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
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
      >
        {user.userNumber}
      </TableCell>
      <TableCell
        sx={{
          "&.MuiTableCell-root": {
            ...tableCellStyle,
          },
        }}
      >
        {user.fullname}
      </TableCell>
      <TableCell
        sx={{
          "&.MuiTableCell-root": {
            ...tableCellStyle,
          },
        }}
      >
        {user.username}
      </TableCell>
      <TableCell
        sx={{
          "&.MuiTableCell-root": {
            ...tableCellStyle,
          },
        }}
        style={{ width: "10%" }}
      >
        {user.role === "student" ? "Murid" : "Guru"}
      </TableCell>
      <TableCell
        sx={{
          "&.MuiTableCell-root": {
            ...tableCellStyle,
          },
        }}
      >
        {user.lastActiveYear}
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
      <DeleteUserDialog
        open={isDeleteDialogOpen}
        setOpen={setIsDeleteDialogOpen}
        user={user}
        onSuccess={onSuccessDelete}
      />
    </TableRow>
  );
};

export default AdminUsersTab;
