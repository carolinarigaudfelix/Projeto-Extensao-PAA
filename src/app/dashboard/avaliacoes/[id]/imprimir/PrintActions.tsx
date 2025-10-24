'use client';

import { Box, Button } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function PrintActions() {
  const router = useRouter();

  return (
    <Box display="flex" gap={2} my={2} data-print-hidden>
      <Button variant="outlined" onClick={() => router.back()}>
        Voltar
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={() => typeof window !== 'undefined' && window.print()}
      >
        Imprimir
      </Button>
    </Box>
  );
}
