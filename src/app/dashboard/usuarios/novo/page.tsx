"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface Membro {
  nome: string;
  cpf: string;
  telefone: string;
}

export default function EquipePedagogica() {
  const [membros, setMembros] = useState<Membro[]>([]);
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Membro>({ nome: "", cpf: "", telefone: "" });

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleOpen = (index: number | null = null) => {
    if (index !== null) {
      setForm(membros[index]);
      setEditIndex(index);
    } else {
      setForm({ nome: "", cpf: "", telefone: "" });
      setEditIndex(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setForm({ nome: "", cpf: "", telefone: "" });
    setEditIndex(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (form.nome && form.cpf && form.telefone) {
      if (editIndex !== null) {
        setMembros((prev) =>
          prev.map((m, i) => (i === editIndex ? form : m))
        );
      } else {
        setMembros((prev) => [...prev, form]);
      }
      handleClose();
    }
  };

  const handleRemove = (index: number) => {
    setMembros((prev) => prev.filter((_, i) => i !== index));
  };

  const linhasPlaceholder = Array.from({ length: Math.max(0, 5 - membros.length) });

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100dvh",
        bgcolor: "#fff",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          width: "100%",
          maxWidth: 414,
          display: "flex",
          flexDirection: "column",
          px: 2,
          pt: 2,
          pb: 12,
          color: "#000",
          flex: 1,
        }}
      >
        {/* Cabeçalho */}
        <Typography variant="h6" sx={{ fontSize: "1rem", mb: 1 }}>
          Planejamento de Acessibilidade na Avaliação - PAA
        </Typography>
        <Box sx={{ height: 4, bgcolor: "#e0e0e0", borderRadius: 2, mb: 0.5 }}>
          <Box sx={{ width: "20%", height: 1, bgcolor: "#2e7d32", borderRadius: 2 }} />
        </Box>
        <Typography sx={{ fontSize: 12, mb: 2 }}>20% concluído</Typography>

        {/* Seção Equipe Pedagógica */}
        <Typography sx={{ fontWeight: 600 }}>2. Equipe Pedagógica</Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Button
            variant="text"
            onClick={() => handleOpen(null)}
            sx={{ textTransform: "none", color: "#000", fontWeight: 500 }}
          >
            + Adicionar membro
          </Button>

          <Button
            variant="text"
            onClick={() => alert("Importar equipe")}
            sx={{ textTransform: "none", color: "#000", fontWeight: 500 }}
          >
            Importar Equipe
          </Button>
        </Box>

        <TableContainer
          component={Paper}
          sx={{
            border: "1px dashed #ccc",
            bgcolor: "#fff",
            height: 245, // 👈 altura exata (5 linhas + header)
            overflowY: "auto",
            mb: 3,
          }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ "& th": { bgcolor: "#f5f5f5" } }}>
                <TableCell sx={{ color: "#000", fontWeight: 700 }}>Nome</TableCell>
                <TableCell sx={{ color: "#000", fontWeight: 700 }}>CPF</TableCell>
                <TableCell sx={{ color: "#000", fontWeight: 700 }}>Telefone</TableCell>
                <TableCell sx={{ color: "#000", fontWeight: 700 }} align="center">
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {membros.map((m, i) => (
                <TableRow key={i}>
                  <TableCell sx={{ color: "#000", height: 38 }}>{m.nome}</TableCell>
                  <TableCell sx={{ color: "#000" }}>{m.cpf}</TableCell>
                  <TableCell sx={{ color: "#000" }}>{m.telefone}</TableCell>
                  <TableCell align="center" sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                    <IconButton
                      size="small"
                      color="success"
                      onClick={() => handleOpen(i)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemove(i)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {linhasPlaceholder.map((_, i) => (
                <TableRow key={`placeholder-${i}`}>
                  <TableCell sx={{ height: 38 }} />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Objetivos */}
        <Typography sx={{ fontWeight: 600, mb: 1 }}>
          3. Objetivos para Avaliação
        </Typography>
        <TextField
          placeholder="Descreva os objetivos para esta avaliação."
          multiline
          minRows={5}
          fullWidth
          sx={{
            mb: 2,
            bgcolor: "#fff",
            "& .MuiInputBase-input": { color: "#000" },
          }}
        />
      </Container>

      {/* Footer fixo */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: "#fff",
          py: 2,
          borderTop: "1px solid #ddd",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box sx={{ display: "flex", gap: 1, maxWidth: 414, width: "100%", px: 2 }}>
          <Button variant="outlined" color="success" fullWidth>
            Anterior
          </Button>
          <Button variant="contained" color="success" fullWidth>
            Próximo
          </Button>
        </Box>
      </Box>

      {/* Modal */}
      <Dialog open={open} onClose={handleClose} fullScreen={fullScreen} fullWidth>
        <DialogTitle sx={{ color: "#000" }}>
          {editIndex !== null ? "Editar Membro" : "Adicionar Membro"}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Nome"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="CPF"
              name="cpf"
              value={form.cpf}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Telefone"
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleSave} variant="contained" color="success">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}